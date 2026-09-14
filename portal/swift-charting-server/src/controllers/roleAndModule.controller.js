const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { getModels } = require('../utils/connection');
const ApiError = require('../utils/ApiError');
const { dbService } = require('../services');

const getRoleAndModules = catchAsync(async (req, res) => {
  const { clinicUuid: uuid, params: { roleId } = {} } = req || {};
  const db = getModels(uuid);
  const roleAndModule = await dbService.getAll({
    model: db.RoleAndModule,
    filter: { where: { roleId: roleId } },
    otherOptions: {
      include: [
        { model: db.Module, as:'module',
          include: [{model: db.GlobalType, as: 'permissions'}]
        },
        { model: db.Role, as:'role' },
      ]
     }

  });

   // Fetch all GlobalTypes
   const globalTypes = await db.GlobalType.findAll();

   // Map through RoleAndModule records and replace permission IDs with GlobalType details
   const roleAndModuleWithPermissions = roleAndModule.map((ram) => {
     const permissionsDetails = ram?.module?.permissions?.map((permissionId) =>
       globalTypes.find((gt) => gt.id == permissionId)
     );
     return {
       ...ram.get({ plain: true }), // convert Sequelize instance to plain object
       permissions: permissionsDetails,
     };
   });

  res.status(httpStatus.OK).send(roleAndModuleWithPermissions);
});

module.exports = {
  getRoleAndModules,
};
