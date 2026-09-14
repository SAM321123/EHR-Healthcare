import PropTypes from 'prop-types';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Grid,
  Link,
} from '@mui/material';
import CustomButton from 'src/components/CustomButton';
import palette from '../../theme/palette';

export const FormCard = (props) => {
  const { item } = props;
  return (
    <Card
      sx={{
        display: 'flex',
        height: '100%',
        borderRadius: 1,
        width: '100%',
      }}
    >
      <CardContent
        sx={{ flexGrow: 1, padding: 1, paddingLeft: 2, width: '100%' }}
      >
        <Box
          sx={{
            display: 'flex',
            flexGrow: 1,
          }}
        >
          <Chip
            label={item.formStatus ? 'Completed' : 'Pending'}
            color={item.formStatus ? 'success' : 'warning'}
            size="small"
          />
        </Box>
        <Typography
          variant="h6"
          color={palette.primary.main}
          sx={{ marginTop: 1 }}
        >
          {item.formType}
        </Typography>

        <Box sx={{ flexGrow: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={9.5}>
              <Typography variant="body2">{item.formCreatedDate}</Typography>
            </Grid>
            <Grid item xs={12} sm={2.5}>
              <div style={{ display: 'flex', justifyContent: 'end' }}>
                {item.formStatus ? (
                  <Link variant="subtitle2">Open PDF</Link>
                ) : (
                  <CustomButton
                    variant="outlined"
                    size="small"
                    label="Complete"
                  />
                )}
              </div>
            </Grid>
          </Grid>
        </Box>
      </CardContent>
      <Box sx={{ flexGrow: 1 }} />
    </Card>
  );
};

FormCard.defaultProps = {
  company: {},
};

FormCard.propTypes = {
  company: PropTypes.instanceOf(Object),
};
