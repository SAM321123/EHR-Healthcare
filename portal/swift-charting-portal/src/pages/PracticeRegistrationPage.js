import React from 'react';
import PageContainer from 'src/components/PageContainer';
import PracticeRegistrationForm from 'src/sections/auth/practiceSetup/practiceRegistrationForm';


const PracticeRegisterationPage = () => (
  <PageContainer label="Register Practice" title="Register Practice" subTitle="To sign up for your trial, please share the following" login={false} component={PracticeRegistrationForm} />
);

export default PracticeRegisterationPage;