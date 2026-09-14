const treatmentPlanStatus = [
    {
      name: 'Active',
      code: 'active',
      description: '',
      globalCategoryTypeCode: 'treatment_plan_status',
      isDeleted: false,
      isActive: true,
      colorCode: 'green',
    },
    {
      name: 'Inactive',
      code: 'inactive',
      description: '',
      globalCategoryTypeCode: 'treatment_plan_status',
      isDeleted: false,
      isActive: true,
      colorCode: 'gray',
    },
    {
      name: 'Error',
      code: 'error',
      description: '',
      globalCategoryTypeCode: 'treatment_plan_status',
      isDeleted: false,
      isActive: true,
      colorCode: 'red',
    },
  ];
  
  module.exports = {
    treatmentPlanStatus,
  };
  