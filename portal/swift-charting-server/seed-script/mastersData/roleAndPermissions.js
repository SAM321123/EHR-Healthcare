const roleAndPermissions = [
    ///////////PATIENT PORTAL/////////////
    // {
    //     roleCode: 'patient',
    //     moduleCode: 'patientPortalDashboard',
    //     permissions: ['read', 'create', 'update', 'delete', 'share', 'print']
    // },
    {
        roleCode: 'patient',
        moduleCode: 'patientPortalappointment',
        permissions: ['read', 'create', 'update', 'delete', 'share', 'print']
    },
    {
        roleCode: 'patient',
        moduleCode: 'patient_form',
        permissions: ['read', 'create', 'update', 'delete', 'share', 'print']
    },
    {
        roleCode: 'patient',
        moduleCode:'patientportalmedication',
        permissions: ['read', 'create', 'update', 'delete', 'share', 'print']
    },
    {
        roleCode: 'patient',
        moduleCode: 'vitals',
        permissions: ['read', 'create', 'update', 'delete', 'share', 'print']
    },
    {
        roleCode: 'patient',
        moduleCode: 'patientPortalAllergies',
        permissions: ['read', 'create', 'update', 'delete', 'share', 'print']
    },
    {
        roleCode: 'patient',
        moduleCode: 'patientPortallabsRadiology',
        permissions: ['read', 'create', 'update', 'delete', 'share', 'print']
    },
    {
        roleCode: 'patient',
        moduleCode: 'patientPortallabsReport',
        permissions: ['read', 'create', 'update', 'delete', 'share', 'print']
    },
    {
        roleCode: 'patient',
        moduleCode: 'patientPortalMessages',
        permissions: ['read', 'create', 'update', 'delete', 'share', 'print']
    },
    {
        roleCode: 'patient',
        moduleCode: 'accounts',
        permissions: ['read', 'create', 'update', 'delete', 'share', 'print'] 
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
        permissions: ['read', 'create', 'update', 'delete', 'share', 'print']
    },
    {
        roleCode: 'practitioner',
        moduleCode: 'patient',
        permissions: ['read', 'create', 'update', 'delete', 'share', 'print']
    },
    /////////////PATIENT NESTED MODULES///////////////////////////////
    {
        roleCode: 'practitioner',
        moduleCode: 'patientSummary',
        permissions: ['read', 'create', 'update', 'delete', 'share', 'print']
    },
    {
        roleCode: 'practitioner',
        moduleCode: 'patientDemographic',
        permissions: ['read', 'create', 'update', 'delete', 'share', 'print']
    },
    {
        roleCode: 'practitioner',
        moduleCode: 'diagnosis',
        permissions: ['read', 'create', 'update', 'delete', 'share', 'print']
    },
    {
        roleCode: 'practitioner',
        moduleCode: 'vitals',
        permissions: ['read', 'create', 'update', 'delete', 'share', 'print']
    },
    {
        roleCode: 'practitioner',
        moduleCode: 'patientmedication',
        permissions: ['read', 'create', 'update', 'delete', 'share', 'print']
    },
    {
        roleCode: 'practitioner',
        moduleCode: 'md-toolbox',
        permissions: ['read', 'create', 'update', 'delete', 'share', 'print']
    },
    {
        roleCode: 'practitioner',
        moduleCode: 'medication_schedule',
        permissions: ['read', 'create', 'update', 'delete', 'share', 'print']
    },
    {
        roleCode: 'practitioner',
        moduleCode: 'emar',
        permissions: ['read', 'create', 'update', 'delete', 'share', 'print']
    },
    {
        roleCode: 'practitioner',
        moduleCode: 'medical_history',
        permissions: ['read', 'create', 'update', 'delete', 'share', 'print']
    },
    {
        roleCode: 'practitioner',
        moduleCode: 'appointment',
        permissions: ['read', 'create', 'update', 'delete', 'share', 'print']
    },
    {
        roleCode: 'practitioner',
        moduleCode: 'insurance',
        permissions: ['read', 'create', 'update', 'delete', 'share', 'print']
    },
    {
        roleCode: 'practitioner',
        moduleCode: 'emergencycontact',
        permissions: ['read', 'create', 'update', 'delete', 'share', 'print']
    },
    {
        roleCode: 'practitioner',
        moduleCode: 'labRadiology',
        permissions: ['read', 'create', 'update', 'delete', 'share', 'print']
    },
    {
        roleCode: 'practitioner',
        moduleCode: 'documents',
        permissions: ['read', 'create', 'update', 'delete', 'share', 'print']
    },
    {
        roleCode: 'practitioner',
        moduleCode: 'treatmentplan',
        permissions: ['read', 'create', 'update', 'delete', 'share', 'print']
    },
    {
        roleCode: 'practitioner',
        moduleCode: 'patientForms',
        permissions: ['read', 'create', 'update', 'delete', 'share', 'print']
    },
    {
        roleCode: 'practitioner',
        moduleCode: 'encounters',
        permissions: ['read', 'create', 'update', 'delete', 'share', 'print']
    },
    {
        roleCode: 'practitioner',
        moduleCode: 'allergies',
        permissions: ['read', 'create', 'update', 'delete', 'share', 'print']
    },
    {
        roleCode: 'practitioner',
        moduleCode: 'eligibility_check_history',
        permissions: ['read', 'create', 'update', 'delete', 'share', 'print']
    },
    {
        roleCode: 'practitioner',
        moduleCode: 'homework',
        permissions: ['read', 'create', 'update', 'delete', 'share', 'print']
    },

    //////////////////////////////////////////////////////////////
    {
        roleCode: 'practitioner',
        moduleCode: 'scheduling',
        permissions: ['read', 'create', 'update', 'delete', 'share', 'print']
    },
    {
        roleCode: 'practitioner',
        moduleCode:'encounter',
        permissions: ['read', 'create', 'update', 'delete', 'share', 'print']
    },
    {
        roleCode: 'practitioner',
        moduleCode: 'encountersbilling',
        permissions: ['read', 'create', 'update', 'delete', 'share', 'print'] 
    },
    {
        roleCode: 'practitioner',
        moduleCode: 'labs_radiology',
        permissions: ['read', 'create', 'update', 'delete', 'share', 'print']
    },
    {
        roleCode: 'practitioner',
        moduleCode: 'medicalBilling',
        permissions: ['read', 'create', 'update', 'delete', 'share', 'print']
    },
    {
        roleCode: 'practitioner',
        moduleCode: 'analytics_and_reporting',  // Medical Billing'
        permissions: ['read', 'create', 'update', 'delete', 'share', 'print']
    },
    {
        roleCode: 'practitioner',
        moduleCode: 'messages', 
        permissions: ['read', 'create', 'update', 'delete', 'share', 'print']
    },
    {
        roleCode: 'practitioner',
        moduleCode: 'alerts', 
        permissions: ['read', 'create', 'update', 'delete', 'share', 'print']
    },
    {
        roleCode: 'practitioner',
        moduleCode: 'tasks', 
        permissions: ['read', 'create', 'update', 'delete', 'share', 'print']
    },
    {
        roleCode: 'practitioner',
        moduleCode: 'fax', 
        permissions: ['read', 'create', 'update', 'delete', 'share', 'print']
    },
    {
        roleCode: 'practitioner',
        moduleCode: 'faxContact', 
        permissions: ['read', 'create', 'update', 'delete', 'share', 'print']
    },
    {
        roleCode: 'practitioner',
        moduleCode: 'faxHistory', 
        permissions: ['read', 'create', 'update', 'delete', 'share', 'print']
    },
    {
        roleCode: 'practitioner',
        moduleCode: 'form_setting', 
        permissions: ['read', 'create', 'update', 'delete', 'share', 'print']
    },
    {
        roleCode: 'practitioner',
        moduleCode: 'bookingSettings', 
        permissions: ['read', 'create', 'update', 'delete', 'share', 'print']
    },
    {
        roleCode: 'practitioner',
        moduleCode: 'accounts',
        permissions: ['read', 'create', 'update', 'delete', 'share', 'print'] 
    },
    {
        roleCode: 'practitioner',
        moduleCode: 'invoice',
        permissions: ['read', 'create', 'update', 'delete', 'share', 'print'] 
    },
    {
        roleCode: 'practitioner',
        moduleCode: 'claims',
        permissions: ['read', 'create', 'update', 'delete', 'share', 'print'] 
    },
  
    ///////////////////////////////////////////
    ////////////RN / Medical assistant/////////
    {
        roleCode: 'rn',
        moduleCode: 'dashboard',
        permissions: ['read', 'create', 'update', 'delete', 'share', 'print']
    },
    {
        roleCode: 'rn',
        moduleCode: 'patient',
        permissions: ['read', 'create', 'update', 'delete', 'share', 'print']
    },
    /////////////PATIENT NESTED MODULES///////////////////////////////
    {
        roleCode: 'rn',
        moduleCode: 'patientSummary',
        permissions: ['read', 'create', 'update', 'delete', 'share', 'print']
    },
    {
        roleCode: 'rn',
        moduleCode: 'patientDemographic',
        permissions: ['read', 'create', 'update', 'delete', 'share', 'print']
    },
    {
        roleCode: 'rn',
        moduleCode: 'diagnosis',
        permissions: ['read', 'create', 'update', 'delete', 'share', 'print']
    },
    {
        roleCode: 'rn',
        moduleCode: 'vitals',
        permissions: ['read', 'create', 'update', 'delete', 'share', 'print']
    },
    {
        roleCode: 'rn',
        moduleCode: 'patientmedication',
        permissions: ['read', 'create', 'update', 'delete', 'share', 'print']
    },
    {
        roleCode: 'rn',
        moduleCode: 'md-toolbox',
        permissions: ['read', 'create', 'update', 'delete', 'share', 'print']
    },
    {
        roleCode: 'rn',
        moduleCode: 'medication_schedule',
        permissions: ['read', 'create', 'update', 'delete', 'share', 'print']
    },
    {
        roleCode: 'rn',
        moduleCode: 'emar',
        permissions: ['read', 'create', 'update', 'delete', 'share', 'print']
    },
    {
        roleCode: 'rn',
        moduleCode: 'medical_history',
        permissions: ['read', 'create', 'update', 'delete', 'share', 'print']
    },
    {
        roleCode: 'rn',
        moduleCode: 'appointment',
        permissions: ['read', 'create', 'update', 'delete', 'share', 'print']
    },
    {
        roleCode: 'rn',
        moduleCode: 'insurance',
        permissions: ['read', 'create', 'update', 'delete', 'share', 'print']
    },
    {
        roleCode: 'rn',
        moduleCode: 'emergencycontact',
        permissions: ['read', 'create', 'update', 'delete', 'share', 'print']
    },
    {
        roleCode: 'rn',
        moduleCode: 'labRadiology',
        permissions: ['read', 'create', 'update', 'delete', 'share', 'print']
    },
    {
        roleCode: 'rn',
        moduleCode: 'documents',
        permissions: ['read', 'create', 'update', 'delete', 'share', 'print']
    },
    {
        roleCode: 'rn',
        moduleCode: 'treatmentplan',
        permissions: ['read', 'create', 'update', 'delete', 'share', 'print']
    },
    {
        roleCode: 'rn',
        moduleCode: 'patientForms',
        permissions: ['read', 'create', 'update', 'delete', 'share', 'print']
    },
    {
        roleCode: 'rn',
        moduleCode: 'encounters',
        permissions: ['read', 'create', 'update', 'delete', 'share', 'print']
    },
    {
        roleCode: 'rn',
        moduleCode: 'allergies',
        permissions: ['read', 'create', 'update', 'delete', 'share', 'print']
    },
    {
        roleCode: 'rn',
        moduleCode: 'eligibility_check_history',
        permissions: ['read', 'create', 'update', 'delete', 'share', 'print']
    },
    {
        roleCode: 'rn',
        moduleCode: 'homework',
        permissions: ['read', 'create', 'update', 'delete', 'share', 'print']
    },

    //////////////////////////////////////////////////////////////
    {
        roleCode: 'rn',
        moduleCode: 'scheduling',
        permissions: ['read', 'create', 'update', 'delete', 'share', 'print']
    },
    {
        roleCode: 'rn',
        moduleCode:'encounter',
        permissions: ['read', 'create', 'update', 'delete', 'share', 'print']
    },
    {
        roleCode: 'rn',
        moduleCode: 'encountersbilling',
        permissions: ['read', 'create', 'update', 'delete', 'share', 'print'] 
    },
    {
        roleCode: 'rn',
        moduleCode: 'labs_radiology',
        permissions: ['read', 'create', 'update', 'delete', 'share', 'print']
    },
    {
        roleCode: 'rn',
        moduleCode: 'medicalBilling',
        permissions: ['read', 'create', 'update', 'delete', 'share', 'print']
    },
    {
        roleCode: 'rn',
        moduleCode: 'analytics_and_reporting',  // Medical Billing'
        permissions: ['read', 'create', 'update', 'delete', 'share', 'print']
    },
    {
        roleCode: 'rn',
        moduleCode: 'messages', 
        permissions: ['read', 'create', 'update', 'delete', 'share', 'print']
    },
    {
        roleCode: 'rn',
        moduleCode: 'alerts', 
        permissions: ['read', 'create', 'update', 'delete', 'share', 'print']
    },
    {
        roleCode: 'rn',
        moduleCode: 'tasks', 
        permissions: ['read', 'create', 'update', 'delete', 'share', 'print']
    },
    {
        roleCode: 'rn',
        moduleCode: 'fax', 
        permissions: ['read', 'create', 'update', 'delete', 'share', 'print']
    },
    {
        roleCode: 'rn',
        moduleCode: 'faxContact', 
        permissions: ['read', 'create', 'update', 'delete', 'share', 'print']
    },
    {
        roleCode: 'rn',
        moduleCode: 'faxHistory', 
        permissions: ['read', 'create', 'update', 'delete', 'share', 'print']
    },
    {
        roleCode: 'rn',
        moduleCode: 'form_setting', 
        permissions: ['read', 'create', 'update', 'delete', 'share', 'print']
    },
    {
        roleCode: 'rn',
        moduleCode: 'bookingSettings', 
        permissions: ['read', 'create', 'update', 'delete', 'share', 'print']
    },
    {
        roleCode: 'rn',
        moduleCode: 'accounts',
        permissions: ['read', 'create', 'update', 'delete', 'share', 'print'] 
    },
    {
        roleCode: 'rn',
        moduleCode: 'invoice',
        permissions: ['read', 'create', 'update', 'delete', 'share', 'print'] 
    },
    {
        roleCode: 'rn',
        moduleCode: 'claims',
        permissions: ['read', 'create', 'update', 'delete', 'share', 'print'] 
    },
    ///////////////////////////////////////////
  ];
  
  module.exports = {
    roleAndPermissions,
  };
  