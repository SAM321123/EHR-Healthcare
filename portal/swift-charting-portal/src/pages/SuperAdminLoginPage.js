import React from 'react';
import AuthContainer from 'src/components/AuthContainer';
import { SuperAdminLoginForm } from 'src/sections/auth/superAdminLoginForm';

const SuperAdminLogin = () => (
  <AuthContainer label="Super Admin Login" title="Login" subTitle="Enter your details to Login" login={false} component={SuperAdminLoginForm} />
);

export default SuperAdminLogin;