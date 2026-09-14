const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { getModels } = require('../utils/connection');
const { dbService } = require('../services');
const ApiError = require('../utils/ApiError');
const { errorMessages } = require('../config/error');
const { Op } = require('sequelize');

const getInvoices = catchAsync(async (req, res) => {
  const uuid = req.clinicUuid;
  const db = getModels(uuid);
  const { searchText, patientId } = req?.query || {};
  let whereClause = {}
  if(patientId){
    whereClause = { patientId }
  }

  if (searchText) {
    whereClause = {
      [Op.or]: [
        { firstName: { [Op.iLike]: `%${searchText}%` } },
        { lastName: { [Op.iLike]: `%${searchText}%` } },
        { middleName: { [Op.iLike]: `%${searchText}%` } },
      ],
    };
  }
  const result = await dbService.getPaginated({
    model: db.Invoice,
    req,
    include: [
      { model: db.Patient, as: 'patient',
        include:[{ model: db.GlobalType, as: 'title' }] ,
        where: whereClause,
        attributes: [ 'id', 'firstName','lastName', 'middleName', 'titleCode'],
      },
      { model: db.PatientEncounters, as: 'encounter',
        attributes: [ 'id'],
        include:[{ 
          model: db.PatientEncounterBilling, as: 'billing',
          include:[{ 
            model: db.Staff, as: 'primaryProvider',
            attributes: [ 'id', 'firstName','lastName', 'middleName', 'titleCode'],
          }],
          attributes: [ 'id'],
          required: true,
        }],
        required: true,  
      },
      {
        model: db.GlobalType,
        as:'statusCode'
      },
    ]
  });
  res.status(httpStatus.OK).send(result);
});

const createInvoice = catchAsync(async (req, res) => {
  const { user, body } = req;
  const { patientId, due} = body || {};
  const userId = user.id;
  const uuid = req.clinicUuid;
  const db = getModels(uuid);
  
  const patient = await dbService.getOneById({
    model: db.Patient,
    id: patientId,
  });
  if (!patient) {
    throw new ApiError(httpStatus.NOT_FOUND, errorMessages.NO_RECORD_FOUND);
  }

  const invoice = await dbService.createOne({
    model: db.Invoice,
    reqParams: body,
  });
  if (invoice) {
    const newBalance = due.toFixed(2);
    // const newBalance = (patient?.balance || 0) + due;
    const[, [patientUpdate]] = await dbService.updateOne({
      model: db.Patient,
      updateParams: { balance: newBalance },
      filter: { where: { id: patientId } },
    })
  }

  res.status(httpStatus.CREATED).send(invoice);
});

const updateInvoice = catchAsync(async (req, res) => {
  const { user, params, body } = req;
  const userId = user.id;
  const { invoiceId } = params;
  const uuid = req.clinicUuid;
  const db = getModels(uuid);

  const existingInvoice = await dbService.getOneById({ model: db.Invoice, id: invoiceId });
  if (!existingInvoice) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Invoice not found');
  }
  
  const updateParams = { ...body, updateById: userId };

  if (body.isDeleted === true) {
    updateParams.deletedById = userId;
  }

  const [,[updatedInvoice]] = await dbService.updateOne({
    model: db.Invoice,
    updateParams,
    filter: { where: { id: invoiceId } },
  });

  res.status(httpStatus.OK).send(updatedInvoice);
});

const getInvoiceById = catchAsync(async (req, res) => {
  const uuid = req.clinicUuid;
  const db = getModels(uuid);

  const result = await dbService.getOneById({
    model: db.Invoice,
    id: req.params.invoiceId,
    include: [
      { model: db.Patient, as: 'patient',
        include:[{ model: db.GlobalType, as: 'title' }] ,
      },
      { model: db.PatientEncounters, as: 'encounter',
        include:[{ 
          model: db.PatientEncounterBilling, as: 'billing',
          include:[
            { model: db.DiagnosisIcd, as: 'encounterDiagnosis' },
            { model: db.DiagnosisSnomedCt, as: 'encounterDiagnosisSnomeds' },
            {
              model: db.ProcedureCode,
              as: 'encounterProcedureCodes',
              through: {
                // attributes: [
                //   'modifier1', 'modifier2', 'modifier3', 
                //   'modifier4', 'total', 'price', 
                //   'serviceDa', 'discPer', 'discAmt',  
                //   'taxPer', 'taxAmt'],
                as: 'addOnFields'
              },
              attributes:['id','name','description', 'cptCode']
          
            },
            { model: db.Staff, 
              as: 'primaryProvider',
              include:[{
                model:db.GlobalType,
                as:'title',
                attributes:['name','code','id']
              }] ,
              attributes: ['id', 'firstName','lastName']
            },
            { model: db.Staff, 
              as: 'referenceProvider',
              include:[{
                model:db.GlobalType,
                as:'title',
                attributes:['name','code','id']
              }] ,
              attributes: ['id', 'firstName','lastName']
            },

        ],
          // attributes: [ 'id'],
          required: true,
        },
        { model: db.GlobalType, as: 'billingType',attributes: ['id', 'name'] },
        { model: db.GlobalType, as: 'encounterType',attributes: ['id', 'name'] },
        { model: db.Staff, as: 'assignedTo',include:[{model:db.GlobalType,as:'title',attributes:['name','code','id']}] ,attributes: ['id', 'firstName','lastName']},
      ],
        required: true,  
      },
      {
        model: db.GlobalType,
        as:'statusCode'
      },
    ]
  });
  res.status(httpStatus.OK).send(result);
});


module.exports = {
  getInvoices,
  createInvoice,
  updateInvoice,
  getInvoiceById,
};
