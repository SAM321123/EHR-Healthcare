import {
  Box,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Divider,
  Stack,
} from '@mui/material';
import { getTimezonesForCountry } from 'countries-and-timezones';
import dayjs from 'dayjs';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import userIcon from 'src/assets/images/user.png';
import Container from 'src/components/Container';
import CustomButton from 'src/components/CustomButton';
import LoadingButton from 'src/components/CustomButton/loadingButton';
import Typography from 'src/components/Typography';
import CustomForm from 'src/components/form';
import UploadFile from 'src/components/form/UploadFile';
import FormModal from 'src/components/modal';
import useAuthUser from 'src/hooks/useAuthUser';
import useCRUD from 'src/hooks/useCRUD';
import usePatientDetail from 'src/hooks/usePatientDetail';
import {
  dateFormats,
  inputLength,
  // inputLength,
  minDOB,
  onlyNumber,
  regEmail,
  regFirstname,
  // regFirstname,
  regTextArea,
  regexCustomText,
  requiredField,
  roleTypes,
  successMessage,
} from 'src/lib/constants';
import { isEmpty, omit } from 'src/lib/lodash';
import { UI_ROUTES } from 'src/lib/routeConstants';
import {
  dateFormatterDayjs,
  feetInchesToCM,
  getDirtyFieldsValue,
  getUpdatedFieldsValue,
  getUserRole,
  showSnackbar,
  updateFormFields
} from 'src/lib/utils';
import ChangePassword from 'src/pages/Account/changePassword';
import { GET_PROFILE_DATA, UPDATE_PROFILE } from 'src/store/types';
import palette from 'src/theme/palette';
import { WiredMasterField } from 'src/wiredComponent/Form/FormFields';
import { formatTimezonesForDisplay } from 'src/lib/timezoneHelpers';


const showOtherTitle = (data) => {
  if (data?.titleCode === 'name_prefixes_other') {
    return { hide: false };
  }
  return { hide: true };
};
const showOtherSexAtBirth = (data) => {
  if (data?.sexAtBirthCode === 'gender_at_birth_other') {
    return { hide: false };
  }
  return { hide: true };
};
const showOtherMaritalStatus = (data) => {
  if (data?.maritalStatusCode === 'marital_status_other') {
    return { hide: false };
  }
  return { hide: true };
};

const showAnotherGenderIdentity = (data) => {
  if (data?.genderIdentityCode === 'another_gender_identity') {
    return { hide: false };
  }
  return { hide: true };
};
const showAnotherOrientation = (data)=>{
  if (data?.sexualOrientationCode === 'another_orientation_not_listed') {
    return { hide: false };
  }
  return { hide: true };
}

export const profileFormGroups = [


  {
    inputType: 'text',
    name: 'firstName',
    textLabel: 'First Name',
    required: requiredField,
    maxLength: { ...inputLength.firstName },
    pattern: {
      value: regFirstname.value,
      message: `Firstname ${regFirstname?.message}`,
    },
  },
  {
    inputType: 'text',
    name: 'middleName',
    textLabel: 'Middle Name',
    maxLength: { ...inputLength.firstName },
    pattern: {
      value: regFirstname.value,
      message: `Middlename ${regFirstname?.message}`,
    },
  },
  {
    inputType: 'text',
    name: 'lastName',
    textLabel: 'Last Name',
    required: requiredField,
    maxLength: { ...inputLength.firstName },
    pattern: {
      value: regFirstname.value,
      message: `Lastname ${regFirstname?.message}`,
    },
  },

  {
    inputType: 'phoneInput',
    type: 'number',
    name: 'phone',
    textLabel: 'Phone Number',
    gridProps: { md: 12 },
  },
  {
    inputType: 'text',
    type: 'email',
    name: 'email',
    textLabel: 'Email Address',
    disabled: true,
  },
  {
    ...WiredMasterField({
      code: 'pronouns',
      filter:{limit:20},
      name: 'pronounsCode',
      label:"Pronouns",
      labelAccessor:"name",
      valueAccessor:"code",
      colSpan:1,
    }),
  },
  {
    inputType: 'mapAutoComplete',
    name: 'address',
    label: 'Address',
    itemProps:{
      address:{colSpan:2},
      countryCode:{colSpan:0.5},
      stateCode:{colSpan:0.5},
      city:{colSpan:0.5},
      postalCode:{colSpan:0.5},

    }
  },
  {
    inputType: 'select',
    name: 'timezone',
    label: 'Timezone',
    valueAccessor: 'name',
    labelAccessor: 'displayLabel',
    required: requiredField,
    colSpan:1,
    dependencies: {
      keys: ['address','address.countryCode'],
      calc: (data, form, { isValueChanged } = {}) => {
        const { setValue = () => {} } = form || {};
        const code = data?.address?.countryCode || 'US'; 
        if (isValueChanged) setValue('timezone', '');
        const rawTimezones = getTimezonesForCountry(code);
        const formattedTimezones = formatTimezonesForDisplay(rawTimezones);
        return {
          reFetch: true,
          options: formattedTimezones,
        };
      },
    },
  },
  {
    inputType: 'number',
    name: 'npiNo',
    // minLength: { value: 10 },
    // maxLength: { ...inputLength.amountLength },
    // pattern: "\d{10}",
    textLabel: 'National Provider Identifier number',
    colSpan: 1,
  },
  {
    inputType: 'text',
    name: 'stateLicenseNo',
    textLabel: 'State License Number',
    colSpan: 1,
    pattern: regexCustomText,
  },
  {
    inputType: 'text',
    name: 'deaNo',
    textLabel: 'DEA Number',
    colSpan: 1,
    pattern: regexCustomText,

  },
  {
    inputType: 'text',
    name: 'fedralTaxId',
    textLabel: 'Federal Tax ID',
    colSpan: 1,
    pattern: regexCustomText,

  },
  {
    inputType: 'text',
    name: 'socialSecurityNo',
    textLabel: 'Social Security Number',
    colSpan: 1,
    pattern: regexCustomText,

  },
  {
    inputType: 'text',
    name: 'experience',
    textLabel: 'Years Of Experience In Practice',
    colSpan: 1,
    pattern: regexCustomText,
  },
  {
    inputType: 'text',
    name: 'education',
    textLabel: 'Education',
    colSpan: 1,
    pattern: regexCustomText,
  },
  {
    inputType: 'text',
    name: 'languagesSpoken',
    textLabel: 'Languages Spoken',
    colSpan: 1,
    pattern: regexCustomText,
  },
  {
    inputType: 'text',
    name: 'facebook',
    textLabel: 'Facebook',
    colSpan: 1,
    pattern: regexCustomText,
  },
  {
    inputType: 'text',
    name: 'instagram',
    textLabel: 'Instagram',
    colSpan: 1,
    pattern: regexCustomText,
  },
  {
    inputType: 'text',
    name: 'whatsapp',
    textLabel: 'WhatsApp',
    colSpan: 1,
    pattern: regexCustomText,
  },
  {
    inputType: 'text',
    name: 'linkedin',
    textLabel: 'LinkedIn',
    colSpan: 1,
    pattern: regexCustomText,
  },
  {
    inputType: 'textArea',
    name: 'bio',
    textLabel: 'Bio',
    colSpan: 2,
    pattern:regexCustomText,
    ...WiredMasterField({
      code: 'gender_at_birth',
      filter:{limit:20},
      name: 'sexAtBirthCode',
      label:"Sex at birth",
      // required: requiredField,
      labelAccessor:'name',
      valueAccessor:'code',
      cache:false,
  }),
  },
  {
    inputType: 'signature',
    name: 'signature',
    colSpan: 2,
    gridProps: { md: 12 },
    required: requiredField,
  },

];

const patientProfileFormGroups = [
  {
    ...WiredMasterField({
      code: 'name_prefixes',
      filter:{limit:20},
      name: 'titleCode',
      label:"Title",
      labelAccessor:'name',
      valueAccessor:'code',
      colSpan:0.5,
      placeholder:'Mr.',
      cache:false,

    }),
  },
  {
    inputType: 'text',
    name: 'otherTitle',
    textLabel: 'Title (Other)',
    colSpan: 0.5,
    dependencies: {
      keys: ['titleCode'],
      calc: showOtherTitle,
    },
  },
  {
    inputType: 'text',
    name: 'firstName',
    textLabel: 'First Name',
    required: requiredField,
    pattern: {
      value: regFirstname.value,
      message: `Firstname ${regFirstname?.message}`,
    },
    maxLength: { ...inputLength.firstName },
    minLength: { value: 3 },
    colSpan: 0.5,
  },
  {
    inputType: 'text',
    name: 'middleName',
    textLabel: 'Middle Name',
    pattern: {
      value: regFirstname.value,
      message: `Lastname ${regFirstname?.message}`,
    },
    maxLength: { ...inputLength.firstName },
    colSpan: 0.5,
  },
  {
    inputType: 'text',
    name: 'lastName',
    textLabel: 'Last Name',
    required: requiredField,
    pattern: {
      value: regFirstname.value,
      message: `Lastname ${regFirstname?.message}`,
    },
    maxLength: { ...inputLength.firstName },
    colSpan: 0.5,
  },
  {
    inputType: 'text',
    type: 'email',
    name: 'email',
    textLabel: 'Email',
    required: requiredField,
    pattern: regEmail,
    maxLength: { ...inputLength.email },
    // colSpan:0.25
  },
  {
    inputType: 'date',
    name: 'dob',
    required: requiredField,
    textLabel: 'Date of Birth',
    minDate: minDOB,
    disableFuture: true,
    // colSpan:0.25,
    
  },
  {
    inputType: 'phoneInput',
    name: 'phone',
    textLabel: 'Phone No.',
    pattern:onlyNumber,
    // colSpan:0.25,
    
  },
  {
    inputType: 'phoneInput',
    name: 'preferredPhone',
    textLabel: 'Preferred Phone No.',
    pattern:onlyNumber,
    // colSpan:0.25
  },
  {
    ...WiredMasterField({
      code: 'gender_at_birth',
      filter:{limit:20},
      name: 'sexAtBirthCode',
      label:"Sex at birth",
      required: requiredField,
      labelAccessor:'name',
      valueAccessor:'code',
      colSpan:1,
      cache:false,
    }),
  },
  {
    inputType: 'text',
    name: 'guardian',
    textLabel: 'Guardian',
    colSpan:1
  },
  {
    inputType: 'text',
    name: 'occupation',
    textLabel: 'Occupation',
    colSpan:1,
    pattern: regexCustomText,
  },
  {
    inputType: 'text',
    name: 'otherSexAtBirth',
    textLabel: 'Sex at birth (Other)',
    // colSpan: 0.25,
    dependencies: {
      keys: ['sexAtBirthCode'],
      calc: showOtherSexAtBirth,
    },
  },
  {
    inputType: 'text',
    name: 'languagesSpoken',
    textLabel: 'languages Spoken',
    colSpan: 1,
    pattern: regexCustomText,
  },
  {
    inputType: 'text',
    name: 'ssn',
    textLabel: 'SSN',
    colSpan: 1,
    pattern: regexCustomText,
  },
  {
    inputType: 'text',
    name: 'driversLicensNo',
    textLabel: `Driver's License Number`,
    colSpan: 1,
    pattern: regexCustomText,
  },
  {
    inputType: 'text',
    name: 'preferredPharmacy',
    textLabel: 'Preferred Pharmacy',
    colSpan: 1,
    pattern: regexCustomText,
  },
  {
    inputType: 'mapAutoComplete',
    name: 'pharmacyAddress',
    label: 'Preferred Pharmacy Address',
    itemProps:{
      address:{colSpan:2 , label: 'PreferredPharmacy Address' ,},
      countryCode:{colSpan:1 , label: 'Preferred Pharmacy Country' },
      stateCode:{colSpan:1 , label: 'Preferred Pharmacy State'},
      city:{colSpan:1 , label: 'Preferred Pharmacy City'},
      postalCode:{colSpan:1 , label: 'Preferred Pharmacy Postal'},

    }
  },
  {
    inputType: 'mapAutoComplete',
    name: 'address',
    label: 'Address',
    itemProps:{
      address:{colSpan:2},
      countryCode:{colSpan:0.5},
      stateCode:{colSpan:0.5},
      city:{colSpan:0.5},
      postalCode:{colSpan:0.5},

    }
  },
  {
    inputType: 'select',
    name: 'timezone',
    label: 'Timezone',
    valueAccessor: 'name',
    labelAccessor: 'displayLabel',
    required: requiredField,
    colSpan:2,
    dependencies: {
      keys: ['address','address.countryCode'],
      calc: (data, form, { isValueChanged } = {}) => {
        const { setValue = () => {} } = form || {};
        const { address: { countryCode: code } = {} } = data;
        if (isValueChanged) setValue('timezone', '');
        const rawTimezones = getTimezonesForCountry(code || 'US');
        const formattedTimezones = formatTimezonesForDisplay(rawTimezones);
        return {
          reFetch: true,
          options: formattedTimezones,
        };
      },
    },
  },
];

const heightForm = [
  {
    name: 'feet',
    inputType: 'select',
    label: 'Height(ft)',
    labelAccessor: 'feet',
    valueAccessor: 'code',
    required: requiredField,
    options: [
      ...Array.from({ length: 10 }, (_, i) => ({
        feet: String(i + 1),
        code: String(i + 1),
      })),
    ],
    colSpan: 0.5,
    gridProps: { md: 4, sm: 4 },
  },
  {
    name: 'inches',
    inputType: 'select',
    label: 'Height(inches)',
    labelAccessor: 'inch',
    valueAccessor: 'code',
    options: [
      ...Array.from({ length: 12 }, (_, i) => ({
        inch: String(i),
        code: String(i),
      })),
    ],
    colSpan: 0.5,
    gridProps: { md: 4, sm: 4 },
  },
];

function getApi(role) {
  switch (role) {

    case roleTypes.patient:
      return API_URL.patient;
    default:
      return API_URL.staff;
  }
}
let updatedFields;

export const AccountProfileDetails = () => {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState({});
  const [isChangePassword, setIsChangePassword] = useState(false);
  const [userData, , , refetchUser] = useAuthUser();
  const userRole = getUserRole();
  const tempProfileFormGroups =
    userRole === roleTypes.patient
      ? [...updateFormFields(patientProfileFormGroups, ['email'], 'disabled', true)]
      : [...profileFormGroups];

  const formDefaultValues = useMemo(() => {
    const updatedData =
      userProfile &&
      omit(userProfile, [
        'id',
        'isActive',
        'practice',
        'user',
        'role',
        'logo',
        'createdAt',
        'updatedAt',
      ]);

    if (userRole === roleTypes.patient) {
      if (userProfile?.dob) {
        updatedData.dob = dayjs(userProfile?.dob);
      }
    }
    const phoneFields = [
      "phone",
      "preferredPhone",
    ];
    
    phoneFields.forEach(field => {
      if (updatedData[field] === null) {
        delete updatedData[field];
      }
    });

    return updatedData;
  }, [userProfile]);
  const [response, ,updateProfileLoading , updateProfileApi, clearData] = useCRUD({
    id: UPDATE_PROFILE,
    url: getApi(userRole),
    type: REQUEST_METHOD.update,
  });

  const [getUserResponse, , getUserLoading, getUser, clearUser] = useCRUD({
    id: GET_PROFILE_DATA,
    url: `${getApi(userRole)}/${userData.id}`,
    type: REQUEST_METHOD.get,
  });
  const clearResponse = usePatientDetail({
    patientId: userData?.id,
  })[3];

  const form = useForm({ mode: 'onChange' });
  const {
    handleSubmit,
    formState: { dirtyFields },
    setValue,
    register,
  } = form;

  useEffect(() => {
    if (getUserResponse) {
      setUserProfile(getUserResponse);
      setTimeout(() => {
        setValue('timezone', getUserResponse?.timezone);
      }, 200);
      clearUser(true);
    }
  }, [clearUser, getUserResponse]);

  useEffect(() => {
    if (userRole === roleTypes.superAdmin) {
      getUser({ role: userRole });
    } else {
      getUser();
    }
  }, []);

  useEffect(() => {
    if (!isEmpty(response)) {
      refetchUser();
      showSnackbar({
        message: successMessage.update,
        severity: 'success',
      });
      clearData();
      navigate(UI_ROUTES.dashboard);
    }
  }, [response]);

  const toggleModal = useCallback(() => {
    setIsChangePassword(!isChangePassword);
  }, [isChangePassword]);

  const handleSaveAccountDetails = useCallback(
    (data) => {
      const payload = getDirtyFieldsValue(data, dirtyFields);
      const filledData = { ...payload };
      const preData = {};
     
      Object.keys(filledData).forEach((key) => {
        preData[key] = userProfile?.[key];
      });
      if (filledData.dob) {
        filledData.dob = dateFormatterDayjs(data.dob, dateFormats.YYYYMMDD);
      }
      updatedFields = getUpdatedFieldsValue(filledData, preData);
      if (isEmpty(getUpdatedFieldsValue(filledData?.address, preData?.address)))
        delete updatedFields?.address;

      if (updatedFields?.feet || updatedFields?.inches) {
        const height = feetInchesToCM(
          updatedFields?.feet || data?.feet,
          updatedFields?.inches || data?.inches
        );
        updatedFields.height = String(height);
        delete updatedFields?.feet;
        delete updatedFields?.inches;
      }

      if (!isEmpty(updatedFields))
        updateProfileApi({ ...updatedFields }, `/${userProfile?.id}`);
      else {
        showSnackbar({
          message: 'No changes found',
          severity: 'error',
        });
      }
      clearResponse(true);
    },
    [dirtyFields, updateProfileApi, userProfile, clearResponse]
  );

  return (
    <Container loading={getUserLoading || updateProfileLoading}>
    <Card>
      {!(userRole === roleTypes.superAdmin) ? (
        <CardHeader subheader="The information can be edited" title="Profile" />
      ) :  <CardHeader title="Profile" />}
      <CardContent sx={{ pt: 0 }}>
      <Box sx={{ display: 'flex', gap: '25px' }}>

      <Box>
          <UploadFile
            accept={'.jpg,.jpeg,.png'}
            buttonStyle={{
              height: 'auto',
              width: 189,
              padding: '47.89px 11px',
              backgroundColor: palette.background.babyGreen,
              border: `1px solid ${palette.border.main}`,
            }}
            form={form}
            {...form}
            register={register('file')}
            textLabel={
              <Box style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <Box
                  style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
                >
                  <img
                    src={userIcon}
                    style={{ widht: 32, height: 32, objectFit: 'contain' }}
                    alt="user"
                  />
                  <Typography
                    color={palette.text.primary}
                    style={{
                      fontSize: 12,
                      lineHeight: '18px',
                      fontWeight: 500,
                    }}
                  >
                    Upload Profile Pic
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    color={palette.text.secondary}
                    style={{
                      textWrap: 'wrap',
                      fontSize: 10,
                      lineHeight: '15px',
                      fontWeight: 400,
                    }}
                  >
                    upload image upto 3 mb and accepted file formats are jpeg.
                    jpg, png,
                  </Typography>
                </Box>
              </Box>
            }
          />
        </Box>
        <Box >
          <CustomForm
            form={form}
            formGroups={tempProfileFormGroups}
            columnsPerRow={2}
            defaultValue={formDefaultValues}
          />
        </Box>
        </Box>
      </CardContent>
      <Stack
        fullWidth
        sx={{
          alignItems: 'end',
        }}
      >
        <CustomButton
          onClick={toggleModal}
          sx={{
            color: palette.primary.main,
            fontWeight: 600,
            '&:hover': {
              backgroundColor: palette.background.paper,
              color: palette.primary.dark,
            },
          }}
          variant="secondary"
          label="Change Password"
        />
      </Stack>

      <Divider />
      <CardActions sx={{ justifyContent: 'center' }}>
        <LoadingButton
          onClick={() => navigate(-1)}
          label="Cancel"
          variant="secondary"
        />
        {!(userRole === roleTypes.superAdmin) ? (
          <LoadingButton
            onClick={handleSubmit(handleSaveAccountDetails)}
            label="Save"
            loading={getUserLoading ||updateProfileLoading }
          />
        ) : null}
      </CardActions>
      <FormModal
        open={isChangePassword}
        onClose={toggleModal}
        header={{
          title: 'Change Password',
        }}
      >
        <ChangePassword modalCloseAction={toggleModal} />
      </FormModal>
    </Card>
    </Container>
  );
};
