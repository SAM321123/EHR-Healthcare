import { convertWithTimezone, dateFormatter } from "src/lib/utils";
import { dateFormats } from "src/lib/constants";

export const getLabsRadiologyEditData = (data)=>{
    const editData={
        patientId:data.patient,
        providerId:data.providerId,
        processingOrderProviderId:data.processingOrderProviderId,
        priority:data.priority,
        diagnosisIcdId:data.diagnosisIcd,
        laboratoryTestIds:data.laboratoryTests,
        sendingDetails:data.sendingDetails,
        testingLabId:data.testingLabId,
        barCode:data.barCode,
        hl7VersionCode:data.hl7VersionCode,
        sendingApplication:data.sendingApplication,
        sendingFacilityId:data.sendingFacilityId,
        patientDiagnosisId : data.patientDiagnosis,
        id:data.id,
        requiredTestingTime:data.requiredTestingTime,
        specimenTypeCode:data.specimenTypeCode,
        siteOfCollection:data.siteOfCollection,
        collectionDateTime: data.collectionDateTime ? convertWithTimezone(data.collectionDateTime,{requiredPlain:true}) : null,
        specimenQuantity:data.specimenQuantity,
        specimenVolume:data.specimenVolume,
        clinicalInfo:data.clinicalInfo,
        suspectedCondition:data.suspectedCondition ? data.suspectedCondition : [],
        fasting:data.fasting,
        sensitiveInsTime:data.sensitiveInsTime,
        patientPrepIns:data.patientPrepIns,
        payer:data?.payer, 
        allergies:data.allergies ? data.allergies : [],
        medicalHistory:data.medicalHistory ? data.medicalHistory : [],
        otherLaboratoryTest:data?.otherLaboratoryTest ? data?.otherLaboratoryTest : [],
      };

      return editData;
}