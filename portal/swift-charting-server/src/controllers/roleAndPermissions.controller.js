const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { getModels } = require('../utils/connection');
const ApiError = require('../utils/ApiError');
const { dbService } = require('../services');

const getRoleAndPermissions = catchAsync(async (req, res) => {
  // const { clinicUuid: uuid, params: { roleId } = {} } = req || {};
  const { params: { roleId } = {} } = req || {};
  const { clinicUuid: uuid } = req || {};
  const db = getModels(uuid);
  const roleAndPermission = await dbService.getAll({
    model: db.RoleAndPermissions,
    filter: { where: { roleId: roleId } },
    otherOptions: {
      include: [
        { model: db.Module, as:'module' },
        { model: db.Role, as:'role' },
      ]
    }
  });

    const newModulePermissionsData  = roleAndPermission?.reduce((acc,data) => {
      const moduleId = data?.moduleId;
      if(acc[moduleId]){
        acc[moduleId].push(data.permissionId.toString())
      }else{
        acc[moduleId]=[data.permissionId.toString()]
      }
      return acc;
    },{})
  res.status(httpStatus.OK).send(newModulePermissionsData);
});

const createRoleAndPermissions = catchAsync(async (req, res) => {
    const { clinicUuid: uuid, body } = req || {};
    const { params: { roleId } = {} } = req || {};
  
    const db = getModels(uuid);

    // const roleAndPermission = await db.RoleAndPermission.create({
    //   body
    // });
    // const roleAndPermission = 'done';

    const roleAndPermissionsData = [];

    // Loop through the JSON data to create the appropriate records
    for (const [moduleId, permissionIds] of Object.entries(body)) {
      permissionIds.forEach((permissionId) => {
        roleAndPermissionsData.push({
          roleId: roleId,         // Assuming you have a specific roleId to assign
          moduleId: parseInt(moduleId, 10),   // Convert moduleId to an integer
          permissionId: parseInt(permissionId, 10) // Convert permissionId to an integer
        });
      });
    }

    // Bulk create the records
    await db.RoleAndPermissions.bulkCreate(roleAndPermissionsData);

    res.status(httpStatus.CREATED).send(roleAndPermissionsData);
  });

  const updateRoleAndPermissions = catchAsync(async (req, res) => {
    const { clinicUuid: uuid, body } = req || {};
    const { params: { roleId } = {} } = req || {};
    const db = getModels(uuid);
    let update;

    for (const [moduleId, newPermissionIds] of Object.entries(body)) {
      // Fetch existing permissions for the role and module
      const existingPermissions = await db.RoleAndPermissions.findAll({
        where: {
          roleId: roleId,
          moduleId: parseInt(moduleId, 10)
        }
      });
  
      const existingPermissionIds = existingPermissions.map(p => p.permissionId.toString());
      // Determine permissions to add and remove
      const permissionsToRemove = existingPermissionIds.filter(id => !newPermissionIds.includes(id));
      const permissionsToAdd = newPermissionIds.filter(id => !existingPermissionIds.includes(id));
  
      // Remove obsolete permissions
      if (permissionsToRemove.length > 0) {
        await db.RoleAndPermissions.destroy({
          where: {
            roleId: roleId,
            moduleId: parseInt(moduleId, 10),
            permissionId: permissionsToRemove.map(id => parseInt(id, 10))
          }
        });
      }
  
      // Add new permissions
      if (permissionsToAdd.length > 0) {
        const newRoleAndPermissionsData = permissionsToAdd.map((permissionId) => ({
          roleId: roleId,
          moduleId: parseInt(moduleId, 10),
          permissionId: parseInt(permissionId, 10)
        }));
  
        update = await db.RoleAndPermissions.bulkCreate(newRoleAndPermissionsData);
      }
    }
    res.status(httpStatus.OK).send(update);
  });

module.exports = {
  getRoleAndPermissions,
  createRoleAndPermissions,
  updateRoleAndPermissions,
};
