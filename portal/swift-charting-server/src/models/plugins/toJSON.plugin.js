const toJSON = (Model) => {
  const originalToJSON = Model.prototype.toJSON;

  Model.prototype.toJSON = function () {
    const values = { ...this.getValues() };

    // Remove fields marked as private
    Object.keys(Model.rawAttributes).forEach((attribute) => {
      if (Model.rawAttributes[attribute].private) {
        delete values[attribute];
      }
    });

    // Replace _id with id
    if (values._id) {
      values.id = values._id.toString();
      delete values._id;
    }

    // Remove createdAt and updatedAt
    delete values.createdAt;
    delete values.updatedAt;

    // Call original toJSON if exists
    if (originalToJSON) {
      return originalToJSON.call(this, values);
    }

    return values;
  };
};

module.exports = toJSON;
