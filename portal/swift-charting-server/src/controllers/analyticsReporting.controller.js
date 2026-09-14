/* eslint-disable no-prototype-builtins */
const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { getModels } = require('../utils/connection');
const { Sequelize, Op } = require('sequelize');
const { dbService } = require('../services');
const { getStartOfTheDayWithTZ, getEndOfTheDayWithTZ } = require('../utils/dateUtility');
const fs = require('fs');  // Import full fs module
const fsp = require('fs').promises;  // Import fs.promises separately
const path = require('path');

const getGenderCount = catchAsync(async (req, res) => {
  const uuid = req.clinicUuid;
  const db = getModels(uuid);
  const genderGroups = await db.Patient.findAll({
    attributes: ['sexAtBirthCode', [Sequelize.fn('COUNT', Sequelize.col('*')), 'count']],
    where: { isDeleted: false },
    group: 'sexAtBirthCode',
    raw: true,
    subQuery: false,
  });
  res.status(httpStatus.OK).send(genderGroups);
});

const getEthnicityCount = catchAsync(async (req, res) => {
  const uuid = req.clinicUuid;
  const db = getModels(uuid);
  const ethicityGroup = await db.Patient.findAll({
    attributes: ['raceCode', [Sequelize.fn('COUNT', Sequelize.col('*')), 'count']],
    where: { isDeleted: false, raceCode: { [Op.ne]: null } },
    group: 'raceCode',
    raw: true,
    subQuery: false,
  });
  res.status(httpStatus.OK).send(ethicityGroup);
});

const getLocationCount = catchAsync(async (req, res) => {
  const uuid = req.clinicUuid;
  const db = getModels(uuid);

  const locationGroups = await db.Patient.findAll({
    attributes: [
      [Sequelize.json('address.countryCode'), 'country'],
      [Sequelize.json('address.stateCode'), 'state'],
      [Sequelize.fn('COUNT', Sequelize.col('*')), 'count'],
    ],
    where: { isDeleted: false },
    group: [Sequelize.json('address.stateCode'), Sequelize.json('address.countryCode')],
    raw: true,
    subQuery: false,
  });

  res.status(httpStatus.OK).send(locationGroups);
});

const getAgeCount = catchAsync(async (req, res) => {
  const uuid = req.clinicUuid;
  const db = getModels(uuid);
  const patientsDob = await db.Patient.findAll({
    attributes: ['dob'],
    where: {
      isDeleted: false,
      dob: {
        [Op.ne]: null, // Ensure dob is not null
      },
    },
    raw: true,
    subQuery: false,
  });

  const today = new Date();

  const ageGroups = patientsDob.reduce((groups, { dob }) => {
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (age <= 18) {
      groups['0-18'] = (groups['0-18'] || 0) + 1;
    } else if (age <= 35) {
      groups['19-35'] = (groups['19-35'] || 0) + 1;
    } else if (age <= 60) {
      groups['36-60'] = (groups['36-60'] || 0) + 1;
    } else {
      groups['60+'] = (groups['60+'] || 0) + 1;
    }

    return groups;
  }, {});

  const result = Object.entries(ageGroups).map(([ageGroup, count]) => ({
    ageGroup,
    count,
  }));

  res.status(httpStatus.OK).send(result);
});

const getEncounterReport = catchAsync(async (req, res) => {
  const uuid = req.clinicUuid;
  const db = getModels(uuid);

  // const fromDate = '2025-01-01'
  // const toDate = '2025-12-31'
  const { fromDate, toDate, practitionerId, duration } = req.query;
  let whereClause = {
    isActive: true,
    isDeleted: false,
  };
  if (fromDate && toDate) {
    whereClause.createdAt = { [Op.between]: [new Date(`${fromDate}T00:00:00.000Z`), new Date(`${toDate}T23:59:59.999Z`)] };
  }
  if (practitionerId) {
    whereClause.assignedToId = practitionerId;
  }
  const encounter = await db.PatientEncounters.count({
    where: whereClause,
  });
  const totalCount = await db.PatientEncounters.count({
    where: { isActive: true, isDeleted: false },
  });

  res.status(httpStatus.OK).send({ encounters: encounter, totalCount });
});

const getDiagnosisReport = catchAsync(async (req, res) => {
  const uuid = req.clinicUuid;
  const db = getModels(uuid);
  const { fromDate, toDate } = req.query;
  // const fromDate = '2025-01-01'
  // const toDate = '2025-12-31'
  let whereClause = {
    isActive: 1,
    isDeleted: false,
  };
  if (fromDate && toDate) {
    whereClause.createdAt = { [Op.between]: [new Date(`${fromDate}T00:00:00.000Z`), new Date(`${toDate}T23:59:59.999Z`)] };
  }
  const diagnosisReport = await db.Diagnosis.findAll({
    attributes: ['ICDId', [Sequelize.fn('COUNT', Sequelize.col('diagnosis.id')), 'count']],
    order: [[Sequelize.fn('COUNT', Sequelize.col('diagnosis.id')), 'DESC']],
    limit: 5,
    where: whereClause,
    group: ['diagnosis.ICDId', 'ICD.id'],
    include: [
      {
        model: db.DiagnosisIcd,
        as: 'ICD',
        attributes: ['id', 'name', 'description'],
      },
    ],
  });

  const totalDiagnosis = await db.Diagnosis.count({
    where: { isActive: 1, isDeleted: false },
  });
  res.status(httpStatus.OK).send({ diagnosisReport, totalDiagnosis });
});

const getDiagnosisProblemReport = catchAsync(async (req, res) => {
  const uuid = req.clinicUuid;
  const db = getModels(uuid);
  const currentYear = new Date().getFullYear();

  const diagnosisProblemReport = await db.Diagnosis.findAll({
    attributes: ['problemId', [Sequelize.fn('COUNT', Sequelize.col('diagnosis.id')), 'count']],
    order: [[Sequelize.fn('COUNT', Sequelize.col('diagnosis.id')), 'DESC']],
    limit: 5,
    where: {
      isDeleted: false,
      [Op.or]: [
        {
          startDate: {
            [Op.gte]: new Date(currentYear, 0, 1), // Start date is in the current year
            [Op.lte]: new Date(currentYear, 11, 31, 23, 59, 59), // End of the year
          },
        },
        {
          endDate: {
            [Op.gte]: new Date(currentYear, 0, 1), // End date is in the current year
            [Op.lte]: new Date(currentYear, 11, 31, 23, 59, 59), // End of the year
          },
        },
      ],
    },
    group: ['diagnosis.problemId', 'problem.id'],
    include: [
      {
        model: db.DiagnosisProblem,
        as: 'problem',
        attributes: ['name'],
      },
    ],
  });
  res.status(httpStatus.OK).send(diagnosisProblemReport);
});

const getMedicationUtilizationReport = catchAsync(async (req, res) => {
  const uuid = req.clinicUuid;
  const db = getModels(uuid);
  const { fromDate, toDate, practitionerId } = req.query;
  const whereClause = { medicineStatusCode: 'medication_status_active' };

  if (fromDate && toDate) {
    whereClause.startDate = { [Op.between]: [new Date(`${fromDate}T00:00:00.000Z`), new Date(`${toDate}T23:59:59.999Z`)] };
  }

  let prescriberWhereClause = {};
  if (practitionerId) {
    prescriberWhereClause.prescriberId = practitionerId;
  }

  const topMedications = await db.PatientMedicationItems.findAll({
    where: { ...whereClause, isDeleted: false },
    attributes: [
      'genericDrug', // Medication name
      [Sequelize.fn('COUNT', Sequelize.col('genericDrug')), 'count'], // Count of occurrences
      [Sequelize.fn('array_agg', Sequelize.col('id')), 'ids'], // Aggregate medication item IDs into an array
    ],
    group: ['genericDrug'], // Group by medication name
    order: [[Sequelize.fn('COUNT', Sequelize.col('genericDrug')), 'DESC']], // Order by count in descending order
    // include: [
    //   {
    //     model: db.PatientMedication,
    //     as: 'medication', // Alias defined in the association
    //     where: prescriberWhereClause,
    //     attributes: []
    //   },
    // ],
    limit: 5, // Limit to top 5 medications
    raw: true, // Fetch raw data for easier processing
    nest: true, // Nest related data for easier access
  });

  const medicationIds = topMedications.flatMap((medication) => medication.ids); // Combine all IDs into a single array

  const diagnoses = await db.PatientMedicationDiagnosis.findAll({
    where: {
      isDeleted: false,
      medicationItemsId: medicationIds, // Fetch diagnoses for all medication IDs
    },
    include: [
      {
        model: db.DiagnosisIcd,
        as: 'icd', // Alias defined in the association
        attributes: ['name'], // Get the diagnosis names
      },
    ],
    attributes: ['id', 'diagnosisIcdId', 'medicationItemsId'], // Get the diagnosis names
    raw: true, // Fetch raw data for easier processing
  });

  // Step 1: Create a map of diagnoses for each medicationItemsId with their counts
  const diagnosisMap = diagnoses.reduce((acc, record) => {
    const { medicationItemsId, 'icd.name': icdName } = record;
    if (!acc[medicationItemsId]) {
      acc[medicationItemsId] = {};
    }
    acc[medicationItemsId][icdName] = (acc[medicationItemsId][icdName] || 0) + 1; // Increment count
    return acc;
  }, {});

  // Step 2: Combine topMedications with their diagnoses and counts
  const result = topMedications?.map((medication) => {
    const { ids, ...rest } = medication;

    // Aggregate diagnosis counts for all associated medication IDs
    const diagnosis = ids?.reduce((agg, id) => {
      const diagnosisCounts = diagnosisMap[id] || {};
      for (const [key, value] of Object.entries(diagnosisCounts)) {
        agg[key] = (agg[key] || 0) + value; // Increment diagnosis count
      }
      return agg;
    }, {});

    // Return the combined result
    return {
      ...rest,
      ids,
      diagnosis,
    };
  });

  const totalMedication = await db.PatientMedicationItems.count({
    where: { isDeleted: false },
  });
  res.status(httpStatus.OK).send({ result, totalMedication });
});

const getAppointmentReport = catchAsync(async (req, res) => {
  const uuid = req.clinicUuid;
  const db = getModels(uuid);
  const role = 'practitioner';
  const { id } = req?.query;

  let result;
  if (id) {
    result = await dbService.getPaginated({
      model: db.Staff,
      req,
      allowedFilters: ['firstName', 'lastName', 'middleName'],
      searchFilter: ['firstName', 'lastName', 'middleName'],
      attributes: ['titleCode', 'otherTitle', 'firstName', 'middleName', 'lastName'],
      addOnFilter: { id },
      include: [
        {
          model: db.User,
          as: 'user',
          attributes: ['id'],
          include: [{ model: db.Role, as: 'roles', where: { code: role }, attributes: ['id', 'name'] }],
        },
        {
          model: db.GlobalType,
          as: 'title',
          attributes: ['name'],
        },
        {
          model: db.Appointment,
          as: 'staffAppointments',
          where: { isActive: 1 },
          attributes: ['id', 'statusCode'],
          required: false,
        },
      ],
    });
  } else {
    result = await dbService.getPaginated({
      model: db.Staff,
      req,
      allowedFilters: ['firstName', 'lastName', 'middleName'],
      searchFilter: ['firstName', 'lastName', 'middleName'],
      attributes: ['titleCode', 'otherTitle', 'firstName', 'middleName', 'lastName'],
      include: [
        {
          model: db.User,
          as: 'user',
          attributes: ['id'],
          include: [{ model: db.Role, as: 'roles', where: { code: role }, attributes: ['id', 'name'] }],
        },
        {
          model: db.GlobalType,
          as: 'title',
          attributes: ['name'],
        },
        {
          model: db.Appointment,
          as: 'staffAppointments',
          where: { isActive: 1 },
          attributes: ['id', 'statusCode'],
          required: false,
        },
      ],
    });
  }
  res.status(httpStatus.OK).send(result);
});

const getLabReportData = catchAsync(async (req, res) => {
  const uuid = req.clinicUuid;
  const db = getModels(uuid);

  let whereClause = {
    isActive: true,
    isDeleted: false,
  };

  const { fromDate, toDate, practitionerId } = req.query;
  if (fromDate && toDate) {
    whereClause.updatedAt = { [Op.between]: [new Date(`${fromDate}T00:00:00.000Z`), new Date(`${toDate}T23:59:59.999Z`)] };
  }
  if (practitionerId) {
    whereClause.providerId = practitionerId;
  }

  const labRequest = await db.LabRadiologyLaboratoryTest.findAll({
    attributes: [
      'laboratoryTestId',
      [Sequelize.fn('COUNT', Sequelize.col('laboratoryTestId')), 'requestCount'],
      [Sequelize.fn('array_agg', Sequelize.col('labRadiologyId')), 'ids'],
      [
        Sequelize.literal(`(
          SELECT COUNT(*)
          FROM lab_reports AS LabReport
          WHERE LabReport."labRadiologyId" IN (
            SELECT DISTINCT "labRadiologyId"
            FROM "labs_radiology_laboratory_tests" AS "labs_radiology_laboratory_test"
            WHERE "labs_radiology_laboratory_test"."laboratoryTestId" = "labs_radiology_laboratory_test"."laboratoryTestId"
          )
        )`),
        'resultCount',
      ],
    ],
    group: ['laboratoryTestId', 'laboratoryTests.id'],
    order: [[Sequelize.fn('COUNT', Sequelize.col('laboratoryTestId')), 'DESC']],
    limit: 10,
    include: [
      {
        model: db.LaboratoryTest,
        as: 'laboratoryTests',
      },
      {
        model: db.LabsRadiology,
        as: 'labRadiology',
        // required: true,
        attributes: [],
        where: whereClause,
      },
    ],
    logging: console.log, // Enable SQL logging
  });

  const totalLabReport = await db.LabRadiologyLaboratoryTest.count({
    include: [
      {
        model: db.LabsRadiology,
        as: 'labRadiology',
        required: true,
        attributes: [],
        where: whereClause,
      },
    ],
  });

  res.status(httpStatus.OK).send({ labReport: labRequest, totalLabReport });
});

const getChronicDieaseReport = catchAsync(async (req, res) => {
  const uuid = req.clinicUuid;
  const db = getModels(uuid);

  const { fromDate, toDate } = req.query || {};

  let whereClause = {
    isActive: 1,
    isDeleted: false,
    typeCode: 'chronic',
  };
  if (fromDate && toDate) {
    whereClause.createdAt = { [Op.between]: [new Date(`${fromDate}T00:00:00.000Z`), new Date(`${toDate}T23:59:59.999Z`)] };
  }
  const chronicDiseaseList = await db.Diagnosis.findAll({
    attributes: ['problemId', [Sequelize.fn('COUNT', Sequelize.col('diagnosis.id')), 'count']],
    where: whereClause,
    group: ['diagnosis.problemId', 'problem.id'],
    include: [
      {
        model: db.DiagnosisProblem,
        as: 'problem',
        attributes: ['id', 'name', 'description'],
      },
      // {
      //   model: db.DiagnosisIcd,
      //   as: 'ICD',
      //   attributes: ['id', 'name', 'description'],
      //   // where: {
      //   //   description: {
      //   //     [Sequelize.Op.iLike]: '%chronic%', // Case-insensitive search for "chronic"
      //   //   },
      //   // },
      // },
    ],
  });

  const totalChronicDisease = await db.Diagnosis.count({
    where: { isActive: 1, isDeleted: false },
    include: [
      {
        model: db.DiagnosisProblem,
        as: 'problem',
        attributes: ['id', 'name', 'description'],
        where: {
          name: {
            [Sequelize.Op.iLike]: '%chronic%', // Case-insensitive search for "chronic"
          },
        },
      },
    ],
  });

  res.status(httpStatus.OK).send({ chronicDiseaseList, totalChronicDisease });
});

const getMedicationAdministerOnTime = catchAsync(async (req, res) => {
  const uuid = req.clinicUuid;
  const db = getModels(uuid);
  const { practitionerId, startDate, endDate, timezone, status } = req.query;

  // Construct where clause
  let whereClause = {
    date: { [Op.ne]: null },
    slotDate: { [Op.ne]: null },
    ...(practitionerId && { clinicianId: practitionerId }),
    ...(startDate &&
      endDate && {
        slotDate: {
          [Op.between]: [getStartOfTheDayWithTZ(startDate, { timezone }), getEndOfTheDayWithTZ(endDate, { timezone })],
        },
      }),
  };

  if (status) {
    if (status === 'onTime') {
      whereClause = {
        ...whereClause,
        actionCode: 'taken',
        [Op.and]: [
          Sequelize.literal(`ABS(EXTRACT(EPOCH FROM "date" - "slotDate")) / 60 <= 30`), // <= 30 minutes
        ],
      };
    } else if (status === 'delayed') {
      whereClause = {
        ...whereClause,
        actionCode: 'taken',
        [Op.and]: [
          Sequelize.literal(`EXTRACT(EPOCH FROM "date" - "slotDate") / 60 > 30`), // > 30 minutes
        ],
      };
    } else if (status === 'beforeTime') {
      whereClause = {
        ...whereClause,
        actionCode: 'taken',
        [Op.and]: [
          Sequelize.literal(`EXTRACT(EPOCH FROM "date" - "slotDate") / 60 < -30`), // < -30 minutes
        ],
      };
    } else {
      whereClause = {
        ...whereClause,
        actionCode: status,
      };
    }
  } else {
    // Default case when no status is provided
    whereClause = {
      ...whereClause,
      actionCode: { [Op.in]: ['taken', 'missed', 'incorrect'] },
    };
  }

  // Fetch records
  const EMARMedication = await db.PatientMedicationItemMARLog.findAll({
    where: whereClause,
    include: [
      {
        model: db.Staff,
        as: 'clinician',
      },
      {
        model: db.PatientMedicationItems,
        as: 'medicationItem',
        where: { medicineStatusCode: 'medication_status_active' },
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
            as: 'direction',
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
          {
            model: db.PatientMedication,
            as: 'medication',
            required: true,
            where: {
              isDeleted: false,
            },
            include: [
              {
                model: db.Patient,
                as: 'patient',
                where: { isDeleted: false },
              },
            ],
          },
        ],
      },
      {
        model: db.GlobalType,
        as: 'action',
      },
    ],
  });

  // Define constants and initialize groups
  const MINUTES_TO_MS = 60 * 1000;
  const TIME_WINDOW = 30;
  const groups = {
    'On Time': 0,
    Delayed: 0,
    'Before Time': 0,
    Missed: 0,
    Incorrect: 0,
  };

  // Process records
  EMARMedication.forEach((record) => {
    const { date, slotDate, actionCode } = record;

    if (actionCode === 'missed') {
      groups['Missed']++;
      return;
    }

    if (actionCode === 'incorrect') {
      groups['Incorrect']++;
      return;
    }

    const timeDifference = (new Date(date) - new Date(slotDate)) / MINUTES_TO_MS;

    if (Math.abs(timeDifference) <= TIME_WINDOW) {
      groups['On Time']++;
    } else if (timeDifference > TIME_WINDOW) {
      groups['Delayed']++;
    } else {
      groups['Before Time']++;
    }
  });

  // Transform groups into result format
  const result = Object.entries(groups).map(([group, count]) => ({ group, count }));

  res.status(httpStatus.OK).send({ result, EMARMedication });
});

const getMedicationChanges = catchAsync(async (req, res) => {
  const uuid = req.clinicUuid;
  const db = getModels(uuid);
  const { practitionerId, searchText } = req?.query || {};

  let whereClause = {};
  let patientSearch = {};

  // Apply filters based on practitionerId
  if (practitionerId) {
    whereClause = {
      [Op.or]: [{ revisedById: practitionerId }, { prescribedById: practitionerId }],
    };
  }

  // Apply search text filter
  if (searchText) {
    patientSearch = {
      [Op.or]: [
        { firstName: { [Op.iLike]: `%${searchText}%` } },
        { lastName: { [Op.iLike]: `%${searchText}%` } },
        { middleName: { [Op.iLike]: `%${searchText}%` } },
      ],
    };
  }

  const totalCount = await db.PatientMedicationItemsHistory.count({
    where: { isDeleted: false },
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
        model: db.PatientMedicationDiagnosisHistory,
        as: 'diagnoses',
        include: [
          {
            model: db.DiagnosisIcd,
            as: 'icd',
          },
        ],
      },
      {
        model: db.PatientMedicationHistory,
        as: 'medication',
        where: whereClause,
        include: [
          {
            model: db.PatientMedication,
            as: 'patientMedication',
            where: { isDeleted: false },
          },
          {
            model: db.Staff,
            as: 'revisedBy',
          },
          {
            model: db.Staff,
            as: 'prescribedBy',
          },
          {
            model: db.Patient,
            as: 'patient',
            where: { ...patientSearch, isDeleted: false },
          },
        ],
      },
    ],
  });

  // Now, get the paginated results
  const result = await dbService.getPaginated({
    model: db.PatientMedicationItemsHistory,
    req,
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
        model: db.PatientMedicationDiagnosisHistory,
        as: 'diagnoses',
        include: [
          {
            model: db.DiagnosisIcd,
            as: 'icd',
          },
        ],
      },
      {
        model: db.PatientMedicationHistory,
        as: 'medication',
        where: whereClause,
        include: [
          {
            model: db.PatientMedication,
            as: 'patientMedication',
            where: { isDeleted: false },
          },
          {
            model: db.Staff,
            as: 'revisedBy',
          },
          {
            model: db.Staff,
            as: 'prescribedBy',
          },
          {
            model: db.Patient,
            as: 'patient',
            where: { ...patientSearch, isDeleted: false },
          },
        ],
      },
    ],
  });

  (result.totalResults = totalCount), (result.totalPages = Math.ceil(totalCount / 10));

  // Send the result
  res.status(httpStatus.OK).send(result);
});

const getMedicationErrorRates = catchAsync(async (req, res) => {
  const uuid = req.clinicUuid;
  const db = getModels(uuid);
  const { practitionerId, searchText } = req?.query || {};
  let whereClause = {};
  let patientSearch = {};
  if (practitionerId) {
    whereClause = {
      prescriberId: practitionerId,
    };
  }
  if (searchText) {
    patientSearch = {
      [Op.or]: [
        { firstName: { [Op.iLike]: `%${searchText}%` } },
        { lastName: { [Op.iLike]: `%${searchText}%` } },
        { middleName: { [Op.iLike]: `%${searchText}%` } },
      ],
    };
  }

  const result = await dbService.getPaginated({
    model: db.PatientMedicationItems,
    req,
    addOnFilter: { medicineStatusCode: 'medication_status_active' },
    include: [
      {
        model: db.PatientMedicationItemMARLog,
        as: 'marLogs',
        required: true,
      },
      {
        model: db.PatientMedication,
        as: 'medication',
        where: whereClause,
        include: [
          {
            model: db.Staff,
            as: 'prescriber',
          },
          {
            model: db.Patient,
            as: 'patient',
            where: { ...patientSearch, isDeleted: false },
          },
        ],
      },
    ],
    attributes: ['genericDrug', 'brandNameDrug'],
  });

  res.status(httpStatus.OK).send(result);
});
const getDoseFrequency = catchAsync(async (req, res) => {
  const uuid = req.clinicUuid;
  const db = getModels(uuid);
  const { searchText } = req?.query || {};

  let whereClause = {};
  if (searchText) {
    whereClause = {
      [Op.or]: [{ genericDrug: { [Op.iLike]: `%${searchText}%` } }, { brandNameDrug: { [Op.iLike]: `%${searchText}%` } }],
    };
  }

  const result = await dbService.getAll({
    model: db.PatientMedication,
    attributes: ['id', 'patientId', 'prescriberId'],
    where: { isDeleted: false },
    otherOptions: {
      include: [
        {
          model: db.PatientMedicationHistory,
          as: 'patientMedicationHistory',
          attributes: ['id', 'patientMedicationId'],
          include: [
            {
              model: db.PatientMedicationItemsHistory,
              as: 'items',
              where: whereClause,
              attributes: ['id', 'amount', 'unitCode', 'patientMedicationHistoryId', 'genericDrug', 'brandNameDrug'],
            },
          ],
        },
        {
          model: db.PatientMedicationItems,
          as: 'items',
          where: whereClause,
          attributes: ['id', 'amount', 'unitCode', 'patientMedicationId', 'genericDrug', 'brandNameDrug'],
        },
        {
          model: db.Patient,
          as: 'patient',
          where: {
            isDeleted: false,
          },
        },
      ],
    },
    tenantId: uuid,
  });

  res.status(httpStatus.OK).send(result);
});
const getAppointmentListReport = catchAsync(async (req, res) => {
  const uuid = req.clinicUuid;
  const db = getModels(uuid);

  const result = await dbService.getPaginated({
    model: db.Appointment,
    req,
    allowedFilters: ['practitionerId', 'typeCode', 'statusCode'],
    searchFilter: ['practitionerId', 'typeCode', 'statusCode'],
    addOnFilter: { isDeleted: false },
    include: [
      { model: db.PracticeLocation, as: 'location' },
      { model: db.ZoomSession, as: 'zoomSession' },

      { model: db.Staff, as: 'practitioner', include: [{ model: db.GlobalType, as: 'title' }] },
      { model: db.GlobalType, as: 'status' },
      { model: db.GlobalType, as: 'type' },
    ],
  });

  res.status(httpStatus.OK).send(result);
});

const getOldAndNewPatientReport = async (req, res) => {
  const uuid = req.clinicUuid;
  const db = getModels(uuid);
  try {
    const currentYear = new Date().getFullYear();
    const previousYear = currentYear - 1;

    const patients = await db.Patient.findAll({
      attributes: [
        [Sequelize.fn('EXTRACT', Sequelize.literal('YEAR FROM "createdAt"')), 'year'],
        [Sequelize.fn('EXTRACT', Sequelize.literal('MONTH FROM "createdAt"')), 'month'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
      ],
      where: {
        isDeleted: false,
        createdAt: {
          [Op.gte]: new Date(previousYear, 0, 1), // Fetch data from the previous year onwards
        },
      },
      group: [Sequelize.literal('EXTRACT(YEAR FROM "createdAt")'), Sequelize.literal('EXTRACT(MONTH FROM "createdAt")')],
      raw: true,
    });

    // Initialize result structure
    let newPatient = new Array(12).fill(0);
    let oldPatient = new Array(12).fill(0);

    // Process patient data
    patients.forEach((record) => {
      const { year, month, count } = record;
      if (year == currentYear) {
        newPatient[month - 1] = parseInt(count); // Month index in array (0-based)
      } else if (year == previousYear) {
        oldPatient[month - 1] = parseInt(count);
      }
    });

    // Send response
    res.json({ newPatient, oldPatient });
  } catch (error) {
    console.error('Error fetching patient report:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getClaimReport = catchAsync(async (req, res) => {
  const uuid = req.clinicUuid;
  const db = getModels(uuid);
  const { patientId, claimStatus, practitionerId, from, to ,timezone } = req?.query || {};
  let statusClause = {};
  let patientWhereClause = {};
  let practitionerWhereClause = {};
  let whereClause = {
    ...(from &&
      to && {
        createdAt: {
          [Op.between]: [getStartOfTheDayWithTZ(from, { timezone }), getEndOfTheDayWithTZ(to, { timezone })],
        },
      }),
  };
  if (practitionerId) {
    practitionerWhereClause = {
      primaryProviderId: practitionerId,
    };
  }
  if (patientId) {
    patientWhereClause = {
      id: patientId,
    };
  }
  if (claimStatus) {
    statusClause = {
      claimStatus,
    };
  }
  const totalCount = await db.PatientEncounterClaims.count({
    where: {
      isDeleted: false,
      ...statusClause,
      ...whereClause,
    },
    include: [
      { model: db.Patient, as: 'patient', where: patientWhereClause },
      {
        model: db.PatientEncounterBilling,
        as: 'encounterBilling',
        where: practitionerWhereClause,
      },
    ],
  });
  const result = await dbService.getPaginated({
    model: db.PatientEncounterClaims,
    req,
    allowedFilters: [],
    searchFilter: [],
    addOnFilter: { ...statusClause, ...whereClause },
    include: [
      {
        model: db.Patient,
        as: 'patient',
        where: patientWhereClause,
        include: [
          { model: db.GlobalType, as: 'sexAtBirth' },
          { model: db.Staff, as: 'primaryProvider' },
        ],
      },
      { model: db.GlobalType, as: 'status' },
      {
        model: db.PatientEncounterBilling,
        as: 'encounterBilling',
        where: practitionerWhereClause,
        include: [
          { model: db.PatientEncounters, as: 'encounter', 
            include: [{ model: db.GlobalType, as: 'billingType' },
              {
                model: db.Invoice,
                as: 'invoice',
                separate: true,        
                limit: 1,
                order: [['createdAt', 'DESC']]
              },
              {model: db.Staff , as: 'assignedTo'},
          ] },
          {
            model: db.Insurance,
            as: 'insurance',
            include: [
              { model: db.PayerList, as: 'payerData' },
              { model: db.GlobalType, as: 'insurancePolicy' },
            ],
          },
          {model: db.Staff , as: 'referenceProvider'},
          {
            model: db.ProcedureCode,
            as: 'encounterProcedureCodes',
            through: {
              attributes: ['modifier1', 'modifier2', 'modifier3', 'modifier4', 'total', 'qty', 'price'],
              as: 'addOnFields',
            },
            attributes: ['id', 'name', 'description', 'cptCode'],
          },
          { model: db.DiagnosisIcd, as: 'encounterDiagnosis' },
          { model: db.Staff, as: 'primaryProvider' },
        ],
      },
    ],
  });
  (result.totalResults = totalCount), (result.totalPages = Math.ceil(totalCount / 10));
  res.status(httpStatus.OK).send(result);
});

const getMedicalBillingEncounterReport = catchAsync(async (req, res) => {
  const uuid = req.clinicUuid;
  const db = getModels(uuid);

  const { from, to ,timezone } = req.query;


  let whereClause = {
    ...(from &&
      to && {
        startDate: {
          [Op.between]: [getStartOfTheDayWithTZ(from, { timezone }), getEndOfTheDayWithTZ(to, { timezone })],
        },
      }),
  };
 
  const result = await dbService.getPaginated({
    model: db.PatientEncounters,
    req,
    allowedFilters: ['assignedToId' , 'patientId'],
    searchFilter: [],
    addOnFilter: whereClause,
    include: [
      {
        model: db.Patient,
        as: 'patient',
      },
      {
        model: db.Staff,
        as: 'assignedTo',
      },
      {
        model: db.GlobalType,
        as:'encounterType'
      },
      {
        model: db.GlobalType,
        as:'billingType'
      },
      {
        model: db.Invoice,
        as: 'invoice',
        separate: true,        
        limit: 1,
        order: [['createdAt', 'DESC']]
      },
    ],
  });
  res.status(httpStatus.OK).send(result);
});
const getProcedureReport = catchAsync(async (req, res) => {
  const uuid = req.clinicUuid;
  const db = getModels(uuid);
  const { from, to ,timezone } = req.query;


  let whereClause = {
    ...(from &&
      to && {
        createdAt: {
          [Op.between]: [getStartOfTheDayWithTZ(from, { timezone }), getEndOfTheDayWithTZ(to, { timezone })],
        },
      }),
  };
  
  const result = await dbService.getPaginated({
    model: db.PatientEncounterBillingProcedureCode,
    req,
    allowedFilters: ['procedureCodeId'],
    searchFilter: [],
    addOnFilter: whereClause,
    include: [
      {
        model: db.ProcedureCode,
        as: 'procedureCode'
      }
    ]
  });
  res.status(httpStatus.OK).send(result);
});

const getInvoiceReport = catchAsync(async (req, res) => {
  const uuid = req.clinicUuid;
  const db = getModels(uuid);
  const { searchText } = req?.query || {};
  let patientSearch = {};
  if (searchText) {
    patientSearch = {
      [Op.or]: [
        { firstName: { [Op.iLike]: `%${searchText}%` } },
        { lastName: { [Op.iLike]: `%${searchText}%` } },
        { middleName: { [Op.iLike]: `%${searchText}%` } },
      ],
    };
  }

  const result = await dbService.getPaginated({
    model: db.Patient,
    req, 
    allowedFilters: ['firstName', 'lastName', 'middleName'],
    searchFilter: ['firstName', 'lastName', 'middleName'],
    include: [
      {
        model: db.Invoice,
        as: 'invoice', 
        required: false,
      },
      { model: db.GlobalType, as: 'title' },
    ],
    attributes: [
      'id', 
      'firstName', 
      'lastName', 
      'middleName', 
      'titleCode',
      'balance'
    ],
    group: ['patient.id'], 
    raw: true, 
  });

  const formattedResult = result?.results?.map(patient => {
    const invoiceCount = patient?.dataValues?.invoice?.length || 0;
    const patientData = {
      id:patient?.dataValues?.id,
      firstName:patient?.dataValues?.firstName, 
      lastName:patient?.dataValues?.lastName, 
      middleName:patient?.dataValues?.middleName,
      title: patient?.dataValues?.title,
      due: patient?.dataValues?.balance,
    }

    const invoiceTotalAmount = patient?.dataValues?.invoice?.reduce((total, invoice) => {
      return total + (parseFloat(invoice?.totalAmount) || 0); 
    }, 0);

    const invoiceTotalPayment = patient?.dataValues?.invoice?.reduce((total, invoice) => {
      return total + (parseFloat(invoice?.totalPayment) || 0); 
    }, 0);
    const invoiceTotalDue = patient?.dataValues?.invoice?.reduce((total, invoice) => {
      return total + (invoice?.due || 0);
    }, 0);

    return {
      patientData,
      invoiceCount,
      invoiceTotalAmount, 
      invoiceTotalPayment,
      invoiceTotalDue,
    };
  });

  
  const response = formattedResult?.map(item => ({
    patient: item.patientData,
    invoiceCount: item.invoiceCount,
    invoiceTotalAmount: item.invoiceTotalAmount,
    invoiceTotalPayment: item.invoiceTotalPayment,
    invoiceTotalDue: item.invoiceTotalDue
  }));

  
  res.status(httpStatus.OK).send({
    data: response,
    total: result.length,
  });
});


const getPatientInvoicesReport = catchAsync(async (req, res) => {
  const uuid = req.clinicUuid;
  const db = getModels(uuid);
  const { searchText, patientId, practitionerId, from, to, timezone } = req?.query || {};
  let billingWhereClause = {}
  let invoiceWhereCaluse = {}
  if(patientId){
    invoiceWhereCaluse = { patientId }
  }
  if(practitionerId){
    billingWhereClause = { primaryProviderId : practitionerId }
  }

  if(from &&  to){
    invoiceWhereCaluse = {
      ...invoiceWhereCaluse,
      createdAt: {
        [Op.between]: [getStartOfTheDayWithTZ(from, { timezone }), getEndOfTheDayWithTZ(to, { timezone })],
      },
    }
  }


  if (searchText) {
    whereClause = {
      [Op.or]: [
        { firstName: { [Op.iLike]: `%${searchText}%` } },
        { lastName: { [Op.iLike]: `%${searchText}%` } },
        { middleName: { [Op.iLike]: `%${searchText}%` } },
      ],
    };
  }
  const result = await dbService.getPaginated({
    model: db.Invoice,
    req,
    include: [
      { model: db.Patient, as: 'patient',
        include:[{ model: db.GlobalType, as: 'title' }]
      },
      { model: db.PatientEncounters, as: 'encounter',
        include:[{ 
          model: db.PatientEncounterBilling, as: 'billing',
          include:[{ model: db.Staff, as: 'primaryProvider'}] , 
          where: billingWhereClause,
          required: true,
        }],
        required: true,  
      },
      {
        model: db.GlobalType,
        as:'statusCode'
      },
    ],
    addOnFilter: invoiceWhereCaluse,
  });
  res.status(httpStatus.OK).send(result);
});
const downloadClaimReport = catchAsync(async (req, res) => {
  const uuid = req.clinicUuid;
  const db = getModels(uuid);

  const localDir = path.join(__dirname, '../claimFiles/claim_file_outbound');

  try {
    // ✅ Use fsp (fs.promises) for async operations
    const filesInDir = await fsp.readdir(localDir);

    const { fileId } = req?.query || {};
    const claimIdFileName = `FS_HCFA_${fileId}_IN_C.txt`;
    const matchingTxtFile = filesInDir.find((file) => file.includes(claimIdFileName));

    if (!matchingTxtFile) {
      return res.status(404).json({ message: 'File not found' });
    }

    const filePath = path.join(localDir, matchingTxtFile);

    // ✅ Check if file exists
    try {
      await fsp.access(filePath);
    } catch (error) {
      return res.status(404).json({ message: 'File does not exist on the server' });
    }

    // ✅ Set headers for file download
    res.setHeader('Content-Disposition', `attachment; filename="${matchingTxtFile}"`);
    res.setHeader('Content-Type', 'text/plain');

    // ✅ Use `fs.createReadStream()` (not `fsp`)
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    fileStream.on('error', (err) => {
      console.error('Error sending file:', err);
      res.status(500).json({ message: 'Error downloading file' });
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

const getPatientPaymentReport = catchAsync(async (req, res) => {
  const uuid = req.clinicUuid;
  const db = getModels(uuid);
  const { searchText, patientId, practitionerId, from, to, timezone, locationId } = req?.query || {};
  let billingWhereClause = {}
  if(patientId){
    billingWhereClause = { patientId }
  }
  if(practitionerId){
    billingWhereClause = { ...billingWhereClause, primaryProviderId : practitionerId }
  }
  if(locationId){
    billingWhereClause = { ...billingWhereClause, locationId : locationId }
  }


  if(from &&  to){
    billingWhereClause = {
      ...billingWhereClause,
      paymentDate: {
        [Op.between]: [getStartOfTheDayWithTZ(from, { timezone }), getEndOfTheDayWithTZ(to, { timezone })],
      },
    }
  }

  if (searchText) {
    whereClause = {
      [Op.or]: [
        { firstName: { [Op.iLike]: `%${searchText}%` } },
        { lastName: { [Op.iLike]: `%${searchText}%` } },
        { middleName: { [Op.iLike]: `%${searchText}%` } },
      ],
    };
  }
  const result = await dbService.getPaginated({
    model: db.PatientEncounterBilling,
    req,
    include: [
      { model: db.Patient, as: 'patient',
        include:[{ model: db.GlobalType, as: 'title' }],
        attributes: [ 'id', 'firstName','lastName', 'middleName', 'titleCode'],
      },
      { model: db.PatientEncounters, as: 'encounter',
        include: [  
          { 
          model: db.Invoice, as: 'invoice',
          attributes: ['paymentAmount']
        }],
        attributes: ['id']
      },
      {
        model: db.ProcedureCode,
        as: 'encounterProcedureCodes',
        through: {
          attributes: ['taxAmt', 'taxPer', 'price'],
          as: 'addOnFields',
        },
        attributes: ['id', 'name', 'description', 'cptCode'],
      },
      { model: db.Staff, as: 'primaryProvider',
        attributes: [ 'id', 'firstName','lastName', 'middleName', 'titleCode'],
      },
    ],
    attributes: [
      'prePaidCash', 
      'cardAmount', 
      'insuranceSubmittedAmount', 
      'paymentDate', 
      'cash', 
      'encounterId',
      'balance',
      'total',
    ],
    addOnFilter: billingWhereClause,
  });
  res.status(httpStatus.OK).send(result);
});

module.exports = {
  getGenderCount,
  getEthnicityCount,
  getLocationCount,
  getAgeCount,
  getEncounterReport,
  getDiagnosisReport,
  getMedicationUtilizationReport,
  getAppointmentReport,
  getLabReportData,
  getChronicDieaseReport,
  getMedicationAdministerOnTime,
  getMedicationChanges,
  getMedicationErrorRates,
  getDoseFrequency,
  getAppointmentListReport,
  getDiagnosisProblemReport,
  getOldAndNewPatientReport,
  getClaimReport,
  getMedicalBillingEncounterReport,
  getProcedureReport,
  getInvoiceReport,
  getPatientInvoicesReport,
  downloadClaimReport,
  getPatientPaymentReport,
};
