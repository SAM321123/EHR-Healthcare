import { roleTypes } from 'src/lib/constants';

const { API_URL } = require('src/api/constants');

export const WiredEnumMasterField = (otherInfo) => ({
  name: 'master',
  label: 'Master Type',
  placeHolder: 'Select Master Type',
  inputType: 'wiredSelect',
  url: API_URL.getEnumMasterType,
  labelAccessor: 'name',
  valueAccessor: 'code',
  params: { isActive: true },
  ...otherInfo,
});

export const WiredMasterField = ({
  label,
  name,
  filter,
  code,
  valueAccessor,
  ...otherInfo
}) => ({
  name: name || 'master',
  label,
  inputType: 'wiredSelect',
  url: `${API_URL.getMasters}/${code}`,
  labelAccessor: 'name',
  valueAccessor: valueAccessor || 'code',
  params: { isActive: true, ...filter },
  code,
  ...otherInfo,
});

export const WiredPractitionerField = ({
  label,
  name,
  filter,
  code,
  ...otherInfo
}) => ({
  name: name || 'practitioners',
  label,
  inputType: 'wiredSelect',
  url: API_URL.practitioner,
  labelAccessor: 'name',
  valueAccessor: 'id',
  params: { isActive: true, ...filter },
  code,
  fetchInitial: true,
  cache: false,
  ...otherInfo,
});

export const WiredUserAutoCompleteField = ({
  label,
  name,
  filter,
  code,
  ...otherInfo
}) => ({
  name: name || 'practitioners',
  label,
  inputType: 'wiredAuto',
  url: API_URL.users,
  labelAccessor: ['firstName', 'middleName', 'lastName'],
  valueAccessor: 'id',
  params: { isActive: true, ...filter },
  code,
  fetchInitial: true,
  cache: false,
  ...otherInfo,
});

export const WiredUserField = ({
  label,
  name,
  filter,
  code,
  ...otherInfo
}) => ({
  name: name || 'practitioners',
  label,
  inputType: 'wiredSelect',
  url: API_URL.users,
  labelAccessor: ['firstName', 'middleName', 'lastName'],
  valueAccessor: 'id',
  params: { isActive: true, ...filter },
  code,
  fetchInitial: true,
  cache: false,
  ...otherInfo,
});

export const WiredStaffField = ({
  label,
  name,
  filter={},
  code,
  ...otherInfo
}) => ({
  name: name || 'practitioners',
  label,
  inputType: 'wiredSelect',
  url: API_URL.staff,
  labelAccessor: ['title.name','firstName', 'middleName', 'lastName'],
  valueAccessor: 'id',
  params: { isActive: true,role:roleTypes.practitioner,limit:100, ...filter },
  code,
  fetchInitial: true,
  cache: false,
  ...otherInfo,
});

export const WiredLocationField = ({
  label,
  name,
  filter,
  code,
  url,
  ...otherInfo
}) => ({
  name: name || 'location',
  label: label || 'Location',
  inputType: 'wiredSelect',
  url: url || API_URL.practiceLocation,
  labelAccessor: 'name',
  valueAccessor: 'id',
  params: { isActive: true, ...filter },
  code,
  cache: false,
  ...otherInfo,
});

export const WiredLocationByStaffIdField =  ({
  label,
  name,
  filter,
  code,
  url,
  ...otherInfo
}) => ({
  name: name || 'location',
  label: label || 'Location',
  inputType: 'wiredSelect',
  url: url || API_URL.practiceLocation,
  labelAccessor: 'location.name',
  valueAccessor: 'location.id',
  params: { isActive: true, ...filter },
  code,
  cache: false,
  ...otherInfo,
});


export const WiredServiceField = ({
  label,
  name,
  filter,
  code,
  url,
  ...otherInfo
}) => ({
  name: name || 'service',
  label,
  inputType: 'wiredSelect',
  url: url || API_URL.services,
  labelAccessor: 'name',
  valueAccessor: 'id',
  params: { isActive: true, ...filter },
  code,
  fetchInitial: true,
  cache: false,
  ...otherInfo,
});

export const WiredSelect = ({
  label,
  name,
  filter,
  code,
  url,
  labelAccessor,
  ...otherInfo
}) => ({
  name,
  label,
  inputType: 'wiredSelect',
  url,
  labelAccessor,
  code,
  ...otherInfo,
});

export const WiredPatientAutoComplete = ({
  label,
  name,
  url,
  params,
  required,
  dependencies,
  ...otherProps
}) => ({
  name: name || 'patient',
  label: label || 'Patient Name',
  inputType: 'wiredAuto',
  url: url || API_URL.getPatients,
  params,
  required,
  dependencies,
  disableClearable: true,
  labelAccessor: ['title.name', 'otherTitle', 'firstName', 'middleName', 'lastName'],
  valueAccessor: 'id',
  ...otherProps,
});

export const WiredMedicineAutoComplete = ({
  label,
  name,
  url,
  params,
  required,
  dependencies,
  ...otherProps
}) => ({
  name: name || 'medicine',
  label: label || 'Medication',
  inputType: 'wiredAuto',
  url: url || API_URL.medicine,
  params,
  required,
  dependencies,
  disableClearable: true,
  ...otherProps,
});

export const WiredPractitionerOrAssistantAutoComplete = ({
  label,
  name,
  url,
  params,
  required,
  dependencies,
  ...otherProps
}) => ({
  name: name || 'practitioner',
  label: label || 'Practitioner',
  inputType: 'wiredAuto',
  url: url || API_URL.practitioner,
  params,
  required,
  dependencies,
  disableClearable: true,
  ...otherProps,
});

export const WiredMasterAutoComplete = ({
  label,
  name,
  url,
  params,
  required,
  dependencies,
  code,
  ...otherProps
}) => ({
  name: name || 'master',
  label: label || 'Master',
  inputType: 'wiredAuto',
  url: url || `${API_URL.getMasters}/${code}`,
  params,
  required,
  dependencies,
  disableClearable: true,
  ...otherProps,
});
