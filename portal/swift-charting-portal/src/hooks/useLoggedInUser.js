import { useSelector } from 'react-redux';
import { USER_LOGIN } from 'src/store/types';

const useLoggedInUser = () => {
    const userInfo = useSelector((state) =>
        state?.crud?.get(USER_LOGIN)?.get('read')?.get('data')
    );

  return userInfo;
};

export default useLoggedInUser;