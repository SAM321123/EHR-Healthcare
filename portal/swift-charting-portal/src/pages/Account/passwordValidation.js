import { useMemo } from 'react';
import { Box } from '@mui/material';

import Container from 'src/components/Container';
import { passwordValidation } from 'src/lib/utils';
import palette from 'src/theme/palette';
import { Iconify } from 'src/components/iconify';
import Typography from 'src/components/Typography';

const PasswordValidation = (props) => {
  const { formData } = props;

  const conditions = useMemo(() => passwordValidation(formData), [formData]);

  return (
    <Container
      component="main"
      style={{
        display: 'flex',
        height: '100%',
        flexDirection: 'column',
      }}
    >
      {conditions.map((item, index) => (
        <Box key={index} sx={{ display: 'flex', alignItems: 'center' }}>
          <Iconify
            icon={
              item.satisfied
                ? 'material-symbols:check-circle'
                : 'material-symbols:cancel'
            }
            color={item.satisfied ? palette.success.dark : palette.error.main}
          />
          <Typography
            sx={{ ml: 1, fontSize: '1rem', color: palette.grey[500] }}
          >
            {item.condition}
          </Typography>
        </Box>
      ))}
    </Container>
  );
};

export default PasswordValidation;
