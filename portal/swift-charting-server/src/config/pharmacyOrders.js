const pharmacyOrderStatus = {
    PENDING: 'pending',
    IN_TRANSIT: 'inTransit',
    DELIVERED: 'delivered',
    FAXED: 'faxed',
  };
  
  const shippedAndPayeeUser = {
    PATIENT: 'patient',
    PRACTICE: 'practice',
  };
  
  module.exports = {
    pharmacyOrderStatus,
    shippedAndPayeeUser,
  };
  