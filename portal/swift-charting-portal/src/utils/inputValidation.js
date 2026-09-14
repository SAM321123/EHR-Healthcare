import get from 'lodash/get';
import isRegExp from 'lodash/isRegExp';

import { regEmail, regMobile, regName } from 'src/lib/constants';

export const checkName = (params) => {
  if (!params) return 'required';
  if (params.length < 3) return 'Name should be between 3 to 50 characters';
  if (!regName.test(params)) return 'enter valid name';
  return '';
};

export const checkEmail = (params) => {
  if (!params) return 'required';
  if (!regEmail.test(params)) return 'enter valid email';
  return '';
};

export const checkMobile = (params) => {
  if (!params) return 'required';
  if (!regMobile.test(params)) return 'enter valid mobile number';
  return '';
};

export const checkDob = (params) => {
  if (!params) return 'required';
  return '';
};

export const customRegexValidator =
  ({ fieldName, field, errMsg, regex, invert } = {}) =>
  (data) => {
    if (!isRegExp(regex)) {
      return null;
    }
    const value = get(data, field);
    if (!value) return null;
    const result = regex.test(value);
    if (!result) {
      if (invert) return null;
      return errMsg || `Invalid ${fieldName}`;
    }
    if (!invert) {
      return null;
    }
    return errMsg || `Invalid ${fieldName}`;
  };
