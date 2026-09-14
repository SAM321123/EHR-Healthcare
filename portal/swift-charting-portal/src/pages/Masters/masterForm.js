/* eslint-disable camelcase */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import isEmpty from 'lodash/isEmpty';
import { useForm } from 'react-hook-form';
import CardContent from '@mui/material/CardContent';

import Events from 'src/lib/events';
import {
  // alphanumericPattern,
  inputLength,
  master,
  regexCommonText,
  requiredField,
  tagsColorCodes,
} from 'src/lib/constants';
import { getDirtyFieldsValue, showSnackbar } from 'src/lib/utils';

import useCRUD from 'src/hooks/useCRUD';
import { MASTER_DATA, PRACTICE_ENUM_MASTERS_DATA } from 'src/store/types';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';

import Modal from 'src/components/modal';
import CustomForm from 'src/components/form';
import Container from 'src/components/Container';
import { WiredMasterField } from 'src/wiredComponent/Form/FormFields';
import Box from 'src/components/Box';
import Typography from 'src/components/Typography';

const ColorComponent = (props) => {
  const { form } = props || {};
  const { setValue = () => {}, getValues = () => {} } = form || {};
  const defaultColor = getValues('metaData');
  const [selectedColor, setSelectedColor] = useState('{"color":"#3498db"}');
  useEffect(() => {
    if (defaultColor) {
      setSelectedColor(JSON.parse(defaultColor));
    } else {
      setValue('metaData', JSON.stringify({ color: '#3498db' }), {
        shouldDirty: false,
      });
    }
  }, [defaultColor]);
  const handleClick = ({ colorCode }) => {
    const newColor = { color: colorCode };
    setSelectedColor(newColor);
    setValue('metaData', JSON.stringify(newColor), {
      shouldDirty: true,
    });
  };
  return (
    <Box>
      <Typography mb={1}>Choose the color for the tag:</Typography>
      <Box style={{ display: 'flex', gap: 10 }}>
        {tagsColorCodes.map((colorCode, index) => (
          <Box
            key={index}
            style={{
              backgroundColor: colorCode,
              width: 20,
              height: 20,
              cursor: 'pointer',
              ...(selectedColor.color === colorCode
                ? {
                    border: '2px solid #78ff00',
                    boxShadow: '-1px 2px 20px 0 rgba(0, 0, 0, 0.4)',
                  }
                : {}),
            }}
            onClick={() => handleClick({ colorCode })}
          />
        ))}
      </Box>
    </Box>
  );
};

const formGroups = [
  {
    inputType: 'text',
    name: 'name',
    textLabel: 'Name',
    placeholder: 'Name',
    required: requiredField,
    gridProps: { md: 4 },
    maxLength: { ...inputLength.commonTextLength },
    pattern: {
      value: regexCommonText.value,
      message: `Name ${regexCommonText.message}`,
    },
  },
  // {
  //   inputType: 'text',
  //   name: 'code',
  //   textLabel: 'Code',
  //   placeholder: 'Code',
  //   required: requiredField,
  //   gridProps: { md: 4 },
  //   pattern: {
  //     value: alphanumericPattern,
  //     message: 'Code should be alphanumeric characters only',
  //   },
  // },
  {
    inputType: 'text',
    name: 'description',
    multiline: true,
    minRows: 3,
    textLabel: 'Description',
    placeholder: 'Description',
    gridProps: { md: 4 },
    maxLength: { ...inputLength.commonTextLength },
    pattern: {
      value: regexCommonText.value,
      message: `Description ${regexCommonText.message}`,
    },
  },
  {
    inputType: 'custome',
    colSpan: 1,
    component: ColorComponent,
  },
  {
    inputType: 'text',
    type: 'number',
    name: 'sortOrder',
    textLabel: 'Sort Order',
    placeholder: 'Sort Order',
    gridProps: { md: 4 },
    maxLength: { value: 3 },
  },
  {
    inputType: 'checkBox',
    name: 'isActive',
    label: 'Active',
    gridProps: { md: 4 },
  },
];

const MasterFormPage = ({
  isVisible,
  setIsVisible,
  selectedMaster,
  rowData = {},
  handleCloseModal,
  parentMasterCodeType,
}) => {
  const [masters] = useCRUD({
    id: PRACTICE_ENUM_MASTERS_DATA,
    type: REQUEST_METHOD.get,
  });

  const selectedMasterData = useMemo(
    () =>
      masters?.find((masterData) => masterData.code === selectedMaster?.code),
    [masters, selectedMaster]
  );

  const {
    name,
    code: enumCode,
    parent_enum_master_type_id,
  } = selectedMasterData || selectedMaster || {};

  if (!isEmpty(rowData) && formGroups[1]?.name === 'code') {
    formGroups[1].disabled = true;
  } else {
    formGroups[1].disabled = false;
  }

  const masterFormGroups = useMemo(() => {
    const updatedFormGroups = [...formGroups];
    if (enumCode !== 'PATIENT_TAGS') {
      updatedFormGroups.splice(2, 1);
    }

    if (parent_enum_master_type_id) {
      return [
        {
          ...WiredMasterField({
            name: 'parentMasterCode',
            label: parent_enum_master_type_id.name,
            code: parent_enum_master_type_id.code,
          }),
        },
        ...updatedFormGroups,
      ];
    }

    return updatedFormGroups;
  }, [parent_enum_master_type_id, enumCode]);

  const form = useForm({ mode: 'onChange' });

  const {
    handleSubmit,
    formState: { dirtyFields },
  } = form;

  const [mastersResponse, error, loading, saveMasters, clearRes] = useCRUD({
    id: `ADD_MASTERS_${enumCode}`,
    url: `${API_URL.saveMasters}/${enumCode}`,
    type: !rowData?.code ? REQUEST_METHOD.post : REQUEST_METHOD.update,
  });

  useEffect(() => {
    if (!error && !isEmpty(mastersResponse)) {
      let message;
      if (parentMasterCodeType) {
        message = 'Form category added successfully';
      } else {
        message = !rowData?.code
          ? master.addSuccessMessage
          : master.updateSuccessMessage;
      }
      showSnackbar({
        message,
        severity: 'success',
      });
      setIsVisible(false);
      clearRes(true);
      Events.trigger(`REFRESH-TABLE-${MASTER_DATA}`);
      Events.trigger(`REFRESH-FORM-CATEGORY`, mastersResponse);
    }
  }, [mastersResponse, parentMasterCodeType]);

  const handleSaveMaster = useCallback(
    (data) => {
      if (data?.name && !rowData?.code) {
        saveMasters({
          data: {
            ...data,
            parentCode: data?.parentCode || parentMasterCodeType,
            code: data?.code || selectedMaster?.code,
          },
        });
      } else {
        const changesData = getDirtyFieldsValue(data, dirtyFields);
        if (!isEmpty(changesData)) {
          saveMasters({
            ...changesData,
            code: rowData?.code,
            parentMasterCode: data.parentMasterCode,
            masterTypeCode: data.masterTypeCode,
          });
        } else {
          showSnackbar({
            message: 'No changes found',
            severity: 'error',
          });
        }
      }
    },
    [rowData?.code, saveMasters, parentMasterCodeType, selectedMaster?.code, dirtyFields]
  );

  const header = useMemo(
    () => ({
      title: !rowData?.code ? `Add ${name || ''}` : `Edit ${name || ''}`,
    }),
    [name, rowData]
  );

  const footer = useMemo(
    () => ({
      leftActions: [
        {
          name: 'Cancel',
          variant: 'text',
          action: handleCloseModal,
          style: { boxShadow: 'unset', color: '#303030' },
        },
        {
          name: 'Save',
          disabled: loading,
          loading,
          action: handleSubmit(handleSaveMaster),
          style: { marginRight: 16 },
        },
      ],
    }),
    [handleCloseModal, handleSaveMaster, handleSubmit, loading]
  );

  return (
    <Modal
      open={isVisible}
      header={header}
      footer={footer}
      onClose={handleCloseModal}
    >
      <Container loading={loading} key={rowData?.id}>
        <CardContent>
          <CustomForm
            formGroups={masterFormGroups}
            columnsPerRow={1}
            defaultValue={rowData}
            form={form}
          />
        </CardContent>
      </Container>
    </Modal>
  );
};

export default MasterFormPage;
