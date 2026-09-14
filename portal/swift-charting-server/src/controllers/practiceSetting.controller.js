const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { getModels } = require('../utils/connection');
const ApiError = require('../utils/ApiError');

const getPracticeSetting = catchAsync(async (req, res) => {
  const { clinicUuid: uuid } = req || {};
  if(!uuid){
    return res.status(httpStatus.OK).send({ message: 'Super Admin.' });
  }
    const db = getModels(uuid);
    const practiceSetting = await db.PracticeSetting.findOne({
      // where: { id: uuid },
      include: { model: db.File, as: 'logo' } // Corrected the closing brace
    });
    res.status(httpStatus.OK).send(practiceSetting);
});

const createPracticeSetting = catchAsync(async (req, res) => {
  let { clinicUuid: uuid, body } = req || {};
  const { logo } = body || {};
  const db = getModels(uuid);
  let logoId;
  if(logo){
    logoId = logo?.id;
    body = {...body, logoId};
  }
  const practiceSetting = await db.PracticeSetting.create({...body});
  res.status(httpStatus.CREATED).send(practiceSetting);
});


const updatePracticeSetting = catchAsync(async (req, res) => {
  let { clinicUuid: uuid, body } = req || {};
  const {logo} = body || {};

  const db = getModels(uuid);
  const practiceSetting = await db.PracticeSetting.findOne();

  let logoId;
  if(logo){
    logoId = logo?.id;
    body = {...body, logoId};
  }
  await db.PracticeSetting.update({...body}, {where: {id: practiceSetting?.id}});
  res.status(httpStatus.CREATED).send('Practice Setting updated');
});


module.exports = {
  getPracticeSetting,
  createPracticeSetting,
  updatePracticeSetting,
};
