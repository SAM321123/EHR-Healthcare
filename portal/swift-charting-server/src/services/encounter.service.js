const { where } = require('sequelize');
const { getModels } = require('../utils/connection');
const dbService = require('./db.service');

const includeOptions = (db) => [
  { model: db.GlobalType, as: 'billingType',attributes: ['id', 'name'] },
  { model: db.Patient, as: 'patient' },
  { model: db.PatientEncounterForm, as: 'patientEncounterForms' },
  { model: db.GlobalType, as: 'encounterType',attributes: ['id', 'name'] },
  { model: db.Staff, as: 'assignedTo',include:[{model:db.GlobalType,as:'title',attributes:['name','code','id']}] ,attributes: ['id', 'firstName','lastName','email','phone','npiNo','signature','timezone']},
  {
    model: db.Allergies,
    as: 'Allergies',
    include: [
      {
        model: db.GlobalType,
        as: 'reactions',
        attributes: ['id', 'name']
      },
      {
        model: db.GlobalType,
        as: 'severities',
        attributes: ['id', 'name']
      },
    ],
  },
  {
    model: db.Diagnosis,
    as: 'Diagnosis',
    include: [
      { model: db.DiagnosisIcd, as: 'ICD', attributes: ['id', 'name', 'description', 'diagnosisProblemId'] },
      { model: db.DiagnosisProblem, as: 'problem', },
      { model: db.GlobalType, as: 'type',attributes: ['id', 'name'] },
      { model: db.GlobalType, as: 'status' ,attributes: ['id', 'name']},
      { model: db.User, as: 'createdBy' },
      { model: db.User, as: 'updatedBy' },
    ],
  },
  {
    model: db.PatientMedication,
    as: 'Medications',
    include: [
      {
        model: db.Patient,
        as: 'patient',
      },
      {
        model: db.Staff,
        as: 'prescriber',
      },
      {
        model: db.PatientMedicationItems,
        as: 'items',
        include: [
          {
            model: db.GlobalType,
            as: 'doseForm',
            attributes: ['id', 'name']
          },
          {
            model: db.GlobalType,
            as: 'unit',
            attributes: ['id', 'name']
          },
          {
            model: db.GlobalType,
            as: 'route',
            attributes: ['id', 'name']
          },
          {
            model: db.GlobalType,
            as: 'frequency',
            attributes: ['id', 'name']
          },
          {
            model: db.GlobalType,
            as: 'duration',
            attributes: ['id', 'name']
          },
          {
            model: db.GlobalType,
            as: 'direction',
            attributes: ['id', 'name']
          },
          {
            model: db.PatientMedicationDiagnosis,
            as: 'diagnoses',
            include: [
              {
                model: db.DiagnosisIcd,
                as: 'icd',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    model: db.LabsRadiology,
    as: 'LabRadiologies',
    include: [
      { model: db.Patient, as: 'patient' },
      { model: db.Staff, as: 'provider' },
      { model: db.DiagnosisIcd, as: 'diagnosisIcd' },
      { model: db.Diagnosis, as: 'patientDiagnosis' },
      { model: db.LaboratoryTest, as: 'laboratoryTests' },
      { model: db.TestingLab, as: 'testingLabs' },
      { model: db.GlobalType, as: 'status',attributes: ['id', 'name'] },
    ],
  },
  { model: db.Vitals, as: 'Vitals' },
  // {
  //   model: db.PatientEncounterBilling,
  //   as: 'billing',
  //   include: [
  //     { model: db.DiagnosisIcd, as: 'encounterDiagnosis' },
  //     { model: db.DiagnosisSnomedCt, as: 'encounterDiagnosisSnomeds' },
  //     {
  //       model: db.ProcedureCode,
  //       as: 'encounterProcedureCodes',
  //       through: {
  //         attributes: ['modifier1', 'modifier2', 'modifier3', 'modifier4', 'total', 'qty', 'price'],
  //         as: 'addOnFields'
  //       },
  //       attributes:['id','name','description']
    
  //     },
  //   ],
  // },
];

const getPatientEncounterItemById = async(patientEncounterId,{tenantId}) => {
    const db = getModels(tenantId);
    const result = await dbService.getOneById({ 
        model: db.PatientEncounters, 
        id: patientEncounterId,
        include:includeOptions(db),
    });
    return result;
}

const getPatientAllergies  = async(patientId,subscribeSocket,{tenantId}) =>{
  const db = getModels(tenantId);
  const result = await dbService.getAll({
    model: db.Allergies,
    filter: {where:{patientId:patientId}},
    otherOptions: { include: [
      {
        model: db.GlobalType,
        as: 'reactions',
      },
      {
        model: db.GlobalType,
        as: 'severities',
      },
      {
        model: db.PatientEncounters,
        as: 'patientEncounter',
        include:[{ model: db.GlobalType, as: 'encounterType' },]
      },
    ]},
    subscribeSocket,
    tenantId:tenantId,
  });
  return result;
}

const getPatientVitals  = async(patientId,subscribeSocket,{tenantId}) =>{
  const db = getModels(tenantId);
  const result = await dbService.getAll({
    model: db.Vitals,
    filter: {where:{patientId:patientId}},
    otherOptions: {},
    subscribeSocket,
    tenantId:tenantId,
  });
  return result;
}

const getPatientLabOrder  = async(patientId,subscribeSocket,{tenantId}) =>{
  const db = getModels(tenantId);
  const result = await dbService.getAll({
    model: db.LabsRadiology,
    filter: {where:{patientId:patientId}},
    otherOptions: {
      include :[
        { model: db.Patient, as: 'patient',include:[{ model: db.GlobalType, as: 'title' }] },
        { model: db.Staff, as: 'provider',include:[{ model: db.GlobalType, as: 'title' }] },
        { model: db.DiagnosisIcd, as: 'diagnosisIcd' },
        { model: db.Diagnosis, as: 'patientDiagnosis' },
        { model: db.LaboratoryTest, as: 'laboratoryTests' },
        { model: db.TestingLab, as: 'testingLabs' },
        { model: db.GlobalType, as: 'status' },
      ]
    },
    subscribeSocket,
    tenantId:tenantId,
  });
  return result;
}

const getPatientDiagnosis = async(patientId,subscribeSocket,{tenantId}) =>{
  const db = getModels(tenantId);
  const result = await dbService.getAll({
    model: db.Diagnosis,
    filter: {where:{patientId:patientId}},
    otherOptions: {
      include: [
        { model: db.DiagnosisIcd, as: 'ICD',attributes:['id','name','description','diagnosisProblemId',] },
        { model: db.DiagnosisProblem, as: 'problem', where},
        { model: db.GlobalType, as: 'type' },
        { model: db.GlobalType, as: 'status' },
        { model: db.User, as: 'createdBy' },
        { model: db.User, as: 'updatedBy' },
      ],
    },
    subscribeSocket,
    tenantId:tenantId,
  });
  return result;
}

const getPatientMedication = async(patientId,subscribeSocket,{tenantId}) =>{
  const db = getModels(tenantId);
  const result = await dbService.getAll({
    model: db.PatientMedication,
    filter: {where:{patientId:patientId}},
    otherOptions: {
      include: [
        {
          model: db.Patient,
          as: 'patient',
        },
        {
          model: db.Staff,
          as: 'prescriber',
        },
        {
          model: db.PatientMedicationItems,
          as: 'items',
          include: [
            {
              model: db.GlobalType,
              as: 'doseForm',
            },
            {
              model: db.GlobalType,
              as: 'unit',
            },
            {
              model: db.GlobalType,
              as: 'route',
            },
            {
              model: db.GlobalType,
              as: 'frequency',
            },
            {
              model: db.GlobalType,
              as: 'duration',
            },
            {
              model: db.GlobalType,
              as: 'direction',
            },
            {
              model: db.GlobalType,
              as: 'medicineStatus',
            },
            {
              model: db.PatientMedicationDiagnosis,
              as: 'diagnoses',
              include: [
                {
                  model: db.DiagnosisIcd,
                  as: 'icd',
                },
              ],
            },
          ],
        },
      ],
    },
    subscribeSocket,
    tenantId:tenantId,
  });
  return result;
}



module.exports = {
    getPatientEncounterItemById,
    getPatientAllergies,
    getPatientVitals,
    getPatientLabOrder,
    getPatientDiagnosis,
    getPatientMedication,
};