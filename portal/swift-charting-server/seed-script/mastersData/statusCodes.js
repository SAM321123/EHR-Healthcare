const statusCode = [
    {
      name: 'Active',
      code: 'active_status_code',
      description: '',
      globalCategoryTypeCode: 'status_code',
      isDeleted: false,
      isActive: true,
      colorCode:'#009217',
      sortOrder: 1,

    },
    {
      name: 'Inactive',
      code: 'inactive_status_code',
      description: '',
      globalCategoryTypeCode: 'status_code',
      isDeleted: false,
      isActive: true,
      colorCode:'orange',
      sortOrder: 2,
    },

  ];
  module.exports = {
    statusCode,
  };
  