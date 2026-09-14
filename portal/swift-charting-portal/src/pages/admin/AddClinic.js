import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import IconButton from '@mui/material/IconButton';
import Input from '@mui/material/Input';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import CircularProgress from '@mui/material/CircularProgress';
import { useForm } from 'react-hook-form';
import isEqual from 'lodash/isEqual';

import LoadingButton from 'src/components/CustomButton/loadingButton';
import CustomForm from 'src/components/form';
import {
  requiredField,
  regEmail,
  maxLength,
  successMessage,
  roleTypes,
  regexName,
  fileInfo,
  regexDomain,
} from 'src/lib/constants';
import useCRUD from 'src/hooks/useCRUD';
import { ADD_CLINIC, CLINIC_DETAILS, USER_LOGIN } from 'src/store/types';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import Container from 'src/components/Container';
import {
  getImageUrl,
  getUpdatedFieldsValue,
  getUserRole,
  showSnackbar,
  uploadImage,
} from 'src/lib/utils';
import { isEmpty } from 'src/lib/lodash';
import palette from 'src/theme/palette';
import { UI_ROUTES } from 'src/lib/routeConstants';
import useAuthUser from 'src/hooks/useAuthUser';

const addClinicFormGroup = (selectedClinic, isClinicAdmin, showUploadLogo) => {
  const formGroup = [
    {
      inputType: 'text',
      name: 'name',
      textLabel: 'Clinic Name',
      required: requiredField,
      maxLength: maxLength('Clinic Name', 200),
      gridProps: { md: 12 },
      pattern: {
        value: regexName.value,
        message: `Clinic Name ${regexName.message}`,
      },
    },
    {
      inputType: 'text',
      type: 'email',
      name: 'email',
      textLabel: 'Clinic Email Address ',
      required: requiredField,
      pattern: regEmail,
      gridProps: { md: 12 },
      // disabled: selectedClinic ? !isClinicAdmin : isClinicAdmin,
    },
    {
      inputType: 'text',
      name: 'domainName',
      textLabel: 'Domain Name',
      required: requiredField,
      maxLength: maxLength('Domain Name', 200),
      gridProps: { md: 12 },
      pattern: {
        value: regexDomain.value,
        message: `Domain Name ${regexDomain.message}`,
      },
      InputProps: { endAdornment: '.swiftcharting.com' },
    },
    {
      inputType: 'phoneInput',
      name: 'contact',
      textLabel: 'Contact Number',
      required: requiredField,
      gridProps: { md: 12 },
    },
    {
      inputType: 'mapAutoComplete',
      name: 'address',
      label: 'Address',
      required: requiredField,
    },
  ];

  // if (!selectedClinic?.logo?.file && !showUploadLogo) {
  //   formGroup.push({
  //     inputType: 'uploadFile',
  //     name: 'logo',
  //     textLabel: 'Upload Logo',
  //     gridProps: { md: 12 },
  //     accept: '.jpg,.jpeg,.png',
  //     fileInfo: { type: fileInfo.CLINIC_LOGO, isPublic: true },
  //   });
  // }

  return formGroup;
};

const AddClinic = ({ form, isButton, isTitle , showUploadLogo}) => {
  const inputFile = useRef(null);
  const [defaultImageUrl, setDefaultImageUrl] = useState();
  const [imageLoading, setImageLoading] = useState(false);
  const [imageDetails, setImageDetails] = useState({});
  const [userData] = useAuthUser();
  const navigate = useNavigate();
  const params = useParams();

  const isClinicAdmin = userData?.role === 'clinicAdmin';

  const [clinicResponse, , clinicLoading, getClinicAPI, clearClinicDetails] =
    useCRUD({
      id: CLINIC_DETAILS,
      url: `${API_URL.adminPractices}/${params?.clinicId}`,
      type: REQUEST_METHOD.get,
    });

  const [response, , loading, callAddClinicAPI, clearData] = useCRUD({
    id: ADD_CLINIC,
    url: isEmpty(clinicResponse)
      ? API_URL.adminPractices
      : `${API_URL.adminPractices}/${params?.clinicId}`,
    type: isEmpty(clinicResponse) ? REQUEST_METHOD.post : REQUEST_METHOD.update,
  });

  // const [roleResponse, , , callRoleAPI] = useCRUD({
  //   id: `${USER_LOGIN}`,
  //   url: API_URL.users,
  //   type: REQUEST_METHOD.get,
  // });

  const editForm = useForm({ mode: 'onChange' });
  const { handleSubmit, setValue } = form || editForm;

  useEffect(() => {
    if (params?.clinicId) {
      getClinicAPI();
    }
    return () => {
      clearClinicDetails(true);
    };
  }, []);

  // useEffect(() => {
  //   if (clinicResponse) {
  //     const { name, email, contact, address, logo } = clinicResponse;
  //     setValue('name', name);
  //     setValue('email', email);
  //     setValue('contact', contact);
  //     setValue('address', address);
  //     setValue('logo', logo);
  //   }
  // }, [clinicResponse, setValue]);

  useEffect(() => {
    if (!isEmpty(response)) {
      let message = '';
      if (!isEmpty(clinicResponse)) {
        message = successMessage.update;
      }
      if (isEmpty(clinicResponse)) {
        message = successMessage.create;
      }
      if (!userData.role.includes(roleTypes.superAdmin)) {
        // callRoleAPI({}, `/${userData?.user}?role=${getUserRole()}`);
      } else navigate(UI_ROUTES.clinics, { replace: true });

      showSnackbar({
        message,
        severity: 'success',
      });
      clearData();
      getClinicAPI();
    }
  }, [response, clearData, clinicResponse, getClinicAPI, navigate]);

  // useEffect(() => {
  //   if (!isEmpty(roleResponse)) {
  //     roleResponse.role = userData?.role;
  //     localStorage.setItem('user', JSON.stringify(roleResponse));
  //   }
  // }, [callRoleAPI, response, roleResponse, userData?.role]);

  const onHandleSubmit = useCallback(
    (data) => {
      if (isEmpty(clinicResponse)) {
        const filledData = {
          name: data.clinicName,
          email: data.clinicEmail,
          address: data.address,
          contact: data.phoneInput,
        };

        const { email, name, address } = filledData;

        if (email && name && address) {
          callAddClinicAPI({
            data: filledData,
          });
        }
      } else {
        if (data?.logo?.id) {
          // eslint-disable-next-line no-param-reassign
          data.logo = data?.logo?.id;
        }
        const updatedFields = getUpdatedFieldsValue(data, clinicResponse);

        if (
          isEmpty(getUpdatedFieldsValue(data?.address, clinicResponse?.address))
        )
          delete updatedFields?.address;
        if (isEqual(data?.logo, clinicResponse?.logo?.id))
          delete updatedFields?.logo;

        if (!isEmpty(updatedFields) || imageDetails?.id) {
          if (!imageDetails?.id) {
            callAddClinicAPI(updatedFields);
          } else {
            callAddClinicAPI({ ...updatedFields, logo: imageDetails?.id });
          }
        } else {
          showSnackbar({
            message: 'No Change Found',
            severity: 'error',
          });
        }
      }
    },
    [callAddClinicAPI, clinicResponse, imageDetails]
  );

  const handleEditImage = () => {
    inputFile.current.click();
  };

  const handleImageChange = async (e, info) => {
    const file = e.target.files;
    if (file && file[0]) {
     
      setImageLoading(true);
      const uploadResponse = await uploadImage(file[0], { uri:API_URL.adminPractices,...info });
      setImageDetails(uploadResponse);
      if (uploadResponse) {
        const imageUrl = getImageUrl(uploadResponse?.name, { isPublic: true });
        setDefaultImageUrl(imageUrl);
        setImageLoading(false);
      }
    }
  };

  useEffect(() => {
    const imageUrl = getImageUrl(clinicResponse?.logo?.name, {
      isPublic: true,
    });
    setDefaultImageUrl(imageUrl);
  }, [clinicResponse?.logo?.name]);

  return (
    <Container
      sx={{
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: `0px 0px 6px rgba(0, 0, 0, 0.15)`,
        backgroundColor: palette.background.paper,
      }}
      loading={clinicLoading}
    >
      <Box
        align="center"
        sx={{
          backgroundColor: palette.background.paper,
        }}
      >
        <Box
          align="left"
          sx={{
            backgroundColor: palette.background.paper,
          }}
          maxWidth="sm"
        >
          {isTitle ? <CardHeader title="Clinic Detail" /> : null}

          <CardContent>
            {/* {clinicResponse?.logo?.file ? (
              <Box
                style={{
                  backgroundImage: `url(${defaultImageUrl})`,
                  backgroundSize: 'contain',
                  backgroundRepeat: 'no-repeat',
                  height: 100,
                  position: 'relative',
                  margin: '24px 0px',
                  border: `1px solid  ${palette.grey[300]}`,
                }}
              >
                <>
                  <Input
                    inputProps={{ accept: '.jpg,.jpeg,.png' }}
                    type="file"
                    onChange={(e) =>
                      handleImageChange(e, {
                        type: fileInfo.CLINIC_LOGO,
                        isPublic: true,
                      })
                    }
                    style={{ display: 'none' }}
                    id="logo-upload"
                    inputRef={inputFile}
                  />
                  <label htmlFor="logo-upload">
                    <IconButton
                      variant="contained"
                      color="primary"
                      onClick={handleEditImage}
                      style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        backgroundColor: palette.common.white,
                        borderRadius: '50%',
                      }}
                    >
                      {imageLoading ? (
                        <CircularProgress />
                      ) : (
                        <EditOutlinedIcon
                          fontSize="small"
                          sx={{ color: palette.grey[800] }}
                        />
                      )}
                    </IconButton>
                  </label>
                </>
              </Box>
            ) : null} */}
            <CustomForm
              form={form || editForm}
              formGroups={addClinicFormGroup(clinicResponse, isClinicAdmin, showUploadLogo)}
              columnsPerRow={1}
            />
          </CardContent>
          {isButton ? (
            <CardActions sx={{ pl: 3 }}>
              <LoadingButton
                onClick={handleSubmit(onHandleSubmit)}
                loading={loading}
                label="Save"
              />
            </CardActions>
          ) : null}
        </Box>
      </Box>
    </Container>
  );
};

export default AddClinic;
