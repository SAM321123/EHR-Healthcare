const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { getModels } = require('../utils/connection');
const { dbService, uploadPatientDataService, getMdToolboxPatientData } = require('../services');
const ApiError = require('../utils/ApiError');
const { errorMessages } = require('../config/error');
const {  parseRXE, ccdDataParser } = require('../utils');

const uploadPatient = catchAsync(async (req, res) => {
  const triggerFrom = 'Md Toolbox Sync'
  const { patientId } = req.params || {};
  const uuid = req.clinicUuid;
  const db = getModels(uuid);

  const patient = await dbService.getOneById({ model: db.Patient, id: patientId, include: [{
    model: db.Allergies,
    as: 'allergies',
    where: {
      isActive: true,
      isDeleted: false,
    },
    required: false
  },
  {
    model: db.Diagnosis,
    as: 'problems',
    where: {
      isActive: 1,
      isDeleted: false,
    },
    required: false,
    include: [{ model: db.DiagnosisIcd, as: 'ICD'},
    ]
  },  
] 
  });
  if (!patient) {
    throw new ApiError(httpStatus.NOT_FOUND, errorMessages.NO_RECORD_FOUND);
  }
  const uploadPatientToMdtoolbox =  await uploadPatientDataService.uploadPatientToMdtoolbox(patient ,req, triggerFrom );
  if (!uploadPatientToMdtoolbox?.ok) {
    throw new ApiError(
      uploadPatientToMdtoolbox?.status || httpStatus.INTERNAL_SERVER_ERROR,
      uploadPatientToMdtoolbox?.message || 'Error in sync'
    );
  }
  res.status(httpStatus.OK).send(uploadPatientToMdtoolbox);
});


const patientsEPrescription = catchAsync(async (req, res) => {
  const { patientId } = req.params || {};
  const { searchText, status } = req.query || {};
  const uuid = req.clinicUuid;
  const db = getModels(uuid);

  // Fetch patient details
  const patient = await dbService.getOneById({ model: db.Patient, id: patientId });
  if (!patient) {
    throw new ApiError(httpStatus.NOT_FOUND, errorMessages.NO_RECORD_FOUND);
  }

  let eRxPrescriptionList = [];

  // Helper to parse prescription data

  // Fetch eRx prescription data
  if (patient.mdToolboxPatientId) {
    const [mdToolboxData, mdToolboxDataCCD] = await Promise.all([
      getMdToolboxPatientData.getPatientData(patient, req),
      getMdToolboxPatientData.getPatientDataCCD(patient, req),
    ]);

    if(mdToolboxData){
      const prescriptionData = parseRXE(mdToolboxData)
      eRxPrescriptionList = prescriptionData.map((item) => ({
        ...item,
        prescribingID:parseInt(item.prescribingID ,10), 
        days:parseInt(item.days ,10),
        drugCode:parseInt(item.drugCode ,10),
        nationalDrugCode:parseInt(item.nationalDrugCode ,10),
        providerNpi:parseInt(item.providerNpi ,10),
        quantity: parseInt(item.quantity,10),
        refill: parseInt(item.refill,10),
        patientId: parseInt(patientId , 10),
        status: 'Current',
      }));
    }

    if(mdToolboxDataCCD){
      const prescriptionDataCCD = ccdDataParser(mdToolboxDataCCD)
      const eRxPrescriptionListCCd = prescriptionDataCCD?.filter(
        (item) => item?.status?.toLowerCase() !== "current"
      );
        eRxPrescriptionList =[...eRxPrescriptionList , ...eRxPrescriptionListCCd ]
      }
  }

  // Apply filters
  if (searchText) {
    const lowerSearchText = searchText.toLowerCase();
    eRxPrescriptionList = eRxPrescriptionList.filter((item) =>
      item.drugName.toLowerCase().includes(lowerSearchText)
    );
  }

  if (status) {
    const lowerStatus = status.toLowerCase();
    eRxPrescriptionList = eRxPrescriptionList.filter(
      (item) => item.status.toLowerCase() === lowerStatus
    );
  }

  res.status(httpStatus.OK).send(eRxPrescriptionList);
});

module.exports = {
    uploadPatient,
    patientsEPrescription
};
