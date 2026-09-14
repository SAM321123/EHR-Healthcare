import React, { useEffect } from 'react';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';

import AuthContainer from 'src/components/AuthContainer';
import useCRUD from 'src/hooks/useCRUD';
import useSearchQuery from 'src/hooks/useSearchQuery';
import ResetPassword from 'src/sections/auth/login/ResetPassword';
import { VALIDATE_RESET_PW_TOKEN } from 'src/store/types';

const ResetPasswordPage = () => {
  const query = useSearchQuery();

  const [tokenResponse, , , callValidateResetPWToken] = useCRUD({
    id: VALIDATE_RESET_PW_TOKEN,
    url: API_URL.validateResetPWToken,
    type: REQUEST_METHOD.get,
  });
  useEffect(() => {
    callValidateResetPWToken({
      token: query.get('token'),
    });
  }, []);

  return tokenResponse?.message !== 'Invalid token' ? (
    <AuthContainer label="Recover Password" title="Recover Password" subTitle='Enter you new credentials' component={<ResetPassword />} />
  ) : (
    <AuthContainer title="Link Expired" />
  );
};

export default ResetPasswordPage;
