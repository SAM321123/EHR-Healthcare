import React from 'react';
import AuthContainer from 'src/components/AuthContainer';
import EmailVerificationForm from 'src/sections/auth/login/emailVerificationForm';

const EmailVerificationPage = () => (
    <AuthContainer
        label="Email Verification"
        title="Two-Factor Authentication (2FA)"
        subTitle="Please enter the verification code sent to your email address"
        login={false}
        component={EmailVerificationForm}
    />
);

export default EmailVerificationPage;