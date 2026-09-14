const KJUR = require('jsrsasign');
const { getModels } = require('../utils/connection');
const { appointmentStatus } = require('../config/appointment');
const { dbService } = require('.');
const { sendInviteNotification } = require('./notification.service');
const config = require('../config/config');

const createZoomSessionOnConfirm = async (appointment, { tenantId }) => {
  try {
    const statusCode = appointment.statusCode;
    const db = getModels(tenantId);
    const appointmentId = appointment.id;

    // Check if the appointment is confirmed
    if (statusCode !== appointmentStatus.CONFIRMED) {
      return;
    }

    // Step 1: Get or create the ZoomSession entry for the appointment
    let zoomSession = await appointment.getZoomSession();

    if (!zoomSession) {
      // If no session exists, create one
      zoomSession = await dbService.createOne({ model: db.ZoomSession, reqParams: { appointmentId } });
    } else {
        await zoomSession.setZoomSessionInvites([])
    }

    // Step 2: Fetch practitioner and patient details
    const patients = await appointment.getPatients();
    const practitioner = await appointment.getPractitioner();

    // Step 3: Create new ZoomSessionInvites for practitioner and patients
    const invites = [
      {
        zoomSessionId: zoomSession.id,
        userId: practitioner.userId,
        roleType: 1, // Role type 1 for practitioner
      },
      ...patients.map(patient => ({
        zoomSessionId: zoomSession.id,
        userId: patient.userId,
        roleType: 0, // Role type 0 for patient
      })),
    ];

    await dbService.createBulk({ model: db.ZoomSessionInvite, reqParams: invites });

    console.log("Zoom session and new invites created for appointment:", appointmentId);
  } catch (error) {
    console.error("Error creating Zoom session on confirmation:", error);
  }
};



const createZoomSession = async (sessionId,roleType) => {
  const iat = Math.round(new Date().getTime() / 1000);
  const exp = iat + 60 * 60 * 2; // Expires in 2 hours

  const oHeader = { alg: 'HS256', typ: 'JWT' };
  const sdkKey = config.zoom.sdkKey;
  const sdkSecret = config.zoom.sdkSecret;

  // Function to generate token based on role_type
    const oPayload = {
      app_key: sdkKey,
      iat,
      exp,
      tpc: sessionId,
      role_type: roleType,
    };
    const sHeader = JSON.stringify(oHeader);
    const sPayload = JSON.stringify(oPayload);
    return KJUR.jws.JWS.sign('HS256', sHeader, sPayload, sdkSecret);

};

const validateZoomSessionInvite = async({sessionId,invitedUserId,tenantId,roleType})=>{
    const db = getModels(tenantId);
    const includeOptions = (db)=>[
      {model:db.Patient,as:'patient'},
      {model:db.Staff,as:'practitioner'},
      {model:db.PatientFormSubmission,as:'patientFormSubmission'},
      {model:db.User,as:'sharedBy'}, 
      // {model:db.Staff,as:'sharedBy'}, 
      {
      model: db.PatientForm,
      as: 'linkedPatientForms',
      include:[{model:db.Patient,as:'patient'},{model:db.Staff,as:'practitioner'},{model:db.PatientFormSubmission,as:'patientFormSubmission'},
        // {model:db.Staff,as:'sharedBy'}
        {model:db.User,as:'sharedBy'}, 
      ]
    },];
    const session = await dbService.getOne({model:db.ZoomSession,filter:{where:{id:sessionId}},include:[{model:db.Appointment,as:'appointment',include:[{model:db.PracticeLocation,as:'location'},{model:db.Staff,as:'practitioner'},{model: db.PatientForm, as: 'patientForms',include:includeOptions(db)},]},{model:db.ZoomSessionInvite,as:'zoomSessionInvites',...(!roleType ?{where:{userId:invitedUserId}}:{})}]});
    if(!session){
      throw new Error("User not autherized");
    }
    return session;
}

const addZoomSessionInvite = async({invitedUserIds,fromUserId,sessionId,roleType,tenantId}) => {
    const db = getModels(tenantId);
    const invitedUsers = [];
    for(let invitedUserId of invitedUserIds){
      try{
        const {item:invite} =await  dbService.upsert({model:db.ZoomSessionInvite,filter:{where:{userId:invitedUserId,roleType}},reqParams:{zoomSessionId:sessionId}});
        invitedUsers.push(invite);
      }catch(err){

      }
    }
    const fromUser = await dbService.getOne({model:db.Staff,filter:{where:{userId:fromUserId}},include:[{model:db.GlobalType,as:'title'}]});
    if(invitedUsers.length){
      sendInviteNotification({fromUser,sessionId,invitedUsers},{tenantId})
    }
    return invitedUsers;
  }


module.exports = {
  createZoomSession,
  createZoomSessionOnConfirm,
  validateZoomSessionInvite,
  addZoomSessionInvite,
};
