const soapNoteTemplates = [
  {
    name: 'PSYCH_*Assesment Full Problem List',
    code: 'psych_assesment_full_list',
    description: '',
    globalCategoryTypeCode: 'soap_note_template',
    isDeleted: false,
    isActive: true,
    sortOrder: 1,
    metaData: [
      {
        label: 'General Appearance',
        options: [
          'Pt. appears stated age',
          'Pt. appers younger then stated age',
          'Pt. appers younger then stated age',
          'clean',
          'well',
          'groomed',
          'dishleved',
          'dirty',
        ],
      },
      { label: 'Orietation', options: ['x4', 'Time', 'Place', 'Person', 'Situation', 'disoriented'] },
    ],
  },
  {
    name: 'PSYCH_*Objective - Mental Status & Physical Exam (MSE)',
    code: 'psych_objective_mse',
    description: '',
    globalCategoryTypeCode: 'soap_note_template',
    isDeleted: false,
    isActive: true,
    sortOrder: 1,
    metaData: [
      {
        label: 'General Appearance',
        options: [
          'Pt. appears stated age',
          'Pt. appers younger then stated age',
          'Pt. appers younger then stated age',
          'clean',
          'well',
          'groomed',
          'dishleved',
          'dirty',
        ],
      },
      { label: 'Orietation', options: ['x4', 'Time', 'Place', 'Person', 'Situation', 'disoriented'] },
    ],
  },
  {
    name: 'PSYCH_*Objective - Mental Status & Physical Exam (MSE)',
    code: 'psych_objective_mse_only',
    description: '',
    globalCategoryTypeCode: 'soap_note_template',
    isDeleted: false,
    isActive: true,
    sortOrder: 1,
    metaData: [
      {
        label: 'General Appearance',
        options: [
          'Pt. appears stated age',
          'Pt. appers younger then stated age',
          'Pt. appers younger then stated age',
          'clean',
          'well',
          'groomed',
          'dishleved',
          'dirty',
        ],
      },
      { label: 'Orietation', options: ['x4', 'Time', 'Place', 'Person', 'Situation', 'disoriented'] },
    ],
  },

  {
    name: 'PSYCH_*Plan - Treatment Plan',
    code: 'psych_plan_treatment_plan',
    description: '',
    globalCategoryTypeCode: 'soap_note_template',
    isDeleted: false,
    isActive: true,
    sortOrder: 1,
    metaData: [
      {
        label: 'General Appearance',
        options: [
          'Pt. appears stated age',
          'Pt. appers younger then stated age',
          'Pt. appers younger then stated age',
          'clean',
          'well',
          'groomed',
          'dishleved',
          'dirty',
        ],
      },
      { label: 'Orietation', options: ['x4', 'Time', 'Place', 'Person', 'Situation', 'disoriented'] },
    ],
  },
];

module.exports = {
  soapNoteTemplates,
};
