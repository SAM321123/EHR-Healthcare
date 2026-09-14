import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import get from 'lodash/get';
import differenceWith from 'lodash/differenceWith';
import isEmpty from 'lodash/isEmpty';
import isEqual from 'lodash/isEqual';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import ViewStreamIcon from '@mui/icons-material/ViewStream';
import BoltIcon from '@mui/icons-material/Bolt';

import Container from 'src/components/Container';
import PageHeader from 'src/components/PageHeader';
import ActionsPopOver from 'src/components/ActionsPopover';
import { inputLength, requiredField } from 'src/lib/constants';
import { generateUniqueId, showConfirmDialog } from 'src/lib/utils';
import palette from 'src/theme/palette';
import Builder from './Builder';
import AddRuleForm from './AddRuleForm';
import BuilderPreview from './BuilderPreview';
import QuickMake from './QuickMake';

const BUILDER_VIEW = 'builder';
const QUICK_MAKE_VIEW = 'quickmake';

const NewForm = ({
  selectedFormConfig,
  setSelectedFormConfig,
  onFormSave,
  onSettingsClick,
}) => {
  const isChangesPending = useRef(false);
  const [formGroups, setFormGroupsState] = useState([]);
  const [open, setOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [rules, setRuleState] = useState([]);
  const [builderView, setBuilderView] = useState(BUILDER_VIEW);

  const form = useForm({ mode: 'onChange' });

  const setFormGroups = useCallback((data) => {
    setFormGroupsState(data);
    isChangesPending.current = true;
  }, []);

  const setRules = useCallback((data) => {
    setRuleState(data);
    const modifiedData = data?.map((item) => {
      const newItem = { ...item };
      if (!Array.isArray(item?.applyTo[item?.applyTo?.type])) {
        newItem.applyTo[item?.applyTo?.type] = [
          item?.applyTo[item?.applyTo?.type],
        ];
      }
      return newItem;
    });
    localStorage.setItem('rule', JSON.stringify(modifiedData));
  }, []);

  const handleBackIconClick = useCallback(() => {
    if (!isChangesPending.current) {
      setSelectedFormConfig({});
    } else {
      showConfirmDialog({
        confirmAction: ({ close }) => {
          setSelectedFormConfig({});
          close();
        },
        message:
          'Are you sure you want to go back? All the unsaved changes will be discarded.',
      });
    }
  }, [setSelectedFormConfig]);

  useEffect(() => {
    if (selectedFormConfig) {
      setFormGroupsState(JSON.parse(selectedFormConfig?.questions || '[]'));
      setRules(JSON.parse(selectedFormConfig?.rules || '[]'));
    }
  }, []);

  const handleFormGroups = useCallback(
    ({
      data = {},
      rowIndex,
      sectionIndex,
      formGroupType,
      itemIndex,
      insertRowIndex,
    }) => {
      const uniqueID = generateUniqueId();

      if (sectionIndex === undefined && !data?.inputType) {
        const { title = '', sectionDescription = '' } = data;

        setFormGroups([
          ...formGroups,
          {
            id: uniqueID,
            name: uniqueID,
            title,
            sectionDescription,
            fields: [],
          },
        ]);
        return;
      }

      const selectedValues = data?.options?.map((option) => ({
        label: option,
        value: option,
      }));

      let maxLength = {};
      if (data?.inputType === 'text') {
        maxLength = inputLength.commonTextLength;
      }
      if (data?.inputType === 'textArea') {
        maxLength = inputLength.textArea;
      }

      const modifiedData = {
        ...data,
        ...(selectedValues && { options: selectedValues }),
        colSpan: Number(data?.colSpan),
        required: data?.mandatory ? requiredField : false,
        maxLength,
      };

      const { title = '', sectionDescription = '' } = modifiedData;
      delete modifiedData?.title;

      if (sectionIndex === undefined) {
        if (title) {
          setFormGroups([
            ...formGroups,
            {
              id: uniqueID,
              name: uniqueID,
              title,
              sectionDescription,
              fields: [[{ ...modifiedData }]],
            },
          ]);
        } else {
          setFormGroups([
            ...formGroups,
            {
              id: uniqueID,
              name: uniqueID,
              fields: [[{ ...modifiedData }]],
            },
          ]);
        }
      } else if (formGroupType === 'field') {
        const currentRow = [
          ...get(formGroups[sectionIndex], `fields[${rowIndex}]`, []),
        ];
        const nextItemIndex =
          typeof itemIndex === 'number' ? itemIndex : currentRow.length;

        currentRow.splice(nextItemIndex, 0, { ...modifiedData });
        formGroups[sectionIndex].fields[rowIndex] = currentRow;
        setFormGroups([...formGroups]);
      } else if (formGroupType === 'row') {
        const sectionRows = [...get(formGroups[sectionIndex], 'fields', [])];
        const nextRowIndex =
          typeof insertRowIndex === 'number'
            ? insertRowIndex
            : typeof rowIndex === 'number'
              ? rowIndex + 1
              : sectionRows.length;

        sectionRows.splice(nextRowIndex, 0, [{ ...modifiedData }]);
        formGroups[sectionIndex] = {
          ...formGroups[sectionIndex],
          fields: sectionRows,
        };
        setFormGroups([...formGroups]);
      }
    },
    [formGroups, setFormGroups]
  );

  const handleDeleteFormGroup = useCallback(
    ({ rowIndex, itemIndex, sectionIndex }) => {
      if (Array.isArray(formGroups[sectionIndex])) {
        formGroups[sectionIndex].splice(itemIndex, 1);
        if (formGroups[sectionIndex].length === 0) {
          formGroups.splice(sectionIndex, 1);
        }
      } else if (
        sectionIndex !== undefined &&
        rowIndex !== undefined &&
        itemIndex !== undefined
      ) {
        formGroups[sectionIndex].fields[rowIndex].splice(itemIndex, 1);
        if (formGroups[sectionIndex].fields[rowIndex].length === 0) {
          formGroups[sectionIndex].fields.splice(rowIndex, 1);
        }
      } else if (sectionIndex !== undefined && formGroups[sectionIndex]) {
        formGroups.splice(sectionIndex, 1);
      }
      setFormGroups([...formGroups]);
    },
    [formGroups, setFormGroups]
  );

  const handleEditFormGroups = useCallback(
    ({ data = {}, itemIndex, rowIndex, sectionIndex }) => {
      let selectedValues = [];
      if (
        !isEmpty(formGroups[sectionIndex]?.fields?.[rowIndex]?.[itemIndex]) &&
        !isEmpty(data?.options)
      ) {
        if (
          !isEmpty(
            differenceWith(
              formGroups[sectionIndex]?.fields?.[rowIndex]?.[itemIndex]
                ?.options,
              data?.options,
              isEqual
            )
          ) ||
          !formGroups[sectionIndex]?.fields?.[rowIndex]?.[itemIndex]?.options
        ) {
          selectedValues = data?.options?.map((option) => ({
            label: option,
            value: option,
          }));
        }
      }
      let maxLength = {};
      if (data?.inputType === 'text') {
        maxLength = inputLength.commonTextLength;
      }
      if (data?.inputType === 'textArea') {
        maxLength = inputLength.textArea;
      }
      const modifiedData = {
        ...data,
        ...(!isEmpty(selectedValues) && { options: selectedValues }),
        colSpan: Number(data?.colSpan),
        required: data?.mandatory ? requiredField : false,
        maxLength,
      };
      if (data?.title && sectionIndex !== undefined) {
        formGroups[sectionIndex] = {
          ...formGroups[sectionIndex],
          title: data?.title,
          sectionDescription:data?.sectionDescription
        };
      } else if (Array.isArray(formGroups[sectionIndex])) {
        formGroups[sectionIndex][itemIndex] = { ...modifiedData };
      } else {
        formGroups[sectionIndex].fields[rowIndex][itemIndex] = {
          ...modifiedData,
        };
      }

      setFormGroups([...formGroups]);
    },
    [formGroups, setFormGroups]
  );

  const handleOpen = useCallback(() => {
    setOpen(!open);
  }, [open]);

  const handlePreview = useCallback(() => {
    setShowPreview(!showPreview);
  }, [showPreview]);

  const onSubmit = useCallback((data) => {
    console.log('LLLLLLLLLLLLLLLL', data);
  }, []);

  // View toggle rendered as a right-side element in the page header
  const ViewToggle = (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        border: `1px solid ${palette.grey[300]}`,
        borderRadius: '8px',
        padding: '2px',
        backgroundColor: palette.grey[100],
      }}
    >
      <Tooltip title="Form Builder (Drag and Drop)">
        <IconButton
          size="small"
          onClick={() => setBuilderView(BUILDER_VIEW)}
          sx={{
            borderRadius: '6px',
            padding: '4px 8px',
            backgroundColor:
              builderView === BUILDER_VIEW
                ? palette.background.paper
                : 'transparent',
            color:
              builderView === BUILDER_VIEW
                ? palette.primary.main
                : palette.grey[500],
            boxShadow:
              builderView === BUILDER_VIEW
                ? '0 1px 4px rgba(0,0,0,0.12)'
                : 'none',
            '&:hover': {
              backgroundColor:
                builderView === BUILDER_VIEW
                  ? palette.background.paper
                  : palette.background.accentBlue,
            },
          }}
          aria-label="Current View"
          aria-pressed={builderView === BUILDER_VIEW}
        >
          <ViewStreamIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Quick Add">
        <IconButton
          size="small"
          onClick={() => setBuilderView(QUICK_MAKE_VIEW)}
          sx={{
            borderRadius: '6px',
            padding: '4px 8px',
            backgroundColor:
              builderView === QUICK_MAKE_VIEW
                ? palette.background.paper
                : 'transparent',
            color:
              builderView === QUICK_MAKE_VIEW
                ? palette.primary.main
                : palette.grey[500],
            boxShadow:
              builderView === QUICK_MAKE_VIEW
                ? '0 1px 4px rgba(0,0,0,0.12)'
                : 'none',
            '&:hover': {
              backgroundColor:
                builderView === QUICK_MAKE_VIEW
                  ? palette.background.paper
                  : palette.background.accentBlue,
            },
          }}
          aria-label="Quick Make View"
          aria-pressed={builderView === QUICK_MAKE_VIEW}
        >
          <BoltIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );

  return (
    <Container className="form-builder-container">
      <PageHeader
        title={selectedFormConfig?.name}
        showBackIcon
        onPressBackIcon={handleBackIconClick}
        rightContent={
          showPreview
            ? [
                {
                  type: 'action',
                  label: 'Edit',
                  onClick: handlePreview,
                  style: { borderRadius: 8, fontSize: '1rem' },
                },
                {
                  type: 'action',
                  label: 'Save',
                  onClick: form.handleSubmit(onSubmit),
                  style: { borderRadius: 8, fontSize: '1rem' },
                },
              ]
            : [
                { render: ViewToggle },
                {
                  type: 'action',
                  label: 'Save',
                  onClick: () => onFormSave(formGroups, rules),
                  style: { borderRadius: 8, fontSize: '1rem' },
                },
                {
                  render: (
                    <ActionsPopOver
                      actions={[
                        {
                          label: 'Preview',
                          action: handlePreview,
                        },
                        {
                          label: 'Add/Edit Rule',
                          action: handleOpen,
                        },
                        {
                          label: 'Settings',
                          action: onSettingsClick,
                        },
                      ]}
                    />
                  ),
                },
              ]
        }
      />
      {showPreview ? (
        <BuilderPreview
          form={form}
          rules={rules}
          columnsPerRow={12}
          handleFormGroups={handleFormGroups}
          formGroups={formGroups}
          handleEditFormGroups={handleEditFormGroups}
          handleDeleteFormGroup={handleDeleteFormGroup}
          setFormGroups={setFormGroupsState}
        />
      ) : builderView === QUICK_MAKE_VIEW ? (
        <QuickMake
          formGroups={formGroups}
          handleFormGroups={handleFormGroups}
          handleEditFormGroups={handleEditFormGroups}
          handleDeleteFormGroup={handleDeleteFormGroup}
          formType={selectedFormConfig?.formType?.code}
        />
      ) : (
        <Builder
          columnsPerRow={12}
          handleFormGroups={handleFormGroups}
          formGroups={formGroups}
          setFormGroups={setFormGroups}
          handleEditFormGroups={handleEditFormGroups}
          handleDeleteFormGroup={handleDeleteFormGroup}
        />
      )}
      {open && (
        <AddRuleForm
          open={open}
          handleClose={handleOpen}
          handleFormGroups={handleFormGroups}
          handleDeleteFormGroup={handleDeleteFormGroup}
          formGroups={formGroups}
          rules={rules}
          setRules={setRules}
          setFormGroups={setFormGroups}
        />
      )}
    </Container>
  );
};

export default NewForm;
