const { dateFormats } = require("src/lib/constants");
const { getImageUrl, dateFormatter, decodeHtml } = require("src/lib/utils");
const { default: getMatrixCalculation } = require("src/pages/FormBuilder/matrixScoring");

const renderValues = (value, timezone, patient) => {
    if (value?.file) {
      const fileName = `${patient?.id}/${value?.name}`;
      return `<a href='${getImageUrl(fileName, {  isPatientFile: true, downloadFile: true  })}'>${value?.name||''}</a>`;
    }
    if (Array.isArray(value)) {
      return value.map((nestedValue) => renderValues(nestedValue, timezone, patient)).join(', ');
    }
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    if (!isNaN(Date.parse(value))) {
      return dateFormatter(value, dateFormats.MMDDYYYY);
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
  
  const genrateFormData = ({ questions = [], rules = [], answers = {}, timezone, patient }) => {
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
            <div style="width:100%;">
              <div style="border: 1px solid #ddd;">
                ${section?.fields
                  ?.map(
                    (row, rowIndex) =>
                      `<div>
                    ${row
                      ?.map((field) =>
                        field?.matrix
                          ? `<div
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
                                            : renderValues(answers[`${rowKey}-${column?.dataKey}`], timezone, patient);
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
                        </div>`
                          : `<div>
                          <td
                          style="margin: 10px; width: 100%; vertical-align: top; display: ${field?.hide ? 'none' : 'unset'};" ${field?.inputType==='editor' ?"colspan='24'" :""}>
                            ${field.inputType==='editor'? decodeHtml(field.editorValue) :(field?.textLabel + ' :' || '')}
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
                  </div>`
                  )
                  .join('')}
              </div>
            </div>
          </div>`
          )
          .join('')}
      </div>`;
  };

  export {
    genrateFormData
  }