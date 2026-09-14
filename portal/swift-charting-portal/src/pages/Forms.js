import { Container } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import { FormCard } from '../sections/forms/forms';

// 0=pending, 1=completed
const formsData = [
  {
    formStatus: 1,
    formType: 'Weight Loss Program - New Patients',
    formCreatedDate: 'Jun 15, 2023',
  },
  {
    formStatus: 0,
    formType: 'Weight Loss Program - New Patients',
    formCreatedDate: 'Jun 15, 2023',
  },
  {
    formStatus: 1,
    formType: 'Weight Loss Program - New Patients',
    formCreatedDate: 'Jun 15, 2023',
  },
  {
    formStatus: 0,
    formType: 'Weight Loss Program - New Patients',
    formCreatedDate: 'Jun 15, 2023',
  },
];

const Forms = () => (
  <Container component="main" maxWidth="md">
    <CssBaseline />
    <List sx={{ padding: 0, alignSelf: 'center' }}>
      {formsData.map((item, index) => (
        <ListItem key={index}>
          <FormCard item={item} />
        </ListItem>
      ))}
    </List>
  </Container>
);

export default Forms;
