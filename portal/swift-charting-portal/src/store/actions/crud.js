import {
  requestCreate as requestCreateFunc,
  setCreateData as setCreateDataFunc,
  setCreateError as setCreateErrorFunc,
  setCreateLoading as setCreateLoadingFunc,
  requestDelete as requestDeleteFunc,
  setDeleteData as setDeleteDataFunc,
  setDeleteError as setDeleteErrorFunc,
  setDeleteLoading as setDeleteLoadingFunc,
  requestUpdate as requestUpdateFunc,
  setUpdateData as setUpdateDataFunc,
  setUpdateError as setUpdateErrorFunc,
  setUpdateLoading as setUpdateLoadingFunc,
  clearData as clearDataFunc,
  clearReadData as clearReadDataFunc,
} from './helper';

export const REQUEST_CREATE = '@crud/REQUEST_CREATE';
export const REQUEST_UPDATE = '@crud/REQUEST_UPDATE';
export const REQUEST_UPDATE_ALL = '@crud/REQUEST_UPDATE_ALL';
export const REQUEST_READ = '@crud/REQUEST_READ';
export const REQUEST_DELETE = '@crud/REQUEST_DELETE';
export const REQUEST_CREATE_WITH_DEBOUNCE = '@crud/REQUEST_CREATE_WITH_DEBOUNCE';

export const SET_DATA_CREATE = '@crud/SET_DATA_CREATE';
export const SET_DATA_UPDATE = '@crud/SET_DATA_UPDATE';
export const SET_DATA_UPDATE_ALL = '@crud/SET_DATA_UPDATE_ALL';
export const SET_DATA_READ = '@crud/SET_DATA_READ';
export const SET_DATA_DELETE = '@crud/SET_DATA_DELETE';

export const SET_ERROR_CREATE = '@crud/SET_ERROR_CREATE';
export const SET_ERROR_UPDATE = '@crud/SET_ERROR_UPDATE';
export const SET_ERROR_UPDATE_ALL = '@crud/SET_ERROR_UPDATE_ALL';
export const SET_ERROR_READ = '@crud/SET_ERROR_READ';
export const SET_ERROR_DELETE = '@crud/SET_ERROR_DELETE';

export const SET_LOADING_CREATE = '@crud/SET_LOADING_CREATE';
export const SET_LOADING_UPDATE = '@crud/SET_LOADING_UPDATE';
export const SET_LOADING_UPDATE_ALL = '@crud/SET_LOADING_UPDATE_ALL';
export const SET_LOADING_READ = '@crud/SET_LOADING_READ';
export const SET_LOADING_DELETE = '@crud/SET_LOADING_DELETE';
export const CLEAR_DATA = '@crud/CLEAR_DATA';
export const CLEAR_READ_DATA = '@crud/CLEAR_READ_DATA';
export const SET_FILTER_CREATE = '@crud/SET_FILTER_CREATE';

export const requestRead = (id, url, params,responseModifier) => ({
  type: REQUEST_READ,
  id,
  url,
  params,
  responseModifier,
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

export const setFilterData = (id, filtersData, type) => ({
  type: SET_FILTER_CREATE,
  id,
  filtersData,
  method: type
});

export const requestCreate = requestCreateFunc(REQUEST_CREATE);

export const setCreateData = setCreateDataFunc(SET_DATA_CREATE);

export const setCreateError = setCreateErrorFunc(SET_ERROR_CREATE);

export const setCreateLoading = setCreateLoadingFunc(SET_LOADING_CREATE);

export const requestDelete = requestDeleteFunc(REQUEST_DELETE);

export const setDeleteData = setDeleteDataFunc(SET_DATA_DELETE);

export const setDeleteError = setDeleteErrorFunc(SET_ERROR_DELETE);

export const setDeleteLoading = setDeleteLoadingFunc(SET_LOADING_DELETE);

export const requestUpdate = requestUpdateFunc(REQUEST_UPDATE);

export const requestCreateWithDebounce = requestCreateFunc(REQUEST_CREATE_WITH_DEBOUNCE);

export const setUpdateData = setUpdateDataFunc(SET_DATA_UPDATE);

export const setUpdateError = setUpdateErrorFunc(SET_ERROR_UPDATE);

export const setUpdateLoading = setUpdateLoadingFunc(SET_LOADING_UPDATE);

export const clearData = clearDataFunc(CLEAR_DATA);

export const clearReadData = clearReadDataFunc(CLEAR_READ_DATA);
