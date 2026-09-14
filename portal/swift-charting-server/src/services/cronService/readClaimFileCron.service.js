const fs = require('fs').promises;
const path = require('path');
const { Op } = require('sequelize');
const { isEmpty } = require('lodash');
const { getModels } = require('../../utils/connection');
const { edi999Parser, parseClaimSummaryFile } = require('../../utils/claimFileUtils');
const { generalClaimStatus } = require('../../utils');
const { dbService } = require('..');

const localDir = path.join(__dirname, '../../claimFiles/claim_file_outbound');

const acknowledgmentStatusMap = {
  A: 'Accepted',
  E: 'Accepted But Errors Were Noted',
  M: 'Rejected, Message Authentication Code (MAC) Failed',
  R: 'Rejected',
  W: 'Rejected, Assurance Failed Validity Tests',
  X: 'Rejected, Content After Decryption Could Not Be Analyzed',
};

const summaryFilePattern = /^FS_HCFA_(\d+)_IN_C\.txt$/i;

const getClaimFileIdFromSummaryFileName = (fileName = '') => fileName.match(summaryFilePattern)?.[1] || '';

const isMatchingSummaryForClaim = (sourceClaimFileName = '', claimFileName = '') => (
  Boolean(sourceClaimFileName)
  && Boolean(claimFileName)
  && (sourceClaimFileName === claimFileName || sourceClaimFileName.endsWith(claimFileName))
);

const readClaimFile = async ({ tenantId }) => {
  try {
    const db = getModels(tenantId);
    const patientCounterClaims = await db.PatientEncounterClaims.findAll({
      where: {
        isDeleted: false,
        [Op.or]: [
          { claimId: null },
          { fileId: null },
          { claimStatus: generalClaimStatus.PENDING },
        ],
      },
    });

    if (patientCounterClaims.length === 0) {
      return;
    }

    const filesInDir = await fs.readdir(localDir);
    const summaryFiles = filesInDir.filter((file) => summaryFilePattern.test(file));
    const summaryCache = new Map();

    const getParsedSummaryFile = async (fileName) => {
      if (summaryCache.has(fileName)) {
        return summaryCache.get(fileName);
      }

      const filePath = path.join(localDir, fileName);
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const parsedSummary = {
        ...parseClaimSummaryFile(fileContent),
        fileId: getClaimFileIdFromSummaryFileName(fileName),
        fileName,
      };

      summaryCache.set(fileName, parsedSummary);
      return parsedSummary;
    };

    await Promise.all(
      patientCounterClaims.map(async (claim) => {
        const originalClaimFileName = claim.claimFileName;
        const claimAckFileName = originalClaimFileName.replace(/\.CLM$/, '_999.999');
        const matching999File = filesInDir.find((file) => file.includes(claimAckFileName));
        let fileId = claim.fileId || null;
        let acknowledgmentStatus = claim.acknowledgmentStatus || null;
        let statusFrom999 = null;

        try {
          if (matching999File) {
            const filePath = path.join(localDir, matching999File);
            const ediContent = await fs.readFile(filePath, 'utf-8');
            const ediData = edi999Parser(ediContent);

            acknowledgmentStatus = acknowledgmentStatusMap[ediData.functionalGroupStatus] || acknowledgmentStatus;
            if (['M', 'R', 'W', 'X'].includes(ediData.functionalGroupStatus)) {
              statusFrom999 = generalClaimStatus.REJECTED;
            }

            fileId = `${ediData.numberOfTransactionSets}${ediData.functionalGroupControlNumber}`;
          }

          let parsedSummary = null;
          if (fileId) {
            const summaryFileName = `FS_HCFA_${fileId}_IN_C.txt`;
            if (filesInDir.includes(summaryFileName)) {
              const summaryData = await getParsedSummaryFile(summaryFileName);
              if (isMatchingSummaryForClaim(summaryData.sourceClaimFileName, originalClaimFileName)) {
                parsedSummary = summaryData;
              } else {
                console.warn(
                  `Summary file "${summaryFileName}" did not match claim "${originalClaimFileName}" for tenant ${tenantId}`
                );
              }
            }
          }

          if (!parsedSummary) {
            for (const summaryFile of summaryFiles) {
              const summaryData = await getParsedSummaryFile(summaryFile);
              if (isMatchingSummaryForClaim(summaryData.sourceClaimFileName, originalClaimFileName)) {
                parsedSummary = summaryData;
                if (!fileId) {
                  fileId = summaryData.fileId;
                }
                break;
              }
            }
          }

          const partialUpdate = {};
          if (fileId) {
            partialUpdate.fileId = fileId;
          }
          if (acknowledgmentStatus) {
            partialUpdate.acknowledgmentStatus = acknowledgmentStatus;
          }
          if (statusFrom999) {
            partialUpdate.claimStatus = statusFrom999;
          }

          if (!isEmpty(partialUpdate)) {
            await dbService.updateOne({
              model: db.PatientEncounterClaims,
              updateParams: partialUpdate,
              filter: { where: { id: claim.id } },
            });
          }

          if (!parsedSummary) {
            if (!matching999File) {
              console.warn(`No matching 999 file found for "${claimAckFileName}" in ${localDir}`);
            }
            console.warn(`No matching claim summary file found for "${originalClaimFileName}" in ${localDir}`);
            return;
          }

          const { claimId, errors } = parsedSummary;
          const claimStatus = isEmpty(errors) ? generalClaimStatus.ACCEPTED : generalClaimStatus.REJECTED;
          const summaryUpdate = {
            fileId: fileId || parsedSummary.fileId || claim.fileId,
            claimStatus,
            errors,
          };

          if (acknowledgmentStatus) {
            summaryUpdate.acknowledgmentStatus = acknowledgmentStatus;
          }
          if (claimId) {
            summaryUpdate.claimId = claimId;
          }

          await dbService.updateOne({
            model: db.PatientEncounterClaims,
            updateParams: summaryUpdate,
            filter: { where: { id: claim.id } },
          });

          if (claimStatus === generalClaimStatus.ACCEPTED) {
            await dbService.updateOne({
              model: db.PatientEncounterBilling,
              updateParams: { statusCode: 'paid_billing_status' },
              filter: { where: { id: claim.encounterBillingId } },
            });
          }
        } catch (err) {
          const processedFileName = matching999File || originalClaimFileName;
          console.error(`Error processing file "${processedFileName}":`, err);
        }
      })
    );
  } catch (error) {
    console.error('Error in readClaimFile:', error);
  }
};

module.exports = { readClaimFile };
