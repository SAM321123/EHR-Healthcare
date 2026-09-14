import React from 'react';
import PageContainer from 'src/components/PageContainer';
import PracticeEmailVerifyForm from 'src/sections/auth/practiceSetup/practiceEmailVerifyForm';

const PracticeRegisterationVerifyEmailPage = () => (
  <PageContainer label="Register Practice" title="Register Practice" subTitle="A verification code has been sent to your email. This code will expire in 15 minutes." login={false} component={PracticeEmailVerifyForm} />
);

export default PracticeRegisterationVerifyEmailPage;