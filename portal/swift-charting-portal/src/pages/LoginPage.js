import React from 'react';

import AuthContainer from 'src/components/AuthContainer';
import { LoginForm } from 'src/sections/auth/login';

const LoginPage = () => (
  <AuthContainer label="Sign In" title="Login" subTitle="Enter your credential to login the platform" login={true} component={LoginForm} />
);

export default LoginPage;
