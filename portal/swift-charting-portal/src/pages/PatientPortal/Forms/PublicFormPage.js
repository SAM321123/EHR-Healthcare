import PageContent from 'src/components/PageContent';
import IntakeFormRender from './intakeFormRender';

const PublicFormPage = () => (
  <PageContent style={{ overflow: 'auto' }}>
    <IntakeFormRender publicAccess />
  </PageContent>
);

export default PublicFormPage;
