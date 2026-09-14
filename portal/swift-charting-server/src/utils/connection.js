/* eslint-disable no-shadow */
/* eslint-disable no-console */
const { createDBConnection } = require('./dbConnection');
const models = require('../models');
const { sequelize } = require('../config/database');

const masterDB = models.initializeModels(sequelize, true);
let tenantMapping = [];
const tenantModels = new Map();

const getConfig = (tenant) => {
  return tenant.databaseConfig;
};

const bootstrap = async () => {
  try {
    const tenants = await masterDB.Practice.findAll({ include: [{ model: masterDB.DatabaseConfig, as: 'databaseConfig' }] });
    const nextTenantIds = new Set();

    tenantMapping = tenants.map((tenant) => {
      const tenantConfig = getConfig(tenant);
      const existingTenant = tenantMapping.find((currentTenant) => currentTenant.uuid === tenant.id);

      nextTenantIds.add(tenant.id);

      return {
        uuid: tenant.id,
        connection: existingTenant?.connection || createDBConnection({ dbConfig: tenantConfig }),
      };
    });

    for (const cachedTenantId of tenantModels.keys()) {
      if (!nextTenantIds.has(cachedTenantId)) {
        tenantModels.delete(cachedTenantId);
      }
    }
  } catch (error) {
    console.error(error);
  }
};

const getClinicConnection = (uuid) => {
  const tenant = tenantMapping.find((tenant) => tenant.uuid === uuid);

  if (!tenant) return null;

  return tenant.connection;
};

const getModels = (uuid) => {
  if (tenantModels.has(uuid)) {
    return tenantModels.get(uuid);
  }

  const tenantSequelize = getClinicConnection(uuid);
  const tenantDb = models.initializeModels(tenantSequelize, false);
  tenantModels.set(uuid, tenantDb);

  return tenantDb;
};

const getAllTenants = async () => {
  if (tenantMapping.length === 0) {
    await bootstrap();
  }
  return tenantMapping;
};

module.exports = {
  getClinicConnection,
  bootstrap,
  getConfig,
  getModels,
  getAllTenants,
};
