const appointmentConfirmation = [
    {
      name: 'Always confirm automatically',
      code: 'always_confirm_automatically',
      description: '',
      globalCategoryTypeCode: 'appointment_confirmation',
      isDeleted: false,
      isActive: true,
      sortOrder: 1,

    },
    {
      name: 'Never confirm automatically',
      code: 'never_confirm_automatically',
      description: '',
      globalCategoryTypeCode: 'appointment_confirmation',
      isDeleted: false,
      isActive: true,
      sortOrder: 2,
    },
    // {
    //     name: 'Confirm when intake form is submitted',
    //     code: 'confirm_when_intake_form_is_submitted',
    //     description: '',
    //     globalCategoryTypeCode: 'appointment_confirmation',
    //     isDeleted: false,
    //     isActive: true,
    //     sortOrder: 3,
    //   },

  ];
  module.exports = {
    appointmentConfirmation,
  };
  