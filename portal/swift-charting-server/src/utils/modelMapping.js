const models = require("../config/models");

const mapTypeToModel = ({ type = '',db }) => {
    let model = '';
    if (type === models.PHARMACY_ORDER) {
      model = db.PharmacyOrder;
    } else if (type === models.PATIENT_FORM) {
      model = db.PatientForm;
    } else if (type === models.APPOINTMENT) {
      model = db.Appointment;
    }
    return model;
  };
  
  module.exports = {
    mapTypeToModel,
  };