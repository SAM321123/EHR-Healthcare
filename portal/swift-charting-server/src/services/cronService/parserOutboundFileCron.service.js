const SftpClient = require('ssh2-sftp-client');
const fs = require('fs').promises;
const path = require('path');
const { dbService } = require('..');
const { getModels } = require('../../utils/connection');

const config = {
  host: process.env.OFFICE_ALLY_SFTP_ADDRESS,
  username: process.env.OFFICE_ALLY_SFTP_USERNAME,
  password: process.env.OFFICE_ALLY_SFTP_PASSWORD,
  port: 22,
  secure: true,
};

const remoteDir = '/outbound';
const localDir = path.join(__dirname, '../../claimFiles/claim_file_outbound');

const parserOutboundFile = async ({ tenantId }) => {
  const sftp = new SftpClient(); // Create a single SFTP client instance
  const db = getModels(tenantId);

  try {
    await sftp.connect(config); // Connect only once

    await fs.mkdir(localDir, { recursive: true });

    const files = await sftp.list(remoteDir);
    if (!files.length) return;

    for (const file of files) {
      const remoteFilePath = `${remoteDir}/${file.name}`;
      const localFilePath = path.join(localDir, file.name);

      try {
        await sftp.fastGet(remoteFilePath, localFilePath);
        await dbService.createOne({
          model: db.ClaimFileLogs,
          reqParams: { fileName: file.name },
        });

        // Remove file from /outbound after successful download
        await sftp.delete(remoteFilePath);

        console.log(`Successfully processed: ${file.name}`);
      } catch (fileError) {
        console.error(`Error processing file ${file.name}:`, fileError);
      }
    }
  } catch (err) {
    console.error('Error in cron job:', err);
  } finally {
    await sftp.end(); // Ensure the SFTP connection is closed properly
  }
};

module.exports = { parserOutboundFile };
