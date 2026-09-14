const axios = require('axios');
const { getModels } = require('../utils/connection');
const httpStatus = require('http-status');

const hasValidMdToolboxConfig = (mdToolboxConfigData) =>
  Boolean(mdToolboxConfigData?.mdToolboxKey && mdToolboxConfigData?.appName && mdToolboxConfigData?.practiceId);

const getPatientData = async (patient, req) => {
    const uuid = req.clinicUuid;
    const db = getModels(uuid);

    const mdToolboxConfigData = await db.MdToolboxConfig.findOne({
        where: { isDeleted: false },
    });
    if (!hasValidMdToolboxConfig(mdToolboxConfigData)) {
        return null;
    }
    try {
        const response = await axios.get(
            'https://test2.mdtoolboxrx.net/rxws/secureapi.asmx/GetPatientDataAllHL7',
            {
                params: {
                    APIKey: mdToolboxConfigData?.mdToolboxKey,
                    RequestingAppName: mdToolboxConfigData?.appName,
                    RequestingUserName: req.user.firstName,
                    PracticeId: mdToolboxConfigData?.practiceId,
                    PatientId: patient.mdToolboxPatientId,
                },
            }
        );
        if(response.status === httpStatus.OK ){            
            return response?.data
          }
        return null
    } catch (error) {
        console.error("Error fetching patient data:", error.message);
    }
};
const getPatientDataCCD = async (patient, req) => {
    const uuid = req.clinicUuid;
    const db = getModels(uuid);

    const mdToolboxConfigData = await db.MdToolboxConfig.findOne({
        where: { isDeleted: false },
    });
    if (!hasValidMdToolboxConfig(mdToolboxConfigData)) {
        return null;
    }
    try {
        const response = await axios.get(
            'https://test2.mdtoolboxrx.net/rxws/secureapi.asmx/GetPatientDataAllCCD',
            {
                params: {
                    APIKey: mdToolboxConfigData?.mdToolboxKey,
                    RequestingAppName: mdToolboxConfigData?.appName,
                    RequestingUserName: req.user.firstName,
                    PracticeId: mdToolboxConfigData?.practiceId,
                    PatientId: patient.mdToolboxPatientId,
                    DataStartDateTime:'',
                    DataEndDateTime: '',
                },
            }
        );
        if(response.status === httpStatus.OK ){            
            return response?.data
          }
        return null
    } catch (error) {
        console.error("Error fetching patient data:", error.message);
    }
};

module.exports = {
    getPatientData,
    getPatientDataCCD,
};
