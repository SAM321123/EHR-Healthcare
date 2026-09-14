const defineAssociations = (db) => {
  // Define associations here

  db.User.belongsToMany(db.Role, {
    through: db.UserRole,
    foreignKey: 'userId',
    otherKey: 'roleId',
    as: 'roles',
  });

  db.Role.belongsToMany(db.User, {
    through: db.UserRole,
    foreignKey: 'roleId',
    otherKey: 'userId',
    as: 'users',
  });

  db.Token.belongsTo(db.User, { foreignKey: 'userId', as: 'user' });
  db.User.hasMany(db.Token, { foreignKey: 'userId', as: 'user' });
  db.User.hasMany(db.Chat, { foreignKey: 'senderId', as: 'SentChats' });
  db.User.hasMany(db.Chat, { foreignKey: 'receiverId', as: 'ReceivedChats' });

  db.User.hasMany(db.Message, { foreignKey: 'senderId', as: 'SentUser' });
  db.User.hasMany(db.Message, { foreignKey: 'receiverId', as: 'ReceivedUser' });

  db.Chat.hasMany(db.Message, { foreignKey: 'chatId', as: 'Messages' });
  db.Chat.hasMany(db.Message, {
    as: 'UnreadMessages',
    foreignKey: 'chatId',
    scope: {
      isRead: false, // Only include messages where isRead is false
      isDeleted: false // Ensure it's not deleted
    }
  });

  db.GlobalCategoryType.belongsTo(db.User, { foreignKey: 'createdById', as: 'createdBy' });
  db.GlobalCategoryType.belongsTo(db.User, { foreignKey: 'updatedById', as: 'updatedBy' });

  db.GlobalType.belongsTo(db.GlobalCategoryType, {
    foreignKey: 'globalCategoryTypeCode',
    targetKey: 'code',
    as: 'globalCategoryType',
  });
  db.GlobalType.belongsTo(db.User, { foreignKey: 'createdById', as: 'createdBy' });
  db.GlobalType.belongsTo(db.User, { foreignKey: 'updatedById', as: 'updatedBy' });
  db.GlobalType.belongsTo(db.GlobalType, { foreignKey: 'parentCode', as: 'parent', targetKey:'code' });

  db.Chat.belongsTo(db.User, { foreignKey: 'senderId', as: 'Sender' });
  db.Chat.belongsTo(db.User, { foreignKey: 'receiverId', as: 'Receiver' });

  
  db.Message.belongsTo(db.User, { foreignKey: 'senderId', as: 'SenderInfo' });
  db.Message.belongsTo(db.User, { foreignKey: 'receiverId', as: 'ReceiverInfo' });

  db.Message.belongsTo(db.Chat, { foreignKey: 'chatId', as: 'MessageInfo' });

  db.Patient.belongsTo(db.User, { foreignKey: 'userId', as: 'user' });
  db.Patient.belongsTo(db.GlobalType, { foreignKey: 'titleCode', targetKey: 'code', as: 'title' });
  db.Patient.belongsTo(db.GlobalType, { foreignKey: 'diagnosisCode', targetKey: 'code', as: 'diagnosis' });
  db.Patient.belongsTo(db.GlobalType, { foreignKey: 'genderIdentityCode', targetKey: 'code', as: 'genderIdentity' });
  db.Patient.belongsTo(db.GlobalType, { foreignKey: 'sexualOrientationCode', targetKey: 'code', as: 'sexualOrientation' });
  db.Patient.belongsTo(db.GlobalType, { foreignKey: 'pronounsCode', targetKey: 'code', as: 'pronouns' });
  db.Patient.belongsTo(db.GlobalType, { foreignKey: 'maritalStatusCode', targetKey: 'code', as: 'maritalStatus' });
  db.Patient.belongsTo(db.GlobalType, { foreignKey: 'raceCode', targetKey: 'code', as: 'race' });
  db.Patient.belongsTo(db.GlobalType, { foreignKey: 'sexAtBirthCode', targetKey: 'code', as: 'sexAtBirth' });
  db.Patient.belongsTo(db.GlobalType, {
    foreignKey: 'preferredContactMethodCode',
    targetKey: 'code',
    as: 'preferredContactMethod',
  });

  db.Patient.belongsTo(db.File, { foreignKey: 'fileId', as: 'file' });
  db.Patient.belongsTo(db.User, { foreignKey: 'createdById', as: 'createdBy' });
  db.Patient.belongsTo(db.User, { foreignKey: 'updatedById', as: 'updatedBy' });
  db.Patient.belongsTo(db.Staff, { foreignKey: 'primaryProviderId', as: 'primaryProvider' });
  db.Patient.hasMany(db.MdToolbox, { foreignKey: 'patientId', as: 'mdToolboxData' });

  db.Staff.belongsTo(db.User, { foreignKey: 'userId', as: 'user' });

  db.Staff.belongsTo(db.User, { foreignKey: 'createdById', as: 'createdBy' });
  db.Staff.belongsTo(db.User, { foreignKey: 'updatedById', as: 'updatedBy' });
  db.Staff.belongsTo(db.GlobalType, { foreignKey: 'titleCode', targetKey: 'code', as: 'title' });
  db.Staff.belongsTo(db.GlobalType, { foreignKey: 'genderIdentityCode', targetKey: 'code', as: 'genderIdentity' });
  db.Staff.belongsTo(db.File, { foreignKey: 'fileId', as: 'file' });
  db.StaffLocation.belongsTo(db.PracticeLocation, {
    foreignKey: 'locationId',
    as: 'location',
  });

  db.EligibilityCheckHistory.belongsTo(db.Staff, { foreignKey: 'providerId', as: 'provider' });
  db.EligibilityCheckHistory.belongsTo(db.Patient, { foreignKey: 'patientId', as: 'patient' });
  db.EligibilityCheckHistory.belongsTo(db.Insurance, { foreignKey: 'insuranceId', as: 'insurance' });
 


  db.User.hasOne(db.Staff, { foreignKey: 'userId', as: 'staff' });
  db.User.hasOne(db.Patient, { foreignKey: 'userId', as: 'patient' });

  db.StaffLocation.hasMany(db.CalendarSchedule, {
    foreignKey: 'locationId',
    as: 'calenderSchedule',
  });

  db.CalendarSchedule.belongsTo(db.StaffLocation, {
    foreignKey: 'locationId',
    as: 'staffLocation',
  });
  db.CalendarSchedule.belongsTo(db.CalendarScheduleRecurringSetting, { foreignKey: 'calendarScheduleRecurringSettingId', as: 'calendarScheduleRecurringSetting' });

  db.Practice.belongsTo(db.DatabaseConfig, { foreignKey: 'databaseConfigId', as: 'databaseConfig' });
  db.Practice.belongsTo(db.User, { foreignKey: 'createdById', as: 'createdBy' });
  db.Practice.belongsTo(db.User, { foreignKey: 'updatedById', as: 'updatedBy' });

  db.DatabaseConfig.belongsTo(db.User, { foreignKey: 'createdById', as: 'createdBy' });
  db.DatabaseConfig.belongsTo(db.User, { foreignKey: 'updatedById', as: 'updatedBy' });

  db.Allergies.belongsTo(db.Patient, { foreignKey: 'patientId', as: 'patient' });
  db.Allergies.belongsToMany(db.GlobalType, {
    through: db.AllergiesReactions, // Specify the junction table
    foreignKey: 'allergyId', // Foreign key in AllergyReaction referencing Allergies.id
    as: 'reactions', // Optional alias for the association on Allergies side
  });

  db.GlobalType.belongsToMany(db.Allergies, {
    through: db.AllergiesReactions, // Specify the junction table
    foreignKey: 'reactionCode', // Foreign key in AllergyReaction referencing GlobalType.refCode
    as: 'allergies', // Optional alias for the association on GlobalType side
  });

  db.Allergies.belongsTo(db.GlobalType, { foreignKey: 'severitiesCode', targetKey: 'code', as: 'severities' });

  db.Allergies.belongsTo(db.User, { foreignKey: 'createdById', as: 'createdBy' });
  db.Allergies.belongsTo(db.User, { foreignKey: 'updatedById', as: 'updatedBy' });
  db.Patient.hasMany(db.Allergies, { foreignKey: 'patientId', as: 'allergies' });
  db.Patient.hasMany(db.PatientMedication, { foreignKey: 'patientId', as: 'medications' });
  db.Patient.hasMany(db.Diagnosis, { foreignKey: 'patientId', as: 'problems' });
  db.Patient.hasMany(db.Insurance, { foreignKey: 'patientId', as: 'insurance' });
  db.Patient.hasMany(db.FamilyHistory, { foreignKey: 'patientId', as: 'familyHistories' });
  db.Patient.hasMany(db.SocialHistory, { foreignKey: 'patientId', as: 'socialHistories' });
  db.Patient.hasMany(db.LabsRadiology, { foreignKey: 'patientId', as: 'labsRadiologies' });

  db.DiagnosisIcd.belongsTo(db.DiagnosisProblem, { foreignKey: 'diagnosisProblemId', as: 'diagnosisProblem' });

  db.Diagnosis.belongsTo(db.DiagnosisProblem, { foreignKey: 'problemId', as: 'problem' });
  db.Diagnosis.belongsTo(db.DiagnosisIcd, { foreignKey: 'ICDId', as: 'ICD' });
  db.Diagnosis.belongsTo(db.GlobalType, { foreignKey: 'sexualOrientationCode', targetKey: 'code', as: 'sexualOrientation' });
  db.Diagnosis.belongsTo(db.GlobalType, { foreignKey: 'typeCode', targetKey: 'code', as: 'type' });
  db.Diagnosis.belongsTo(db.GlobalType, { foreignKey: 'statusCode', targetKey: 'code', as: 'status' });
  db.Diagnosis.belongsTo(db.Patient, { foreignKey: 'patientId', as: 'patient' });
  db.Diagnosis.belongsTo(db.User, { foreignKey: 'createdById', as: 'createdBy' });
  db.Diagnosis.belongsTo(db.User, { foreignKey: 'updatedById', as: 'updatedBy' });

  db.Insurance.belongsTo(db.GlobalType, { foreignKey: 'insurancePolicyCode', targetKey: 'code', as: 'insurancePolicy' });
  db.Insurance.belongsTo(db.File, { foreignKey: 'insuranceFrontFileId', as: 'insuranceFrontFile' });
  db.Insurance.belongsTo(db.File, { foreignKey: 'insuranceBackFileId', as: 'insuranceBackFile' });
  db.Insurance.belongsTo(db.User, { foreignKey: 'createdById', as: 'createdBy' });
  db.Insurance.belongsTo(db.User, { foreignKey: 'updatedById', as: 'updatedBy' });
  db.Insurance.belongsTo(db.PayerList, { foreignKey: 'payerId', as: 'payerData' });
  db.Insurance.belongsTo(db.PayerList, { foreignKey: 'claimStatusCheckPayerId', as: 'claimStatusCheckPayerData' });
  db.Insurance.belongsTo(db.PayerList, { foreignKey: 'eligibilityCheckPayerId', as: 'eligibilityCheckPayerData' });
  db.Insurance.hasMany(db.EligibilityCheckHistory, { foreignKey: 'insuranceId', as: 'eligibilityData' });

  db.FamilyHistory.belongsTo(db.GlobalType, { foreignKey: 'relationshipCode', targetKey: 'code', as: 'relationship' });
  db.FamilyHistory.belongsTo(db.GlobalType, { foreignKey: 'statusCode', targetKey: 'code', as: 'status' });

  db.FamilyHistory.belongsTo(db.GlobalType, { foreignKey: 'conditionCode', targetKey: 'code', as: 'condition' });
  db.FamilyHistory.belongsTo(db.Patient, { foreignKey: 'patientId', as: 'patient' });
  db.FamilyHistory.belongsTo(db.User, { foreignKey: 'createdById', as: 'createdBy' });
  db.FamilyHistory.belongsTo(db.User, { foreignKey: 'updatedById', as: 'updatedBy' });

  db.SocialHistory.belongsTo(db.GlobalType, { foreignKey: 'socialHistoryCode', targetKey: 'code', as: 'socialHistory' });
  db.SocialHistory.belongsTo(db.GlobalType, { foreignKey: 'statusCode', targetKey: 'code', as: 'status' });
  db.SocialHistory.belongsTo(db.Patient, { foreignKey: 'patientId', as: 'patient' });
  db.SocialHistory.belongsTo(db.User, { foreignKey: 'createdById', as: 'createdBy' });
  db.SocialHistory.belongsTo(db.User, { foreignKey: 'updatedById', as: 'updatedBy' });

  db.PatientDocument.belongsTo(db.GlobalType, { foreignKey: 'typeCode', targetKey: 'code', as: 'type' });
  db.PatientDocument.belongsTo(db.Patient, { foreignKey: 'patientId', as: 'patient' });
  db.PatientDocument.belongsTo(db.File, { foreignKey: 'fileId', as: 'file' });
  db.PatientDocument.belongsTo(db.User, { foreignKey: 'createdById', as: 'createdBy' });
  db.PatientDocument.belongsTo(db.User, { foreignKey: 'updatedById', as: 'updatedBy' });
  db.PatientDocument.belongsTo(db.Staff, { foreignKey: 'providerId', as: 'provider' });

  db.GenericDrug.hasMany(db.BrandNameDrug, {
    foreignKey: 'genericDrugId',
    as: 'brands',
  });
  db.BrandNameDrug.belongsTo(db.GenericDrug, {
    foreignKey: 'genericDrugId',
    as: 'genericDrug',
  });

  // Associations for PatientMedication
  db.PatientMedication.belongsTo(db.Patient, { foreignKey: 'patientId', as: 'patient' });
  db.PatientMedication.belongsTo(db.Staff, { foreignKey: 'prescriberId', as: 'prescriber' });
  db.PatientMedication.hasMany(db.PatientMedicationItems, { foreignKey: 'patientMedicationId', as: 'items' });
  db.PatientMedicationItems.belongsTo(db.PatientMedication, { foreignKey: 'patientMedicationId', as: 'medication' });

  db.PatientMedicationItems.hasMany(db.PatientMedicationDiagnosis, { foreignKey: 'medicationItemsId', as: 'diagnoses' });
  db.PatientMedicationDiagnosis.belongsTo(db.PatientMedicationItems, { foreignKey: 'medicationItemsId', as: 'items' });

  db.PatientMedicationDiagnosis.belongsTo(db.DiagnosisIcd, {
    foreignKey: 'diagnosisIcdId',
    as: 'icd',
  });
  db.DiagnosisIcd.hasMany(db.PatientMedicationDiagnosis, {
    foreignKey: 'diagnosisIcdId',
    as: 'diagnoses',
  });

  // Additional associations for foreign keys in PatientMedicationItems

  db.PatientMedicationItems.belongsTo(db.GlobalType, { foreignKey: 'doseFormCode', targetKey: 'code', as: 'doseForm' });
  db.PatientMedicationItems.belongsTo(db.GlobalType, { foreignKey: 'unitCode', targetKey: 'code', as: 'unit' });
  db.PatientMedicationItems.belongsTo(db.GlobalType, { foreignKey: 'routeCode', targetKey: 'code', as: 'route' });
  db.PatientMedicationItems.belongsTo(db.GlobalType, { foreignKey: 'frequencyCode', targetKey: 'code', as: 'frequency' });
  db.PatientMedicationItems.belongsTo(db.GlobalType, { foreignKey: 'durationCode', targetKey: 'code', as: 'duration' });
  db.PatientMedicationItems.belongsTo(db.GlobalType, { foreignKey: 'directionCode', targetKey: 'code', as: 'direction' });
  db.PatientMedicationItems.belongsTo(db.GlobalType, {
    foreignKey: 'medicineStatusCode',
    targetKey: 'code',
    as: 'medicineStatus',
  });
  db.PatientMedicationItems.belongsTo(db.User, { foreignKey: 'createdById', as: 'createdBy' });
  db.PatientMedicationItems.belongsTo(db.User, { foreignKey: 'updatedById', as: 'updatedBy' });
  db.PatientMedicationItems.hasOne(db.MedicationSchedule, { foreignKey: 'patientMedicationItemId', as: 'schedules' });
  db.MedicationSchedule.belongsTo(db.PatientMedicationItems, { foreignKey: 'patientMedicationItemId', as: 'medicineItem' });

  db.PatientMedicationItems.hasMany(db.PatientMedicationItemMARLog, {
    foreignKey: 'patientMedicationItemId',  // Foreign key in the MAR Log table
    as: 'marLogs',  // Alias to access logs via associations
  });

  db.PatientMedicationItemMARLog.belongsTo(db.PatientMedicationItems, {
    foreignKey: 'patientMedicationItemId',  // Foreign key in the MAR Log table
    as: 'medicationItem',  // Alias to access the related medication item
  });
  db.PatientMedicationItemMARLog.belongsTo(db.GlobalType, { foreignKey: 'actionCode', targetKey: 'code', as: 'action' });
  
  db.PatientMedicationItemMARLog.belongsTo(db.Staff, { foreignKey: 'clinicianId', as: 'clinician' });


  db.PatientMedicationHistory.belongsTo(db.PatientMedication, {
    foreignKey: 'patientMedicationId',
    as: 'patientMedication',
  });
  db.PatientMedication.hasMany(db.PatientMedicationHistory, {
    foreignKey: 'patientMedicationId',
    as: 'patientMedicationHistory',
  });

  // Associations for PatientMedication
  db.PatientMedicationHistory.belongsTo(db.Patient, { foreignKey: 'patientId', as: 'patient' });
  db.PatientMedicationHistory.belongsTo(db.Staff, { foreignKey: 'prescriberId', as: 'prescriber' });
  db.PatientMedicationHistory.hasMany(db.PatientMedicationItemsHistory, {
    foreignKey: 'patientMedicationHistoryId',
    as: 'items',
  });
  db.PatientMedicationItemsHistory.belongsTo(db.PatientMedicationHistory, {
    foreignKey: 'patientMedicationHistoryId',
    as: 'medication',
  });

  db.PatientMedicationItemsHistory.hasMany(db.PatientMedicationDiagnosisHistory, {
    foreignKey: 'medicationItemsHistoryId',
    as: 'diagnoses',
  });
  db.PatientMedicationDiagnosisHistory.belongsTo(db.PatientMedicationItemsHistory, {
    foreignKey: 'medicationItemsHistoryId',
    as: 'items',
  });

  db.PatientMedicationDiagnosisHistory.belongsTo(db.DiagnosisIcd, {
    foreignKey: 'diagnosisIcdId',
    as: 'icd',
  });
  db.DiagnosisIcd.hasMany(db.PatientMedicationDiagnosisHistory, {
    foreignKey: 'diagnosisIcdId',
    as: 'diagnosesHistory',
  });

  // Additional associations for foreign keys in PatientMedicationItems

  db.PatientMedicationItemsHistory.belongsTo(db.GlobalType, {
    foreignKey: 'doseFormCode',
    targetKey: 'code',
    as: 'doseForm',
  });
  db.PatientMedicationItemsHistory.belongsTo(db.GlobalType, { foreignKey: 'unitCode', targetKey: 'code', as: 'unit' });
  db.PatientMedicationItemsHistory.belongsTo(db.GlobalType, { foreignKey: 'routeCode', targetKey: 'code', as: 'route' });
  db.PatientMedicationItemsHistory.belongsTo(db.GlobalType, {
    foreignKey: 'frequencyCode',
    targetKey: 'code',
    as: 'frequency',
  });
  db.PatientMedicationItemsHistory.belongsTo(db.GlobalType, {
    foreignKey: 'durationCode',
    targetKey: 'code',
    as: 'duration',
  });
  db.PatientMedicationItemsHistory.belongsTo(db.GlobalType, {
    foreignKey: 'directionCode',
    targetKey: 'code',
    as: 'direction',
  });
  db.PatientMedicationItemsHistory.belongsTo(db.GlobalType, {
    foreignKey: 'medicineStatusCode',
    targetKey: 'code',
    as: 'medicineStatus',
  });
  db.PatientMedicationItemsHistory.belongsTo(db.User, { foreignKey: 'createdById', as: 'createdBy' });
  db.PatientMedicationItemsHistory.belongsTo(db.User, { foreignKey: 'updatedById', as: 'updatedBy' });

  db.PatientMedicationHistory.belongsTo(db.Staff, { foreignKey: 'prescribedById', as: 'prescribedBy' });
  db.PatientMedicationHistory.belongsTo(db.Staff, { foreignKey: 'revisedById', as: 'revisedBy' });

  db.EmergencyContact.belongsTo(db.Patient, { foreignKey: 'patientId', as: 'patient' });
  db.EmergencyContact.belongsTo(db.User, { foreignKey: 'createdById', as: 'createdBy' });
  db.EmergencyContact.belongsTo(db.User, { foreignKey: 'updatedById', as: 'updatedBy' });
  db.EmergencyContact.belongsTo(db.GlobalType, {
    foreignKey: 'patientRelationCode',
    targetKey: 'code',
    as: 'patientRelation',
  });

  db.Appointment.belongsTo(db.GlobalType, { foreignKey: 'typeCode', targetKey: 'code', as: 'type' });
  db.Appointment.belongsTo(db.GlobalType, { foreignKey: 'copayCode', targetKey: 'code', as: 'copay' });
  db.Appointment.belongsTo(db.GlobalType, { foreignKey: 'statusCode', targetKey: 'code', as: 'status' });
  db.Appointment.belongsTo(db.PracticeLocation, { foreignKey: 'locationId', as: 'location' });
  db.Appointment.belongsTo(db.Staff, { foreignKey: 'practitionerId', as: 'practitioner' });
  db.Appointment.belongsTo(db.User, { foreignKey: 'createdById', as: 'createdBy' });
  db.Appointment.belongsTo(db.User, { foreignKey: 'updatedById', as: 'updatedBy' });
  db.Appointment.belongsTo(db.User, { foreignKey: 'deletedById', as: 'deletedBy' });
  db.Appointment.belongsTo(db.RecurringSetting, { foreignKey: 'recurringSettingId', as: 'recurringSetting' });
  db.Appointment.belongsTo(db.DiagnosisProblem, { foreignKey: 'problemId', as: 'problem' });
  db.StaffBookingSetting.belongsTo(db.Staff, {foreignKey: 'staffId', as: 'staff'})
  db.Staff.hasOne(db.StaffBookingSetting, {foreignKey: 'staffId', as: 'bookingSetting'})


  // db.Appointment.belongsTo(db.StaffBookingSetting, { targetKey: 'practitionerId' ,foreignKey: 'staffId', as: 'locationBookingSetting' });
  // db.Appointment.belongsTo(db.PatientForm, { foreignKey: 'patientFormId', as: 'patientForm' });

  db.Appointment.belongsToMany(db.Patient, { through: 'appointment_patient', foreignKey: 'appointmentId', as: 'patients' });
  db.Patient.belongsToMany(db.Appointment, { through: 'appointment_patient', foreignKey: 'patientId', as: 'appointments' });

  db.Appointment.belongsToMany(db.PatientForm, {
    through: db.AppointmentForm,
    as: 'patientForms', // Optional: alias for the association
    foreignKey: 'appointmentId', // Optional: the key used in the join table
  });

  db.PatientForm.belongsToMany(db.Appointment, {
    through: db.AppointmentForm,
    as: 'appointments', // Optional: alias for the association
    foreignKey: 'patientFormId', // Optional: the key used in the join table
  });

  db.RecurringSetting.hasMany(db.Appointment, { foreignKey: 'recurringSettingId', as: 'appointments' });

  db.PracticeSetting.belongsTo(db.File, { foreignKey: 'logoId', as: 'logo' });

  db.MeetConfig.belongsTo(db.User, { foreignKey: 'createdById', as: 'createdBy' });
  db.MeetConfig.belongsTo(db.User, { foreignKey: 'updatedById', as: 'updatedBy' });
  db.MeetConfig.belongsTo(db.User, { foreignKey: 'deletedById', as: 'deletedBy' });

  db.Form.belongsTo(db.GlobalType, { foreignKey: 'formCategoryCode', as: 'formCategory', targetKey: 'code' });
  db.Form.belongsTo(db.GlobalType, { foreignKey: 'formTypeCode', as: 'formType', targetKey: 'code' });
  db.Form.belongsTo(db.User, { foreignKey: 'createdById', as: 'createdBy' });
  db.Form.belongsTo(db.User, { foreignKey: 'updatedById', as: 'updatedBy' });
  db.Form.belongsTo(db.User, { foreignKey: 'deletedById', as: 'deletedBy' });
  db.Form.belongsToMany(db.Form, {
    through: db.LinkedConsentForm,
    as: 'linkedConsentForms',
    foreignKey: 'questionnaireId',
    otherKey: 'consentFormId',
  });

  db.Form.belongsToMany(db.Form, {
    through: db.LinkedConsentForm,
    as: 'questionnaires',
    foreignKey: 'consentFormId',
    otherKey: 'questionnaireId',
  });

  db.Form.belongsToMany(db.GlobalType, {
    through: db.FormEncounterTypes, // Specify the junction table
    foreignKey: 'formId',
    as: 'encounterTypes',
  });

  db.GlobalType.belongsToMany(db.Form, {
    through: db.FormEncounterTypes, // Specify the junction table
    foreignKey: 'encounterTypeCode',
    as: 'forms', // Optional alias for the association on GlobalType side
  });

  db.PatientForm.belongsTo(db.Patient, { foreignKey: 'patientId', as: 'patient' });
  db.PatientForm.belongsTo(db.Form, { foreignKey: 'formId', as: 'form' });
  db.PatientForm.belongsTo(db.Staff, { foreignKey: 'practitionerId', as: 'practitioner' });
  // db.PatientForm.belongsTo(db.Staff, { foreignKey: 'sharedById', as: 'sharedBy' });
  db.PatientForm.belongsTo(db.User, { foreignKey: 'sharedById', as: 'sharedBy' });
  db.PatientForm.belongsTo(db.PatientFormSubmission, { foreignKey: 'patientFormSubmissionId', as: 'patientFormSubmission' });
  db.PatientForm.belongsTo(db.User, { foreignKey: 'createdById', as: 'createdBy' });
  db.PatientForm.belongsTo(db.User, { foreignKey: 'updatedById', as: 'updatedBy' });
  db.PatientForm.belongsTo(db.User, { foreignKey: 'deletedById', as: 'deletedBy' });
  db.PatientForm.belongsToMany(db.PatientForm, {
    through: db.LinkedConsentFormPatient,
    as: 'linkedPatientForms',
    foreignKey: 'questionnaireId',
    otherKey: 'consentFormId',
  });

  db.PatientForm.belongsToMany(db.PatientForm, {
    through: db.LinkedConsentFormPatient,
    as: 'questionnaires',
    foreignKey: 'consentFormId',
    otherKey: 'questionnaireId',
  });

  db.PatientFormSubmission.belongsTo(db.PatientForm, { foreignKey: 'patientFormId', as: 'patientForm' });
  db.PatientFormSubmission.belongsTo(db.User, { foreignKey: 'createdById', as: 'createdBy' });
  db.PatientFormSubmission.belongsTo(db.User, { foreignKey: 'updatedById', as: 'updatedBy' });
  db.PatientFormSubmission.belongsTo(db.User, { foreignKey: 'deletedById', as: 'deletedBy' });

  db.FaxContact.belongsTo(db.User, { foreignKey: 'createdById', as: 'createdBy' });
  db.FaxContact.belongsTo(db.User, { foreignKey: 'updatedById', as: 'updatedBy' });
  db.FaxContact.belongsTo(db.User, { foreignKey: 'deletedById', as: 'deletedBy' });

  db.FaxHistory.belongsTo(db.FaxContact, { foreignKey: 'faxContactId', as: 'faxContact' });
  db.FaxHistory.belongsTo(db.PatientForm, { foreignKey: 'patientFormId', as: 'patientForm' });
  db.FaxHistory.belongsTo(db.PatientMedication, { foreignKey: 'patientMedicationId', as: 'patientMedication' });
  db.FaxHistory.belongsTo(db.User, { foreignKey: 'createdById', as: 'createdBy' });
  db.FaxHistory.belongsTo(db.User, { foreignKey: 'updatedById', as: 'updatedBy' });
  db.FaxHistory.belongsTo(db.User, { foreignKey: 'deletedById', as: 'deletedBy' });
  db.PatientForm.hasMany(db.FaxHistory, { foreignKey: 'patientFormId' });
  db.PatientMedication.hasMany(db.FaxHistory, { foreignKey: 'patientMedicationId' });

  db.LaboratoryTest.belongsTo(db.User, { foreignKey: 'createdById', as: 'createdBy' });
  db.LaboratoryTest.belongsTo(db.User, { foreignKey: 'updatedById', as: 'updatedBy' });
  db.LaboratoryTest.belongsTo(db.User, { foreignKey: 'deletedById', as: 'deletedBy' });

  db.LabsRadiology.belongsToMany(db.LaboratoryTest, {
    through: db.LabRadiologyLaboratoryTest,
    foreignKey: 'labRadiologyId',
    as: 'laboratoryTests', // Alias for LabsRadiology association
  });

  db.LaboratoryTest.belongsToMany(db.LabsRadiology, {
    through: db.LabRadiologyLaboratoryTest,
    foreignKey: 'laboratoryTestId',
    as: 'labsRadiologies', // Alias for LaboratoryTest association
  });

  // for analytics
  db.LabRadiologyLaboratoryTest.belongsTo(db.LaboratoryTest, { foreignKey: 'laboratoryTestId', as: 'laboratoryTests' });
  db.LabRadiologyLaboratoryTest.belongsTo(db.LabsRadiology, { foreignKey: 'labRadiologyId', as: 'labRadiology' });


  db.LabsRadiology.belongsTo(db.Patient, { foreignKey: 'patientId', as: 'patient' });
  db.LabsRadiology.belongsTo(db.Staff, { foreignKey: 'providerId', as: 'provider' });
  db.LabsRadiology.belongsTo(db.Staff, { foreignKey: 'processingOrderProviderId', as: 'processingOrderProvider' });
  db.LabsRadiology.belongsTo(db.DiagnosisIcd, { foreignKey: 'diagnosisIcdId', as: 'diagnosisIcd' });
  db.LabsRadiology.belongsTo(db.Diagnosis, { foreignKey: 'patientDiagnosisId', as: 'patientDiagnosis' });
  db.LabsRadiology.belongsTo(db.GlobalType, { foreignKey: 'statusCode', targetKey: 'code', as: 'status' });
  db.LabsRadiology.belongsTo(db.User, { foreignKey: 'createdById', as: 'createdBy' });
  db.LabsRadiology.belongsTo(db.User, { foreignKey: 'updatedById', as: 'updatedBy' });
  db.LabsRadiology.belongsTo(db.User, { foreignKey: 'deletedById', as: 'deletedBy' });
  db.LabsRadiology.belongsTo(db.PracticeLocation, { foreignKey: 'sendingFacilityId', as: 'sendingFacility' });
  db.LabsRadiology.belongsTo(db.TestingLab, { foreignKey: 'testingLabId', as: 'testingLabs' });
  db.LabsRadiology.belongsTo(db.GlobalType, { foreignKey: 'payer', targetKey: 'code', as: 'payerInfo' });

  db.EmailTemplate.belongsTo(db.GlobalType, { foreignKey: 'emailTypeCode', targetKey: 'code', as: 'emailType' });
  db.EmailTemplate.belongsTo(db.GlobalType, { foreignKey: 'typeCode', targetKey: 'code', as: 'appointmentType' });

  db.PatientEncounterForm.belongsTo(db.PatientEncounters, { foreignKey: 'patientEncounterId', as: 'patientEncounter' });
  db.PatientEncounterForm.belongsTo(db.Form, { foreignKey: 'formId' });

  db.PatientEncounters.hasMany(db.Allergies, { foreignKey: 'patientEncounterId', as: 'Allergies' });
  db.PatientEncounters.hasMany(db.PatientMedication, { foreignKey: 'patientEncounterId', as: 'Medications' });
  db.PatientEncounters.hasMany(db.Diagnosis, { foreignKey: 'patientEncounterId', as: 'Diagnosis' });
  db.PatientEncounters.hasMany(db.LabsRadiology, { foreignKey: 'patientEncounterId', as: 'LabRadiologies' });
  db.PatientEncounters.hasMany(db.Vitals, { foreignKey: 'patientEncounterId', as: 'Vitals' });
  db.PatientEncounters.belongsTo(db.Patient, { foreignKey: 'patientId', as: 'patient' });
  db.PatientEncounters.belongsTo(db.Staff, { foreignKey: 'assignedToId', as: 'assignedTo' });
  db.PatientEncounters.belongsTo(db.GlobalType, { foreignKey: 'encounterTypeCode', as: 'encounterType', targetKey: 'code' });
  db.PatientEncounters.belongsTo(db.GlobalType, { foreignKey: 'billingTypeCode', as: 'billingType', targetKey: 'code' });
  db.PatientEncounters.hasMany(db.PatientEncounterForm, { foreignKey: 'patientEncounterId', as: 'patientEncounterForms' });
  db.Form.hasMany(db.PatientEncounterForm, { foreignKey: 'formId' });
  db.Allergies.belongsTo(db.PatientEncounters, { foreignKey: 'patientEncounterId', as: 'patientEncounter' });
  db.Diagnosis.belongsTo(db.PatientEncounters, { foreignKey: 'patientEncounterId', as: 'patientEncounter' });
  db.PatientMedication.belongsTo(db.PatientEncounters, { foreignKey: 'patientEncounterId', as: 'patientEncounter' });
  db.LabsRadiology.belongsTo(db.PatientEncounters, { foreignKey: 'patientEncounterId', as: 'patientEncounter' });
  db.Vitals.belongsTo(db.PatientEncounters, { foreignKey: 'patientEncounterId', as: 'patientEncounter' });
  db.PatientEncounters.belongsTo(db.User, { foreignKey: 'createdById', as: 'createdBy' });
  db.PatientEncounters.belongsTo(db.User, { foreignKey: 'updatedById', as: 'updatedBy' });
  db.PatientEncounters.belongsTo(db.User, { foreignKey: 'deletedById', as: 'deletedBy' });
  db.PatientEncounterClaims.belongsTo(db.PatientEncounters, { foreignKey: 'encounterId', as: 'encounterDetails' });
  db.PatientEncounterClaims.belongsTo(db.Patient, { foreignKey: 'patientId', as: 'patient' });
  db.PatientEncounterClaims.belongsTo(db.GlobalType, { foreignKey: 'claimStatus', targetKey: 'code', as: 'status' });
  db.PatientEncounterClaims.belongsTo(db.PatientEncounterBilling, { foreignKey: 'encounterBillingId', as: 'encounterBilling' });
  db.PatientEncounterBilling.belongsTo(db.Insurance, { foreignKey: 'insuranceId', as: 'insurance' });

 



  db.PatientEncounters.hasOne(db.PatientEncounterBilling, {
    foreignKey: 'encounterId',
    as: 'billing',
  });

  db.PatientEncounterBilling.belongsTo(db.PatientEncounters, {
    foreignKey: 'encounterId',
    as: 'encounter',
  });

  //patient encounter billing
  db.PatientEncounterBilling.belongsTo(db.Patient, { foreignKey: 'patientId', as: 'patient' });
  db.PatientEncounterBilling.belongsTo(db.Staff, { foreignKey: 'primaryProviderId', as: 'primaryProvider' });
  db.PatientEncounterBilling.belongsTo(db.Staff, { foreignKey: 'referenceProviderId', as: 'referenceProvider' });
  db.PatientEncounterBilling.belongsTo(db.PracticeLocation, { foreignKey: 'locationId', as: 'location' });
  db.PatientEncounterBilling.belongsTo(db.GlobalType, { foreignKey: 'statusCode', as: 'status', targetKey: 'code' });
  db.Patient.hasMany(db.PatientEncounters, { foreignKey: 'patientId', as: 'encounters' });

  db.PatientEncounterBilling.belongsToMany(db.DiagnosisIcd, {
    through: db.PatientEncounterBillingIcdCode,
    foreignKey: 'patientEncounterBillingId',
    as: 'encounterDiagnosis', // Alias for association
  });

  db.DiagnosisIcd.belongsToMany(db.PatientEncounterBilling, {
    through: db.PatientEncounterBillingIcdCode,
    foreignKey: 'diagnosisIcdId',
    as: 'encounterBillings', // Alias for association
  });

  db.PatientEncounterBilling.belongsToMany(db.DiagnosisSnomedCt, {
    through: db.PatientEncounterBillingSnomedCtCode,
    foreignKey: 'patientEncounterBillingId',
    as: 'encounterDiagnosisSnomeds', // Alias for association
  });

  db.DiagnosisSnomedCt.belongsToMany(db.PatientEncounterBilling, {
    through: db.PatientEncounterBillingSnomedCtCode,
    foreignKey: 'diagnosisSnomedCtId',
    as: 'encounterBillings', // Alias for association
  });

  db.PatientEncounterBilling.belongsToMany(db.ProcedureCode, {
    through: db.PatientEncounterBillingProcedureCode,
    foreignKey: 'encounterBillingId',
    otherKey: 'procedureCodeId',
    as: 'encounterProcedureCodes',
  });

  db.ProcedureCode.belongsToMany(db.PatientEncounterBilling, {
    through: db.PatientEncounterBillingProcedureCode,
    foreignKey: 'procedureCodeId',
    otherKey: 'encounterBillingId',
    as: 'encounterBillings',
  });
  
  db.PatientEncounterBillingProcedureCode.belongsTo(db.ProcedureCode, { foreignKey: 'procedureCodeId', as: 'procedureCode' });

  db.PatientEncounterBilling.hasMany(db.PatientEncounterClaims, {
    foreignKey: 'encounterBillingId',
    as: 'claims',
  });

  // ... any other associations

  db.TreatmentPlan.belongsTo(db.GlobalType, { foreignKey: 'statusCode', targetKey: 'code', as: 'status' });
  db.TreatmentPlan.belongsTo(db.User, { foreignKey: 'createdById', as: 'createdBy' });
  db.TreatmentPlan.belongsTo(db.User, { foreignKey: 'updatedById', as: 'reviewedBy' });
  db.TreatmentPlan.belongsTo(db.Patient, { foreignKey: 'patientId', as: 'patient' });
  db.TreatmentPlan.hasMany(db.TreatmentPlanDiagnosis, { foreignKey: 'treatmentPlanId', as: 'diag' });

  db.TreatmentPlanDiagnosis.belongsTo(db.TreatmentPlan, { foreignKey: 'treatmentPlanId' });
  db.TreatmentPlanDiagnosis.belongsTo(db.DiagnosisIcd, { foreignKey: 'icdId', as: 'ICDId' });
  db.TreatmentPlanDiagnosis.hasMany(db.TreatmentPlanProblem, { foreignKey: 'treatmentPlanDiagnosisId', as: 'prob' });

  db.TreatmentPlanProblem.belongsTo(db.TreatmentPlanDiagnosis);
  db.TreatmentPlanProblem.belongsTo(db.IcdProblem, { foreignKey: 'icdProblemId', as: 'IPId' });
  db.TreatmentPlanProblem.hasMany(db.TreatmentPlanBehavior, { foreignKey: 'treatmentPlanProblemId', as: 'beha' });
  db.TreatmentPlanBehavior.belongsTo(db.TreatmentPlanProblem);
  db.TreatmentPlanBehavior.belongsTo(db.ProblemBehavior, { foreignKey: 'problemBehaviorId', as: 'PBId' });
  db.TreatmentPlanBehavior.hasMany(db.TreatmentPlanGoal, { foreignKey: 'treatmentPlanBehaviorId', as: 'goals' });
  db.TreatmentPlanGoal.belongsTo(db.TreatmentPlanBehavior);
  db.TreatmentPlanGoal.belongsTo(db.BehaviorGoal, { foreignKey: 'behaviorGoalId', as: 'BGId' });
  db.TreatmentPlanGoal.hasMany(db.TreatmentPlanObjective, { foreignKey: 'treatmentPlanGoalId', as: 'obj' });
  db.TreatmentPlanObjective.belongsTo(db.TreatmentPlanGoal);
  db.TreatmentPlanObjective.belongsTo(db.GoalObjective, { foreignKey: 'goalObjectiveId', as: 'GOId' });
  db.TreatmentPlanIntervention.belongsTo(db.TreatmentPlanObjective);
  db.TreatmentPlanIntervention.belongsTo(db.ObjectiveIntervention, {
    foreignKey: 'objectiveInterventionId',
    as: 'OIId',
  });
  db.TreatmentPlanObjective.hasMany(db.TreatmentPlanIntervention, {
    foreignKey: 'treatmentPlanObjectiveId',
    as: 'inter',
  });
  db.TreatmentPlanTemplate.belongsTo(db.User, { foreignKey: 'createdById', as: 'createdBy' });
  db.TreatmentPlanTemplate.belongsTo(db.User, { foreignKey: 'updatedById', as: 'reviewedBy' });
  db.TreatmentPlanTemplate.hasMany(db.TreatmentPlanTemplateDiagnosis, { foreignKey: 'treatmentPlanTemplateId', as: 'diag' });
  
  db.TreatmentPlanTemplateDiagnosis.belongsTo(db.TreatmentPlanTemplate, { foreignKey: 'treatmentPlanTemplateId' });
  db.TreatmentPlanTemplateDiagnosis.belongsTo(db.DiagnosisIcd, { foreignKey: 'icdId', as: 'ICDId' });
  db.TreatmentPlanTemplateDiagnosis.hasMany(db.TreatmentPlanTemplateProblem, { foreignKey: 'treatmentPlanTemplateDiagnosisId', as: 'prob' });

  db.TreatmentPlanTemplateProblem.belongsTo(db.TreatmentPlanTemplateDiagnosis);
  db.TreatmentPlanTemplateProblem.belongsTo(db.IcdProblem, { foreignKey: 'icdProblemId', as: 'IPId' });
  db.TreatmentPlanTemplateProblem.hasMany(db.TreatmentPlanTemplateBehavior, { foreignKey: 'treatmentPlanTemplateProblemId', as: 'beha' });
  db.TreatmentPlanTemplateBehavior.belongsTo(db.TreatmentPlanTemplateProblem);
  db.TreatmentPlanTemplateBehavior.belongsTo(db.ProblemBehavior, { foreignKey: 'problemBehaviorId', as: 'PBId' });
  db.TreatmentPlanTemplateBehavior.hasMany(db.TreatmentPlanTemplateGoal, { foreignKey: 'treatmentPlanTemplateBehaviorId', as: 'goals' });
  db.TreatmentPlanTemplateGoal.belongsTo(db.TreatmentPlanTemplateBehavior);
  db.TreatmentPlanTemplateGoal.belongsTo(db.BehaviorGoal, { foreignKey: 'behaviorGoalId', as: 'BGId' });
  db.TreatmentPlanTemplateGoal.hasMany(db.TreatmentPlanTemplateObjective, { foreignKey: 'treatmentPlanTemplateGoalId', as: 'obj' });
  db.TreatmentPlanTemplateObjective.belongsTo(db.TreatmentPlanTemplateGoal);
  db.TreatmentPlanTemplateObjective.belongsTo(db.GoalObjective, { foreignKey: 'goalObjectiveId', as: 'GOId' });
  db.TreatmentPlanTemplateIntervention.belongsTo(db.TreatmentPlanTemplateObjective);
  db.TreatmentPlanTemplateIntervention.belongsTo(db.ObjectiveIntervention, {
    foreignKey: 'objectiveInterventionId',
    as: 'OIId',
  });
  db.TreatmentPlanTemplateObjective.hasMany(db.TreatmentPlanTemplateIntervention, {
    foreignKey: 'treatmentPlanTemplateObjectiveId',
    as: 'inter',
  });
  db.Appointment;

  db.LabReport.belongsTo(db.LabsRadiology, {
    foreignKey: 'labRadiologyId',
    as: 'labRadiology',
  });

  db.RoleAndModule.belongsTo(db.Role, {
    foreignKey: 'roleId',
    as: 'role',
  });

  db.RoleAndModule.belongsTo(db.Module, {
    foreignKey: 'moduleId',
    as: 'module',
  });

  db.RoleAndPermissions.belongsTo(db.Role, {
    foreignKey: 'roleId',
    as: 'role',
  });

  db.RoleAndPermissions.belongsTo(db.Module, {
    foreignKey: 'moduleId',
    as: 'module',
  });

  db.Module.belongsToMany(db.GlobalType, {
    through: db.PermissionModule,
    foreignKey: 'moduleId',
    as: 'permissions', // Alias for LabsRadiology association
  });
  
  // staff appoitments                                                 
  db.Staff.hasMany(db.Appointment, { foreignKey: 'practitionerId',as: 'staffAppointments' });

  db.Appointment.hasOne(db.ZoomSession, { foreignKey: "appointmentId",as:"zoomSession" });
db.ZoomSession.belongsTo(db.Appointment, { foreignKey: "appointmentId",as:'appointment' });
db.ZoomSession.hasMany(db.ZoomSessionInvite, { foreignKey: "zoomSessionId",as:"zoomSessionInvites" });
db.ZoomSessionInvite.belongsTo(db.User, { foreignKey: "userId",as:"user"});

  db.Role.belongsTo(db.RoleAndPermissions, {
    foreignKey: 'id',
    targetKey: 'roleId',
    as: 'RoleAndPermission',
  })

  db.RoleAndPermissions.belongsTo(db.GlobalType, {
    foreignKey: 'permissionId',
    as: 'permissions',
  });

  db.Homework.belongsTo(db.User, { foreignKey: 'createdById', as: 'createdBy' });
  db.Homework.belongsTo(db.User, { foreignKey: 'updatedById', as: 'updatedBy' });
  db.Homework.belongsTo(db.DiagnosisIcd, { foreignKey: 'ICDId', as: 'diagnosisIcd' });
  db.Homework.belongsTo(db.GlobalType, { foreignKey: 'statusCode', targetKey: 'code', as: 'status' });

  db.Invoice.belongsTo(db.Patient, { foreignKey: 'patientId', as: 'patient' });
  db.Invoice.belongsTo(db.PatientEncounters, { foreignKey: 'encounterId', as: 'encounter' });
  db.Invoice.belongsTo(db.GlobalType, { foreignKey: 'status',targetKey: 'code', as: 'statusCode' });
  db.PatientEncounters.hasMany(db.Invoice, { foreignKey: 'encounterId', as: 'invoice' });
  db.Patient.hasMany(db.Invoice, { foreignKey: 'patientId', as: 'invoice' });
  db.EncounterNote.belongsTo(db.User, { foreignKey: 'createdById', as: 'createdBy' });
  db.PatientEncounters.hasMany(db.EncounterNote, { foreignKey: 'encounterId', as: 'notes' });

  db.OutOfOfficeSchedule.belongsTo(db.PracticeLocation, {
    foreignKey: 'locationId',
    as: 'location',
  });
};

module.exports = defineAssociations;
