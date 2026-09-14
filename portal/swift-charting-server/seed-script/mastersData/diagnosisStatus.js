const diagnosisStatus = [
  {
    name: 'Active',
    code: 'diagnosis_status_active',
    description: '',
    globalCategoryTypeCode: 'diagnosis_status',
    isDeleted: false,
    isActive: true,
    colorCode: 'green',
    sortOrder: 1,
  },
  {
    name: 'Inactive',
    code: 'diagnosis_status_inactive',
    description: '',
    globalCategoryTypeCode: 'diagnosis_status',
    isDeleted: false,
    isActive: true,
    colorCode: 'gray',
    sortOrder: 2,
  },
  {
    name: 'Error',
    code: 'diagnosis_status_error',
    description: '',
    globalCategoryTypeCode: 'diagnosis_status',
    isDeleted: false,
    isActive: true,
    colorCode: 'red',
    sortOrder: 3,
  },
];

module.exports = {
  diagnosisStatus,
};
