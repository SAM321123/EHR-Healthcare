import React from 'react';
import AuthContainer from 'src/components/AuthContainer';
import { SignUpForm } from 'src/sections/auth/signup';

const SignUp = () => (
  <AuthContainer label="Sign Up" title="Signup" subTitle="Enter your details to sign up" login={false} component={SignUpForm} />
);

export default SignUp;

