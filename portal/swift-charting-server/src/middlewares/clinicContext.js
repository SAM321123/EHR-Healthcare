/* eslint-disable no-shadow */
/* eslint-disable no-console */
/* eslint-disable import/prefer-default-export */
/* eslint-disable no-new */

const { sequelize } = require('../config/database');
const { initializeModels } = require('../models');

// const seClinicContext = async (req, res, next) => {
//   console.log('req--------------->',req.headers.origin, req.headers, req.headers['x-forwarded-host'], req.hostname)
//   const db = initializeModels(sequelize);
//   const domainName = req.headers.origin;
//   // const domainName = 'swift_charting'; //will be defined later from request origin
//   if (domainName) {
//     console.log('req-------ddd-------->')
//     const practiceData = await db.Practice.findOne({ where: { domainName } });
//     req.clinicUuid = practiceData?.id;
//   }
//   next();
// };

// const seClinicContext = async (req, res, next) => {
//   try {
//     const db = initializeModels(sequelize);
//     const origin = req.headers.host;
  
//     let domainName=null;
//     console.log("origin",origin);
    
//     if (origin) {
      
//       const host = origin.replace(/^https?:\/\//, '').split(':')[0]; 
//       const parts = host.split('.');

//       if (parts.length === 3) {
//         domainName = parts[0];
//         console.log("Extracted domain name:", domainName);
//       }else{
//         return res.status(403).json({ message: "Clinic doesn't exist or incorrect" });
//       }
//       // const match = origin.split(".");
//       // if (match) {
//       //   domainName = match[0];
//       //   console.log("Extracted domain name:", domainName);
//       // }
//     }

//     // const domainName = req.headers.origin === 'http://localhost:3000'? null : req.headers.origin ;

//     if (domainName !== 'admin') {
//       const practiceData = await db.Practice.findOne({ where: { domainName } });
//       if (!practiceData) {
//         return res.status(404).json({ message: "Clinic doesn't exist or incorrect" });
//       }
//       if(practiceData){
//         const isExpired = practiceData?.trialExpiresAt && new Date(practiceData?.trialExpiresAt) < new Date();
//         if(isExpired){
//           return res.status(404).json({ message: "Clinic trial period expires!" });
//         }
//       }
//       req.clinicUuid = practiceData?.id;
//     }
//     next();
//   } catch (error) {
//     console.error('Error in seClinicContext:', error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };

const masterDB = initializeModels(sequelize, true);
const clinicCache = new Map();
const CLINIC_CACHE_TTL_MS = 5 * 60 * 1000;

const getDomainNameFromRequest = (req) => {
  const origin = req.headers.origin;
  const forwardedHost = req.headers['x-forwarded-host'];
  const hostHeader = forwardedHost || req.headers.host;

  if (origin) {
    const match = origin.match(/^https?:\/\/([^.:/]+)\./);
    if (match) {
      return match[1];
    }
  }

  if (hostHeader) {
    const host = hostHeader.replace(/^https?:\/\//, '').split(':')[0];
    const parts = host.split('.');
    if (parts.length > 1) {
      return parts[0];
    }
  }

  return null;
};

const getClinicUuidByDomain = async (domainName) => {
  const cachedClinic = clinicCache.get(domainName);
  if (cachedClinic && cachedClinic.expiresAt > Date.now()) {
    return cachedClinic;
  }

  const practiceData = await masterDB.Practice.findOne({
    where: { domainName },
    attributes: ['id', 'trialExpiresAt'],
  });
  const clinicContext = {
    clinicUuid: practiceData?.id || null,
    trialExpiresAt: practiceData?.trialExpiresAt || null,
    expiresAt: Date.now() + CLINIC_CACHE_TTL_MS,
  };

  clinicCache.set(domainName, clinicContext);

  return clinicContext;
};

const seClinicContext = async (req, res, next) => {
  try {
    const domainName = getDomainNameFromRequest(req);

    if (!domainName || domainName === 'admin') {
      return next();
    }

    const clinicContext = await getClinicUuidByDomain(domainName);
    const clinicUuid = clinicContext?.clinicUuid;
    if (!clinicUuid) {
      return res.status(403).json({ message: "Clinic doesn't exist or incorrect" });
    }

    const isExpired = clinicContext?.trialExpiresAt && new Date(clinicContext.trialExpiresAt) < new Date();
    if (isExpired) {
      return res.status(404).json({ message: "Clinic trial period expires!" });
    }

    req.clinicUuid = clinicUuid;
    return next();
  } catch (error) {
    console.error('Error in seClinicContext:', error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};


module.exports = { seClinicContext };
