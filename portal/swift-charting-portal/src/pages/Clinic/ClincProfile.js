import { Box, Card, CardActions, CardContent, CardHeader, CircularProgress, Divider, IconButton, Input } from '@mui/material';
import CustomForm from 'src/components/form';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { clinicAddFormField } from '../admin/clinicAddForm';
import UploadFile from 'src/components/form/UploadFile';
import palette from 'src/theme/palette';
import Typography from 'src/components/Typography';
import userIcon from 'src/assets/images/user.png';
import CustomButton from 'src/components/CustomButton';
import { useNavigate, useParams } from 'react-router-dom';
import { ADD_CLINIC, CLINIC_DETAILS, GET_PRACTICE_DATA_SETTING, UPDATE_PRACTICE_DATA_SETTING } from 'src/store/types';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import useCRUD from 'src/hooks/useCRUD';
import { getImageUrl, getUpdatedFieldsValue, getUpdatedFieldsValues, showSnackbar, uploadImage } from 'src/lib/utils';
import { fileInfo, successMessage } from 'src/lib/constants';
import LoadingButton from 'src/components/CustomButton/loadingButton';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { isEmpty, isEqual } from 'lodash';
import Container from 'src/components/Container';

const ClinicProfile = () => {
    const form = useForm({ mode: 'onChange' });
    const params = useParams();
    const inputFile = useRef(null);
    const [imageLoading, setImageLoading] = useState(false);
    const [imageDetails, setImageDetails] = useState({});
    const [defaultImageUrl, setDefaultImageUrl] = useState();
    const { handleSubmit, register, setValue } = form;
    const navigate = useNavigate();
    // const [practiceSetting, setPracticeSetting] = useState({});

    // const [getPracticeSettingResponse, ,getPracticeSettingLoading ,getPracticeSetting, clearPracticeSetting] = useCRUD({
    //     id: GET_PRACTICE_DATA_SETTING,
    //     url: API_URL.practiceSetting,
    //     type: REQUEST_METHOD.get,
    // });

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
    
    
    useEffect(() => {
        getClinicAPI();
    }, []); 


    const handleImageChange = async (e, info) => {
        console.log('file------------->',e.target.files, e.target, e)
        const uploadUrl = `${API_URL.adminPractices}/upload/${params?.clinicId}` 
        const file = e.target.files;
        if (file && file[0]) {
         
          setImageLoading(true);
          const uploadResponse = await uploadImage(file[0], { uri:uploadUrl ,...info });
          setImageDetails(uploadResponse);
          if (uploadResponse) {
            const imageUrl = getImageUrl(uploadResponse?.name, { isPublic: true });
            setDefaultImageUrl(imageUrl);
            setImageLoading(false);
          }
        }
      };

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
      

      
      useEffect(() => {
        if (!isEmpty(response)) {
          showSnackbar({
            message: successMessage.update,
            severity: 'success',
          });
          clearData();
        }
      }, [response]);

      useEffect(() => {
          const imageUrl = getImageUrl(clinicResponse?.logo?.name, {
            isPublic: true,
          });
          setDefaultImageUrl(imageUrl);
        }, [clinicResponse?.logo?.name]);
    

      const handleEditImage = () => {
        inputFile.current.click();
      };

    return (
      <Container>
        <Box style={{margin: '10px'}} >
          <Box sx={{ display: 'flex', gap: '25px' }}>
            {/* <Box>
              <UploadFile
                accept={'.jpg,.jpeg,.png'}
                // buttonStyle={{
                //   height: 'auto',
                //   width: 189,
                //   padding: '47.89px 11px',
                //   backgroundColor: palette.background.babyGreen,
                //   border: `1px solid ${palette.border.main}`,
                // }}
                form={form}
                {...form}
                register={register('logo')}
                // textLabel={
                //   <Box style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                //     <Box
                //       style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
                //     >
                //       <Typography
                //         color={palette.text.primary}
                //         style={{
                //           fontSize: 12,
                //           lineHeight: '18px',
                //           fontWeight: 500,
                //         }}
                //       >
                //         Upload Practice Logo
                //       </Typography>
                //     </Box>
                //     <Box>
                //       <Typography
                //         color={palette.text.secondary}
                //         style={{
                //           textWrap: 'wrap',
                //           fontSize: 10,
                //           lineHeight: '15px',
                //           fontWeight: 400,
                //         }}
                //       >
                //         upload image upto 3 mb and accepted file formats are jpeg.
                //         jpg, png,
                //       </Typography>
                //     </Box>
                //   </Box>
                // }
              />
            </Box> */}
            {/* /////////////////////TO UPLOAD PRACTICE LOGO//////////////////////////////// */}
            {/* <Box
                style={{
                    backgroundImage: defaultImageUrl ? `url(${defaultImageUrl})` : 'none',
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                    height: 100,
                    width: 150, // <-- Added width
                    position: 'relative',
                    margin: '24px 0px',
                    border: `1px solid ${palette.grey[300]}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: !defaultImageUrl ? palette.grey[200] : 'transparent', // Background for empty state
                }}
                >
                {!defaultImageUrl && ( // Show label only if no image
                    <Typography
                    variant="body2"
                    sx={{
                        color: palette.grey[600],
                        fontSize: 12,
                        fontWeight: 500,
                    }}
                    >
                    Upload Pic
                    </Typography>
                )}

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
                </Box> */}

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <Box style={{}}>
                <CustomForm
                  formGroups={clinicAddFormField}
                  columnsPerRow={1}
                  form={form}
                  defaultValue={clinicResponse || {}}
                />
              </Box>
              <Box style={{ display: 'flex', gap: 20 }}>
                <LoadingButton
                  label="Cancel"
                  variant="outlinedSecondary"
                  onClick={() => navigate(-1)}
                />
                <LoadingButton
                  onClick={handleSubmit(onHandleSubmit)}
                //   onClick={handleSubmit(handleSavePracticeSettingDetails)}
                  label="Save"
                //   loading=}
                />
              </Box>
            </Box>
          </Box>
        </Box>
        </Container>
    )
}

export default ClinicProfile;