const formCategories = [
  {
    name: 'Shared Questionnaire',
    code: 'fc_shared_questionnaire',
    parentCode: 'FT_QUESTIONNAIRES',
    description: '',
    globalCategoryTypeCode: 'form_category',
    isDeleted: false,
    isActive: true,
    sortOrder: 1,
  },
  {
    name: 'Shared Consent Forms',
    code: 'fc_shared_consent_form',
    parentCode: 'FT_CONSENT_FORMS',
    description: '',
    globalCategoryTypeCode: 'form_category',
    isDeleted: false,
    isActive: true,
    sortOrder: 2,
  },
  {
    name: 'Shared Note Templates',
    code: 'fc_shared_note_template',
    parentCode: 'FT_NOTE_TEMPLATES',
    description: '',
    globalCategoryTypeCode: 'form_category',
    isDeleted: false,
    isActive: true,
    sortOrder: 3,
  },
  {
    name: 'Shared History Templates',
    code: 'fc_shared_history_template',
    parentCode: 'FT_HISTORY_TEMPLATES',
    description: '',
    globalCategoryTypeCode: 'form_category',
    isDeleted: false,
    isActive: true,
    sortOrder: 4,
  },
  
  {
    name: 'Shared Encounter Templates',
    code: 'fc_shared_encounter_tempates',
    parentCode: 'FT_ENCOUNTER_TEMPLATES',
    description: '',
    globalCategoryTypeCode: 'form_category',
    isDeleted: false,
    isActive: true,
    sortOrder: 5,
  },
  ];
  
  module.exports={
    formCategories
  }