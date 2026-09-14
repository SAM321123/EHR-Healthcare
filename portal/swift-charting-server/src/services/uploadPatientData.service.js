const axios = require('axios');
const { dobDateFormatter, dateFormatter } = require('../utils/dateUtility');
const { getSexAtBirth, removeUSCountryCode, checkAddressCountryCode, allergiesList, problemList } = require('../utils');
const { isEmpty } = require('lodash');
const httpStatus = require('http-status');
const { dbService } = require('.');
const { getModels } = require('../utils/connection');
const { errorMessages } = require('../config/error');

const truncateMessage = (message = '') => message.toString().slice(0, 255);

const buildSyncResult = ({ status, message }) => ({
  ok: status === httpStatus.OK,
  status,
  message,
});

const getMdToolboxConfigError = (mdToolboxConfigData) => {
  if (!mdToolboxConfigData) {
    return errorMessages.MD_TOOLBOX_CONFIG_MISSING;
  }

  const missingFields = ['appName', 'practiceId', 'mdToolboxKey'].filter((field) => !mdToolboxConfigData[field]);

  if (!missingFields.length) {
    return null;
  }

  return `${errorMessages.MD_TOOLBOX_CONFIG_MISSING} Missing fields: ${missingFields.join(', ')}.`;
};

const getSyncError = (error) => {
  if (error?.response?.status) {
    return {
      status: error.response.status,
      message: truncateMessage(error.message || 'MD Toolbox sync request failed.'),
    };
  }

  return {
    status: httpStatus.INTERNAL_SERVER_ERROR,
    message: truncateMessage(error.message || 'An unexpected error occurred'),
  };
};

const uploadPatientToMdtoolbox = async ( patient, req,triggerFrom) => {
  const uuid = req.clinicUuid;
  const db = getModels(uuid);
  try {
    const diagnosisList = patient?.problems?.map(diagnosis => 
      `${diagnosis?.ICD?.name} (${diagnosis?.ICD?.description})`
    ) || [];    
    const problemsToUpload = problemList(diagnosisList);
    const allergyList = patient?.allergies ? [...patient?.allergies]: []; 
    const allergiesToUpload = allergiesList(allergyList);
    const patientAddress = patient?.address || {};
    const isUsCountryCode = checkAddressCountryCode(patientAddress.countryCode);
    const address1 = (patientAddress.description || '').slice(0, 35);
    const address2 = (patientAddress.address2 || '').slice(0, 35);
    const cellPhone = removeUSCountryCode(patient.phone);
    const homePhone = removeUSCountryCode(patient.homePhone);
    const mdToolboxConfigData = await db.MdToolboxConfig.findOne({
      where: { isDeleted: false },
    });
    const configError = getMdToolboxConfigError(mdToolboxConfigData);

    if (configError) {
      await dbService.createOne({
        model: db.MdToolbox,
        reqParams: {
          patientId: patient.id,
          triggerFrom,
          status: httpStatus.BAD_REQUEST,
          message: truncateMessage(configError),
          createdById: req.user.id,
        },
      });
      return buildSyncResult({ status: httpStatus.BAD_REQUEST, message: configError });
    }

    const response = await axios.post('https://test2.mdtoolboxrx.net/rxws/secureapi.asmx/UploadPatientDataDetail', {
      APIKey: mdToolboxConfigData?.mdToolboxKey, // Replace with your actual API key
      RequestingAppName: mdToolboxConfigData?.appName, // Name of your app/system
      RequestingUserName: req.user.firstName || 'System', // The requesting user's username
      PracticeId: mdToolboxConfigData?.practiceId, // Your practice ID
      ExternalPatientId: patient.id, // The unique patient ID from your database
      PatientFirst: patient.firstName,
      PatientLast: patient.lastName,
      PatientMiddle: patient.middleName || '',
      BirthDate: dobDateFormatter(patient.dob, dateFormatter.MMDDYYYY_WITH_SLASHES),
      Gender: getSexAtBirth(patient.sexAtBirthCode || ''),
      Address1: isUsCountryCode ? address1: '',
      Address2: isUsCountryCode ? address2: '',
      City: isUsCountryCode ? patientAddress.locality: '',
      State: isUsCountryCode ? patientAddress.stateCode : '',
      Zip : isUsCountryCode ? patientAddress.postalCode : '',
      HomePhone: (isUsCountryCode && homePhone ) ? homePhone : '',
      CellPhone: (isUsCountryCode && cellPhone ) ? cellPhone : '',
      FavPharmacyId: '',
      Allergies: (!isEmpty(allergyList)) ? allergiesToUpload: '',
      Conditions: (!isEmpty(diagnosisList)) ? problemsToUpload: '',
    });
    if (!patient.mdToolboxPatientId) {
      const patientLookupResponse = await axios.get('https://test2.mdtoolboxrx.net/rxws/secureapi.asmx/GetPatientID', {
        params: {
          APIKey: mdToolboxConfigData?.mdToolboxKey, // Replace with your actual API key
          RequestingAppName: mdToolboxConfigData?.appName, // Name of your app/system
          RequestingUserName: req.user.firstName || 'System', // The requesting user's username
          PracticeId: mdToolboxConfigData?.practiceId, // Your practice ID
          PatientExternalId: patient.id, // The unique patient ID from your database
          PatientFirstName: patient.firstName,
          PatientLastName: patient.lastName,
          PatientMiddleName: patient.middleName || '',
          PatientBirthDate: dobDateFormatter(patient.dob, dateFormatter.MMDDYYYY_WITH_SLASHES),
          PatientGender: getSexAtBirth(patient.sexAtBirthCode || ''),
          PatientZip: isUsCountryCode ? patientAddress.postalCode : '',
        },
      });
      if (patientLookupResponse?.status === httpStatus.OK) {
        const xmlData = patientLookupResponse?.data;
        const match = xmlData.match(/<string[^>]*>(\d+)<\/string>/);
        if (match?.[1]) {
          const mdToolboxPatientId = match[1];
          await dbService.updateById({
            model: db.Patient,
            reqParams: { id: patient.id, ...patient, mdToolboxPatientId: parseInt(mdToolboxPatientId, 10), updatedById: req.user.id },
          });
        }
      }
    }
    
    await dbService.createOne({
      model: db.MdToolbox,
      reqParams: {
        patientId: patient.id,
        status: response.status,
        message: truncateMessage(response.statusText),
        triggerFrom,
        createdById: req.user.id,
      },
    });
    return buildSyncResult({ status: response.status, message: response.statusText });

  } catch (error) {
    const syncError = getSyncError(error);
    await dbService.createOne({
      model: db.MdToolbox,
      reqParams: {
        patientId: patient.id,
        triggerFrom,
        status: syncError.status,
        message: syncError.message,
        createdById: req.user.id,
      },
    });
    return buildSyncResult(syncError);
  }
};

module.exports = {
  uploadPatientToMdtoolbox,
};
