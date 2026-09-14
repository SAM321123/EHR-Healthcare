const dbService = require("./db.service");
const { getModels } = require("../utils/connection");
const ApiError = require("../utils/ApiError");
const httpStatus = require("http-status");
const { errorMessages } = require("../config/error");
const { exitOnError } = require("winston");
const path = require("path");
const fs = require('fs');
const { ftpService } = require(".");
const { genralStatus, generalClaimStatus } = require("../utils");
const { exit } = require("process");
const uuid = require('uuid').v4;

const createEncounterClaimBilling = async({tenantId,body,user})=>{
    const db= getModels(tenantId);
    let { encounterProcedureCodes=[], encounterDiagnosis, encounterDiagnosisSnomeds, patientId,encounterId,insuranceType,primaryProviderId,insuranceSubmittedAmount, ...rest } = body || {};
    // encounterProcedureCodes = encounterProcedureCodes.reverse();
    const officeallyUsername = process.env.OFFICE_ALLY_USERNAME;
    const officeallyPassword = process.env.OFFICE_ALLY_PASSWORD;
    const officeallySenderId = process.env.OFFICE_ALLY_SENDER_ID;
    const receiverId = "OFFICE ALLY";

    const patientData = await dbService.getOneById({
      model: db.Patient,
      id: patientId,
      include: [
        { model: db.GlobalType, as: 'sexAtBirth' },
    ]
    });
    
    const patientInsurance = await dbService.getOne({
      model: db.Insurance,
      filter: {
        where: {
          insuranceType,
          patientId,
          isDeleted: false,
        }
      }
    });
    if (!patientInsurance) {
      throw new ApiError(httpStatus.BAD_REQUEST, errorMessages.NO_INSURANCE_EXISTS);
    }
   
    const insurance = await dbService.getOne({
      model: db.Insurance,
      filter: {where: {id:patientInsurance?.id,patientId}}
  })
  
  const payerListId=insurance?.payerId;
    const payerData = await dbService.getOne({
      model: db.PayerList,
      filter: {where: {id:payerListId}}
  })
  const providerData = await dbService.getOne({
    model: db.Staff,
    filter: {where: {id:primaryProviderId}}
})

  if (!patientData || !insurance || !payerData || !providerData) {
    throw new ApiError(httpStatus.BAD_REQUEST, errorMessages.NO_RECORD_FOUND);
  }

    const { dob, sexAtBirth } = patientData;
    let sex = 'U';
    const gender = sexAtBirth?.name?.trim().toLowerCase();
    
    if (gender === 'male') {
      sex = 'M';
    } else if (gender === 'female') {
      sex = 'F';
    }
    patientName = {
        last: insurance?.lastName,
        middle: insurance?.middleName,
        first: insurance?.firstName
    }
    const patientAddress=patientData?.address;

      const payerId=payerData?.payerId;
      const payerName=payerData?.payerName;
      const providerNpi=providerData?.npiNo;
      const providerFirstName=providerData?.firstName;
      const providerLastName=providerData?.lastName;
      const providerAddress=providerData?.address;
      
      const insurance_Id = insurance?.insuranceId;
      const groupNumber = insurance?.groupNumber || "";
      const memberId = insurance_Id;
      const dateOfService = new Date().toISOString().slice(0,8);
      const dateOfBirth = new Date(dob);
      const formattedDateOfBirth = dateOfBirth.toISOString().slice(0, 10).replace(/-/g, '')
      
    delete rest.procedureCode;

    const encounterBilling = await dbService.createOne({
      model: db.PatientEncounterBilling,
      reqParams: { ...rest,patientId,encounterId,insuranceId:patientInsurance?.id,
        primaryProviderId,insuranceSubmittedAmount,insuranceType, },
    });
  
    let diagnosisLine=[];

    if(encounterDiagnosis && encounterDiagnosis.length){
      const diagnosisIcdIds = encounterDiagnosis?.map(diagnosis => diagnosis.id);
      for (const encounterDiagnosisdata of encounterDiagnosis) {
        let diaSegment = `*ABK>${encounterDiagnosisdata?.name}`;
        diagnosisLine.push(`${diaSegment}`);
    }
          await encounterBilling.setEncounterDiagnosis(diagnosisIcdIds);
    }
    if(encounterDiagnosisSnomeds && encounterDiagnosisSnomeds.length){
      const diagnosisSnomeds = encounterDiagnosisSnomeds?.map(diagnosisSnomed => diagnosisSnomed.id);
      await encounterBilling.setEncounterDiagnosisSnomeds(diagnosisSnomeds)
    }

    let procedureCodeDataArray =[];
    for(let encounterProcedureCode of encounterProcedureCodes){
      if(typeof encounterProcedureCode.id==='string' && encounterProcedureCode.id.startsWith('new_')){
        const {id,...restProcedureCodeItem}= encounterProcedureCode || {};
        const createdProcedureCode= await dbService.createOne({
          model: db.ProcedureCode,
          reqParams: {...restProcedureCodeItem}
        });
        procedureCodeDataArray.push(createdProcedureCode)
      }else{
        procedureCodeDataArray.push(encounterProcedureCode)
      }
    }
    let serviceLines = [];

    if (procedureCodeDataArray && procedureCodeDataArray.length) {
      let lxIndex = 1; // LX counter
      for (const procedureCode of procedureCodeDataArray) {
        const serviceDate=procedureCode?.serviceDate?.split("T")[0].replace(/-/g, "");

        await encounterBilling.addEncounterProcedureCode(procedureCode.id, {
          through: {
            modifier1: procedureCode.modifier1,
            modifier2: procedureCode.modifier2,
            modifier3: procedureCode.modifier3,
            modifier4: procedureCode.modifier4,
            total:procedureCode.total,
            qty: procedureCode.qty,
            price: procedureCode.price,
            serviceDate: procedureCode.serviceDate,
            discAmt: procedureCode.discAmt,
            discPer: procedureCode.discPer,
            taxAmt: parseInt(procedureCode.taxAmt) || 0,
            taxPer: parseInt(procedureCode.taxPer) || 0,
          }
        });
         // Constructing the EDI segment
      let lxSegment = `LX*${lxIndex}~`;
      let sv1Segment = `SV1*HC>${procedureCode.cptCode}*${procedureCode.price}*UN*${procedureCode.qty}***1~`;
      let dtpSegment = `DTP*472*D8*${serviceDate}~`;

      serviceLines.push(`\n${lxSegment}\n${sv1Segment}\n${dtpSegment}`);
      lxIndex++;
      }
    }
    const existingEncounterClaim = await dbService.getCounts({
        model: db.PatientEncounterClaims,
        filter: {
          where: {
            encounterBillingId:encounterBilling?.id,
            encounterId,
            patientId
          }
        }
      });
      const date = new Date();

      const traceNumber =  date.getFullYear().toString().slice(-2) +  // YY (last 2 digits of year)
             (date.getMonth() + 1).toString().padStart(2, "0") +  // MM (month)
             date.getDate().toString().padStart(2, "0") +  // DD (day)
             date.getHours().toString().padStart(2, "0") +  // HH (hour)
             date.getMinutes().toString().padStart(2, "0") +  // MM (minute)
             date.getSeconds().toString().padStart(2, "0");  // SS (seconds)
      const payload = construct837Payload({ officeallySenderId, receiverId,payerId,payerName, providerNpi,providerFirstName,providerLastName,providerAddress, groupNumber, memberId, patientName, patientAddress, dob:formattedDateOfBirth,serviceLines,diagnosisLine,insuranceSubmittedAmount ,traceNumber,sex});
      const config = {
        host: process.env.OFFICE_ALLY_SFTP_ADDRESS,
        password: process.env.OFFICE_ALLY_SFTP_PASSWORD,
        user: process.env.OFFICE_ALLY_SFTP_USERNAME,
        port: 22,
        secureOptions:{ rejectUnauthorized:true },
        secure: true,
        connectTimeout: 30000, // 30 seconds
        pasvTimeout: 30000,   // 30 seconds
        keepalive: 30000     // 30 seconds
      }
    
    const localPath = path.resolve(__dirname, '../../claimFiles'); // Convert to absolute path

    fs.mkdirSync(localPath, { recursive: true });
    // Define the path to the local file where you want to store the HL7 content
    const outputPath = path.join(localPath , `SBR_${patientId}_Claim_${existingEncounterClaim+1}_ttId_${tenantId}_` + new Date().toISOString().slice(0, 4)
    + new Date().toISOString().slice(5, 7) + new Date().toISOString().slice(8, 10)+ "_" + new Date().toISOString().slice(11, 13) + 
    new Date().toISOString().slice(14, 16) + 
    new Date().toISOString().slice(17, 19) +  `.CLM`);

    
    try{
      fs.writeFile(outputPath, payload, (err) => {
        if (err) {
          console.error('Error writing file:', err);
        } else {
          console.log('File written successfully:', outputPath);
        }
      });
      // code of FTP
  
      const fileName = `SBR_${patientId}_Claim_${existingEncounterClaim+1}_ttId_${tenantId}_` 
      + new Date().toISOString().slice(0, 4) 
      + new Date().toISOString().slice(5, 7) 
      + new Date().toISOString().slice(8, 10)+ "_" + new Date().toISOString().slice(11, 13) + // Hours
      new Date().toISOString().slice(14, 16) + // Minutes
      new Date().toISOString().slice(17, 19) + `.CLM`;
      const localPathWithForwardSlashes = outputPath.replace(/\\/g, '/');
      const remotePath = `/inbound`
      let result = await ftpService.uploadFileSFTP(config, localPathWithForwardSlashes, remotePath, patientId, fileName);
      if (result.success) {
        // Delete the local file after successful upload
            fs.unlink(outputPath, (err) => {
              if (err) {
                console.error('Error deleting local file:', err);
              } else {
                console.log('Local file deleted successfully:', outputPath);
              }
            });
            const encounterClaimBilling = await dbService.createOne({
            model: db.PatientEncounterClaims,
            reqParams: { encounterBillingId:encounterBilling?.id,encounterId,patientId ,claimFileName:fileName,claim837EDI:payload,claimStatus:generalClaimStatus?.PENDING ,traceNumber},
            });

        
      } else {
        console.error('Upload failed, local file not deleted:', result.error);
      }
    } catch (error) {
        console.error('Error during file operations:', error);
        throw new ApiError(httpStatus.BAD_REQUEST, errorMessages.INCOMPLETE_PARAMS);
      }
   return encounterBilling;
}


const construct837Payload = ({ officeallySenderId, receiverId, payerId,payerName, providerNpi,providerFirstName,providerLastName,providerAddress, groupNumber = "", memberId, patientName,patientAddress, dob,serviceLines ,diagnosisLine,insuranceSubmittedAmount, traceNumber , sex}) => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const seconds = now.getSeconds().toString().padStart(2, "0");
    console.log("patientAddress?.description>>>>>>>>>>>>>>>>>>",patientAddress?.description);
    const formattedTime = `${hours}${minutes}${seconds}`;
    return `ISA*00*          *00*          *ZZ*${officeallySenderId.padEnd(15)}*ZZ*${receiverId.padEnd(15)}*${new Date().toISOString().slice(2, 4)}${new Date().toISOString().slice(5, 7)}${new Date().toISOString().slice(8, 10)}*${formattedTime}*^*00501*000000001*0*T*>~
GS*HC*${officeallySenderId}*${receiverId}*${now.toISOString().slice(0, 4)}${now.toISOString().slice(5, 7)}${new Date().toISOString().slice(8, 10)}*${formattedTime}*000000001*X*005010X222A1~
ST*837*0021*005010X222A1~
BHT*0019*00*${traceNumber}*${now.toISOString().slice(0, 4)}${now.toISOString().slice(5, 7)}${new Date().toISOString().slice(8, 10)}*${formattedTime}*RP~
NM1*41*1*${receiverId}****46*330897513~
PER*IC*OFFICE ALLY SUPPORT*TE*3609757000~
NM1*40*2*${payerName}*****46*${payerId}~
HL*1**20*1~
NM1*85*1*${providerLastName}*${providerFirstName}****XX*${providerNpi}~
N3*${providerAddress?.addressLine1 || providerAddress?.addressLine2 || providerAddress?.description}~
N4*${providerAddress?.locality}*${providerAddress?.stateCode}*${providerAddress?.postalCode}~
REF*EI*587654321~
HL*2*1*22*0~
SBR*P*18*${groupNumber}******HM~
NM1*IL*1*${patientName.last}*${patientName.first}****MI*${memberId}~
N3*${patientAddress?.description}~
N4*${patientAddress?.locality}*${patientAddress?.stateCode}*${patientAddress?.postalCode}~
DMG*D8*${dob}*${sex}~
NM1*PR*2*${payerName}*****PI*${payerId}~
CLM*3456781*${insuranceSubmittedAmount}***11>B>1*Y*A*Y*I~
DTP*431*D8*${now.toISOString().slice(0, 4)}${now.toISOString().slice(5, 7)}${new Date().toISOString().slice(8, 10)}~
HI${diagnosisLine.join("")}~${serviceLines.join("")}
SE*41*0021~
GE*1*000000001~
IEA*1*000000001~`.trim();
  };

const updateEncounterClaimBilling = async({tenantId,encounterBillingId,updateParams,user}) => {
    const db= getModels(tenantId);
    let { encounterProcedureCodes=[], encounterDiagnosis=[], encounterDiagnosisSnomeds=[],patientId,encounterId,insuranceType,primaryProviderId,insuranceSubmittedAmount, ...rest } = updateParams || {};
    encounterProcedureCodes = encounterProcedureCodes.reverse();

    const userId = user.id;
    const officeallyUsername = process.env.OFFICE_ALLY_USERNAME;
    const officeallyPassword = process.env.OFFICE_ALLY_PASSWORD;
    const officeallySenderId = process.env.OFFICE_ALLY_SENDER_ID;
    const receiverId = "OFFICE ALLY";


    
    const patientData = await dbService.getOneById({
      model: db.Patient,
      id: patientId,
      include: [
        { model: db.GlobalType, as: 'sexAtBirth' },
    ]
    });

    
    const patientInsurance = await dbService.getOne({
      model: db.Insurance,
      filter: {
        where: {
          insuranceType,
          patientId
        }
      }
    });
    let patientInsuranceId;
    if (!patientInsurance) {
       patientInsuranceId = null;
    }
    else{
       patientInsuranceId = patientInsurance?.id;
    }
    if (!patientInsurance) {
      throw new ApiError(httpStatus.BAD_REQUEST, errorMessages.NO_INSURANCE_EXISTS);
    }
    const insurance = await dbService.getOne({
      model: db.Insurance,
      filter: {where: {id:patientInsurance?.id,patientId}}
  })
  
  const payerListId=insurance?.payerId;
    const payerData = await dbService.getOne({
      model: db.PayerList,
      filter: {where: {id:payerListId}}
  })
  const providerData = await dbService.getOne({
    model: db.Staff,
    filter: {where: {id:primaryProviderId}}
})
if (!patientData || !insurance || !payerData || !providerData) {
  throw new ApiError(httpStatus.BAD_REQUEST, errorMessages.NO_RECORD_FOUND);
}


    const { dob, sexAtBirth } = patientData;
    let sex = 'U';
    const gender = sexAtBirth?.name?.trim().toLowerCase();
    
    if (gender === 'male') {
      sex = 'M';
    } else if (gender === 'female') {
      sex = 'F';
    }
    patientName = {
        last: insurance?.lastName || patientData?.lastName,
        middle: insurance?.middleName  || patientData?.middleName,
        first: insurance?.firstName || patientData?.firstName
    }
      const patientAddress=patientData?.address;

      const payerId=payerData?.payerId;
      const payerName=payerData?.payerName;
      const providerNpi=providerData?.npiNo;
      const providerFirstName=providerData?.firstName;
      const providerLastName=providerData?.lastName;
      const providerAddress=providerData?.address;
      
      const insurance_Id = insurance?.insuranceId;
      const groupNumber = insurance?.groupNumber || "";
      const dateOfService = new Date().toISOString().slice(0,8);
      const dateOfBirth = new Date(dob);
      const formattedDateOfBirth = dateOfBirth.toISOString().slice(0, 10).replace(/-/g, '')
      const memberId = insurance_Id;

     

            
        if (!payerId || !payerName || !providerNpi || !insurance_Id) {
          throw new ApiError(httpStatus.BAD_REQUEST, errorMessages.INCOMPLETE_PARAMS);
        }
  
    const updateData ={ ...rest, id:encounterBillingId, updatedById: userId,insuranceId:patientInsuranceId,insuranceSubmittedAmount, insuranceType };
    delete rest.procedureCode;

    const newProcedureCodes = [];
    const procedureCodeOnly =[]
  
    const existingEncounterBilling = await dbService.getOneById({
      model: db.PatientEncounterBilling,
      id: encounterBillingId,
    });
    if (!existingEncounterBilling) {
      throw new ApiError(httpStatus.NOT_FOUND, errorMessages.NO_RECORD_FOUND);
    }

    
    const [,[encounterBilling]] = await dbService.updateById({
      model: db.PatientEncounterBilling,
      reqParams: updateData,
    });
  
    encounterProcedureCodes.forEach(item=>{
      if(typeof item.id==='string' && item.id.startsWith('new_')){
        const {id,...restDProcedureCodeItem}= item || {};
        newProcedureCodes.push(restDProcedureCodeItem);
      }else{
        procedureCodeOnly.push(item)
      }
    })
    let diagnosisLine=[];
    if(encounterDiagnosis){
      const diagnosisIcdIds = encounterDiagnosis?.map(diagnosis => diagnosis.id);
      for (const encounterDiagnosisdata of encounterDiagnosis) {
          let diaSegment = `*ABK>${encounterDiagnosisdata?.name}`;
          diagnosisLine.push(`${diaSegment}`);
      }
      await encounterBilling.setEncounterDiagnosis(diagnosisIcdIds);
    }
    if(encounterDiagnosisSnomeds){
        const diagnosisSnomeds = encounterDiagnosisSnomeds?.map(diagnosisSnomed => diagnosisSnomed.id);
        await encounterBilling.setEncounterDiagnosisSnomeds(diagnosisSnomeds)
    }

    let procedureCodeDataArray =[];
    for(let encounterProcedureCode of encounterProcedureCodes){
      if(typeof encounterProcedureCode.id==='string' && encounterProcedureCode.id.startsWith('new_')){
        const {id,...restProcedureCodeItem}= encounterProcedureCode || {};
        const createdProcedureCode= await dbService.createOne({
          model: db.ProcedureCode,
          reqParams: {...restProcedureCodeItem}
        });
        procedureCodeDataArray.push(createdProcedureCode)
      }else{
        procedureCodeDataArray.push(encounterProcedureCode)
      }
    }
    let serviceLines = [];

    if (procedureCodeDataArray) {
      await encounterBilling.setEncounterProcedureCodes([]);
     
    let lxIndex = 1; // LX counter
      for (const procedureCode of procedureCodeDataArray) {
        const serviceDate=procedureCode?.serviceDate?.split("T")[0].replace(/-/g, "");
        await encounterBilling.addEncounterProcedureCode(procedureCode.id, {
          through: {
            modifier1: procedureCode.modifier1,
            modifier2: procedureCode.modifier2,
            modifier3: procedureCode.modifier3,
            modifier4: procedureCode.modifier4,
            total:procedureCode.total,
            qty: procedureCode.qty,
            price: procedureCode.price,
            serviceDate: procedureCode.serviceDate,
            discAmt: procedureCode.discAmt,
            discPer: procedureCode.discPer,
            taxAmt: parseInt(procedureCode.taxAmt) || 0,
            taxPer: parseInt(procedureCode.taxPer) || 0,
          }
        });
          // Constructing the EDI segment
      let lxSegment = `LX*${lxIndex}~`;
      let sv1Segment = `SV1*HC>${procedureCode.cptCode}*${procedureCode.price}*UN*${procedureCode.qty}***1~`;
      let dtpSegment = `DTP*472*D8*${serviceDate}~`;

      serviceLines.push(`\n${lxSegment}\n${sv1Segment}\n${dtpSegment}`);
      lxIndex++;
      }
  
    }

    
    const existingEncounterClaim = await dbService.getCounts({
        model: db.PatientEncounterClaims,
        filter: {
          where: {
            encounterBillingId,
            encounterId,
            patientId
          }
        }
      });
      const date = new Date();

      const traceNumber =  date.getFullYear().toString().slice(-2) +  // YY (last 2 digits of year)
             (date.getMonth() + 1).toString().padStart(2, "0") +  // MM (month)
             date.getDate().toString().padStart(2, "0") +  // DD (day)
             date.getHours().toString().padStart(2, "0") +  // HH (hour)
             date.getMinutes().toString().padStart(2, "0") +  // MM (minute)
             date.getSeconds().toString().padStart(2, "0");  // SS (seconds)
    const payload = construct837Payload({ officeallySenderId, receiverId, payerId,payerName, providerNpi,providerFirstName,providerLastName,providerAddress, groupNumber, memberId, patientName,patientAddress, dob:formattedDateOfBirth,serviceLines,diagnosisLine,insuranceSubmittedAmount, traceNumber ,sex});
    const config = {
      host: process.env.OFFICE_ALLY_SFTP_ADDRESS,
      password: process.env.OFFICE_ALLY_SFTP_PASSWORD,
      user: process.env.OFFICE_ALLY_SFTP_USERNAME,
      port: 22,
      secureOptions:{ rejectUnauthorized:true },
      secure: true,
      connectTimeout: 30000, // 30 seconds
      pasvTimeout: 30000,   // 30 seconds
      keepalive: 30000     // 30 seconds
    }
    // Define the path to the local file where you want to store the HL7 content
    const outputPath = path.join(__dirname,'../../claimFiles', `SBR_${patientId}_Claim_${existingEncounterClaim+1}_ttId_${tenantId}_` + new Date().toISOString().slice(0, 4)
    + new Date().toISOString().slice(5, 7) + new Date().toISOString().slice(8, 10)+ "_" + new Date().toISOString().slice(11, 13) + // Hours
    new Date().toISOString().slice(14, 16) + // Minutes
    new Date().toISOString().slice(17, 19) +  `.CLM`);
    try{
      fs.writeFile(outputPath, payload, (err) => {
        if (err) {
          console.error('Error writing file:', err);
        } else {
          console.log('File written successfully:', outputPath);
        }
      });
      // code of FTP
  
      const fileName = `SBR_${patientId}_Claim_${existingEncounterClaim+1}_ttId_${tenantId}_` 
      + new Date().toISOString().slice(0, 4) 
      + new Date().toISOString().slice(5, 7) 
      + new Date().toISOString().slice(8, 10)+ "_" + new Date().toISOString().slice(11, 13) + // Hours
      new Date().toISOString().slice(14, 16) + // Minutes
      new Date().toISOString().slice(17, 19) + `.CLM`;
      const localPathWithForwardSlashes = outputPath.replace(/\\/g, '/');
      const remotePath = `/inbound`
      let result = await ftpService.uploadFileSFTP(config, localPathWithForwardSlashes, remotePath, patientId, fileName);
      if (result.success) {
        // Delete the local file after successful upload
            fs.unlink(outputPath, (err) => {
              if (err) {
                console.error('Error deleting local file:', err);
              } else {
                console.log('Local file deleted successfully:', outputPath);
              }
            });
            const encounterClaimBilling = await dbService.createOne({
            model: db.PatientEncounterClaims,
            reqParams: {encounterBillingId,encounterId,patientId ,claimFileName:fileName,claim837EDI:payload,claimStatus:generalClaimStatus?.PENDING ,traceNumber},
            });
        
      } else {
        console.error('Upload failed, local file not deleted:', result.error);
      }
    } catch (error) {
        console.error('Error during file operations:', error);
        throw new ApiError(httpStatus.BAD_REQUEST, errorMessages.INCOMPLETE_PARAMS);
      }

   return encounterBilling;
}
module.exports={
    createEncounterClaimBilling,
    updateEncounterClaimBilling,
}
