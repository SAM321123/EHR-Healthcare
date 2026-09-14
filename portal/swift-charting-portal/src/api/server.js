/* eslint-disable no-promise-executor-return */
import axios from 'axios';
import debounce from 'lodash/debounce';
import get from 'lodash/get';
import { getUserRole, triggerEvents } from 'src/lib/utils';
import { getDecryptedParams } from 'src/utils/decryption/Decryption';
import { getEncryptedParams } from 'src/utils/encryption/Encryption';
import { API_URL, BASE_URL, ENCRYPT_REQUEST_KEY, DECRYPT_RESPONSE_KEY, ENVIRONMENT } from './constants';

/**
 * Server address (for api)
 * @private
 * @constant
 */

// const PROTOCOL = process.env.SSL ? 'https' : 'http';
// const PATH = process.env.API_PATH ? `/${process.env.API_PATH}` : '';
// const API = process.env.API ? `${PROTOCOL}://${process.env.API}${PATH}/` : BASE_URL;

const API_PATH = BASE_URL;

const server = axios.create({
  baseURL: API_PATH,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

export const serverDownload = axios.create({
  baseURL: API_PATH,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

export const multipartServer = axios.create({
  baseURL: API_PATH,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'multipart/form-data',
  },
});

let refreshInstance = false;
const NON_REFRESHABLE_AUTH_MESSAGES = [
  'User is inactive',
  'Your Free Trial Has Ended',
  'Your practice subscription is currently inactive',
  'Your subscription has been canceled',
];

const getAuthErrorMessage = (err) => err?.response?.data?.message?.trim?.() || '';

const isNonRefreshableAuthError = (err) => {
  const status = err?.response?.status;
  const message = getAuthErrorMessage(err);

  return status === 401 && NON_REFRESHABLE_AUTH_MESSAGES.some((item) => message.includes(item));
};

const shouldRefreshToken = (err) => {
  const status = err?.response?.status;
  const message = getAuthErrorMessage(err);

  return status === 401 && !NON_REFRESHABLE_AUTH_MESSAGES.some((item) => message.includes(item));
};

const getRefreshToken = () => {
  if (refreshInstance) {
    return refreshInstance;
  }

  const refreshToken = localStorage.getItem('refresh_token');
  const userRole = getUserRole();
  refreshInstance = fetch(`${BASE_URL}${API_URL.refreshToken}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    cache: 'no-cache',
    body: JSON.stringify({ refreshToken, userRole }),
  }).then((response) => {
    if (response.ok) {
      return response.json();
    }
    return Promise.reject(response);
  })
    .then((data) => data)
    .finally(() => { refreshInstance = false; })
    .catch((err) => {
      console.log('err', err);
      localStorage.clear();
      return { error: true };
    });
  return refreshInstance;
};
const debouncedRefreshApiFn = debounce(getRefreshToken, 1000, { leading: true, trailing: false });

const refreshTokenHandler = async (err, resolve, reject, isDownload) => {
  const originalReq = err.config;
  // eslint-disable-next-line no-underscore-dangle
  if (err.config && !err.config.__isRetryRequest && !process.env.TEST_ENV && shouldRefreshToken(err)) {

    const data = await debouncedRefreshApiFn();
    const { tokens:{refresh:{token:refresh_token}={},access:{token:access_token}={}} ={}} = data || {};
    if (access_token) {
      localStorage.setItem('access_token', access_token);
    }
    if (refresh_token) {
      localStorage.setItem('refresh_token', refresh_token);
    }
    if (!get(data, 'error')) {
      originalReq.__isRetryRequest = true;
      const _server = isDownload?serverDownload:server;
      return _server(originalReq).then((resp) => resolve(resp)).catch((error)=>reject(error));
      // return server(originalReq).then((resp) => resolve(resp)).catch((error)=>reject(error));
    }
    triggerEvents("showSnackbar", {
      message: err?.response?.data?.message,
      severity: "error",
    });
    triggerEvents('logout');
    return reject();
  }
  if (isNonRefreshableAuthError(err)) {
    triggerEvents("showSnackbar", {
      message: getAuthErrorMessage(err),
      severity: "error",
    });
    triggerEvents('logout');
  }
  return reject(err);
};

const encryptRequest = (data) => {
  const encyptedData = getEncryptedParams(data, ENCRYPT_REQUEST_KEY);
  return encyptedData;
};

const decryptResponse = (data) => {
  const encyptedData = getDecryptedParams(data, DECRYPT_RESPONSE_KEY);
  return encyptedData;
}

const getQueryParams = (params) => {
  const paramsJson = {};
  const pairs = params.split('&');
  pairs.forEach((p) => {
    const pair = p.split('=');
    const key = pair[0];
    const value = decodeURIComponent(pair[1] || '');

    if (paramsJson[key]) {
      if (Object.prototype.toString.call(paramsJson[key]) === '[object Array]') {
        paramsJson[key].push(value);
      } else {
        paramsJson[key] = [paramsJson[key], value];
      }
    } else {
      paramsJson[key] = value;
    }
  });
  return paramsJson;
}

server.interceptors.request.use((config) => {
  const { data, url } = config || {};
  let { params } = config || {};
  const newConfig = { ...config };
  const accessToken = localStorage.getItem('access_token');
  if (accessToken) {
    newConfig.headers['Authorization'] = `Bearer ${accessToken}`;
  }
  if (ENVIRONMENT !== 'development') {
    if (url.includes("?")) {
      const [newurl, queryParams] = url.split('?');
      newConfig.url = newurl;
      const paramsJson = getQueryParams(queryParams);
      params = { ...params, ...paramsJson }
    }
    if (params) {
      const encryptParams = encryptRequest(params);
      newConfig.params = encryptParams;
    }
    if (data) {
      const encryptedData = encryptRequest(data);
      newConfig.data = JSON.stringify(encryptedData);
    }
  }
  return newConfig;
}, (error) => Promise.reject(error));

server.interceptors.response.use(
  (response) => {
    let { data } = response || {};
    if (data && ENVIRONMENT !== 'development') {
      data = decryptResponse(data);
    }
    const { tokens:{refresh:{token:refresh_token}={},access:{token:access_token}={}} ={}} = data || {};
    if (access_token) {
      localStorage.setItem('access_token', access_token);
    }
    if (refresh_token) {
      localStorage.setItem('refresh_token', refresh_token);
    }
    return data;
  },
  (err) => new Promise((resolve, reject) => refreshTokenHandler(err, resolve, reject)),
);

// server.interceptors.response.use(
//   (response) => response.data,
//   (err) => new Promise((resolve, reject) => refreshTokenHandler(err, resolve, reject)),
// );

// server.interceptors.request.use((request) => request, (error) => Promise.reject(error));

multipartServer.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('access_token');
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
multipartServer.interceptors.response.use(
  (response) => {
    let { data } = response || {};
    if (data && ENVIRONMENT !== 'development') {
      data = decryptResponse(data);
    }
    return data;
  },
  (err) => new Promise((resolve, reject) => refreshTokenHandler(err, resolve, reject)),
);


serverDownload.interceptors.response.use(
  (response) => response,
  (err) => new Promise((resolve, reject) => refreshTokenHandler(err, resolve, reject,true)),
);

serverDownload.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('access_token');
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default server;
