import React from 'react';

import AuthContainer from 'src/components/AuthContainer';
import ForgotPassword from 'src/sections/auth/login/ForgotPassword';

const ForgotPasswordPage = () => (
  <AuthContainer label="Forgot Password?" title="Forgot Password" subTitle='Enter your email to get reset passowrd link' component={<ForgotPassword />} />
);

export default ForgotPasswordPage;
