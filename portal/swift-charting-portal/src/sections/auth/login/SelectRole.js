import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';

import CustomButton from 'src/components/CustomButton';
import Typography from 'src/components/Typography';
import { roleTypes, roleTypesValue } from 'src/lib/constants';
import { showSnackbar } from 'src/lib/utils';
import palette from 'src/theme/palette';
import Assistant from '../../../assets/images/svg/assistant.svg';
import Practitioner from '../../../assets/images/svg/practitioner.svg';
import ClinicAdmin from '../../../assets/images/svg/clinic_admin.svg';

const image = (type) => {
  switch (type) {
    case roleTypes.clinicAdmin:
      return ClinicAdmin;
    case roleTypes.assistant:
      return Assistant;
    case roleTypes.practitioner:
      return Practitioner;
    default:
      return null;
  }
};

const SelectRole = ({
  roles,
  modalCloseAction,
  initialRole = '',
  handleShowModal = () => {},
}) => {
  const [selected, setSelected] = useState(initialRole || null);

  const handleConfirm = () => {
    if (initialRole && initialRole === selected) {
      handleShowModal();
      return;
    }
    try {
      if (selected) {
        if (modalCloseAction) modalCloseAction(selected);
      } else {
        showSnackbar({
          message: 'Please select role',
          severity: 'error',
        });
      }
    } catch (err) {
      showSnackbar(err);
    }
  };

  return (
    <Container>
      <Box
        sx={{ marginTop: 0 }}
        display="flex"
        flexWrap="wrap"
        justifyContent="center"
      >
        {(roles || [])?.map((role, index) => (
          <Box
            key={index}
            display="flex"
            flexDirection="column"
            m={2}
            sx={{
              border:
                selected?.id === role?.id
                  ? `1px solid ${palette.primary.main}`
                  : `1px solid  ${palette.grey[300]}`,
              borderRadius: '10px',
            }}
            justifyContent="center"
            alignItems="center"
          >
            <Box
              onClick={() => setSelected(role)}
              style={{
                backgroundImage: `url(${image(role.code)})`,
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                position: 'relative',
                width: '160px',
                height: '120px',
                cursor: 'pointer',
                marginBottom: '19px',
              }}
            >
              <input
                type="radio"
                checked={selected?.id === role?.id}
                style={{
                  position: 'absolute',
                  top: '6px',
                  right: '6px',
                  transform: 'scale(1.2)',
                }}
                readOnly
              />
            </Box>
            <Typography
              onClick={() => setSelected(role)}
              sx={{
                textAlign: 'center',
                fontSize: '12px',
                fontWeight: 600,
                marginBottom: '19px',
              }}
            >
              {role?.name}
            </Typography>
          </Box>
        ))}
      </Box>
      <Box display="flex" justifyContent="center" alignItems="center">
        <CustomButton
          sx={{
            mt: 3,
          }}
          onClick={handleConfirm}
          label="Proceed"
        />
      </Box>
    </Container>
  );
};
export default SelectRole;
