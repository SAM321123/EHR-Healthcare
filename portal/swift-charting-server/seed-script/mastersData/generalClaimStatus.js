const generalClaimStatus = [
    {
      name: 'Pending',
      code: 'claim_status_pending',
      description: '',
      globalCategoryTypeCode: 'general_claim_status',
      isDeleted: false,
      colorCode: '#F2D600',
      isActive: true,
      sortOrder:1,
    },
    {
      name: 'Accepted',
      code: 'claim_status_accepted',
      description: '',
      globalCategoryTypeCode: 'general_claim_status',
      colorCode: '#00FF00',
      isDeleted: false,
      isActive: true,
      sortOrder:2,
    },
    {
      name: 'Rejected',
      code: 'claim_status_rejected',
      description: '',
      globalCategoryTypeCode: 'general_claim_status',
      isDeleted: false,
      colorCode: '#FF0000',
      isActive: true,
      sortOrder:3,
    },
  ];
  module.exports = {
    generalClaimStatus,
  };
 
  