/* eslint-disable no-prototype-builtins */
const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { getModels } = require('../utils/connection');
const { dbService } = require('../services');
const { errorMessages } = require('../config/error');
const ApiError = require('../utils/ApiError');

const getTreatmentPlanTemplate = catchAsync(async (req, res) => {
  const uuid = req.clinicUuid;
  const db = getModels(uuid);

  const result = await dbService.getPaginated({
    model: db.TreatmentPlanTemplate,
    req,
    allowedFilters: ['templateName'],
    searchFilter: ['templateName'],
    include: [
      {
        model: db.User,
        as: 'createdBy',
      },
      {
        model: db.User,
        as: 'reviewedBy',
      },

      {
        model: db.TreatmentPlanTemplateDiagnosis,
        as: 'diag',
        include: [
          {
            model: db.DiagnosisIcd,
            as: 'ICDId',
          },
          {
            model: db.TreatmentPlanTemplateProblem,
            as: 'prob',
            include: [
              {
                model: db.IcdProblem,
                as: 'IPId'
              },
              {
                model: db.TreatmentPlanTemplateBehavior,
                as: 'beha',
                include: [
                  {
                    model: db.ProblemBehavior,
                    as: 'PBId'
                  },
                  {
                    model: db.TreatmentPlanTemplateGoal,
                    as: 'goals',
                    include: [
                      {
                        model: db.BehaviorGoal,
                        as:'BGId'
                      },
                      {
                        model: db.TreatmentPlanTemplateObjective,
                        as: 'obj',
                        include: [
                          {
                            model: db.GoalObjective,
                            as: 'GOId'
                          },
                          {
                            model: db.TreatmentPlanTemplateIntervention,
                            as: 'inter',
                            include: [
                              {
                                model: db.ObjectiveIntervention,
                                as: 'OIId',
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  });

  res.status(httpStatus.OK).send(result);
});


const createTreatmentPlanTemplate = catchAsync(async (req, res) => {
  const { user, body } = req;
  const {  diagnoses, problemList, behaviorList, goalList, objectiveList, interventionList,templateName, ...rest } = body || {};

  const userId = user.id;
  const uuid = req.clinicUuid;
  const db = getModels(uuid);
  delete body.problemList;

  const treatmentPlanTemplateExist = await db.TreatmentPlanTemplate.findOne({
    where: { templateName ,isDeleted: false },
  });

  if (treatmentPlanTemplateExist) {
    throw new ApiError(httpStatus.CONFLICT, errorMessages._EXIST(`Template with this name`));
  }

  const finalBehiavour = {};
  const finalGoal = {};
  const finalObjective = {};
  const finalIntervention = {};
  const finalProblems = {};
  const finalDiagnosis = [];

  for (let diagnosis of diagnoses) {
    let diagnosisId = diagnosis.id;
    finalDiagnosis.push(diagnosisId);
    finalProblems[diagnosisId] = [];
    const problems = problemList[diagnosisId] || [];
    for (let problem of problems) {
      let problemId = problem.id;
      if (typeof problem.id === 'string' && problem.id.startsWith('new_')) {
        const { name, icdId } = problem;
        const icdProblem = await dbService.createOne({
          model: db.IcdProblem,
          reqParams: { name, icdId, isActive: true, isDeleted: false },
        });
        problemId = icdProblem.id;
      }
      finalProblems[diagnosisId].push(problemId);
      finalBehiavour[problemId] = [];

      const behaviors = behaviorList[problem.id] || [];
      for (let behavior of behaviors) {
        let behaviorId = behavior.id;
        if (typeof behavior.id === 'string' && behavior.id.startsWith('new_')) {
          const { name } = behavior;
          const problemBehavior = await dbService.createOne({
            model: db.ProblemBehavior,
            reqParams: { name, problemId, isActive: true, isDeleted: false },
          });
          behaviorId = problemBehavior.id;
        }
        finalBehiavour[problemId].push(behaviorId);
        finalGoal[behaviorId] = [];

        const goals = goalList[behavior.id] || [];
        for (let goal of goals) {
          let goalId = goal.id;

          if (typeof goal.id === 'string' && goal.id.startsWith('new_')) {
            const { name } = goal;
            const behaviorGoal = await dbService.createOne({
              model: db.BehaviorGoal,
              reqParams: { name, behaviorId, isActive: true, isDeleted: false },
            });
            goalId = behaviorGoal.id;
          }
          finalGoal[behaviorId].push(goalId);
          const objectives = objectiveList[goal.id] || [];
          finalObjective[goalId] = [];
          for (let objective of objectives) {
            let objectiveId = objective.id;
            if (typeof objective.id === 'string' && objective.id.startsWith('new_')) {
              const { name } = objective;
              const goalObjective = await dbService.createOne({
                model: db.GoalObjective,
                reqParams: { name, goalId, isActive: true, isDeleted: false },
              });
              objectiveId = goalObjective.id;
            }
            finalObjective[goalId].push(objectiveId);
            const interventions = interventionList[objective.id] || [];
            finalIntervention[objectiveId] = [];

            for (let intervention of interventions) {
              let interventionId = intervention.id;
              if (typeof intervention.id === 'string' && intervention.id.startsWith('new_')) {
                const { name } = intervention;
                const objectiveIntervention = await dbService.createOne({
                  model: db.ObjectiveIntervention,
                  reqParams: { name, objectiveId, isActive: true, isDeleted: false },
                });
                interventionId = objectiveIntervention.id;
              }
              finalIntervention[objectiveId].push(interventionId);
            }
          }
        }
      }
    }
  }

  const treatmentTemplateData = {
    ...rest,
    templateName,
    createdById: userId,
    diag: finalDiagnosis.map((diagnosis) => ({
      icdId: diagnosis,
      prob: finalProblems[diagnosis].map((problemId) => ({
        icdProblemId: problemId,
        beha: finalBehiavour[problemId].map((behaviorId) => ({
          problemBehaviorId: behaviorId,
          goals: finalGoal[behaviorId].map((goalId) => ({
            behaviorGoalId: goalId,
            obj: finalObjective[goalId].map((objectiveId) => ({
              goalObjectiveId: objectiveId,
              inter: finalIntervention[objectiveId].map((interventionId) => ({
                objectiveInterventionId: interventionId,
              })),
            })),
          })),
        })),
      })),
    })),
  };

  const treatmentPlanTemplate = await dbService.createOne({
    model: db.TreatmentPlanTemplate,
    reqParams: treatmentTemplateData,
    include: [
      {
        model: db.User,
        as: 'createdBy',
      },
      {
        model: db.TreatmentPlanTemplateDiagnosis,
        as: 'diag',
        include: [
          {
            model: db.DiagnosisIcd,
            as: 'ICDId',
          },
          {
            model: db.TreatmentPlanTemplateProblem,
            as: 'prob',
            include: [
              {
                model: db.IcdProblem,
                as: 'IPId',
              },
              {
                model: db.TreatmentPlanTemplateBehavior,
                as: 'beha',
                include: [
                  {
                    model: db.ProblemBehavior,
                    as: 'PBId',
                  },
                  {
                    model: db.TreatmentPlanTemplateGoal,
                    as: 'goals',
                    include: [
                      {
                        model: db.BehaviorGoal,
                        as: 'BGId',
                      },
                      {
                        model: db.TreatmentPlanTemplateObjective,
                        as: 'obj',
                        include: [
                          {
                            model: db.GoalObjective,
                            as: 'GOId',
                          },
                          {
                            model: db.TreatmentPlanTemplateIntervention,
                            as: 'inter',
                            include: [
                              {
                                model: db.ObjectiveIntervention,
                                as: 'OIId',
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  });
  res.status(httpStatus.CREATED).send(treatmentPlanTemplate);
});

const updateTreatmentPlanTemplate = catchAsync(async (req, res) => {
  const { user, params, body } = req;
  const userId = user.id;
  const {
    diagnoses = [],
    problemList = {},
    behaviorList = {},
    goalList = {},
    objectiveList = {},
    interventionList = {},
    ...rest
  } = body || {};
  const { templateId } = params;
  const uuid = req.clinicUuid;
  const db = getModels(uuid);
  
  const finalBehiavour = {};
  const finalGoal = {};
  const finalObjective = {};
  const finalIntervention = {};
  const finalProblems = {};
  const finalDiagnosis = [];
  for (let diagnosis of diagnoses) {
    let diagnosisId = diagnosis.id;
    finalDiagnosis.push(diagnosisId);
    finalProblems[diagnosisId] = [];
    const problems = problemList[diagnosisId] || [];
    for (let problem of problems) {
      let problemId = problem.id;
      if (typeof problem.id === 'string' && problem.id.startsWith('new_')) {
        const { name, icdId } = problem;
        const icdProblem = await dbService.createOne({
          model: db.IcdProblem,
          reqParams: { name, icdId, isActive: true, isDeleted: false },
        });
        problemId = icdProblem.id;
      }
      finalProblems[diagnosisId].push(problemId);
      finalBehiavour[problemId] = [];

      const behaviors = behaviorList[problem.id] || [];
      for (let behavior of behaviors) {
        let behaviorId = behavior.id;
        if (typeof behavior.id === 'string' && behavior.id.startsWith('new_')) {
          const { name } = behavior;
          const problemBehavior = await dbService.createOne({
            model: db.ProblemBehavior,
            reqParams: { name, problemId, isActive: true, isDeleted: false },
          });
          behaviorId = problemBehavior.id;
        }
        finalBehiavour[problemId].push(behaviorId);
        finalGoal[behaviorId] = [];

        const goals = goalList[behavior.id] || [];
        for (let goal of goals) {
          let goalId = goal.id;

          if (typeof goal.id === 'string' && goal.id.startsWith('new_')) {
            const { name } = goal;
            const behaviorGoal = await dbService.createOne({
              model: db.BehaviorGoal,
              reqParams: { name, behaviorId, isActive: true, isDeleted: false },
            });
            goalId = behaviorGoal.id;
          }
          finalGoal[behaviorId].push(goalId);
          const objectives = objectiveList[goal.id] || [];
          finalObjective[goalId] = [];
          for (let objective of objectives) {
            let objectiveId = objective.id;
            if (typeof objective.id === 'string' && objective.id.startsWith('new_')) {
              const { name } = objective;
              const goalObjective = await dbService.createOne({
                model: db.GoalObjective,
                reqParams: { name, goalId, isActive: true, isDeleted: false },
              });
              objectiveId = goalObjective.id;
            }
            finalObjective[goalId].push(objectiveId);
            const interventions = interventionList[objective.id] || [];
            finalIntervention[objectiveId] = [];

            for (let intervention of interventions) {
              let interventionId = intervention.id;
              if (typeof intervention.id === 'string' && intervention.id.startsWith('new_')) {
                const { name } = intervention;
                const objectiveIntervention = await dbService.createOne({
                  model: db.ObjectiveIntervention,
                  reqParams: { name, objectiveId, isActive: true, isDeleted: false },
                });
                interventionId = objectiveIntervention.id;
              }
              finalIntervention[objectiveId].push(interventionId);
            }
          }
        }
      }
    }
  }
 
  const updatedTemplateData = {
    ...rest,
    diag: finalDiagnosis.map((diagnosis) => ({
      icdId: diagnosis,
      prob: finalProblems[diagnosis].map((problemId) => ({
        icdProblemId: problemId,
        beha: finalBehiavour[problemId].map((behaviorId) => ({
          problemBehaviorId: behaviorId,
          goals: finalGoal[behaviorId].map((goalId) => ({
            behaviorGoalId: goalId,
            obj: finalObjective[goalId].map((objectiveId) => ({
              goalObjectiveId: objectiveId,
              inter: finalIntervention[objectiveId].map((interventionId) => ({
                objectiveInterventionId: interventionId,
              })),
            })),
          })),
        })),
      })),
    })),
  };

  const existingTreatmentPlanTemplate = await dbService.getOneById({
    model: db.TreatmentPlanTemplate,
    id: templateId,
    include: [
      {
        model: db.User,
        as: 'createdBy',
      },
      {
        model: db.TreatmentPlanTemplateDiagnosis,
        as: 'diag',
        include: [
          {
            model: db.DiagnosisIcd,
            as: 'ICDId',
          },
          {
            model: db.TreatmentPlanTemplateProblem,
            as: 'prob',
            include: [
              {
                model: db.IcdProblem,
                as: 'IPId',
              },
              {
                model: db.TreatmentPlanTemplateBehavior,
                as: 'beha',
                include: [
                  {
                    model: db.ProblemBehavior,
                    as: 'PBId',
                  },
                  {
                    model: db.TreatmentPlanTemplateGoal,
                    as: 'goals',
                    include: [
                      {
                        model: db.BehaviorGoal,
                        as: 'BGId',
                      },
                      {
                        model: db.TreatmentPlanTemplateObjective,
                        as: 'obj',
                        include: [
                          {
                            model: db.GoalObjective,
                            as: 'GOId',
                          },
                          {
                            model: db.TreatmentPlanTemplateIntervention,
                            as: 'inter',
                            include: [
                              {
                                model: db.ObjectiveIntervention,
                                as: 'OIId',
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  });
  if (!existingTreatmentPlanTemplate) {
    throw new ApiError(httpStatus.NOT_FOUND, errorMessages._NOT_FOUND(`Template`));
  }

  const updateParams = { ...updatedTemplateData, updatedById: userId };
  if (body.isDeleted === true) {
    updateParams.deletedById = userId;
  }

  await dbService.updateById({
    model: db.TreatmentPlanTemplate,
    reqParams: { id: templateId, ...updateParams },
  });

  if (diagnoses.length) {
    // Clear existing problems and nested associations
    await existingTreatmentPlanTemplate.setDiag([]);
    for (const diagnosis of updatedTemplateData.diag) {
      const { prob, ...diagnosisData } = diagnosis;
      const TreatmentPlanTemplateDiagnosis = await dbService.createOne({
        model: db.TreatmentPlanTemplateDiagnosis,
        reqParams: { ...diagnosisData, treatmentPlanTemplateId: templateId },
      });
      for (const problem of prob) {
        const { beha, ...problemData } = problem;
        const treatmentPlanTemplateProblem = await dbService.createOne({
          model: db.TreatmentPlanTemplateProblem,
          reqParams: { ...problemData, treatmentPlanTemplateDiagnosisId: TreatmentPlanTemplateDiagnosis.id },
        });

        for (const behavior of beha) {
          const { goals, ...behaviorData } = behavior;
          const treatmentPlanTemplateBehavior = await dbService.createOne({
            model: db.TreatmentPlanTemplateBehavior,
            reqParams: { ...behaviorData, treatmentPlanTemplateProblemId: treatmentPlanTemplateProblem.id },
          });

          for (const goal of goals) {
            const { obj, ...goalData } = goal;
            const treatmentPlanTemplateGoal = await dbService.createOne({
              model: db.TreatmentPlanTemplateGoal,
              reqParams: { ...goalData, treatmentPlanTemplateBehaviorId: treatmentPlanTemplateBehavior.id },
            });

            for (const objective of obj) {
              const { inter, ...objectiveData } = objective;
              const treatmentPlanTemplateObjective = await dbService.createOne({
                model: db.TreatmentPlanTemplateObjective,
                reqParams: { ...objectiveData, treatmentPlanTemplateGoalId: treatmentPlanTemplateGoal.id },
              });

              for (const intervention of inter) {
                await dbService.createOne({
                  model: db.TreatmentPlanTemplateIntervention,
                  reqParams: { ...intervention, treatmentPlanTemplateObjectiveId: treatmentPlanTemplateObjective.id },
                });
              }
            }
          }
        }
      }
    }
  }
  res.status(httpStatus.OK).send(existingTreatmentPlanTemplate);
});


module.exports = {
  getTreatmentPlanTemplate,
  createTreatmentPlanTemplate,
  updateTreatmentPlanTemplate,
};
