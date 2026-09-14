/* eslint-disable eqeqeq */
/* eslint-disable no-param-reassign */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-unused-vars */
/* eslint-disable array-callback-return */
import React, { useCallback, useEffect, useState } from 'react';
import cloneDeep from 'lodash/cloneDeep';
import isEmpty from 'lodash/isEmpty';
import { useParams } from 'react-router-dom';

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { FormLabel } from '@mui/material';

import Events from 'src/lib/events';
import CustomForm from 'src/components/form';
import Typography from 'src/components/Typography';
import useReduxState from 'src/hooks/useReduxState';

import './builder.scss';
import { fileInfo } from 'src/lib/constants';

const calc = (conditions, data = {}) => {
  let hide = false;
  for (const item of conditions) {
    if (!item?.operator) {
      if(Array.isArray(data?.[item?.field?.id])){
        if(data?.[item?.field?.id].includes(item?.value?.value)){
          hide=true
        }else{
          hide=false
        }
      }
      else if (item?.value?.value === data?.[item?.field?.id]) {
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

const BuilderPreview = ({
  form,
  formGroups,
  gridGap = '10px',
  defaultValue,
  cardStyle={},
  cardContentStyle={},
  showSectionTitle=true,
  disabled=false,
}) => {

  const params = useParams();
  const [formData, setFormData] = useReduxState(
    `patient-preview-form-${params?.formId}`,
    {}
  );
  const [modifiedFormGroups, setModifiedFormGroups] = useState([]);

  useEffect(()=>{
    setModifiedFormGroups(formGroups);
  },[formGroups]);

  useEffect(() => {
    Events.on(
      'set-form-preview-data-in-redux',
      'set-form-preview-data-in-redux',
      () => {
        setFormData(form.getValues());
      }
    );
    if (!isEmpty(formData)) {
      Object.entries(formData).forEach(([key, value]) => form.setValue(key, value));
      setFormData({});
    }
  }, []);


  const handleRowGroups = useCallback(
    ({ rows, index, sectionIndex, rowLength }) => (
      <CardContent key={index || sectionIndex} style={{ padding: '12px' }}>
        <CustomForm
          form={form}
          columnsPerRow={rowLength}
          formGroups={rows}
          preview={true}
          defaultValue={defaultValue}
        />
      </CardContent>
    ),
    [defaultValue, form]
  );

  return (
    <div className="formBuilder-container">
      <div className={disabled?'builder-form-disable' :'inner-container'}>
      {modifiedFormGroups?.map((sectionGroups, sectionIndex) => {
        if (Array.isArray(sectionGroups)) {
          const rowLength = sectionGroups.reduce(
            (accumulator, currentItem) => accumulator + currentItem.colSpan,
            0
          );
          return handleRowGroups({
            rows: sectionGroups,
            sectionIndex,
            rowLength,
          });
        }
        return (
          <Card
            key={sectionIndex}
            style={{
              display: 'flex',
              flex: 1,
              gap: gridGap,
              alignItems: 'center',
              marginBottom: '19px',
              width:'100%',
              ...cardStyle,
            }}
          >
            {!sectionGroups?.hide && (
              <CardContent
                key={sectionIndex}
                style={{ flex: 1, backgroundColor: 'white',width:'100%',...cardContentStyle }}
              >
                <div style={{display:'flex',flexDirection:'column'}}>
                {showSectionTitle && <Typography variant="h6">
                  {sectionGroups?.title ?? null}
                </Typography>}
                <FormLabel sx={{fontSize:'12px' }}>{sectionGroups?.sectionDescription ??null}</FormLabel>
                </div>
                {sectionGroups?.fields?.map((rowGroup, index) => {
                  const rowLength = rowGroup?.reduce(
                    (accumulator, currentItem) =>
                      accumulator + currentItem.colSpan,
                    0
                  );
                  return handleRowGroups({
                    rows: rowGroup,
                    index,
                    sectionIndex,
                    rowLength,
                  });
                })}
              </CardContent>
            )}
          </Card>
        );
      })}
      </div>
    </div>
  );
};

export default React.memo(BuilderPreview);
