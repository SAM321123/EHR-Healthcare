const { notifyGroup } = require('../../utils/socketApi');

const watchChanges = (model) => {
  // Hook for individual updates when `individualHooks` is true
  model.addHook('afterUpdate', async (instance, options) => {
    // Skip if this is a bulk update and `individualHooks` is false
    const newData = instance.get({ plain: true });
    
    console.log("Individual update triggered");
    const operation = 'updated';
    const modelName = model.name;

    notifyGroup({
      modelName,
      operation,
      data:newData,
    });
  });

  // Hook for bulk updates (runs once after a bulk update)
  model.addHook('afterBulkUpdate', async (options) => {
    console.log("Bulk update triggered", options);
    const operation = 'bulk-updated';
    const modelName = model.name;

    // You can include additional info about the update, like the filter used
    notifyGroup({
      modelName,
      operation,
      data:options.where
    });
  });

  // Hook for individual record creation
  model.addHook('afterCreate', (instance, options) => {
    const newData = instance.get({ plain: true });

    const operation = 'created';
    const modelName = model.name;

    notifyGroup({
      modelName,
      operation,
      data:newData
    });
  });

  // Hook for bulk creation (runs once after a bulk insert)
  model.addHook('afterBulkCreate', (instances, options) => {
    console.log("Bulk record creation triggered");
    const operation = 'bulk-created';
    const modelName = model.name;

    // Pass additional data about the bulk creation if needed
    notifyGroup({
      modelName,
      operation,
      count: instances.length, // Number of records created in bulk
    });
  });
};

module.exports = watchChanges;
