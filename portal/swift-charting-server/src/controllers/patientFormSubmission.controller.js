const httpStatus = require("http-status");
const { patientFormSubmissionService } = require("../services");
const catchAsync = require("../utils/catchAsync");

const createPatientFormSubmission = catchAsync(async (req, res) => {
    const { user,clinicUuid:tenantId} = req || {};
    await patientFormSubmissionService.createPatientFormSubmission(req.body,{tenantId});
    res.status(httpStatus.CREATED).send("Created");
});

const createPublicPatientFormSubmission = catchAsync(async (req, res) => {
    const { clinicUuid: tenantId } = req || {};
    await patientFormSubmissionService.createPatientFormSubmission(req.body, { tenantId, allowPublicAccess: true });
    res.status(httpStatus.CREATED).send("Created");
});

const updatePatientFormSubmission = catchAsync(async (req, res) => {
    const { user,clinicUuid:tenantId} = req || {};
    const patientFormSubmission = await patientFormSubmissionService.updatePatientFormSubmissionById(
      req.params.patientFormSubmissionId,
      req.body,
      {tenantId}
    );
    res.status(httpStatus.OK).send(patientFormSubmission);
  });
  
module.exports={
    createPatientFormSubmission,
    createPublicPatientFormSubmission,
    updatePatientFormSubmission,
}
