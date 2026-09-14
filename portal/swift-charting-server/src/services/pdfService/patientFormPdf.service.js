const { capitalize, isNaN } = require('lodash');
const { formatDate, dateTimeFormatTwelveHour } = require('../../utils/dateUtility');
const { getImageUrl, decodeHtml } = require('../../utils');
const { getModels } = require('../../utils/connection');
const { createPDF, createPDFHeading } = require('../../utils/pdfUtility/pdfUtility');

const getMaximumScore = (matrix) => {
  let maxScore = 0;
  const rows = matrix?.[0]?.rowData?.length;
  matrix?.[0]?.columns?.forEach((col) => {
    if (parseInt(col.score, 10) > maxScore) {
      maxScore = parseInt(col.score, 10);
    }
  });

  return maxScore * rows;
};

const getAchievedScore = (matrix, formData) => {
  let achievedScore = 0;
  Object.values(formData)?.forEach((value) => {
    const columns = matrix?.[0]?.columns || [];
    const res = columns?.find((item) => item?.dataKey === value);
    if (res) {
      achievedScore += parseInt(res.score, 10);
    }
  });
  return achievedScore;
};

const getMatrixCalculation = (formData, formGroups) => {
  const matrix = {};
  formGroups?.forEach((section) => {
    section?.fields?.forEach((fields) => {
      fields?.forEach((field) => {
        if (field?.inputType === 'matrix' && field?.enableScore) {
          matrix[`${field.id}`] = {
            id: field.id,
            achievedScore: getAchievedScore(field?.matrix, formData),
            maximumScore: getMaximumScore(field?.matrix)
          };
        }
      });
    });
  });
  return matrix;
};

const createSignature = ({ name, signature, roleName, timezone, consentForm,practice }) => {
  if (!signature?.signature) {
    return '';
  }

  return `
  <div style="font-size: 12px;color:grey; margin-left: 5px;text-align:right;">${practice?.name}</div>
  <div style=" border-top: 1px solid rgb(230, 237, 232);"></div>

    <div style="
      display: flex;
      flex-direction: column;
      align-items: center;
      margin: 0px auto;
      padding: 24px;
      border-radius: 8px;
    ">
      <div class="header" style="
        font-size: 24px;
        font-weight: bold;
        margin-bottom: 16px;
      ">
        ${roleName} Signature
      </div>
      <div class="signature-container" style="
        display: flex;
        justify-content: center;
        align-items: center;
        margin-bottom: 24px;
      ">
        <img
          src="${signature?.signature}"
          alt="${name}'s Signature"
          style="
            max-width: 100%;
            border-radius: 6px;
          "
        />
      </div>
      <div class="details" style="
        display: flex;
        justify-content: space-between;
        font-size: 14px;
        color: #999999;
      ">
        <div class="signed-at">
          Signed At: ${formatDate(signature?.date, { timezone, format: dateTimeFormatTwelveHour })}
        </div>
        <div style="margin-left:10px;" class="signature-owner">
          Signed By: ${capitalize(name)}
        </div>
      </div>
    </div>`;
};

const addInputStyle = () => {
  return `<style>
  input.consent-input-container{
    border: none;
    background-color: #fffae5;
    border-bottom: 1px solid #ffa500!important;
    height: 20px !important;
	  width: 100px !important;
}
span.consent-checkbox-container {
	display: inline-block;
	width: 20px;
	height: 20px;
	border: 1px solid #999;
	cursor: pointer;
  }
  span.consent-input-container {
	border-bottom: 1px solid #999 !important;
	height: 20px;
	width: 100px;
	display: inline-block;
	background: #feffaf;
  }

input.consent-checkbox-container{
    height:20px;
    width: 40px;
}
.consent-checkbox-container:checked{
    background-color: #2196F3;
}
div.image-container {
  page-break-inside: avoid;
}
.page {
  page-break-after: always;
}
</style>`;
};
const createConsentFromTemplate = ({ consentForm, patient, assistant, practitioner, timezone,practice } = {}) => {
  const {
    formData,
    patientFormSubmission,
  } = consentForm;
  const { response, partialResponse, patientSignature, practitionerSignature, assistantSignature } = patientFormSubmission || {}
  let template = `<div style="display:flex;justify-content:center;text-align:center;font-weight:600; font-size:22px; font-family: Poppins;">${
    formData?.name || ''
  }</div>`;
  template += decodeHtml(response || partialResponse || formData?.consentForm || '');
  template += addInputStyle();
  template = `<div class="page">${template}</div>`;
  template += createSignature({
    signature: patientSignature,
    roleName: 'Patient',
    name: `${patient?.firstName} ${patient?.lastName}`,
    timezone,
    consentForm,
    practice,
  });

  template += createSignature({
    signature: assistantSignature,
    roleName: 'Assistant',
    name: `${assistant?.firstName} ${assistant?.lastName}`,
    timezone,
    consentForm,
    practice,
  });

  template += createSignature({
    signature: practitionerSignature,
    roleName: 'Practitioner',
    name: `${practitioner?.firstName} ${practitioner?.lastName}`,
    timezone,
    consentForm,
    practice,
  });
  if (patientSignature || assistantSignature || practitionerSignature) {
    template = `<div class="page">${template}</div>`;
  }

  return template;
};

const renderValues = (value, timezone, patient,practice) => {
  if (value?.file) {
    const fileName = `${patient?.id}/${value?.name}`;
    return `<a href='${getImageUrl(fileName, { practice, isPatientFile: true, downloadFile: true  })}'>${value?.name||''}</a>`;
  }
  if (Array.isArray(value)) {
    return value.map((nestedValue) => renderValues(nestedValue, timezone, patient,practice)).join(', ');
  }
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  if (!isNaN(Date.parse(value))) {
    return formatDate(value, { timezone });
  }
  if (`${value}`?.startsWith('data:image/')) {
    return `<img style="width:200px " src="${value}" alt="Saved Signature" />`;
  }
  return value || '';
};

const calc = (conditions, data = {}) => {
  let hide = false;
  for (const item of conditions) {
    if (!item?.operator) {
      if (item?.value?.value === data?.[item?.field?.id]) {
        hide = true;
      } else {
        hide = false;
      }
    } else if (item.operator === 'OR') {
      if (hide || item?.value?.value === data?.[item?.field?.id]) {
        hide = true;
      } else {
        hide = false;
      }
    } else if (item.operator === 'AND') {
      if (hide && item?.value?.value === data?.[item?.field?.id]) {
        hide = true;
      } else {
        hide = false;
      }
    }
  }
  return { hide };
};

const genrateFormData = ({ questions = [], rules = [], answers = {}, timezone, patient,practice }) => {
  const getMatrixScore = (matrixId) => {
    const allScores = getMatrixCalculation(answers, questions);
    const score = allScores[matrixId];
    return score ? `Score: ${score?.achievedScore}/${score?.maximumScore}` : '';
  };
  rules?.forEach(({ conditions, applyTo, action = '' }) => {
    if ((action === 'hide' || action === 'show') && applyTo?.type === 'field') {
      questions?.forEach((section, sectionIndex) => {
        section?.fields?.forEach((row, rowIndex) => {
          row?.forEach((field, fieldIndex) => {
            applyTo?.[applyTo?.type].forEach((item) => {
              if (field?.id === item?.value?.id) {
                const result = calc(conditions, answers);
                if (action === 'show') {
                  result.hide = !result.hide;
                }
                if (questions[sectionIndex].fields[rowIndex][fieldIndex]?.hide !== result?.hide) {
                  questions[sectionIndex].fields[rowIndex][fieldIndex] = {
                    ...questions[sectionIndex].fields[rowIndex][fieldIndex],
                    ...result
                  };
                }
              }
            });
          });
        });
      });
    }
    if ((action === 'hide' || action === 'show') && applyTo?.type === 'section') {
      questions?.forEach((section, sectionIndex) => {
        applyTo?.[applyTo?.type].forEach((item) => {
          if (section?.id === item?.id) {
            const result = calc(conditions, answers);
            if (action === 'show') {
              result.hide = !result.hide;
            }
            if (questions[sectionIndex]?.hide !== result?.hide) {
              questions[sectionIndex] = {
                ...questions[sectionIndex],
                ...result
              };
            }
          }
        });
      });
    }
  });
  return `<div style="width: 100%;">
      ${questions
        .map(
          (section) =>
            `<div
        style="margin-bottom: 16px; padding: 16px; overflow: auto; display: ${
          section?.hide ? 'none' : 'block'
        };"
        >
          <div
            style="margin-bottom: 16px;"
          >
            <span
              style="font-size: 20;font-weight: 700;border-bottom: 3.5px solid #07B2FB;"
            >
              ${section?.title || ''}
            </span>
          </div>
          <table style="width:100%;">
            <tbody style="border: 1px solid #ddd;">
              ${section?.fields
                ?.map(
                  (row, rowIndex) =>
                    `<tr>
                  ${row
                    ?.map((field) =>
                      field?.matrix
                        ? `<td
                        colSpan="24"
                        style="paddingTop: 12px;text-align: left;"
                      >
                        <table
                        style="width: 100%; border: 1px solid #E6EDFF; border-collapse: collapse;"
                        >
                          <thead>
                            <tr
                            style="background: #EAF0F7;"
                            >
                              ${field?.matrix[0]?.columns
                                .map(
                                  (column) =>
                                    `<th
                                  style="padding: 8px; text-align: left; border: 1px solid #E6EDFF;"
                                >
                                  ${column?.label || ''}
                                </th>`
                                )
                                .join('')}
                            </tr>
                          </thead>
                          <tbody>
                            ${field.matrix[0].rowData
                              .map((rowData) => {
                                const rowKey = Object.keys(rowData)[0];
                                const rowLabel = rowData[rowKey]?.rh?.label;
                                return `<tr>
                                  <td
                                  style="border: 1px solid #E6EDFF; padding: 8px; text-align: left;"
                                  >
                                    ${rowLabel || ''}
                                  </td>
                                  ${field.matrix[0]?.columns
                                    .slice(1)
                                    .map((column) => {
                                      const cellValue =
                                        answers[rowKey] === column?.dataKey
                                          ?(rowData?.[rowKey]?.[column?.dataKey]?.label ||  `✓`)
                                          : renderValues(answers[`${rowKey}-${column?.dataKey}`], timezone, patient,practice);
                                      return `<td style="border: 1px solid #E6EDFF; padding: 8px; text-align: left;" >
                                          ${cellValue || ''}
                                        </td>`;
                                    })
                                    .join('')}
                                </tr>`;
                              })
                              .join('')}
                          </tbody>
                          ${
                            field?.enableScore ?
                            `<tfoot>
                              <tr>
                                <td
                                style="text-align: end; font-size: 14px;"
                                  colSpan="${field?.matrix[0]?.columns?.length}"
                                >
                                  ${getMatrixScore(field?.id)}
                                </td>
                              </tr>
                            </tfoot>`:''
                          }
                        </table>
                      </td>`
                        : `<div>
                        <td
                        style="margin: 10px; width: 100%; vertical-align: top; display: ${field?.hide ? 'none' : 'unset'};" ${field?.inputType==='editor' ?"colspan='24'" :""}>
                          ${field.inputType==='editor'? decodeHtml(field.editorValue) :(field?.textLabel || '')}
                        </td>
                        ${field?.inputType==='editor'?'' :`<td
                        style="margin: 10px; min-width: 150px; font-weight: 600; vertical-align: top; display: ${
                          field?.hide ? 'none' : 'unset'
                        };"
                        >
                          ${renderValues(answers[field?.id], timezone, patient)}
                        </td>`}
                      </div>`
                    )
                    .join('')}
                </tr>`
                )
                .join('')}
            </tbody>
          </table>
        </div>`
        )
        .join('')}
    </div>`;
};

const createPatientFormPDFTemplate = ({ patientForm, linkedConsentForms = [], timezone = '',practice = '',onNewPage=true }) => {
  const { formData, patientFormSubmission, patient, assistant, practitioner } = patientForm || {};
  const isConsentForm = formData?.formType?.code === 'FT_CONSENT_FORMS';
  let finalTemplate = ``;
  if (isConsentForm) {
    if (patientForm)
      finalTemplate += createConsentFromTemplate({ consentForm: patientForm, patient, assistant, practitioner, timezone,practice });
  } else {
    let { response, partialResponse } = patientFormSubmission || {};
    response = JSON.parse(response || '{}');
    partialResponse = JSON.parse(partialResponse || '{}');
    const templateTitle = `<div style="display:flex;justify-content:center;text-align:center;font-weight: 600;font-size:22px; font-family: Poppins;${onNewPage ? 'margin-bottom:40px;' : ''}">${
      formData?.name || ''
    }</div>`;
    finalTemplate += templateTitle;

    finalTemplate += `<div ${onNewPage ? 'class="page"' : ''}>${genrateFormData({
      questions: JSON.parse(formData?.questions || '[]'),
      rules: JSON.parse(formData?.rules || '[]'),
      answers: response || partialResponse || {},
      timezone,
      patient,
      practice
    })}</div>`;
  }

  linkedConsentForms.forEach((consentForm) => {
    if (consentForm)
      finalTemplate += `<div ${onNewPage ? 'class="page"' : ''}>
    <div style="font-size: 12px; color:grey; margin-left: 5px;text-align:right;">${practice.name}</div>
    <div style="border: 1px solid rgb(230, 237, 232);"></div>

      ${createConsentFromTemplate({
        consentForm,
        patient,
        assistant,
        practitioner,
        timezone,
        practice
      })}</div>`;
  });

  finalTemplate = `<div style="font-family: Poppins;" ${onNewPage ? 'class="page"' : ''} >${finalTemplate}</div>`;

  return finalTemplate;
};

const createPatientFormPDF = async ({patientFormData,practiceSetting}) => {
  let {practiceSetting:practice}=  practiceSetting ||{};
  const { linkedPatientForms = [] } = patientFormData || {};
  const { patient } = patientFormData;
  const timezone =patient.timezone; // need to switch timezone on user based 

  let patientFormPDFTemplate = createPatientFormPDFTemplate({ patientForm:patientFormData, linkedConsentForms:linkedPatientForms, timezone,practice });

  patientFormPDFTemplate =
    `<div style="margin-bottom:50px">${createPDFHeading({ practice, practiceSetting })}</div>` +
    patientFormPDFTemplate;

  const filename = `${patientFormData?.formData?.name || 'patientForm'}-${formatDate(new Date(), { timezone })}.pdf`;

  const pdfBufferData = await createPDF({
    template: patientFormPDFTemplate,
    filename
  });
  return { pdfBufferData, filename };
};

module.exports = {
  createPatientFormPDF,
  createPatientFormPDFTemplate,
};
