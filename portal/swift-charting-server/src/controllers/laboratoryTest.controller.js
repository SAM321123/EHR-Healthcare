const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { getModels } = require('../utils/connection');
const { dbService } = require('../services');

const getLaboratoryTests = catchAsync(async (req, res) => {
  const uuid = req.clinicUuid;
  const db = getModels(uuid);
  const result = await dbService.getPaginated({
    model: db.LaboratoryTest,
    req,
    allowedFilters: [],
    searchFilter: ['name','cptCode','loincCode'],
  });
  res.status(httpStatus.OK).send(result);
});

const createLaboratoryTests = catchAsync(async (req, res) => {
  // const { name,parentCode } = req.body || {};
  // const {globalCategoryTypeCode} = req?.params || {};
  const { user: { id: userId } = {} } = req || {};
  const uuid = req.clinicUuid;
  const db = getModels(uuid);
  // const code = slugify(name, '_');
  const doc = await db.LaboratoryTest.create({...req.body, createdBy: userId });
  res.status(httpStatus.CREATED).send(doc);
});

const updateLaboratoryTest = catchAsync(async (req, res) => {
  const { user, params, body } = req;
  const userId = user.id;
  const { laboratoryTestId } = params;
  const uuid = req.clinicUuid;
  const db = getModels(uuid);

  const existingLabTest = await dbService.getOneById({ model: db.LaboratoryTest, id: laboratoryTestId });
  if (!existingLabTest) {
    throw new ApiError(httpStatus.NOT_FOUND, errorMessages._NOT_FOUND(`Lab Test`));
  }

  const updatedLabTest = await dbService.updateOne({
    model: db.LaboratoryTest,
    updateParams: { ...body, updatedById: userId },
    filter: { where: { id: laboratoryTestId } },
  });
  res.status(httpStatus.OK).send(updatedLabTest);
});




module.exports = {
  getLaboratoryTests,
  createLaboratoryTests,
  updateLaboratoryTest,
};
