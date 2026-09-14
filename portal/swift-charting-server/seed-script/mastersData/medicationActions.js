const medicationActions = [
    {
      name: 'Taken',
      code: 'taken',
      description: '',
      globalCategoryTypeCode: 'medication_actions',
      isDeleted: false,
      isActive: true,
      sortOrder: 1,
 
    },
    {
        name: 'Refused',
        code: 'refused',
        description: '',
        globalCategoryTypeCode: 'medication_actions',
        isDeleted: false,
        isActive: true,
        sortOrder: 2,
    },
    {
        name: 'Unable To Take',
        code: 'unableToTake',
        description: '',
        globalCategoryTypeCode: 'medication_actions',
        isDeleted: false,
        isActive: true,
        sortOrder: 3,
      },
  ];
  module.exports = {
    medicationActions,
  };
 