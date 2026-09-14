/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
const slugify = require('slugify');
const config = require('../config/config');
const { up } = require('../utils/tenant');
const { getModels, getClinicConnection } = require('../utils/connection');
const randomPassword = require('../utils/randomPassword');
const { sequelize } = require('../config/database');
const { initializeModels } = require('../models');
const { doctorsData } = require('../../seed-script/mastersData/doctorsData');
const dbService = require('./db.service');
const { defaultMeetConfig } = require('../../seed-script/mastersData/defaultMeetConfig');
const { createMeetConfig } = require('./meetConfig.service');
const { laboratoryTest } = require('../../seed-script/mastersData/laboratoryTest');
const { diagnosisProblems } = require('../../seed-script/mastersData/diagnosisProblems');
const { diagnosisIcd } = require('../../seed-script/mastersData/diagnosisIcd');
const { genericDrugData } = require('../../seed-script/mastersData/genericDrugData');
const { brandNameDrugData } = require('../../seed-script/mastersData/brandNameDrugData');
const GlobalTypeCategoryData = require('../../seed-script/mastersData/globalTypeCategory');
const { mastersData } = require('../../seed-script/globalType');
const { testingLabs } = require('../../seed-script/mastersData/testingLabs');
const path = require('path');
const fs = require('fs');
const { formData } = require('../../seed-script/mastersData/formData');
const { defaultEmailTemplates } = require('../../seed-script/mastersData/defaultEmailTemplates');
const { procedureData } = require('../../seed-script/mastersData/procedureData');
const { snomedCtData } = require('../../seed-script/mastersData/diagnosisSnomedCT');
const { icdProblem } = require('../../seed-script/mastersData/treatmentPlan/icdProblem');
const {problemBehavior} = require('../../seed-script/mastersData/treatmentPlan/problemBehavior');
const {behaviorGoal} = require('../../seed-script/mastersData/treatmentPlan/behaviorGoal');
const {goalObjective} = require('../../seed-script/mastersData/treatmentPlan/goalObjective');
const {objectiveIntervention} = require('../../seed-script/mastersData/treatmentPlan/objectiveIntervention');
const {modules}  = require('../../seed-script/mastersData/module');
const {roleAndModules} = require('../../seed-script/mastersData/roleAndModule');
const { isEmpty } = require('lodash');
const { syncClinicDB } = require('./common.service');
const { Op } = require('sequelize');


const setupMeetConfigs =async ({clinicDB,tenantId})=>{
  const params = {...defaultMeetConfig};
 await  createMeetConfig(params,{tenantId})
} 


const BATCH_SIZE = 1000; // Adjust batch size as necessary
const MAX_RETRIES = 3; // Number of retries for deadlock handling

const importDiagnosisProblem = async ({ clinicDB, tenantId }) => {
   // Step 1: Check existing record count
  const existingICDCount = await clinicDB.DiagnosisIcd.count();

  if (existingICDCount >= 70000) {
    console.log(`Skipping seed: DiagnosisIcd table already has ${existingICDCount} records.`);
    return;
  }

  // Read the ICD-10-CM text file (adjust path as per your file location)
  const dataFilePath = path.join(__dirname, '../../seed-script/mastersData/icd10cm_codes_2024.txt');
  const rawData = fs.readFileSync(dataFilePath, 'utf8');
  const lines = rawData.split('\n');

  const failedLines = [];
  const successCount = { total: 0, inserted: 0, updated: 0 };

  let diagnosisProblemBatch = [];
  let diagnosisICDBatch = [];

  const parseLine = (line) => {
    const trimmedLine = line.trim();
    if (!trimmedLine) return null;
    const match = trimmedLine.match(/^([A-Z0-9]+)\s{1,}(.*)$/);
    if (match && match[1] && match[2]) {
      return { code: match[1], description: match[2] };
    }
    return null;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const parsed = parseLine(line);

    if (!parsed) {
      failedLines.push(line);
      continue;
    }

    const { code, description } = parsed;
    diagnosisProblemBatch.push({
      name: description,
      description,
      metaData: { code },
    });

    diagnosisICDBatch.push({
      name: code,
      description,
    });

    // Process in batches
    if (diagnosisProblemBatch.length >= BATCH_SIZE || i === lines.length - 1) {
      try {
        // Upsert diagnosis problems
        const diagnosisProblems = await clinicDB.DiagnosisProblem.bulkCreate(
          diagnosisProblemBatch,
          {
            updateOnDuplicate: ['name', 'description', 'metaData'],
          }
        );

        // Map ICD entries with corresponding problemId
        const codeToIdMap = {};
        for (const prob of diagnosisProblems) {
          codeToIdMap[prob.metaData.code] = prob.id;
        }

        const icdUpserts = diagnosisICDBatch.map((icd) => ({
          ...icd,
          diagnosisProblemId: codeToIdMap[icd.name],
        }));

        await clinicDB.DiagnosisIcd.bulkCreate(icdUpserts, {
          updateOnDuplicate: ['description', 'diagnosisProblemId'],
        });

        successCount.total += diagnosisProblemBatch.length;
        successCount.inserted += diagnosisProblemBatch.length;
      } catch (error) {
        console.error(`Batch failed:`, error);
        failedLines.push(...diagnosisProblemBatch.map((_, index) => lines[i - BATCH_SIZE + index + 1] || ''));
      }

      diagnosisProblemBatch = [];
      diagnosisICDBatch = [];
    }
  }

  console.log('Processing completed.');
  console.log(`Total lines processed: ${lines.length}`);
  console.log(`Successful insertions: ${successCount.inserted}`);
  console.log(`Failed lines: ${failedLines.length}`);

  if (failedLines.length > 0) {
    console.log('Failed lines sample:', failedLines.slice(0, 5));
  }
};
const importPayerList = async ({ clinicDB, tenantId }) => {
  const dataFilePath = path.join(__dirname, '../../seed-script/mastersData/office_ally_payer_list.txt');
  const rawData = fs.readFileSync(dataFilePath, 'utf8');
  const lines = rawData.split('\n');

  const promises = [];
  const failedLines = [];
  const successCount = { total: 0, inserted: 0, updated: 0 };

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;

    const match = trimmedLine.match(/^(.*)\s{3}(.*)\s{3}(.*)$/);

    if (match && match[1] && match[2] && match[3]) {
      const payerName = match[1].trim();
      const payerId = match[2].trim();
      const transaction = match[3].trim();

      try {
        const promise = dbService.upsert({
          model: clinicDB.PayerList,
          filter: { where: { payerId, transaction ,payerName} },
        });

        promises.push(promise);
        successCount.total++;
        successCount.inserted++; // Optional: adjust if upsert tells you whether insert or update

      } catch (error) {
        console.error(`Failed to process line: ${line}`, error);
        failedLines.push(line);
      }
    } else {
      console.warn(`Invalid line: ${line}`);
      failedLines.push(line);
    }
  }

  // Handle promise results
  const results = await Promise.allSettled(promises);
  const failedInserts = results.filter(r => r.status === 'rejected');

  console.log('Processing completed.');
  console.log(`Total lines processed: ${lines.length}`);
  console.log(`Successful insertions/updates: ${results.length - failedInserts.length}`);
  console.log(`Failed inserts: ${failedInserts.length}`);
  console.log(`Failed line parsing: ${failedLines.length}`);
  if (failedLines.length > 0) {
    console.log('Failed lines:', failedLines);
  }
};





const createDummyDoctors = async ({ masterDB, clinicDB,tenantId }) => {
  const providerRole = await clinicDB.Role.findOne({ where: { code: 'practitioner' } });
  const modifiedDoctors = doctorsData.map((item) => ({ ...item, password: randomPassword(),tenantId }));
  const usersPromises = [];
  modifiedDoctors.forEach((modifiedDoctor) => {
    const { email, ...rest } = modifiedDoctor || {};
    usersPromises.push(dbService.upsert({ model: clinicDB.User, filter: { where: { email } }, reqParams: { ...rest } }));
  });
  const createdUsers = await Promise.all(usersPromises);
  for(const createdUser of createdUsers){
    await createdUser.item.setRoles([providerRole.id])
  }
  const staffPromises = [];
  const staffData = createdUsers.map((item) => ({
    titleCode: 'dr',
    firstName: item.item.firstName,
    lastName: item.item.lastName,
    email: item.item.email,
    userId: item.item.id,
    timezone:"America/Los_Angeles",
  }));
  staffData.forEach((staff) => {
    staffPromises.push(clinicDB.Staff.upsert({ ...staff }));
  });
  await Promise.all(staffPromises);
};

const createLaboratoryTest =async ({clinicDB,tenantId})=>{
  const laboratoryTestPromises = [];
  laboratoryTest.forEach((item) => {
    const { name, ...rest } = item || {};
    laboratoryTestPromises.push(
      dbService.upsert({ model: clinicDB.LaboratoryTest, filter: { where: { name } }, reqParams: { ...rest } })
    );
  });
  await Promise.all(laboratoryTestPromises)
}

const createDiagnosisProblem = async({clinicDB,tenantId})=>{
  try {
    const problemsPromises = [];
    diagnosisProblems.forEach((diagnosisProblem) => {
      const { name, ...rest } = diagnosisProblem || {};
      problemsPromises.push(
        dbService.upsert({ model: clinicDB.DiagnosisProblem, filter: { where: { name } }, reqParams: { ...rest } })
      );
    });
    await Promise.all(problemsPromises);
    const icdsPromises = [];
    diagnosisIcd.forEach((diagnosisIcdItem) => {
      const { name, ...rest } = diagnosisIcdItem || {};
      icdsPromises.push(
        dbService.upsert({ model: clinicDB.DiagnosisIcd, filter: { where: { name } }, reqParams: { ...rest } })
      );
    });
    await Promise.all(icdsPromises);
  } catch (err) {
    console.log('🚀 ~ createDefaultData ~ err:', err);
  }

}

const createDrugs =async({clinicDB,tenantId})=>{
  try {
    const genericDrugsPromises = [];
    genericDrugData.forEach((modifiedGenericDrugItem) => {
      const { name, ...rest } = modifiedGenericDrugItem || {};
      genericDrugsPromises.push(
        dbService.upsert({ model: clinicDB.GenericDrug, filter: { where: { name } }, reqParams: { ...rest } })
      );
    });
    await Promise.all(genericDrugsPromises);
    const brandNameDrugPromises = [];
    brandNameDrugData.forEach((modifiedBrandNameDrugItem) => {
      const { name, ...rest } = modifiedBrandNameDrugItem || {};
      brandNameDrugPromises.push(
        dbService.upsert({ model: clinicDB.BrandNameDrug, filter: { where: { name } }, reqParams: { ...rest } })
      );
    });
    await Promise.all(brandNameDrugPromises);
  } catch (err) {
    console.log('🚀 ~ createDefaultData ~ err:', err);
  }
}

const createGlobalTypeAndCategory =async ({clinicDB,tenantId})=>{

  await Promise.all([
    // Insert modifiedGlobalTypeCategory into clinicDB
    Promise.all(
      GlobalTypeCategoryData.map(async (item) => {
        await clinicDB.GlobalCategoryType.upsert(item);
      })
    ),
    // Insert modifiedGlobalType into clinicDB
  ]);
  for(const item of mastersData){
    await clinicDB.GlobalType.upsert(item);
  }

}

const createTestingLabs = async ({clinicDB,tenantId})=>{

  const testingLabsPromises = [];
  testingLabs.forEach((item) => {
    const { name, ...rest } = item || {};
    testingLabsPromises.push(
      dbService.upsert({ model: clinicDB.TestingLab, filter: { where: { name } }, reqParams: { ...rest } })
    );
  });
  await Promise.all(testingLabsPromises)
}

const createFormData = async({clinicDB,tenantId})=>{
  const formDataPromises = [];
  formData.forEach((item) => {
    const { name, ...rest } = item || {};
    formDataPromises.push(
      dbService.upsert({ model: clinicDB.Form, filter: { where: { name } }, reqParams: { ...rest } })
    );
  });
  await Promise.all(formDataPromises)
}

const createDefaultEmailTemplate = async({clinicDB,tenantId})=>{
  const defaultEmailTemplatesPromises = [];
  defaultEmailTemplates.forEach((item) => {
    const { name, ...rest } = item || {};
    defaultEmailTemplatesPromises.push(
      dbService.upsert({ model: clinicDB.EmailTemplate, filter: { where: { name } }, reqParams: { ...rest } })
    );
  });
  await Promise.all(defaultEmailTemplatesPromises)
}

const createProcedureCodeData = async({clinicDB,tenantId})=>{
  const procedureCodePromises = [];
  procedureData.forEach((item) => {
    const { name, ...rest } = item || {};
    procedureCodePromises.push(
      dbService.upsert({ model: clinicDB.ProcedureCode, filter: { where: { name } }, reqParams: { ...rest } })
    );
  });
  await Promise.all(procedureCodePromises)
}

const createDiagnosisSnomedCT = async({clinicDB,tenantId})=>{
  const snomedCTPromises = [];
  snomedCtData.forEach((item) => {
    const { name, ...rest } = item || {};
    snomedCTPromises.push(
      dbService.upsert({ model: clinicDB.DiagnosisSnomedCt, filter: { where: { name } }, reqParams: { ...rest } })
    );
  });
  await Promise.all(snomedCTPromises)
}
const createIcdProblem= async({clinicDB,tenantId})=>{
  const icdProblemPromises = [];
  icdProblem.forEach((item) => {
    const { name, ...rest } = item || {};
    icdProblemPromises.push(
      dbService.upsert({ model: clinicDB.IcdProblem, filter: { where: { name } }, reqParams: { ...rest } })
    );
  });
  await Promise.all(icdProblemPromises)
}

const createProblemBehavior= async({clinicDB,tenantId})=>{
  const problemBehaviorPromises = [];
  problemBehavior.forEach((item) => {
    const { name, ...rest } = item || {};
    problemBehaviorPromises.push(
      dbService.upsert({ model: clinicDB.ProblemBehavior, filter: { where: { name } }, reqParams: { ...rest } })
    );
  });
  await Promise.all(problemBehaviorPromises)
}

const createBehaviorGaol=async({clinicDB,tenantId})=>{
  const behaviorGoalPromises = [];
  behaviorGoal.forEach((item) => {
    const { name, ...rest } = item || {};
    behaviorGoalPromises.push(
      dbService.upsert({ model: clinicDB.BehaviorGoal, filter: { where: { name } }, reqParams: { ...rest } })
    );
  });
  await Promise.all(behaviorGoalPromises)
}

const createGoalObjective=async({clinicDB,tenantId})=>{
  const goalObjectivePromises = [];
  goalObjective.forEach((item) => {
    const { name, ...rest } = item || {};
    goalObjectivePromises.push(
      dbService.upsert({ model: clinicDB.GoalObjective, filter: { where: { name } }, reqParams: { ...rest } })
    );
  });
  await Promise.all(goalObjectivePromises)
}

const createObjectiveIntervention=async({clinicDB,tenantId})=>{
  const objectiveInterventionPromises = [];
  objectiveIntervention.forEach((item) => {
    const { name, ...rest } = item || {};
    objectiveInterventionPromises.push(
      dbService.upsert({ model: clinicDB.ObjectiveIntervention, filter: { where: { name } }, reqParams: { ...rest } })
    );
  });
  await Promise.all(objectiveInterventionPromises)
}
// const createModules=async({clinicDB,tenantId})=>{
//   const modulePromises = [];
//   modules.forEach((item) => {
//     const {code ,...rest } = item || {};
//     modulePromises.push(
//       dbService.upsert({ model: clinicDB.Module, reqParams: { ...rest },filter:{where:{code}} })
//     );
//   });

//   const db = getModels(tenantId);
//   const permissionIds = await dbService.getAll({ model: db.GlobalType, filter: { where:{globalCategoryTypeCode: 'permissions'} } });
//   const ids = permissionIds?.map(permission => permission?.id);
//   const modulesData = await dbService.getAll({ model: db.Module});
//   modulesData?.map((module) => {
//     module.setPermissions(ids);
//   })
//   await Promise.all(modulePromises);
  

//   // const roleAndModulesPromises = [];
//   // const clinicRole = await dbService.getAll({model: db.Role});
//   // clinicRole?.map((role) => {
//   //   console.log('role data------------------>', role);
//   //   if(role?.id == 1){
//   //     modulesData?.map((module) => {
//   //       if(module?.id == 1){
//   //         console.log('data -------------->', role?.id, module?.id)
//   //         const roleId = role?.id;
//   //         const moduleId = module?.id;
//   //         roleAndModulesPromises.push(
//   //           dbService.createOne({ model: clinicDB.RoleAndModule, reqParams: {roleId, moduleId} })
//   //         );
//   //       }
//   //     })
//   //   }
//   // })
//   //  await Promise.all(roleAndModulesPromises);
// }
const createModules = async ({ clinicDB, tenantId }) => {
  try {
    const modulePromises = [];
    modules.forEach((item) => {
      const {code ,...rest } = item || {};
      modulePromises.push(
        dbService.upsert({
          model: clinicDB.Module,
          reqParams: { ...rest },
          filter:{where:{code}},
        })
      );
    });

    const db = getModels(tenantId);

    // Fetch permission IDs
    const permissionIds = await dbService.getAll({
      model: db.GlobalType,
      filter: { where: { globalCategoryTypeCode: 'permissions' } },
    });

    const ids = permissionIds?.map((permission) => permission?.id);

    
    // Await all module promises
    await Promise.all(modulePromises);
    
    // Fetch all modules
    const modulesData = await dbService.getAll({ model: db.Module });

    // Set permissions for each module
    modulesData?.forEach((module) => {
      module.setPermissions(ids);
    });

    // Uncomment the following block if needed for role and module assignments
    /*
    const roleAndModulesPromises = [];
    const clinicRole = await dbService.getAll({ model: db.Role });

    clinicRole?.forEach((role) => {
      if (role?.id == 1) {
        modulesData?.forEach((module) => {
          if (module?.id == 1) {
            console.log('Assigning role to module:', role?.id, module?.id);
            roleAndModulesPromises.push(
              dbService.createOne({
                model: clinicDB.RoleAndModule,
                reqParams: { roleId: role?.id, moduleId: module?.id },
              })
            );
          }
        });
      }
    });

    await Promise.all(roleAndModulesPromises);
    */

    console.log('Modules created and permissions assigned successfully');
  } catch (error) {
    console.error('Error in createModules:', error);
  }
};




const createRoleAndModules = async ({ clinicDB, tenantId }) => {
  const db = getModels(tenantId);
  const roleAndModulePromises = [];

  // Check if RoleAndModules already exist
  const isExistsRoleAndModules = await dbService.getAll({ model: db.RoleAndModule });
  console.log('Existing RoleAndModules:', isExistsRoleAndModules);

  // if (isEmpty(isExistsRoleAndModules)) {
    // console.log('No existing RoleAndModules, starting creation process.');

    // Fetch all roles and modules with permissions
    const [clinicRoles, modulesData] = await Promise.all([
      dbService.getAll({ model: db.Role }),
      dbService.getAll({
        model: db.Module,
        include: [{ model: db.GlobalType, as: 'permissions' }],
      }),
    ]);

    // console.log('Roles and Modules Data:', clinicRoles, modulesData);

    for (const role of clinicRoles) {
      const filteredModules = roleAndModules?.filter(
        (rm) => rm.roleCode === role?.code
      );
      

      for (const module of modulesData) {
        const roleId = role?.id;
        const moduleId = module?.id;

        // Check if the module already exists in filteredModules
        const moduleExists = filteredModules.some(
          (rm) => rm.moduleCode === module?.code
        );


        if (moduleExists) {
          // Create RoleAndModule entry
          roleAndModulePromises.push(
            // dbService.createOne({
            dbService.upsert({
              model: clinicDB.RoleAndModule,
              reqParams: { roleId, moduleId },
              filter:{where:{roleId, moduleId}},
            })
          );
          
          const modulesPermissions = await dbService.getAll({
            model: db.PermissionModule,
            filter: { where: { moduleId } },
            attributes: ['globalTypeId'],
          });

          for (const permission of modulesPermissions) {
            roleAndModulePromises.push(
              // dbService.createOne({
              dbService.upsert({
              model: clinicDB.RoleAndPermissions,
                reqParams: {
                  roleId,
                  moduleId,
                  permissionId: permission?.globalTypeId,
                },
                filter:{where:{roleId, moduleId, permissionId: permission?.globalTypeId}},
              })
            );
          }
        }

        // Fetch and create permissions for the module
        // if (moduleExists) {
        //   const modulesPermissions = await dbService.getAll({
        //     model: db.PermissionModule,
        //     filter: { where: { moduleId } },
        //     attributes: ['globalTypeId'],
        //   });

        //   for (const permission of modulesPermissions) {
        //     roleAndModulePromises.push(
        //       dbService.createOne({
        //         model: clinicDB.RoleAndPermissions,
        //         reqParams: {
        //           roleId,
        //           moduleId,
        //           permissionId: permission?.globalTypeId,
        //         },
        //       })
        //     );
        //   }
        // }
      }
    }

    // Wait for all promises to resolve
    await Promise.all(roleAndModulePromises);
    console.log('Role and Modules creation process completed.');
  // } else {
  //   console.log('RoleAndModules already exist, no action taken.');
  // }
};


// const createRoleAndModules=async({clinicDB,tenantId})=>{
//   const db = getModels(tenantId);
//   const roleAndModulePromises = [];
//   const isExistsRoleAndModules = await dbService.getAll({ model: db.RoleAndModule});
//   console.log('script----------1-------------->', isExistsRoleAndModules)
//   if(isEmpty(isExistsRoleAndModules)){
//     console.log('script----------2-------------->')
//     const clinicRole = await dbService.getAll({model: db.Role});
//     const modulesData = await dbService.getAll({ 
//       model: db.Module,
//       include: [{model: db.GlobalType, as: 'permissions'}]
//     });
//     console.log('script----------3-------------->', clinicRole, modulesData)
//     clinicRole?.map((role) => {
//       const filteredModules = roleAndModules.filter(
//         (rm) => rm.roleCode === role?.code
//       );
//       // console.log('script-----------4--->', filteredModules)

//       modulesData?.map(async(module) => {
//         const roleId = role?.id;
//         const moduleId = module?.id;
        
//         // Check if module?.code exists in the filteredModules array
//         const moduleExists = filteredModules.some(
//           (rm) => rm.moduleCode === module?.code
//         );
//         // console.log('script----------5--->', moduleExists, module);

//         if(moduleExists){
//           roleAndModulePromises.push(
//             dbService.createOne({ model: clinicDB.RoleAndModule, reqParams: {roleId, moduleId} })
//           );
//         }
//         const modulesPermissions = await dbService.getAll({ 
//           model: db.PermissionModule,
//           where: { moduleId },
//           attributes: ['globalTypeId']
//         });

//         if(moduleId){
//           modulesPermissions?.map((permission) => {
//             dbService.createOne({ model: clinicDB.RoleAndPermissions, reqParams: {roleId, moduleId , permissionId: permission} })
//           })
//         }
//         })
//       }
//     )

//     // roleAndModules.forEach((item) => {
//       //   const {roleId, moduleId } = item || {};
//       //   roleAndModulePromises.push(
//         //     dbService.createOne({ model: clinicDB.RoleAndModule, reqParams: {roleId, moduleId} })
//         //   );
//         // });
//         // await Promise.all(roleAndModulesPromises);
//   }
//   // await Promise.all(roleAndModulesPromises);
//   await Promise.all(roleAndModulePromises)
// }

const createTreatmentPlanMaster =async({clinicDB,tenantId})=>{
 await createIcdProblem({clinicDB,tenantId})
 await createProblemBehavior({clinicDB,tenantId})
 await createBehaviorGaol({clinicDB,tenantId})
 await createGoalObjective({clinicDB,tenantId})
 await createObjectiveIntervention({clinicDB,tenantId})
}

const createDefaultData = async ({ masterDB, clinicDB,tenantId }) => {

  await createGlobalTypeAndCategory({clinicDB,tenantId});
  await createDiagnosisProblem({clinicDB,tenantId});
  await createDrugs({clinicDB,tenantId})
  // await createDummyDoctors({ masterDB, clinicDB ,tenantId});
  await createLaboratoryTest({clinicDB,tenantId});
  await createTestingLabs({clinicDB,tenantId});
  await createFormData({clinicDB,tenantId});
  await createDefaultEmailTemplate({clinicDB,tenantId});
  await createProcedureCodeData({clinicDB,tenantId});
  await createDiagnosisSnomedCT({clinicDB,tenantId});
  
  await createModules({clinicDB, tenantId});
  await createRoleAndModules({clinicDB, tenantId});
  await createTreatmentPlanMaster({clinicDB,tenantId})
  await importPayerList({clinicDB , tenantId})

  // Optionally, you can return something or perform additional tasks here
  // await setupMeetConfigs({clinicDB,tenantId});
   console.log('<<<<<<<<<<<<<<<<<<< DIAGNOSIS ICD SEED : START >>>>>>>>>>>>>');
  await importDiagnosisProblem({clinicDB,tenantId})
   console.log('<<<<<<<<<<<<<<<<<<< DIAGNOSIS ICD SEED : END >>>>>>>>>>>>>');
};

const createPractice = async (userBody) => {
  const { name, email, address, contact, staffLastName, staffFirstName, staffEmail, staffContact } = userBody || {};
  const isAlready = false; // If Practice with same email alredy exists
  const masterDB = initializeModels(sequelize);

  const tenantName = slugify(name.toLowerCase(), '_');
  const password = randomPassword();
  const practice = {
    name,
    email,
    address,
    contact,
    domainName: tenantName,
  };
  const dbConfig = {
    // add one common method
    databaseName: tenantName,
    databaseUser: config.sequelize.username,
    databasePassword: config.sequelize.password,
    databasePort: config.sequelize.port,
    databaseHost: config.sequelize.host,
    databaseDialect: config.sequelize.dialect,
  };
  // const databaseConfigData = await masterDB.DatabaseConfig.upsert(dbConfig);
  const databaseConfigData = await dbService.upsert({
    model: masterDB.DatabaseConfig,
    reqParams: {...dbConfig},
    filter: {where: {databaseName: tenantName}},
  })

  // const createdPractice = await masterDB.Practice.upsert({ ...practice, databaseConfigId: databaseConfigData[0].id });
  const createdPractice = await masterDB.Practice.upsert({ ...practice, databaseConfigId: databaseConfigData?.item?.id });
  await up({ tenantName, password, uuid: createdPractice[0].id }); // rename to relatble
  const clinicDB = getModels(createdPractice[0].id);
  const roles = [
    { name: 'Clinic Admin', code: 'clinicAdmin', description: 'initial created one', isDefault: true },
    { name: 'Patient', code: 'patient', description: 'initial created one', isDefault: true },
    { name: 'Practitioner', code: 'practitioner', description: 'initial created one', isDefault: true },
    { name: 'RN/Medical assistant', code: 'rn', description: 'initial created one', isDefault: true },
  ];
const rolePromises = []
  for(let role of roles){
    const {code,...restRole} = role || {}
    rolePromises.push(dbService.upsert({model:clinicDB.Role,filter:{where:{code}},reqParams:{...restRole}}));
  }
 await Promise.all(rolePromises);
  const clinicRole = await clinicDB.Role.findOne({ where: { code: 'clinicAdmin' } });
  const clinicAdminUser = await dbService.upsert({
    model: clinicDB.User,
    filter: { where: { email: staffEmail } },
    reqParams: {
      firstName: staffFirstName,
      lastName: staffLastName,
      password: randomPassword(),
      tenantId: createdPractice[0].id,
    },
  });
  await clinicAdminUser.item.setRoles([clinicRole.id])

  await dbService.upsert({model:clinicDB.PracticeSetting,filter:{where:{name}},reqParams:{email, contact, address}});
  await dbService.upsert({model:clinicDB.PracticeLocation,filter:{where:{name}},reqParams:{address}});
  await createDefaultData({ clinicDB, masterDB,tenantId:createdPractice[0].id });
  await clinicDB.Staff.upsert({
    titleCode:'dr',
    firstName: staffFirstName,
    lastName: staffLastName,
    email: staffEmail,
    userId: clinicAdminUser.item.id,
    contact: staffContact,
  });
  // await importDiagnosisProblem({clinicDB,tenantId:createdPractice[0].id});


  const existingPractices = await masterDB.Practice.findAll({
    where: {
      name: {
        [Op.not]: "Swift Charting"
      }
    }
  });
  if (!isEmpty(existingPractices)) {
    await Promise.all(
      existingPractices?.map(async (practice) => {
        console.log(`PRACTICE SEED START FOR ${practice?.name}`);
        // Get the connection for the new tenant
        const tenant = getClinicConnection(practice?.id);

        // Run migrations for the new tenant
        await syncClinicDB(tenant);
        await createDefaultData({ clinicDB: getModels(practice?.id), masterDB, tenantId: practice?.id });
        console.log(`PRACTICE SEED END FOR ${practice?.name}`);
      })
    );
  }



  // Trigger Mail Here For Welcome
};

const getPractices = async (req, res) => {};
module.exports = {
  createPractice,
  getPractices,
  createDefaultData,
};
