/* eslint-disable no-param-reassign */
/* eslint-disable no-restricted-syntax */
import React, { useCallback } from 'react';
import isNaN from 'lodash/isNaN';
import CheckIcon from '@mui/icons-material/Check';

import { dateFormats } from 'src/lib/constants';
import { convertWithTimezone, downloadFile, getImageUrl, showSnackbar } from 'src/lib/utils';

import getMatrixCalculation from 'src/pages/FormBuilder/matrixScoring';
import EditorPreview from 'src/components/form/Editor/editorPreview';

const handleDownload = (value, patient) => { 
  showSnackbar({
  message: 'Downloading...',
  severity: 'success',
});
downloadFile({...value?.file, patient: patient?.id},  `${patient?.id}/${value?.name}`)
}
const renderValues = (value, patient) => {
  if(value?.file && value.contentType === 'image') {
      return <img src={getImageUrl(value.file)} alt="logo" />
  }
  if(value?.file) {
    // eslint-disable-next-line react/jsx-no-script-url, no-script-url
    return (<a href='javascript:void(0)' onClick={()=> handleDownload(value, patient) } >{value?.name}</a>)
  }
  if (Array.isArray(value)) {
    return value.map((nestedValue) => renderValues(nestedValue, patient)).join(', ');
  }
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  if (!isNaN(Date.parse(value))) {
    return convertWithTimezone(value, {
      format: dateFormats?.MMDDYYYY,
    });
  }
  if (`${value}`?.startsWith('data:image/')) {
    return <img src={value} alt="Saved Signature" />;
  }
  return value;
};

const calc = (conditions, data = {}) => {
  let hide = false;

  for (const item of conditions) {
    const itemValue = item?.value?.value;
    const fieldValue = data?.[item?.field?.id];

    if (!item?.operator) {
      hide = itemValue === fieldValue;
    } else if (item.operator === 'OR') {
      hide = hide || itemValue === fieldValue;
    } else if (item.operator === 'AND') {
      hide = hide && itemValue === fieldValue;
    }
  }

  return { hide };
};

const ViewFormData = ({ questions = [], rules = [], answers = {} , patient = {}}) => {

rules?.forEach(({ conditions, applyTo, action = '' }) => {
  if ((action !== 'hide' && action !== 'show') || !applyTo) {
    return;
  }
  const applyToType = applyTo.type;
  const updateField = (field, item) => {
    if (field?.id === item?.value?.id) {
      const result = calc(conditions, answers);
      if (action === 'show') {
        result.hide = !result.hide;
      }
      return { ...field, ...result,};
    }
    return field;
  };
  if (applyToType === 'field') {
    questions?.forEach((section, sectionIndex) => {
      section?.fields?.forEach((row, rowIndex) => {
        row?.forEach((field, fieldIndex) => {
          applyTo[applyToType]?.forEach((item) => {
            questions[sectionIndex].fields[rowIndex][fieldIndex] = updateField( field, item );
          });
        });
      });
    });
  } else if (applyToType === 'section') {
    questions?.forEach((section, sectionIndex) => {
      applyTo[applyToType]?.forEach((item) => {
        if (section?.id === item?.id) {
          questions[sectionIndex] = { ...(section || {}), ...updateField(section, item) };
        }
      });
    });
  }
});

  const getMatrixScore = useCallback(
    (matrixId) => {
      const allScores = getMatrixCalculation(answers, questions);
      const score = allScores[matrixId];
      return score
        ? `Score: ${score?.achievedScore}/${score?.maximumScore}`
        : '';
    },
    [answers, questions]
  );

  return (
    <div>
      {questions.map((section) => (
        <div
          style={{
            boxShadow: '0 0 2px 0 #EAF0F7, 0 12px 24px -4px #EAF0F7',
            borderRadius: '12px',
            marginBottom: '16px',
            padding: '16px',
            overflow: 'auto',
            display: section?.hide && 'none',
          }}
          key={section?.title}
        >
          <div
            style={{
              marginBottom: '16px',
            }}
          >
            <span
              style={{
                fontSize: 20,
                fontWeight: 700,
                borderBottom: '3.5px solid #337AB7',
              }}
            >
              {section?.title}
            </span>
          </div>
          <table style={{ width: '100%' }}>
            <tbody style={{ border: '1px solid #ddd' }}>
              {section?.fields?.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row?.map((field) =>console.log(">>>>field",field) ||
                    field?.matrix ? (
                      <td
                        key={field?.id}
                        colSpan={24}
                        style={{
                          paddingTop: '12px',
                          textAlign: 'left',
                        }}
                      >
                        <table
                          style={{
                            width: '100%',
                            border: '1px solid var(--border, #E6EDFF)',
                            borderCollapse: 'collapse',
                          }}
                        >
                          <thead>
                            <tr
                              style={{
                                background: 'var(--accent-blue, #EAF0F7)',
                              }}
                            >
                              {field?.matrix[0]?.columns.map((column) => (
                                <th
                                  key={column.dataKey}
                                  style={{
                                    padding: '8px',
                                    textAlign: 'left',
                                    border: '1px solid var(--border, #E6EDFF)',
                                  }}
                                >
                                  {column?.label}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {field.matrix[0].rowData.map((rowData) => {
                              const rowKey = Object.keys(rowData)[0];
                              const rowLabel = rowData[rowKey]?.rh?.label;
                              return (
                                <tr key={rowKey}>
                                  <td
                                    style={{
                                      border:
                                        '1px solid var(--border, #E6EDFF)',
                                      padding: '8px',
                                      textAlign: 'left',
                                    }}
                                  >
                                    {rowLabel}
                                  </td>
                                  {field.matrix[0]?.columns
                                    .slice(1)
                                    .map((column) => {
                                      const cellValue =
                                        answers[rowKey] === column?.dataKey
                                          ? (rowData[rowKey][column?.dataKey]?.label || <CheckIcon 
                                               style={{
                                                fontSize: 20,
                                                color: 'grey',
                                          }}
                                          />)
                                          : renderValues(
                                              answers[
                                                `${rowKey}-${column?.dataKey}`
                                              ], patient
                                            );
                                      return (
                                        <td
                                          key={column?.dataKey}
                                          style={{
                                            border:
                                              '1px solid var(--border, #E6EDFF)',
                                            padding: '8px',
                                            textAlign: 'left',
                                          }}
                                        >
                                          {cellValue}
                                        </td>
                                      );
                                    })}
                                </tr>
                              );
                            })}
                          </tbody>
                          {field?.enableScore && (
                            <tfoot>
                              <tr>
                                <td
                                  style={{
                                    textAlign: 'end',
                                    fontSize: '14px',
                                  }}
                                  colSpan={field?.matrix[0]?.columns?.length}
                                >
                                  {getMatrixScore(field?.id)}
                                </td>
                              </tr>
                            </tfoot>
                          )}
                        </table>
                      </td>
                    ) : (
                      <>
                        <td
                          style={{
                            margin: 10,
                            width: `${((field?.colSpan||1)/12)* 100}%`,
                            display: field?.hide && 'none',
                            verticalAlign: 'top',
                            }}
                          {...(field.inputType==='editor')?{colSpan:24}:{}}
                        >
                          {field.inputType==='editor'?<EditorPreview editorValue={field.editorValue}/>: field?.textLabel}
                        </td>
                        {field.inputType==='editor' ? null :<td
                          style={{
                            margin: 10,
                            minWidth: '150px',
                            display: field?.hide && 'none',
                            fontWeight: 600,
                            verticalAlign: 'top',
                          }}
                        >
                          {renderValues(answers[field?.id], patient)}
                        </td>}
                      </>
                    )
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default ViewFormData;
