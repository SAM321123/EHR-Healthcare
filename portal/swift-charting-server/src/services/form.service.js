const { getModels } = require("../utils/connection");
const dbService = require("./db.service");

const getFormById =async(formId,{tenantId})=>{
    const db = getModels(tenantId);
    const form = await dbService.getOneById({ model: db.Form, id: formId, include: [
        { model: db.GlobalType, as: 'formCategory' },
        { model: db.GlobalType, as: 'formType' },
  
      ], });
    return form;
}

module.exports={
    getFormById,
}