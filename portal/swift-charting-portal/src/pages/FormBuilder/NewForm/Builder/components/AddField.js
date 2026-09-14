/* eslint-disable camelcase */
import React, { useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import isEmpty from 'lodash/isEmpty';
import CardContent from '@mui/material/CardContent';

import {
  inputLength,
  noHtmlTagPattern,
  regexCustomText,
  requiredField,
} from 'src/lib/constants';

import Modal from 'src/components/modal';
import CustomForm from 'src/components/form';
import Container from 'src/components/Container';
import { generateUniqueId } from 'src/lib/utils';

export const INPUT_TYPE_OPTIONS = [
  { label: 'Select', value: 'select' },
  { label: 'CheckBox', value: 'checkBox' },
  { label: 'TextArea', value: 'textArea' },
  { label: 'Radio', value: 'radio' },
  { label: 'Date', value: 'date' },
  { label: 'Date & Time', value: 'dateTime' },
  { label: 'Text', value: 'text' },
  { label: 'Slider', value: 'slider' },
  { label: 'MultiSelect', value: 'multiSelect' },
  { label: 'Matrix', value: 'matrix' },
  { label: 'MultiChoice', value: 'multiChoice' },
  { label: 'Signature', value: 'signature' },
  { label: 'Number', value: 'number' },
  { label: 'File', value: 'uploadFile' },
  { label: 'Editor', value: 'editor' },
  { label: 'Placeholder Text', value: 'textLabel' },
];

const profileFieldsTypeInput = [
  { label: 'First Name', value: 'firstName' },
  { label: 'Middle Name', value: 'middleName' },
  { label: 'Last Name', value: 'lastName' },
  { label: 'Email', value: 'email' },
  { label: 'Address', value: 'address' },
];

const profileFieldsTypeRadio = [{ label: 'Gender', value: 'gender' }];
const profileFieldsTypePhone = [{ label: 'Phone', value: 'contact' }];

const fieldValidations = [
  { label: 'Only alphabets', value: 'onlyAlphabet' },
  { label: 'Alphabets and numbers', value: 'alphanumeric' },
  { label: 'Alphabets, numbers and special characters', value: 'commonText' },
  { label: 'Email type', value: 'email' },
  { label: 'Alphabets and spaces', value: 'alphabetAndSpaces' },
];

const formGroups = [
  {
    inputType: 'text',
    name: 'textLabel',
    textLabel: 'Field Label',
    placeholder: 'Enter Field Label',
    required: requiredField,
    pattern: noHtmlTagPattern,
  },
  {
    inputType: 'text',
    name: 'description',
    multiline: true,
    minRows: 3,
    textLabel: 'Field Description',
    placeholder: 'Enter Field description',
    pattern: noHtmlTagPattern,
    maxLength: { ...inputLength.commonTextLength },
    dependencies: {
      keys: ['inputType'],
      calc: (data) => ({
        hide:
          data.inputType === 'radio' ||
          data.inputType === 'matrix' ||
          data.inputType === 'signature' ||
          data.inputType === 'checkBox' ||
          data.inputType === 'uploadFile'
      }),
    },
  },
  {
    inputType: 'select',
    name: 'inputType',
    label: 'Type',
    valueAccessor: 'value',
    labelAccessor: 'label',
    data: INPUT_TYPE_OPTIONS,
    required: requiredField,
    colSpan: 0.5,
  },
  {
    inputType:'editor',
    name:'editorValue',
    colSpan:1,
    dependencies: {
      keys: ['inputType'],
      calc: (data) => ({
        hide: data.inputType !== 'editor',
      }),
    },
  },
  {
    inputType:'text',
    type:'number',
    textLabel:'Min',
    name:'min',
    colSpan:0.25,
    dependencies: {
      keys: ['inputType'],
      calc: (data) => ({
        hide: data.inputType !== 'slider',
      }),
    },
  },
  {
    inputType:'text',
    type:'number',
    textLabel:'Max',
    name:'max',
    colSpan:0.25,
    dependencies: {
      keys: ['inputType'],
      calc: (data) => ({
        hide: data.inputType !== 'slider',
      }),
    },
  },
  {
    inputType: 'checkBox',
    name: 'enableScore',
    label: 'Enable Score Calculation',
    dependencies: {
      keys: ['inputType'],
      calc: (data) => ({
        hide: data.inputType !== 'matrix',
      }),
    },
  },
  {
    inputType: 'matrix',
    name: 'matrix',
    textLabel: 'Matrix',
    dependencies: {
      keys: ['inputType'],
      calc: (data) => ({
        hide: data.inputType !== 'matrix',
      }),
    },
  },
  {
    inputType: 'select',
    name: 'profileFieldMapping',
    label: 'Profile Mapping',
    valueAccessor: 'value',
    labelAccessor: 'label',
    data: profileFieldsTypeInput,
    dependencies: {
      keys: ['inputType'],
      calc: (data) => ({
        hide: data.inputType !== 'text',
      }),
    },
    colSpan: 0.5,
  },
  {
    inputType: 'select',
    name: 'profileFieldMapping',
    label: 'Profile Mapping',
    valueAccessor: 'value',
    labelAccessor: 'label',
    data: profileFieldsTypeRadio,
    dependencies: {
      keys: ['inputType'],
      calc: (data) => ({
        hide: data.inputType !== 'select' && data.inputType !== 'radio',
      }),
    },
    colSpan: 0.5,
  },
  {
    inputType: 'select',
    name: 'profileFieldMapping',
    label: 'Profile Mapping',
    valueAccessor: 'value',
    labelAccessor: 'label',
    data: profileFieldsTypePhone,
    dependencies: {
      keys: ['inputType'],
      calc: (data) => ({
        hide: data.inputType !== 'number',
      }),
    },
    colSpan: 0.5,
  },
  {
    inputType: 'tags',
    name: 'options',
    label: 'Options',
    multiple:true,
    optionsParser: (tagOptions) => tagOptions.map((option) => option.label || option),
    dependencies: {
      keys: ['inputType'],
      calc: (data) => ({
        hide:
          data.inputType === 'text' ||
          data.inputType === 'textArea' ||
          data.inputType === 'date' ||
          data.inputType === 'dateTime' ||
          data.inputType === 'textLabel' ||
          data.inputType === 'slider' ||
          data.inputType === 'checkBox' ||
          data.inputType === 'matrix' ||
          data.inputType === 'signature' ||
          data.inputType === 'number' ||
          data.inputType === 'uploadFile' ||
          data.inputType === 'editor' ||
          !data.inputType,
      }),
    },
  },
  {
    inputType: 'select',
    name: 'validation',
    label: 'Validations',
    valueAccessor: 'value',
    labelAccessor: 'label',
    data: fieldValidations,
    dependencies: {
      keys: ['inputType'],
      calc: (data) => ({
        hide: data.inputType !== 'text' && data.inputType !== 'textArea',
      }),
    },
  },
  {
    inputType: 'checkBox',
    name: 'mandatory',
    label: 'Required',
    dependencies: {
      keys: ['inputType'],
      calc: (data) => ({
        hide: data.inputType === 'matrix',
      }),
    },
  },
  {
    inputType: 'slider',
    type: 'number',
    name: 'colSpan',
    textLabel: 'Field Width',
    min: 1,
    max: 12,
  },
];

const AddField = ({
  isVisible,
  handleClose,
  handleFormGroups,
  handleEditFormGroups,
  rowIndex,
  insertRowIndex,
  sectionIndex,
  formGroupType,
  itemIndex,
  fieldToEdit,
  maxColSpan,
}) => {
  const normalizedDefaultValue = useMemo(
    () => ({
      ...fieldToEdit,
      textLabel: fieldToEdit?.textLabel || fieldToEdit?.label,
      mandatory: Boolean(
        fieldToEdit?.mandatory ||
          fieldToEdit?.required?.value ||
          fieldToEdit?.required
      ),
      options: Array.isArray(fieldToEdit?.options)
        ? fieldToEdit?.options?.map(
            (option) => option?.label || option?.value || option
          )
        : fieldToEdit?.options,
    }),
    [fieldToEdit]
  );

  let newFormGroup = [...formGroups];
  if (!formGroupType) {
    newFormGroup.unshift({
      inputType: 'text',
      name: 'title',
      textLabel: 'Section Title',
      placeholder: 'Type section title',
      pattern: regexCustomText,
      maxLength: { ...inputLength.commonTextLength },
    });
  }

  const maxFieldWidth = useMemo(() => {
    if (formGroupType === 'field' && normalizedDefaultValue?.colSpan) {
      return Math.min(
        12,
        Number(maxColSpan || 0) + Number(normalizedDefaultValue?.colSpan || 0)
      );
    }

    if (formGroupType === 'field') {
      return Math.max(1, Number(maxColSpan || 12));
    }

    return 12;
  }, [formGroupType, maxColSpan, normalizedDefaultValue?.colSpan]);

  newFormGroup = newFormGroup.map((item) => {
    if (item.name === 'colSpan') {
      return {
        ...item,
        max: maxFieldWidth,
      };
    }

    return item;
  });

  const form = useForm({ mode: 'onChange' });

  const {
    handleSubmit,
    watch,
    formState: { dirtyFields },
  } = form;

  if (watch('inputType') === 'text' || watch('inputType') === 'textArea') {
    newFormGroup = newFormGroup.map(item => {
      if (item.name === 'validation') {
        return {
          ...item,
          required: requiredField,
        };
      }
      return item;
    });
  }

  if (['select','radio','multiSelect','multiChoice'].includes(watch('inputType'))) {
    newFormGroup = newFormGroup.map(item => {
      if (item.name === 'options') {
        return {
          ...item,
          required: requiredField,
        };
      }
      return item;
    });
  }
  if (watch('inputType')==='slider') {
    newFormGroup = newFormGroup.map(item => {
      if (item.name === 'min') {
        return {
          ...item,
          required: requiredField,
        };
      }
      if (item.name === 'max') {
        return {
          ...item,
          required: requiredField,
        };
      }
      return item;
    });
  }

  const handleSaveMaster = useCallback(
    (data) => {
      if (!isEmpty(dirtyFields)) {
        if (fieldToEdit?.id) {
          handleEditFormGroups({
            data,
            rowIndex,
            itemIndex,
            sectionIndex,
          });
        } else {
          const uniqueID = generateUniqueId();
          handleFormGroups({
            data: { id: uniqueID, name: uniqueID, ...data },
            rowIndex,
            insertRowIndex,
            itemIndex,
            sectionIndex,
            formGroupType,
          });
        }
      }
      handleClose();
    },
    [
      dirtyFields,
      fieldToEdit?.id,
      formGroupType,
      handleClose,
      handleEditFormGroups,
      handleFormGroups,
      itemIndex,
      insertRowIndex,
      rowIndex,
      sectionIndex,
    ]
  );

  const footer = useMemo(
    () => ({
      leftActions: [
        {
          name: 'Cancel',
          variant: 'text',
          action: handleClose,
          style: { boxShadow: 'unset', color: '#303030' },
        },
        {
          name: 'Save',
          action: handleSubmit(handleSaveMaster),
          style: { marginRight: 16 },
        },
      ],
    }),
    [handleClose, handleSaveMaster, handleSubmit]
  );

  return (
    <Modal
      open={isVisible}
      header={{ title: 'Add Field' }}
      footer={footer}
      onClose={handleClose}
    >
      <Container key={fieldToEdit?.id || normalizedDefaultValue?.inputType}>
        <CardContent>
          <CustomForm
            formGroups={newFormGroup}
            columnsPerRow={1}
            defaultValue={normalizedDefaultValue}
            form={form}
          />
        </CardContent>
      </Container>
    </Modal>
  );
};

export default AddField;
