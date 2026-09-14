
const formCategories = [
    {
      name: 'Patient Health Questionnaire',
      code: 'fc_patient_health_questionnaire',
      parentCode: 'FT_QUESTIONNAIRES',
      description: '',
      globalCategoryTypeCode: 'form_category',
      isDeleted: false,
      isActive: true,
      sortOrder: 1,
    },
    {
      name: 'Medical History',
      code: 'fc_patient_medical_history',
      parentCode: 'FT_HISTORY_TEMPLATES',
      description: '',
      globalCategoryTypeCode: 'form_category',
      isDeleted: false,
      isActive: true,
      sortOrder: 2,
    },
    {
      name: 'Social History',
      code: 'fc_patient_social_history',
      parentCode: 'FT_HISTORY_TEMPLATES',
      description: '',
      globalCategoryTypeCode: 'form_category',
      isDeleted: false,
      isActive: true,
      sortOrder: 3,
    },
    {
      name: 'Women Only',
      code: 'fc_patient_women_only_history',
      parentCode: 'FT_HISTORY_TEMPLATES',
      description: '',
      globalCategoryTypeCode: 'form_category',
      isDeleted: false,
      isActive: true,
      sortOrder: 4,
    },
  {
    name: 'Patient Rating',
    code: 'Patient_Rating',
    parentCode: 'FT_QUESTIONNAIRES',
    description: '',
    globalCategoryTypeCode: 'form_category',
    isDeleted: false,
    isActive: true,
    sortOrder: 5,
  },
  {
    name: 'Encounter Forms',
    code: 'encounter_form',
    parentCode: 'FT_ENCOUNTER_TEMPLATES',
    description: '',
    globalCategoryTypeCode: 'form_category',
    isDeleted: false,
    isActive: true,
    sortOrder: 6,
  },
  ];
  
  module.exports={
    formCategories
  }