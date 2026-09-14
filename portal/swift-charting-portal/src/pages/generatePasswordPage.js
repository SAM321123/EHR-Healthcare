import React, { useEffect } from 'react';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';

import AuthContainer from 'src/components/AuthContainer';
import useCRUD from 'src/hooks/useCRUD';
import useSearchQuery from 'src/hooks/useSearchQuery';
import GeneratePassword from 'src/sections/auth/login/GeneratePassword';
import { VALIDATE_RESET_PW_TOKEN } from 'src/store/types';

const GeneratePasswordPage = () => {
  const query = useSearchQuery();
  
  const [tokenResponse, , , callValidateResetPWToken] = useCRUD({
    id: VALIDATE_RESET_PW_TOKEN,
    url: API_URL.validateResetPWToken,
    type: REQUEST_METHOD.get,
  });
  useEffect(() => {
    callValidateResetPWToken({
      token: query.get('token'),
      isGeneratePassword: true,
    });
  }, []);

  return tokenResponse?.message !== 'Invalid token' ? (
      <AuthContainer label="Generate Password" title="Generate Password" subTitle='Enter your new credentials' component={<GeneratePassword />} />
    ) : (
      <AuthContainer title="Link Expired" />
    );
};

export default GeneratePasswordPage;
