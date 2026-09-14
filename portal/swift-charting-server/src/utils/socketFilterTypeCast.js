const { isEmpty } = require("lodash");
const { Op } = require("sequelize");


// Mapping Sequelize Symbols to string representations
const OpToSerialized = {
  [Op.or]: '$or',
  [Op.and]: '$and',
  [Op.not]: '$not',
  [Op.between]: '$between',
  [Op.like]: '$like',
  [Op.iLike]: '$iLike'
};

// Reverse mapping from strings back to Sequelize Symbols
const SerializedToOp = {
  $or: Op.or,
  $and: Op.and,
  $not: Op.not,
  $between: Op.between,
  $like: Op.like,
  $iLike: Op.iLike
};

function serializeFilter(filter) {
  if (!filter || typeof filter !== 'object') return filter;

  const serializedFilter = {};

  // Get all keys, including Symbols
  const keys = [...Object.keys(filter), ...Object.getOwnPropertySymbols(filter)];

  for (const key of keys) {
    const value = filter[key];
    const serializedKey = OpToSerialized[key] ? OpToSerialized[key] : key; // Handle Symbol keys

    if (value && typeof value === 'object') {
      if (value instanceof Date) {
        // Handle Date serialization
        serializedFilter[serializedKey] = value.toISOString();
      } else if (Array.isArray(value)) {
        // Handle array serialization, including Dates inside arrays
        serializedFilter[serializedKey] = value.map(v => (v instanceof Date ? v.toISOString() : serializeFilter(v)));
      } else if (OpToSerialized[key]) { // Check for Sequelize operators in Symbol form
        serializedFilter[serializedKey] = Array.isArray(value)
          ? value.map(v => serializeFilter(v))
          : serializeFilter(value);
      } else {
        serializedFilter[serializedKey] = serializeFilter(value);
      }
    } else {
      serializedFilter[serializedKey] = value;
    }
  }

  return serializedFilter;
}


function deserializeFilter(serializedFilter) {
  if (!serializedFilter || typeof serializedFilter !== 'object') return serializedFilter;

  const filter = {};

  // Get all keys from serialized filter
  const keys = [...Object.keys(serializedFilter), ...Object.getOwnPropertySymbols(serializedFilter)];

  for (const key of keys) {
    const value = serializedFilter[key];
    const deserializedKey = SerializedToOp[key] || key; // Convert back to Sequelize Symbol if it's a serialized key

    if (value && typeof value === 'object') {
      if (value.$date) {
        // Handle Date deserialization
        filter[deserializedKey] = new Date(value.$date);
      } else if (SerializedToOp[key]) { // Check if it's a serialized operator
        filter[deserializedKey] = Array.isArray(value)
          ? value.map(v => deserializeFilter(v))
          : deserializeFilter(value);
      } else {
        filter[deserializedKey] = deserializeFilter(value);
      }
    } else {
      filter[deserializedKey] = value;
    }
  }

  return filter;
}



  
  function processIncludes(includes) {
    return includes.map(includeItem => {
      const modelName = includeItem.model.name;
      // Process nested includes if any
      const nestedIncludes = includeItem.include ? processIncludes(includeItem.include) : undefined;
      // Serialize filters for the current include
      const serializedFilter = serializeFilter(includeItem.where || {});
      return {
        ...includeItem,
        model: modelName,
        include: nestedIncludes,  // Recursively process nested includes
        ...(isEmpty(serializedFilter)?{}:{where:serializedFilter})  // Add serialized filters
      };
    });
  }

  function processOrder(order) {
    return order.map(item => {
        return item.map(subItem => {
            // Check if subItem is an object and has a model property
            if (typeof subItem === 'object' && subItem.model) {
                // Update model to its name
                return { model: subItem.model.name.toLowerCase(), as: subItem.as };
            }
            return subItem; // Return the item as-is if it's not a model object
        });
    });
}

  const getQueryMetaData = ({include=[],filter,model,tenantId,pagination,customOrder,attributes,serviceName,order}) => {

    const includeFilters = {};

    // Extract filters for included models
    for (let i of include) {
      if (i.where) {
        includeFilters[i.model.name] = i.where;
      }
    }

   const _metaData =  {
        data: {
          filter:serializeFilter(filter),                         // Main filter applied on the model
          model: model.name,              // Model name
          include:processIncludes(include),                        // Include options for related models
          includeFilters,                 // Filters applied on included models
          ...(pagination? { pagination: {                   // Pagination details
            limit: pagination?.limit,
            page: pagination?.page,
            order: customOrder || pagination?.order,
          }}:{}),
          attributes,  
          tenantId,
          serviceName,
          ...(order?{order:processOrder(order)}:{}),
        },
      }

      return _metaData;
  }

  module.exports={
    processIncludes,
    serializeFilter,
    getQueryMetaData,
    deserializeFilter,
  }