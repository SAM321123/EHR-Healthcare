/* eslint-disable no-undef */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-shadow */
const path = require('path');
const PDFMerger = require('pdf-merger-js');
const puppeteer = require('puppeteer');
const fs = require('fs');
const { clientLogo } = require('../../config/config');

const options = {
  displayHeaderFooter: false,
  printBackground: true,
  margin: {
    top: '44px',
    bottom: '64px',
    left: '40px',
    right: '40px',
  },
};

const resolveAssetPath = (...relativePathSegments) => path.join(__dirname, ...relativePathSegments);

const getBase64 = (file) => {
  const fileBuffer = fs.readFileSync(file);
  return fileBuffer.toString('base64');
};

const getBase64WithFallback = (paths, fallbackValue = '') => {
  for (const filePath of paths) {
    if (fs.existsSync(filePath)) {
      return getBase64(filePath);
    }
  }
  return fallbackValue;
};

const getLogoSource = ({ practice, practiceSetting, logoBase64 = '', logoMimeType = '', logoName = '' }) => {
  const practiceData = practice?.dataValues || practice || {};
  const practiceLogo = practiceData?.logo || {};
  const practiceLogoAttachment = practiceSetting?.logoConfigs?.practiceLogoAttechment || {};
  const resolvedLogo = logoBase64 || practiceLogoAttachment?.content || clientLogo;
  const resolvedMimeType =
    logoMimeType || practiceLogo?.mimetype || practiceLogo?.imageType || practiceLogoAttachment?.type || 'image/png';
  const normalizedLogo = resolvedLogo?.startsWith('data:') ? resolvedLogo.split(',').pop() : resolvedLogo;

  if (!normalizedLogo) {
    return {
      logoData: '',
      logoMimeType: resolvedMimeType,
      logoName: logoName || practiceLogo?.name || practiceLogoAttachment?.filename || '',
    };
  }

  return {
    logoData: `data:${resolvedMimeType};base64,${normalizedLogo}`,
    logoMimeType: resolvedMimeType,
    logoName: logoName || practiceLogo?.name || practiceLogoAttachment?.filename || '',
  };
};

const buildInlineAssetAttachment = ({ filename, content, cid, type = 'image/png' }) => {
  const normalizedContent = content?.startsWith?.('data:') ? content.split(',').pop() : content;

  if (!normalizedContent || !cid) {
    return null;
  }

  return {
    filename,
    content: normalizedContent,
    cid,
    type,
    disposition: 'inline',
    encoding: 'base64',
  };
};

const addFontFaimly = async (template) => {
  const poppinsFron = await getBase64(resolveAssetPath('../../lib/fonts/Poppins-Regular.ttf'));
  const fontDefination = `<style>@font-face {
    font-family: "Poppins";
    src: url("data:font/ttf;base64,${poppinsFron}");
  }</style>`;
  return `${fontDefination} ${template}`;
};

const setPageContentAndData = async ({ template, options }) => {
  const pageContent = await addFontFaimly(template);
  const { pdfPath, ...pageOptions } = options;
  const merger = new PDFMerger();
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox'],
  });

  const page = await browser.newPage();
  await page.setContent(pageContent, {
    waitUntil: ['load', 'networkidle0'],
  });

  const scrollDimension = await page.evaluate(() => {
    return {
      width: document.scrollingElement.scrollWidth,
      height: document.scrollingElement.scrollHeight,
    };
  });

  await page.setViewport({
    width: scrollDimension.width,
    height: scrollDimension.height,
  });
  await page.addStyleTag({ content: '.page { page-break-after: always; }' });

  const buffer = await page.pdf({
    ...pageOptions,
    format: 'A4',
  });
  if (buffer) {
    await merger.add(buffer);
  }

  const pdfBufferData = await merger.saveAsBuffer();

  await browser.close();
  return pdfBufferData;
};

const createDocumentHeading = ({ practice, practiceSetting, logoBase64, logoMimeType, logoName, isEmail = false }) => {
  const practiceData = practice?.dataValues || practice || {};
  const { logoData, logoMimeType: resolvedLogoMimeType, logoName: resolvedLogoName } = getLogoSource({
    practice,
    practiceSetting,
    logoBase64,
    logoMimeType,
    logoName,
  });
  const email = getBase64WithFallback([
    resolveAssetPath('../../lib/images/emailNew.png'),
    resolveAssetPath('../../lib/images/email.png'),
  ]);
  const address = getBase64WithFallback([
    resolveAssetPath('../../lib/images/locationNew.png'),
    resolveAssetPath('../../lib/images/location.png'),
  ]);
  const phone = getBase64WithFallback([
    resolveAssetPath('../../lib/images/phoneNew.png'),
    resolveAssetPath('../../lib/images/phone.png'),
  ]);

  const logoAttachment = isEmail
    ? buildInlineAssetAttachment({
        filename: resolvedLogoName || 'practice-logo.png',
        content: logoData,
        cid: 'practice_logo',
        type: resolvedLogoMimeType || 'image/png',
      })
    : null;
  const phoneAttachment = isEmail
    ? buildInlineAssetAttachment({
        filename: 'phone.png',
        content: phone,
        cid: 'practice_phone_icon',
      })
    : null;
  const emailAttachment = isEmail
    ? buildInlineAssetAttachment({
        filename: 'email.png',
        content: email,
        cid: 'practice_email_icon',
      })
    : null;
  const addressAttachment = isEmail
    ? buildInlineAssetAttachment({
        filename: 'address.png',
        content: address,
        cid: 'practice_address_icon',
      })
    : null;

  const logoSrc = isEmail ? (logoAttachment ? `cid:${logoAttachment.cid}` : '') : logoData;
  const phoneSrc = isEmail ? (phoneAttachment ? `cid:${phoneAttachment.cid}` : '') : phone ? `data:image/png;base64,${phone}` : '';
  const emailSrc = isEmail ? (emailAttachment ? `cid:${emailAttachment.cid}` : '') : email ? `data:image/png;base64,${email}` : '';
  const addressSrc = isEmail
    ? (addressAttachment ? `cid:${addressAttachment.cid}` : '')
    : address
      ? `data:image/png;base64,${address}`
      : '';

  return {
    html: `
  <div component="main" data-testid="container_test" style="display: flex; flex-direction: row; justify-content: space-between;">
  <div>
    ${logoSrc ? `<img src="${logoSrc}" alt="logo" style="height: 54px;">` : ''}
  </div>
  <div id="invoiceDetails" style="margin-left: 20px;">
    <div id="heading" style="font-size: 24px; color: rgb(69, 79, 91); font-family: Poppins; text-align: right;">${
      practiceData?.name
    }</div>
    
      <div style="font-size: 14px; color: rgb(48, 48, 48); font-family: Poppins;">
       
      <div style="display: flex; flex-direction: row; justify-content: flex-end;">
        <div id="Date_heading">${phoneSrc ? `<img src="${phoneSrc}" alt= "Phone: " style= "height:14px; margin-top:2px;"/>` : ''}</div>
        <div id="Date_value" style="padding-left: 5px; text-align: right;">${practiceData?.contact || ''}</div>
      </div>
      <div style="display: flex; flex-direction: row; justify-content: flex-end;">
      <div id="Date_heading">${emailSrc ? `<img src="${emailSrc}" alt= "Email: " style= "height:14px; margin-top:4px;"/>` : ''}</div>
      <div id="Date_value" style="padding-left: 5px; text-align: right;">${practiceData?.email}</div>
    </div>
    
    <div style="display: flex; flex-direction: row; justify-content: flex-end;">
    <div id="Date_heading">${addressSrc ? `<img src="${addressSrc}" alt= "Address: " style= "height:14px; margin-top:4px;"/>` : ''}</div>
    <div id="Date_value" style="padding-left: 5px; text-align: right;">${practiceData?.address?.addressLine1 || ''}</div>
  </div>
  <div style="display: flex; flex-direction: row; justify-content: flex-end;">
  <div id="Date_value" style="padding-left: 5px; text-align: right;">${(practiceData?.address?.locality || '') + " " + (practiceData?.address?.state || '') + " " + (practiceData?.address?.postalCode || '')}</div>
</div>
    </div>
  </div>
</div>
<div style="margin-top: 10px; border: 1px solid rgb(196, 205, 213);"></div>

  `,
    attachments: [logoAttachment, phoneAttachment, emailAttachment, addressAttachment].filter(Boolean),
  };
};

const createPDFHeading = ({ practice, practiceSetting, logoBase64, logoMimeType, logoName }) => {
  return createDocumentHeading({ practice, practiceSetting, logoBase64, logoMimeType, logoName }).html;
};
const createPDF = async (data) => {
  const { template, filename, pageOptions = {} } = data;
  const pdfPath = path.join(process.cwd(), filename);
  const buffer = await setPageContentAndData({ template, options: { ...options, ...pageOptions, pdfPath } });
  return buffer;
};

const setPDFDownloadHeaders = (res, filename) => {
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
};

module.exports = {
  createPDF,
  setPDFDownloadHeaders,
  createPDFHeading,
  createDocumentHeading,
};
