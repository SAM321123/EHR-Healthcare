import { useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';

import CustomForm from 'src/components/form';
import Modal from 'src/components/modal';
import CardContent from '@mui/material/CardContent';
import Container from 'src/components/Container';
import {
  inputLength,
  noHtmlTagPattern,
  regexAlphanumeric,
  requiredField,
} from '../../../../../lib/constants';

const formBuilderFormGroups = [
  {
    inputType: 'text',
    name: 'title',
    textLabel: 'Title',
    placeholder: 'Enter title name',
    required: requiredField,
    pattern: regexAlphanumeric,
    maxLength: { ...inputLength.commonTextLength },
  },
  {
    inputType: 'text',
    name: 'sectionDescription',
    textLabel: 'Section Description',
    placeholder: 'Enter Section description',
    pattern: noHtmlTagPattern,
    maxLength: { ...inputLength.commonTextLength },
    minRows: 3,
    multiline: true,
  },
];

const SectionTitleModal = ({
  handleClose,
  open,
  defaultValue = {},
  handleFormGroups,
  sectionIndex,
  type,
  handleEditFormGroups,
}) => {
  const form = useForm({ mode: 'onChange' });

  const handleAddFormGroups = useCallback(
    (data) => {
      if (type === 'edit') {
        handleEditFormGroups({
          data,
          sectionIndex,
        });
      } else {
        handleFormGroups({
          data,
          sectionIndex,
        });
      }
      handleClose();
    },
    [handleClose, handleEditFormGroups, handleFormGroups, sectionIndex, type]
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
          action: form.handleSubmit(handleAddFormGroups),
          style: { marginRight: 16 },
        },
      ],
    }),
    [form, handleAddFormGroups, handleClose]
  );

  return (
    <Modal
      open={open}
      header={{ title: type === 'edit' ? 'Edit section' : 'Add section' }}
      footer={footer}
      onClose={handleClose}
    >
      <Container>
        <CardContent>
          <CustomForm
            formGroups={formBuilderFormGroups}
            columnsPerRow={1}
            defaultValue={defaultValue}
            form={form}
          />
        </CardContent>
      </Container>
    </Modal>
  );
};

export default SectionTitleModal;
