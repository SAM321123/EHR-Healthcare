/* eslint-disable consistent-return */
import axios from 'axios';
import server, { multipartServer } from './server';
import formDataParser from './helper';
import { contentType } from '../lib/constants';

let cancelToken = axios.CancelToken.source();

const multipartFormDataServer = (options, method) => {
  const { data, url } = options || {};
  delete data.contentType;
  const formData = formDataParser(data);
  return multipartServer({
    url,
    method,
    data: formData,
    headers: {},
    cancelToken: cancelToken.token,
  });
};

const get = (options) => {
  const { url, params = {} } = options || {};
  const { responseType } = params;
  if (responseType) {
    delete params.responseType;
  }

  const serverOptions = {
    url,
    method: 'get',
    headers: { },
    params,
    responseType,
    cancelToken: cancelToken.token,
  };
  return server(serverOptions);
};

const post = (options) => {
  const { data, url, params } = options || {};
  if (!data) return;
  if (data.contentType === contentType.MULTIPART) {
    return multipartFormDataServer(options, 'POST');
  }

  const serverOptions = {
    url,
    method: 'POST',
    headers: {},
    data,
    cancelToken: cancelToken.token,
    params
  };
  return server(serverOptions);
};

const put = (options) => {
  const { data, url, token } = options || {};
  if (data.contentType === contentType.MULTIPART) {
    return multipartFormDataServer(options, 'PUT');
  }
  return server({
    url,
    method: 'PUT',
    data,
    headers: { Authorization: `Bearer ${token}` },
    cancelToken: cancelToken.token,
  });
};

const deleteAPI = (options) => {
  const { data, url, token } = options || {};
  const serverOptions = {
    url,
    method: 'DELETE',
    data,
    cancelToken: cancelToken.token,
  };
  if (token) {
    serverOptions.headers = { Authorization: `Bearer ${token}` };
  }
  return server(serverOptions);
};

const cancelRequests = () => {
  cancelToken.cancel('REQUEST_CANCELLED_SESSION_TIMEOUT');
  cancelToken = axios.CancelToken.source();
};

export default {
  get,
  post,
  put,
  delete: deleteAPI,
  multipartFormDataServer,
  cancelRequests,
};
