import { Route, Routes } from 'react-router-dom';
import PageContent from 'src/components/PageContent';
import ConsentFormRender from './consentFormRender';
import IntakeFormRender from './intakeFormRender';
import FormsList from './list';

const PatientForms = ({ shared= false }={}) => (
  <PageContent style={{ overflow: 'auto' }}>
    <Routes>
      <Route path="/" element={<FormsList shared={shared}/>} />
      <Route path=":formId" element={<IntakeFormRender shared={shared}/>} />
      <Route
        path=":formId/consent/:consentId"
        element={<ConsentFormRender />}
      />
    </Routes>
  </PageContent>
);

export default PatientForms;
