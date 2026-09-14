export const REQUEST_READ = '@reduxStoreWithId/REQUEST_READ';

export const SET_DATA_READ = '@reduxStoreWithId/SET_DATA_READ';

export const SET_ERROR_READ = '@reduxStoreWithId/SET_ERROR_READ';

export const SET_LOADING_READ = '@reduxStoreWithId/SET_LOADING_READ';

export const CLEAR_DATA = '@reduxStoreWithId/CLEAR_DATA';

export const CLEAR_DATA_WITH_ID = '@reduxStoreWithId/CLEAR_DATA_WITH_ID';

export const requestRead = (id, url, params) => ({
  type: REQUEST_READ,
  id,
  url,
  params,
});

export const setReadData = (id, data) => ({
  type: SET_DATA_READ,
  id,
  data,
});

export const setReadError = (id, error) => ({
  type: SET_ERROR_READ,
  id,
  error,
});

export const setReadLoading = (id, loading) => ({
  type: SET_LOADING_READ,
  id,
  loading,
});

export const clearData = (id) => ({
  type: CLEAR_DATA,
  id,
});

export const clearDataWithId = (id) => ({
  type: CLEAR_DATA_WITH_ID,
  id,
});
