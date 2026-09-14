const billingStatus = [
    {
      name: 'Work in progress',
      code: 'work_in_progress',
      description: '',
      globalCategoryTypeCode: 'billing_status',
      isDeleted: false,
      isActive: true,
      sortOrder: 1,
    },
    {
        name: 'Paid',
        code: 'paid_billing_status',
        description: '',
        globalCategoryTypeCode: 'billing_status',
        isDeleted: false,
        isActive: true,
        sortOrder: 2,
      },
]
    
    module.exports={
        billingStatus,
    }