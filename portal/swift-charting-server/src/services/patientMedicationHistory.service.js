const  dbService  = require("./db.service");
const { getModels } = require("../utils/connection");

const createPatientMedicationHistory =async ({tenantId,data}) => {
    const { items } = data || {};
    const db = getModels(tenantId);
    // Transform PatientMedicationItems to include PatientMedicationDiagnosis correctly
    const transformedItems = items.map((item) => ({
      ...item,
      id:undefined,
      diagnoses: item?.diagnoses?.map((diagnosis) => ({
        diagnosisIcdId: diagnosis.diagnosisIcdId,
      })),
    }));
  
    const patientMedicationHisotryData = {
      ...data,
      items: transformedItems,
      };
  await dbService.createOne({
      model: db.PatientMedicationHistory,
      reqParams: patientMedicationHisotryData,
      include: [{
        model: db.PatientMedicationItemsHistory,
        as: 'items',
        include: [{
          model: db.PatientMedicationDiagnosisHistory,
          as: 'diagnoses'
        }]
      }]
    });
  
    return 'created';
  };

  module.exports={
    createPatientMedicationHistory,
  }