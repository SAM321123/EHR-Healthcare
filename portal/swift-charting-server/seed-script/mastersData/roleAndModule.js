const roleAndModules = [
    ///////////PATIENT PORTAL/////////////
    // {
    //     roleCode: 'patient',
    //     moduleCode: 'patientPortalDashboard',
    // },
    {
        roleCode: 'patient',
        moduleCode: 'patientPortalappointment',
    },
    {
        roleCode: 'patient',
        moduleCode: 'patient_form',
    },
    {
        roleCode: 'patient',
        moduleCode:'patientportalmedication',
    },
    {
        roleCode: 'patient',
        moduleCode: 'vitals',
    },
    {
        roleCode: 'patient',
        moduleCode: 'patientPortalAllergies',
    },
    {
        roleCode: 'patient',
        moduleCode: 'patientPortallabsRadiology',
    },
    {
        roleCode: 'patient',
        moduleCode: 'patientPortallabsReport',
    },
    {
        roleCode: 'patient',
        moduleCode: 'patientPortalMessages',
    },
    {
        roleCode: 'patient',
        moduleCode: 'accounts', 
    },
    /////////////////////////////////////// 
    ///////////CLINIC ADMIN///////////////////
    {
        roleCode: 'clinicAdmin',
        moduleCode: 'dashboard',
    },
    {
        roleCode:'clinicAdmin',
        moduleCode: 'patient',
    },
    {
        roleCode: 'clinicAdmin',
        moduleCode: 'scheduling',
    },
    {
        roleCode: 'clinicAdmin',
        moduleCode:'encounter',
    },
    {
        roleCode: 'clinicAdmin',
        moduleCode: 'labRadiology',
    },
    {
        roleCode: 'clinicAdmin',
        moduleCode: '/staff',
    },
    {
        roleId: 'clinicAdmin',
        moduleCode: '/fax',  // Medical Billing'
    },
    {
        roleCode: 'clinicAdmin',
        moduleCode: '/system-settings', 
    },
    {
        roleCode: 'clinicAdmin',
        moduleCode: '/medical-billing', 
    },
    {
        roleCode: 'clinicAdmin',
        moduleCode: '/messages', 
    },
    {
        roleCode: 'clinicAdmin',
        moduleCode: 'analytics_and_reporting', 
    },
    {
        roleCode: 'clinicAdmin',
        moduleCode: '/patient',  //fax
    },
    {
        roleCode: 'clinicAdmin',
        moduleCode: '/alerts', 
    },
    {
        roleCode: 'clinicAdmin',
        moduleCode: '/tasks', 
    },
    {
        roleCode: 'clinicAdmin',
        moduleCode: 'accounts', 
    },
    ///////////////////////////////////////////
    /////////////PRACTITIONER/////////////////
    {
        roleCode: 'practitioner',
        moduleCode: 'dashboard',
    },
    {
        roleCode: 'practitioner',
        moduleCode: 'patient',
    },
    /////////////PATIENT NESTED MODULES///////////////////////////////
    {
        roleCode: 'practitioner',
        moduleCode: 'patientSummary',
    },
    {
        roleCode: 'practitioner',
        moduleCode: 'patientDemographic',
    },
    {
        roleCode: 'practitioner',
        moduleCode: 'diagnosis',
    },
    {
        roleCode: 'practitioner',
        moduleCode: 'vitals',
    },
    {
        roleCode: 'practitioner',
        moduleCode: 'patientmedication',
    },
    {
        roleCode: 'practitioner',
        moduleCode: 'md-toolbox',
    },
    {
        roleCode: 'practitioner',
        moduleCode: 'medication_schedule',
    },
    {
        roleCode: 'practitioner',
        moduleCode: 'form',
    },
    {
        roleCode: 'practitioner',
        moduleCode: 'medical_history',
    },
    {
        roleCode: 'practitioner',
        moduleCode: 'emar',
    },
    {
        roleCode: 'practitioner',
        moduleCode: 'family_history',
    },
    {
        roleCode: 'practitioner',
        moduleCode: 'socialHistory',
    },
    {
        roleCode: 'practitioner',
        moduleCode: 'appointment',
    },
    {
        roleCode: 'practitioner',
        moduleCode: 'insurance',
    },
    {
        roleCode: 'practitioner',
        moduleCode: 'emergencycontact',
    },
    {
        roleCode: 'practitioner',
        moduleCode: 'labs_radiology',
    },
    {
        roleCode: 'practitioner',
        moduleCode: 'documents',
    },
    {
        roleCode: 'practitioner',
        moduleCode: 'treatmentplan',
    },
    {
        roleCode: 'practitioner',
        moduleCode: 'patientForms',
    },
    {
        roleCode: 'practitioner',
        moduleCode: 'encounters',
    },
    {
        roleCode: 'practitioner',
        moduleCode: 'allergies',
    },
    {
        roleCode: 'practitioner',
        moduleCode: 'eligibility_check_history',
    },
    {
        roleCode: 'practitioner',
        moduleCode: 'homework',
    },

    //////////////////////////////////////////////////////////////
    {
        roleCode: 'practitioner',
        moduleCode: 'scheduling',
    },
    {
        roleCode: 'practitioner',
        moduleCode:'encounter',
    },
    {
        roleCode: 'practitioner',
        moduleCode: 'encountersbilling',
    },
    {
        roleCode: 'practitioner',
        moduleCode: 'labRadiology',
    },
    {
        roleCode: 'practitioner',
        moduleCode: 'medicalBilling',
    },
    {
        roleCode: 'practitioner',
        moduleCode: 'analytics_and_reporting',  // Medical Billing'
    },
    {
        roleCode: 'practitioner',
        moduleCode: 'messages', 
    },
    {
        roleCode: 'practitioner',
        moduleCode: 'alerts', 
    },
    {
        roleCode: 'practitioner',
        moduleCode: 'tasks', 
    },
    {
        roleCode: 'practitioner',
        moduleCode: 'fax', 
    },
    {
        roleCode: 'practitioner',
        moduleCode: 'faxContact', 
    },
    {
        roleCode: 'practitioner',
        moduleCode: 'faxHistory', 
    },
    {
        roleCode: 'practitioner',
        moduleCode: 'form_setting', 
    },
    {
        roleCode: 'practitioner',
        moduleCode: 'bookingSettings', 
    },
    {
        roleCode: 'practitioner',
        moduleCode: 'accounts', 
    },
    {
        roleCode: 'practitioner',
        moduleCode: 'invoice', 
    },
    {
        roleCode: 'practitioner',
        moduleCode: 'claims', 
    },
  
    ///////////////////////////////////////////
    //////////RN / Medical assistant///////////
     {
        roleCode: 'rn',
        moduleCode: 'dashboard',
    },
    {
        roleCode: 'rn',
        moduleCode: 'patient',
    },
    /////////////PATIENT NESTED MODULES///////////////////////////////
    {
        roleCode: 'rn',
        moduleCode: 'patientSummary',
    },
    {
        roleCode: 'rn',
        moduleCode: 'patientDemographic',
    },
    {
        roleCode: 'rn',
        moduleCode: 'diagnosis',
    },
    {
        roleCode: 'rn',
        moduleCode: 'vitals',
    },
    {
        roleCode: 'rn',
        moduleCode: 'patientmedication',
    },
    {
        roleCode: 'rn',
        moduleCode: 'md-toolbox',
    },
    {
        roleCode: 'rn',
        moduleCode: 'medication_schedule',
    },
    {
        roleCode: 'rn',
        moduleCode: 'form',
    },
    {
        roleCode: 'rn',
        moduleCode: 'medical_history',
    },
    {
        roleCode: 'rn',
        moduleCode: 'emar',
    },
    {
        roleCode: 'rn',
        moduleCode: 'family_history',
    },
    {
        roleCode: 'rn',
        moduleCode: 'socialHistory',
    },
    {
        roleCode: 'rn',
        moduleCode: 'appointment',
    },
    {
        roleCode: 'rn',
        moduleCode: 'insurance',
    },
    {
        roleCode: 'rn',
        moduleCode: 'emergencycontact',
    },
    {
        roleCode: 'rn',
        moduleCode: 'labs_radiology',
    },
    {
        roleCode: 'rn',
        moduleCode: 'documents',
    },
    {
        roleCode: 'rn',
        moduleCode: 'treatmentplan',
    },
    {
        roleCode: 'rn',
        moduleCode: 'patientForms',
    },
    {
        roleCode: 'rn',
        moduleCode: 'encounters',
    },
    {
        roleCode: 'rn',
        moduleCode: 'allergies',
    },
    {
        roleCode: 'rn',
        moduleCode: 'eligibility_check_history',
    },
    {
        roleCode: 'rn',
        moduleCode: 'homework',
    },

    //////////////////////////////////////////////////////////////
    {
        roleCode: 'rn',
        moduleCode: 'scheduling',
    },
    {
        roleCode: 'rn',
        moduleCode:'encounter',
    },
    {
        roleCode: 'rn',
        moduleCode: 'encountersbilling',
    },
    {
        roleCode: 'rn',
        moduleCode: 'labRadiology',
    },
    {
        roleCode: 'rn',
        moduleCode: 'medicalBilling',
    },
    {
        roleCode: 'rn',
        moduleCode: 'analytics_and_reporting',  // Medical Billing'
    },
    {
        roleCode: 'rn',
        moduleCode: 'messages', 
    },
    {
        roleCode: 'rn',
        moduleCode: 'alerts', 
    },
    {
        roleCode: 'rn',
        moduleCode: 'tasks', 
    },
    {
        roleCode: 'rn',
        moduleCode: 'fax', 
    },
    {
        roleCode: 'rn',
        moduleCode: 'faxContact', 
    },
    {
        roleCode: 'rn',
        moduleCode: 'faxHistory', 
    },
    {
        roleCode: 'rn',
        moduleCode: 'form_setting', 
    },
    {
        roleCode: 'rn',
        moduleCode: 'bookingSettings', 
    },
    {
        roleCode: 'rn',
        moduleCode: 'accounts', 
    },
    {
        roleCode: 'rn',
        moduleCode: 'invoice', 
    },
    {
        roleCode: 'rn',
        moduleCode: 'claims', 
    },
    ///////////////////////////////////////////
    
  ];
  
  module.exports = {
    roleAndModules,
  };
  