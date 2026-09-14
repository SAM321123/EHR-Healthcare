const dbService = require("./db.service");
const { getModels } = require("../utils/connection");
const ApiError = require("../utils/ApiError");
const httpStatus = require("http-status");
const { errorMessages } = require("../config/error");

const createEncounterBilling = async({tenantId,body,user})=>{
    const db= getModels(tenantId);
    let { encounterProcedureCodes=[], encounterDiagnosis, encounterDiagnosisSnomeds, patientId,insuranceType
,      ...rest } = body || {};
    // encounterProcedureCodes = encounterProcedureCodes.reverse();
  
    const patient = await dbService.getOneById({
      model: db.Patient,
      id: patientId,
    });
    
    let patientInsurance;
    if(insuranceType){
      patientInsurance = await dbService.getOne({
        model: db.Insurance,
        filter: {
          where: {
            insuranceType,
            patientId
          }
        }
      });
    }

    if (!patient) {
      throw new ApiError(httpStatus.NOT_FOUND, errorMessages.NO_RECORD_FOUND);
    }
  
    delete rest.procedureCode;

    const encounterBilling = await dbService.createOne({
      model: db.PatientEncounterBilling,
      reqParams: { ...rest,patientId,insuranceType,insuranceId:patientInsurance?.id || null },
    });
  

    if(encounterDiagnosis && encounterDiagnosis.length){
      const diagnosisIcdIds = encounterDiagnosis?.map(diagnosis => diagnosis.id);
      await encounterBilling.setEncounterDiagnosis(diagnosisIcdIds);
    }
    if(encounterDiagnosisSnomeds && encounterDiagnosisSnomeds.length){
      const diagnosisSnomeds = encounterDiagnosisSnomeds?.map(diagnosisSnomed => diagnosisSnomed.id);
      await encounterBilling.setEncounterDiagnosisSnomeds(diagnosisSnomeds)
    }

    let procedureCodeDataArray =[];
    for(let encounterProcedureCode of encounterProcedureCodes){
      if(typeof encounterProcedureCode.id==='string' && encounterProcedureCode.id.startsWith('new_')){
        const {id,...restProcedureCodeItem}= encounterProcedureCode || {};
        const createdProcedureCode= await dbService.createOne({
          model: db.ProcedureCode,
          reqParams: {...restProcedureCodeItem}
        });
        procedureCodeDataArray.push(createdProcedureCode)
      }else{
        procedureCodeDataArray.push(encounterProcedureCode)
      }
    }
  
    if (procedureCodeDataArray && procedureCodeDataArray.length) {
      for (const procedureCode of procedureCodeDataArray) {
        await encounterBilling.addEncounterProcedureCode(procedureCode.id, {
          through: {
            modifier1: procedureCode.modifier1,
            modifier2: procedureCode.modifier2,
            modifier3: procedureCode.modifier3,
            modifier4: procedureCode.modifier4,
            total:procedureCode.total,
            qty: procedureCode.qty,
            price: procedureCode.price,
            serviceDate: procedureCode.serviceDate,
            discAmt: procedureCode.discAmt,
            discPer: procedureCode.discPer,
            taxAmt: parseInt(procedureCode.taxAmt) || 0,
            taxPer: parseInt(procedureCode.taxPer) || 0,
          }
        });
      }
    }
  
   return encounterBilling;
}

const updateEncounterBilling = async({tenantId,encounterBillingId,updateParams,user}) => {

    const db= getModels(tenantId);
    let { encounterProcedureCodes=[], encounterDiagnosis=[], encounterDiagnosisSnomeds=[],insuranceType,patientId, ...rest } = updateParams || {};
    encounterProcedureCodes = encounterProcedureCodes.reverse();
    
    let patientInsurance;
    if(insuranceType){
      patientInsurance = await dbService.getOne({
        model: db.Insurance,
        filter: {
          where: {
            insuranceType,
            patientId
          }
        }
      });
    }
    let patientInsuranceId;
    if (!patientInsurance) {
       patientInsuranceId = null;
    }
    else{
       patientInsuranceId = patientInsurance?.id;
    }
    const userId = user.id;
    
    const updateData ={ ...rest, id:encounterBillingId, updatedById: userId,insuranceId:patientInsuranceId, insuranceType: insuranceType || null };
    delete rest.procedureCode;

    const newProcedureCodes = [];
    const procedureCodeOnly =[]
  
    const existingEncounterBilling = await dbService.getOneById({
      model: db.PatientEncounterBilling,
      id: encounterBillingId,
    });
    if (!existingEncounterBilling) {
      throw new ApiError(httpStatus.NOT_FOUND, errorMessages.NO_RECORD_FOUND);
    }
  
    const [,[encounterBilling]] = await dbService.updateById({
      model: db.PatientEncounterBilling,
      reqParams: updateData,
    });
  
    encounterProcedureCodes.forEach(item=>{
      if(typeof item.id==='string' && item.id.startsWith('new_')){
        const {id,...restDProcedureCodeItem}= item || {};
        newProcedureCodes.push(restDProcedureCodeItem);
      }else{
        procedureCodeOnly.push(item)
      }
    })
    if(encounterDiagnosis){
      const diagnosisIcdIds = encounterDiagnosis?.map(diagnosis => diagnosis.id);
      await encounterBilling.setEncounterDiagnosis(diagnosisIcdIds);
    }
    if(encounterDiagnosisSnomeds){
        const diagnosisSnomeds = encounterDiagnosisSnomeds?.map(diagnosisSnomed => diagnosisSnomed.id);
        await encounterBilling.setEncounterDiagnosisSnomeds(diagnosisSnomeds)
    }

    let procedureCodeDataArray =[];
    for(let encounterProcedureCode of encounterProcedureCodes){
      if(typeof encounterProcedureCode.id==='string' && encounterProcedureCode.id.startsWith('new_')){
        const {id,...restProcedureCodeItem}= encounterProcedureCode || {};
        const createdProcedureCode= await dbService.createOne({
          model: db.ProcedureCode,
          reqParams: {...restProcedureCodeItem}
        });
        procedureCodeDataArray.push(createdProcedureCode)
      }else{
        procedureCodeDataArray.push(encounterProcedureCode)
      }
    }
    if (procedureCodeDataArray) {
      await encounterBilling.setEncounterProcedureCodes([]);
      for (const procedureCode of procedureCodeDataArray) {
        await encounterBilling.addEncounterProcedureCode(procedureCode.id, {
          through: {
            modifier1: procedureCode.modifier1,
            modifier2: procedureCode.modifier2,
            modifier3: procedureCode.modifier3,
            modifier4: procedureCode.modifier4,
            total:procedureCode.total,
            qty: procedureCode.qty,
            price: procedureCode.price,
            serviceDate: procedureCode.serviceDate,
            discAmt: procedureCode.discAmt,
            discPer: procedureCode.discPer,
            taxAmt: parseInt(procedureCode.taxAmt) || 0,
            taxPer: parseInt(procedureCode.taxPer) || 0,
          }
        });
      }
  
    }
  
   return encounterBilling;
}
module.exports={
    createEncounterBilling,
    updateEncounterBilling,
}