/* eslint-disable no-prototype-builtins */
const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { getModels } = require('../utils/connection');
const { dbService, patientMedicationService, patientMedicationHistroyService, staffService } = require('../services');
const ApiError = require('../utils/ApiError');
const { errorMessages } = require('../config/error');
const { sendMedicationNotification } = require('../services/notification.service');
const { notifications } = require('../config/notification');
const { isEmpty } = require('lodash');

const createPatientMedication = catchAsync(async (req, res) => {
  const { user, body } = req;
  const { patientId, items } = body || {};
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


  // Transform PatientMedicationItems to include PatientMedicationDiagnosis correctly
  const transformedItems = items.map((item) => ({
    ...item,
    genericDrug: item.genericDrug,
    brandNameDrug: item.brandNameDrug,
    createdById: userId,
    ...(item?.diagnoses?.length > 0 && {
      diagnoses: item.diagnoses.map((diagnosis) => ({
        diagnosisIcdId: diagnosis.id,
        createdById: userId,
      })),
    }),
    ...(item?.medicineStatusCode==='medication_status_discontinued')?{discontinueDate:new Date() }:{}
  }));
  

  const patientMedicationData = {
    ...body,
    createdById: userId,
    items: transformedItems,
  };
  const patientMedication = await dbService.createOne({
    model: db.PatientMedication,
    reqParams: patientMedicationData,
    include: [
      {
        model: db.PatientMedicationItems,
        as: 'items',
        include: [
          {
            model: db.PatientMedicationDiagnosis,
            as: 'diagnoses',
          },
        ],
      },
    ],
  });
  
  const patientNotificationInfo = notifications.Patient.MEDICATION_CREATED;
  sendMedicationNotification({patientMedication},{tenantId:uuid,patientNotificationInfo});

  res.status(httpStatus.CREATED).send(patientMedication);
});

const getPaitentMedication = catchAsync(async (req, res) => {
  const uuid = req.clinicUuid;
  const db = getModels(uuid);

  const result = await dbService.getPaginated({
    model: db.PatientMedication,
    req,
    allowedFilters: ['patientId','patientEncounterId'],
    searchFilter: [],
    include: [
      {
        model: db.Patient,
        as: 'patient',
      },
      {
        model: db.Staff,
        as: 'prescriber',
      },
      {
        model: db.PatientMedicationItems,
        as: 'items',
        include: [
          {
            model: db.GlobalType,
            as: 'doseForm',
          },
          {
            model: db.GlobalType,
            as: 'unit',
          },
          {
            model: db.GlobalType,
            as: 'route',
          },
          {
            model: db.GlobalType,
            as: 'frequency',
          },
          {
            model: db.GlobalType,
            as: 'duration',
          },
          {
            model: db.GlobalType,
            as: 'direction',
          },
          {
            model: db.GlobalType,
            as: 'medicineStatus',
          },
          {
            model: db.PatientMedicationDiagnosis,
            as: 'diagnoses',
            include: [
              {
                model: db.DiagnosisIcd,
                as: 'icd',
              },
            ],
          },
          // {
          //   model: db.MedicationSchedule,
          //   as: 'schedules' 
          // }
        ],
      },
    ],
  });

  res.status(httpStatus.OK).send(result);
});

const getPatientMedicationById = catchAsync(async (req, res) => {
  const uuid = req.clinicUuid;
  console.log("🚀 ~ getPatientMedicationById ~ uuid:", uuid)
  const { patientMedicationId } = req.params || {};
  const result = await patientMedicationService.getPatientMedicationById(patientMedicationId, { tenantId: uuid });
  res.status(httpStatus.OK).send(result);
});

const updatePatientMedication = catchAsync(async (req, res) => {
  const { user, params, body } = req;
  const { items=[],...restBody } = body || {};
  const userId = user.id;
  const { patientMedicationId } = params;
  const uuid = req.clinicUuid;
  const db = getModels(uuid);

  // Transform PatientMedicationItems to include PatientMedicationDiagnosis correctly
  const transformedItems = items.map((item) => ({
    ...item,
    genericDrug: item.genericDrug,
    brandNameDrug: item.brandNameDrug,
    ...(item?.diagnoses?.length > 0 && {
      diagnoses: item.diagnoses.map((diagnosis) => ({
        diagnosisIcdId: diagnosis.id,
        createdById: userId,
      })),
    }),
  }));

  const resonForChangesArray = transformedItems?.map((item) => item.reasonForChanges  && { id: item.id, reasonForChanges: item.reasonForChanges} )

  const existingPatientMedication = await dbService.getOneById({
    model: db.PatientMedication,
    id: patientMedicationId,
    include: [
      {
        model: db.PatientMedicationItems,
        as: 'items',
        include: [
          {
            model: db.PatientMedicationDiagnosis,
            as: 'diagnoses',
          },
        ],
      },
    ],
  });

  if (!existingPatientMedication) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Patient Medication not found');
    }
    
    const prescribedBy = await existingPatientMedication.getPrescriber();
    const revisedBy = await staffService.getStaffByUserId({tenantId:uuid,userId});

    // Update the existing items based on reasonForChangesArray
    const updatedItems = existingPatientMedication.items.map((item) => {
      const reasonForChange = resonForChangesArray.find((rfc) => rfc?.id === item.id);
      if (reasonForChange) {
        return {
          ...item.toJSON(),
          reasonForChanges: reasonForChange.reasonForChanges, // updating the reasonForChanges
        };
      }
      return item.toJSON(); // Keep the item as is if no matching reasonForChange
    });
    
    // Create the history before clearing the existing items
    try{
    await patientMedicationHistroyService.createPatientMedicationHistory({
      tenantId: uuid,
      data: {
        ...existingPatientMedication.toJSON(),
        id: undefined,
        patientMedicationId: existingPatientMedication.id,
        prescribedById:prescribedBy.id,
        revisedById:revisedBy.id,
        items: updatedItems?.map((item) => ({
        // items: existingPatientMedication.items.map((item) => ({
          // ...item.toJSON(),
          ...item,
          patientMedicationId: undefined,
          diagnoses: item?.diagnoses?.map((diagnosis) => ({
            ...diagnosis,
          })),
          // diagnoses: item?.diagnoses?.map((diagnosis) => ({
          //   ...diagnosis.toJSON(),
          // })),
        })),
      },
    });
  }catch(err){
    console.log("🚀 ~ updatePatientMedication ~ err:", err)
  }


  await dbService.updateById({model:db.PatientMedication,reqParams:{id:patientMedicationId,...restBody,updatedById:userId}})
  if(items.length){
  // Clear existing items and diagnoses
  // await existingPatientMedication.setItems([]);

  // Remove `reasonForChanges` after the transformation
  const transformedItemsWithoutReasonForUpdate = transformedItems.map(({ reasonForChanges, ...rest }) => rest);

  // for (const item of transformedItems) {
  for (const item of transformedItemsWithoutReasonForUpdate) {
    const { diagnoses, id, ...itemData } = item;
    let medicationItem;
    if(item?.medicineStatusCode==='medication_status_discontinued' && !item?.discontinueDate){
      itemData.discontinueDate=new Date()
      }else if(item?.medicineStatusCode!=='medication_status_discontinued'){
        itemData.discontinueDate=null
      }
    if (id) {
      const [,updatedData] = await dbService.updateById({ model: db.PatientMedicationItems,reqParams:{ id,...itemData} });
      medicationItem=updatedData[0];
    } else {
      medicationItem = await dbService.createOne({
        model: db.PatientMedicationItems,
        reqParams: { ...itemData, patientMedicationId, createdById: userId },
      });
    }
  
    // Fetch existing diagnoses for the medication item
    const existingDiagnoses = await medicationItem.getDiagnoses()
  
    const existingDiagnosisIds = existingDiagnoses.map(d => d.diagnosisIcdId);
    const newDiagnosisIds = diagnoses.map(d => d.diagnosisIcdId);
  
    // Find diagnoses to remove (present in existing but not in new diagnoses)
    const diagnosesToRemoveArray = existingDiagnosisIds.filter(id => !newDiagnosisIds.includes(id));
    const diagnosesToRemove = existingDiagnoses
  .filter(diagnosis => diagnosesToRemoveArray.includes(diagnosis.diagnosisIcdId))
  .map(diagnosis => diagnosis.id); // Map to 'id', which is the primary key

  
    // Find diagnoses to add (present in new diagnoses but not in existing)
    const diagnosesToAdd = newDiagnosisIds.filter(id => !existingDiagnosisIds.includes(id));
    console.log("🚀 ~ updatePatientMedication ~ diagnosesToAdd:", diagnosesToAdd,diagnosesToRemove)
  

    // Add new diagnoses
    const createdDiagnoses = [];
    for (const diagnosisIcdId of diagnosesToAdd) {
        const createdDiagnosis = await dbService.createOne({
          model: db.PatientMedicationDiagnosis,
          reqParams: {
            diagnosisIcdId,
            medicationItemsId: medicationItem.id,
            createdById: userId,
          },
        });
        createdDiagnoses.push(createdDiagnosis.id);
    }
  
    // Associate new diagnoses with the medication item
    if(diagnosesToRemove.length>0){
       await medicationItem.removeDiagnoses(diagnosesToRemove)
    }
    if (createdDiagnoses.length > 0) {
      await medicationItem.addDiagnoses(createdDiagnoses);
    }
  }
  
}

  res.status(httpStatus.OK).send(existingPatientMedication);
});

const sharePatientMedication = catchAsync(async (req, res) => {
  const { user, clinicUuid: uuid } = req || {};
  const patientForm = await patientMedicationService.sharePatientMedication(req.params.patientMedicationId, req.body, {
    user,
    tenantId: uuid,
  });
  res.status(httpStatus.OK).send(patientForm);
});


const getPatientMedicationItems = catchAsync(async (req, res) => {
  const uuid = req.clinicUuid;
  const db = getModels(uuid);
  const { patientMedicationId, patientId } = req.query || {};
  const filter= {};
  if(patientId){
    filter.patientId
  }
  if(patientMedicationId){
    filter.patientMedicationId=patientMedicationId;
  }
  const result = await dbService.getPaginated({
    model:db.PatientMedicationItems,
    req,
    allowedFilters:['patientMedicationId'],
      include: [
        {
          model: db.GlobalType,
          as: 'doseForm',
        },
        {
          model: db.GlobalType,
          as: 'unit',
        },
        {
          model: db.GlobalType,
          as: 'route',
        },
        {
          model: db.GlobalType,
          as: 'frequency',
        },
        {
          model: db.GlobalType,
          as: 'duration',
        },
        {
          model: db.GlobalType,
          as: 'direction',
        },
        {
          model: db.GlobalType,
          as: 'medicineStatus',
        },
        {
          model: db.PatientMedicationDiagnosis,
          as: 'diagnoses',
          include: [
            {
              model: db.DiagnosisIcd,
              as: 'icd',
              include: [
                {
                  model: db.DiagnosisProblem,
                  as: 'diagnosisProblem' 
                }
              ]
            },
          ],
        },
        {
          model: db.MedicationSchedule,
          as: 'schedules' 
        },
        {
          model: db.PatientMedication,
          as: 'medication',
          where: {patientId} 
        },
        {
          model: db.PatientMedicationItemMARLog,
          as: 'marLogs', 
          limit: 1,
        }
      ]

  });
  res.status(httpStatus.OK).send(result);
});

module.exports = {
  createPatientMedication,
  getPaitentMedication,
  getPatientMedicationById,
  updatePatientMedication,
  sharePatientMedication,
  getPatientMedicationItems,
};
