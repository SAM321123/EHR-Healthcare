const ftp = require('basic-ftp');
const path = require('path');
const fs = require('fs');
const Client = require('ssh2-sftp-client');

const uploadFile = async(config,  localPathWithForwardSlashes, remotePath, labsRadiologyId, patientId, fileName) => {
  

  const client = new ftp.Client();
  client.ftp.verbose = true; // Enable verbose logging
  try {
    await client.access(config);
    console.log('Connected to FTP server');
    await client.ensureDir(remotePath)
    await client.cd(remotePath)
    if(patientId===0){
      await client.uploadFrom( localPathWithForwardSlashes, `${fileName}`);
    } else{
      await client.uploadFrom( localPathWithForwardSlashes, `${patientId}_${labsRadiologyId}${fileName}`);
    }
    console.log('File uploaded successfully');
    return { success: true }
  } catch (error) {
    console.error('Error uploading file:', error);
    return { success: false, error };
  } finally {
    client.close();
  }
}

const uploadFileSFTP = async(config, localPath, remotePath, patientId, fileName) => {
  const sftp = new Client();
  try {
    await sftp.connect(config);
    console.log("Connected to SFTP");
    await sftp.put(localPath, `${remotePath}/${fileName}`);
    console.log("File uploaded successfully");
    await sftp.end();
    return { success: true };
  } catch (error) {
    console.error("Error uploading file:", error);
    return { success: false, error };
  }
}

const readFilesFromFTP = async(config, labInfo, remotePath, data) => {
  const client = new ftp.Client();
  client.ftp.verbose = true;
  try {
    await client.access(config);
    console.log('Connected to FTP server');

    try {
      await client.cd(remotePath);
    } catch (cdError) {
      throw new Error(`FTP Error: Unable to access remote path "${remotePath}" – ${cdError.message}`);
    }

    // List files in the directory
    const files = await client.list();

    if (!files.length) {
      console.log(`No files found in FTP path: ${remotePath}`);
      return null;
    }
    const tempDir = path.join(__dirname, 'temp_download');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }
    
    for (const file of files) {
      const remoteFilePath = path.posix.join(remotePath, file.name); // FTP paths use posix
      const localFilePath = path.join(tempDir, file.name);

      try {
      console.log(`Downloading file: ${remoteFilePath}`);
      await client.downloadTo(localFilePath, remoteFilePath);
      console.log(`File downloaded: ${localFilePath}`);
      } catch (downloadErr) {
        console.error(`Failed to download ${remoteFilePath}: ${downloadErr.message}`);
        continue;
      }
      // Read the file content
      if (!fs.existsSync(localFilePath)) {
        console.log(`Local file not found after download: ${localFilePath}`);
        continue;
      }
      const fileContent = fs.readFileSync(localFilePath, 'utf8');
      
      // Parse the file content
      const lines = fileContent.split('\n');
      let pidLine = null;
      let orcLine = null;
      
      for (const line of lines) {
          if (line.startsWith('PID')) {
              pidLine = line;
          }
          if (line.startsWith('ORC')) {
              orcLine = line;
          }
      }
      
      if (pidLine && orcLine) {
          const pidParts = pidLine.split('|');
          const orcParts = orcLine.split('|');
        const pIdMatch = data?.pId == pidParts[2];
        const orderIdMatch = data?.orderId == orcParts[2];

        if (pIdMatch && orderIdMatch) {
          fs.unlinkSync(localFilePath);
          await deleteTemporaryFiles(tempDir);
          return fileContent; // ✅ Matched: return content
        }
      }
      // Delete the local file after processing
      fs.unlinkSync(localFilePath);
  }
    // Delete temporary directory if no match found
    await deleteTemporaryFiles(tempDir);
    return null;
  } catch (err) {
      console.error(`readFilesFromFTP failed: ${err.message}`);
      throw err; // (cron will skip)
  } finally {
      client.close();
  }
}

const deleteTemporaryFiles = async (dir) => {
  if (fs.existsSync(dir)) {
    fs.readdirSync(dir).forEach((file) => {
      const curPath = path.join(dir, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        deleteTemporaryFiles(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(dir);
  }
};


module.exports = { 
  uploadFile,
  readFilesFromFTP,
  uploadFileSFTP,
};