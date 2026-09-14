const { sequelize } = require('../src/config/database');
const { errorMessages } = require('../src/config/error');
const { initializeModels } = require('../src/models');
const { dbService } = require('../src/services');
const { diagnosisIcd } = require('./mastersData/diagnosisIcd');
const { diagnosisProblems } = require('./mastersData/diagnosisProblems');

const createDiagnosisProblem = async () => {
  const masterDB = initializeModels(sequelize);
  try {
    const problemsPromises = [];
    diagnosisProblems.forEach((diagnosisProblem) => {
      const {name,...rest} = diagnosisProblem || {}
      problemsPromises.push(dbService.upsert({model:masterDB.DiagnosisProblem,filter:{where:{name}},reqParams:{...rest}}));
    });
    await Promise.all(problemsPromises);
    const icdsPromises=[]
    diagnosisIcd.forEach((diagnosisIcdItem) => {
      const {name,...rest} = diagnosisIcdItem || {}
      icdsPromises.push(dbService.upsert({model:masterDB.DiagnosisIcd,filter:{where:{name}},reqParams:{...rest}}));
    });
    await Promise.all(icdsPromises)

  } catch (err) {
  console.log("🚀 ~ createDiagnosisProblem ~ err:", err)
  }
};

module.exports = createDiagnosisProblem;
