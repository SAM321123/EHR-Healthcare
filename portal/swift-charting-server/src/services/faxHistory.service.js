const dbService = require("./db.service");
const models = require("../config/models");
const { getModels } = require("../utils/connection");
const { faxError } = require("../config/faxError");
const faxStatus = require("../config/faxConfig");
const { pharmacyOrderStatus } = require("../config/pharmacyOrders");
const sendFax = require("../utils/srFaxUtils/srFaxApis");

const createFaxHistory = async (faxBody, {tenantId,pdfContent}) => {
  const db = getModels(tenantId);
    const {patientFormId,patientMedicationId,  faxType, faxContactId } = faxBody;
    const faxContactData = await dbService.getOne({ model: db.FaxContact, filter: { where:{id: faxContactId} }, });
    const { faxNo } = faxContactData || {};
  
    const { filename, pdfBufferData } = pdfContent;
    const { Status: status, Result: result,error } = await sendFax({
      faxNumber: faxNo,
      fileContent: pdfBufferData.toString('base64'),
      fileName: filename,
    });
    const faxHistory = await dbService.createOne({
      model: db.FaxHistory,
      reqParams: { ...faxBody, status:error?faxStatus.FAILED : status, result: faxError[String(result)?.trim()] || result || faxStatus.FAILED },
    });
 if (faxType === models.PATIENT_FORM && status === faxStatus.SUCCESS) {
    await dbService.updateOne({
      model:db.PatientForm,
      updateParams: {
        ...(status === faxStatus.SUCCESS ? { status: pharmacyOrderStatus.FAXED } : {}),
        faxContactId,
      },
      filter: { where : {id: patientFormId} },
    });
}

    return status;
  };
  

  module.exports={
    createFaxHistory,
  }