const { getModels } = require('../utils/connection');
const dbService = require('./db.service');

const includeOptions = (db) => [
    { model: db.Patient, as: 'patient',
      include:[
        { model: db.GlobalType, as: 'title' },
        { model: db.GlobalType, as: 'sexAtBirth' }
      ],
    },
    { model: db.PatientEncounters, as: 'encounter',
        include:[
            {model: db.GlobalType, as: 'billingType',attributes: ['id', 'name'] },
            {model: db.GlobalType, as: 'encounterType',attributes: ['id', 'name']} ,    
            {model: db.PatientEncounterBilling, as: 'billing',
              include: [
                    {model: db.PracticeLocation, as: 'location'},    
                    { model: db.DiagnosisIcd, as: 'encounterDiagnosis' },
                    { model: db.DiagnosisSnomedCt, as: 'encounterDiagnosisSnomeds' },
                    {
                      model: db.ProcedureCode,
                      as: 'encounterProcedureCodes',
                      through: {
                        // attributes: ['modifier1', 'modifier2', 'modifier3', 'modifier4', 'total', 'qty', 'price', 'serviceDate', 'discPer', 'discAmt',  'taxPer', 'taxAmt'],
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
                required: true,
            },
            { model: db.Staff, as: 'assignedTo',include:[{model:db.GlobalType,as:'title',attributes:['name','code','id']}] ,attributes: ['id', 'firstName','lastName']},
        ],
        required: true,  
    },
  ];

const getPatientInvoiceById = async(patientInvoiceId,{tenantId})=>{
    const db = getModels(tenantId);
    const result = await dbService.getOneById({ 
        model: db.Invoice, 
        id: patientInvoiceId,
        include:includeOptions(db)});
    return result;

}

module.exports = {
    getPatientInvoiceById,
}