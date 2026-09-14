const defineAdminAssociations = (db) => {
    // Define associations here
  
    db.User.belongsToMany(db.Role, {
      through: db.UserRole,
      foreignKey: 'userId',
      otherKey: 'roleId',
      as: 'roles',
    });
  
    db.Role.belongsToMany(db.User, {
      through: db.UserRole,
      foreignKey: 'roleId',
      otherKey: 'userId',
      as: 'users',
    });

    db.Practice.belongsTo(db.DatabaseConfig, { 
      foreignKey: 'databaseConfigId', 
      as: 'databaseConfig' 
    });

    db.DatabaseConfig.belongsTo(db.User, { 
      foreignKey: 'createdById', 
      as: 'createdBy' 
    });

    db.DatabaseConfig.belongsTo(db.User, { 
      foreignKey: 'updatedById', 
      as: 'updatedBy' 
    });
    
    db.Subscription.hasMany(db.SubscriptionHistory, {
      foreignKey: 'practiceId',
      sourceKey: 'practiceId',
      as: 'subscriptionHistory',
      onUpdate: 'NO ACTION',   // prevents propagation
      onDelete: 'NO ACTION',   // prevents deletion
    });
   
    db.Subscription.belongsTo(db.Practice, {
      foreignKey: 'practiceId',
      as: 'practice',
   });

    db.Practice.belongsTo(db.Subscription, {
      foreignKey: 'id',
      targetKey: 'practiceId',
      as: 'subscription',
   });

    db.GlobalType.belongsTo(db.GlobalCategoryType, {
      foreignKey: 'globalCategoryTypeCode',
      targetKey: 'code',
      as: 'globalCategoryType',
    });

    db.Subscription.belongsTo(db.GlobalType, { 
      foreignKey: 'cancelReason',
      targetKey: 'code', 
      as: 'reasonForCancel' 
    });

    db.Practice.belongsTo(db.TrialSubscription, {
      foreignKey: 'id',
      targetKey: 'practiceId',
      as: 'trialSubscription',
   });

  };
  
  module.exports = defineAdminAssociations;
  