import { getUserRole, setUserTimezone } from "src/lib/utils";
import { useNavigate } from 'react-router-dom';
import { UI_ROUTES, navigateTo } from "src/lib/routeConstants";
import { roleTypes } from "src/lib/constants";
import useCRUD from "./useCRUD";

const { USER_LOGIN, AUTHENTICATE_USER } = require('src/store/types');
const { API_URL, REQUEST_METHOD } = require('src/api/constants');
const { useCallback, useEffect } = require('react');

const useAuthUser = () => {
  const navigate = useNavigate();
  const [userData, error, loading, callAuthApi, clear] = useCRUD({
    id: AUTHENTICATE_USER,
    url: API_URL.authenticate,
    type: REQUEST_METHOD.get,
    shouldClearError: false,
  });
  const [
    userInfo,
    userInfoError,
    userInfoLoading,
    callUserInfoApi,
    clearUserInfo,
  ] = useCRUD({
    id: `${USER_LOGIN}`,
    url: API_URL.users,
    type: REQUEST_METHOD.get,
  });

  const { id: userId } = userData || {};
  const userRole =getUserRole();
  const validateToken = useCallback(() => {
    // const accessToken = localStorage.getItem('access_token');
    // if (!userData && !loading && !error && accessToken) {
    if (!userData && !loading && !error) {
      callAuthApi();
    }
  }, [callAuthApi, error, loading, userData]);

  useEffect(() => {
    if (userData?.id && !userInfo && !error && userRole) {
      callUserInfoApi({}, `/${userId}?role=${userRole}`);
    }
  }, [userData?.id, userInfo]);

  useEffect(() => {
    if (error) {
      clear(true);
      clearUserInfo(true);
      localStorage.clear();
      navigate(navigateTo(`${UI_ROUTES.login}?redirectionURL=${ window.location.pathname}`));
    }
  }, [error]);

  const refetchUser = useCallback(
    (params = {}) => {
      callUserInfoApi(params, `/${userId}?role=${userRole}`);
    },
    [callUserInfoApi, userId, userRole]
  );

  useEffect(() => {
    if (userInfo) {
      userInfo.role = userRole;
        setUserTimezone(userInfo?.timezone || null)
    }
  }, [userInfo, userRole]);

  return [
    userInfo,
    userInfoError,
    userInfoLoading || loading,
    refetchUser,
    clearUserInfo,
    validateToken,
    userData,
    clear
  ];
};
export default useAuthUser;