/* eslint-disable no-param-reassign */
/* eslint-disable no-restricted-syntax */
import React, { useCallback, useMemo } from 'react';
import isNaN from 'lodash/isNaN';
import CheckIcon from '@mui/icons-material/Check';

import { dateFormats } from 'src/lib/constants';
import {
  convertWithTimezone,
  getImageUrl,
} from 'src/lib/utils';
import getMatrixCalculation from 'src/pages/FormBuilder/matrixScoring';
import EditorPreview from 'src/components/form/Editor/editorPreview';


const renderValues = (value, patient) => {
  if(value?.file && value.contentType === 'image') {
      return <img src={getImageUrl(value.file)} alt="logo" />
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

const FieldMatrix = ({ field, answers, getMatrixScore }) => (
  <td
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
                  border: '1px solid var(--border, #E6EDFF)',
                  padding: '8px',
                  textAlign: 'left',
                }}
              >
                {rowLabel}
              </td>
              {field.matrix[0]?.columns.slice(1).map((column) => {
                const cellValue =
                  answers[rowKey] === column?.dataKey
                    ? (
                      rowData[rowKey][column?.dataKey]?.label || (
                        <CheckIcon
                          style={{
                            fontSize: 14,
                            color: 'grey',
                          }}
                        />
                      )
                    )
                    : renderValues(answers[`${rowKey}-${column?.dataKey}`]);
                return (
                  <td
                    key={column?.dataKey}
                    style={{
                      border: '1px solid var(--border, #E6EDFF)',
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
);

const ViewFormData = ({ questions = [], rules = [], answers = {}, patient = {} }) => {
    const stableQuestions = useMemo(() => [...questions], [questions]);
    const stableAnswers = useMemo(() => ({ ...answers }), [answers]);
  
    const getMatrixScore = useCallback(
      (matrixId) => {
        const allScores = getMatrixCalculation(stableAnswers, stableQuestions);
        const score = allScores[matrixId];
        return score
          ? `Score: ${score?.achievedScore}/${score?.maximumScore}`
          : '';
      },
      [stableAnswers, stableQuestions]
    );

  return (
    <div
    
    >
      {questions.map((section) => (
        <div
          key={section?.title}
          style={{
            boxShadow: '0 0 2px 0 #EAF0F7, 0 12px 24px -4px #EAF0F7',
            borderRadius: '12px',
            marginBottom: '16px',
            padding: '12px',
            overflow: 'auto',
            display: section?.hide ? 'none' : undefined,
            fontSize: '14px', // Set a global smaller font size
          }}
        >
          <div
            style={{
              marginBottom: '16px',
              borderBottom: '3.5px solid #337AB7',
            }}
          >
            <span style={{ fontSize: 14, fontWeight: 700 }}>{section?.title}</span>
          </div>
          <table style={{ width: '100%' }}>
            <tbody style={{ border: '1px solid #ddd' }}>
              {section?.fields?.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row?.map((field) =>
                    field?.matrix ? (
                      <FieldMatrix
                        key={field?.id}
                        field={field}
                        answers={answers}
                        getMatrixScore={getMatrixScore}
                      />
                    ) : (
                      <>
                        <td
                          key={field?.id}
                          style={{
                            margin: 10,
                            width: `${((field?.colSpan || 1) / 12) * 100}%`,
                            display: field?.hide ? 'none' : undefined,
                            verticalAlign: 'top',
                          }}
                          colSpan={field.inputType === 'editor' ? 24 : undefined}
                        >
                          {field.inputType === 'editor' ? (
                            <EditorPreview editorValue={field.editorValue} />
                          ) : (
                            field?.textLabel
                          )}
                        </td>
                        {field.inputType !== 'editor' && (
                          <td
                            style={{
                              margin: 10,
                              minWidth: '150px',
                              fontWeight: 600,
                              verticalAlign: 'top',
                              display: field?.hide ? 'none' : undefined,
                            }}
                          >
                            {renderValues(answers[field?.id], patient)}
                          </td>
                        )}
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
