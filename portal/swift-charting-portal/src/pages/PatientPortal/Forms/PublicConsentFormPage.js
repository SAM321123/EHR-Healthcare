import PageContent from 'src/components/PageContent';
import ConsentFormRender from './consentFormRender';

const PublicConsentFormPage = () => (
  <PageContent style={{ overflow: 'auto' }}>
    <ConsentFormRender publicAccess />
  </PageContent>
);

export default PublicConsentFormPage;
