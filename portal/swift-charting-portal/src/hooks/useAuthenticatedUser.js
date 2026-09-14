import { useSelector } from 'react-redux';
import { AUTHENTICATE_USER } from 'src/store/types';

const useAuthenticatedUser = () => {
  const userInfo = useSelector((state) =>
    state?.crud?.get(AUTHENTICATE_USER)?.get('read')?.get('data')
  );

  return userInfo;
};

export default useAuthenticatedUser;
