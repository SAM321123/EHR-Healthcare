import { Box, Card, CardActions, CardContent, CardHeader, Divider } from '@mui/material';
import CustomForm from 'src/components/form';
import React, { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { practiceSettingFormField } from './practiceSettingFormField';
import UploadFile from 'src/components/form/UploadFile';
import palette from 'src/theme/palette';
import Typography from 'src/components/Typography';
import userIcon from 'src/assets/images/user.png';
import CustomButton from 'src/components/CustomButton';
import { useNavigate } from 'react-router-dom';
import { GET_PRACTICE_DATA_SETTING, UPDATE_PRACTICE_DATA_SETTING } from 'src/store/types';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import useCRUD from 'src/hooks/useCRUD';
import { getUpdatedFieldsValues, showSnackbar } from 'src/lib/utils';
import { successMessage } from 'src/lib/constants';
import LoadingButton from 'src/components/CustomButton/loadingButton';
import { isEmpty } from 'lodash';
import Container from 'src/components/Container';

const PracticeSettings = () => {
    const form = useForm({ mode: 'onChange' });
    const { handleSubmit, register, setValue } = form;
    const navigate = useNavigate();
    const [practiceSetting, setPracticeSetting] = useState({});

    const [getPracticeSettingResponse, ,getPracticeSettingLoading ,getPracticeSetting, clearPracticeSetting] = useCRUD({
        id: GET_PRACTICE_DATA_SETTING,
        url: API_URL.practiceSetting,
        type: REQUEST_METHOD.get,
    });

    const [practiceData, ,practiceLoading ,callPracticeSettingSaveAPI, clearPractice] = useCRUD({
      id: UPDATE_PRACTICE_DATA_SETTING,
      url: API_URL.practiceSetting,
      type: isEmpty(practiceSetting) ? REQUEST_METHOD.post : REQUEST_METHOD.update,
    });
    
    useEffect(() => {
      getPracticeSetting();
    }, []); 

    const handleSavePracticeSettingDetails = useCallback(
      (data) => {
        const isDefaultDataEmpty = isEmpty(practiceSetting);
        let payload = {};
        if (isDefaultDataEmpty) {
          payload = data;
        } else {
          const updatedFields = getUpdatedFieldsValues(data, practiceSetting);
          if (!isEmpty(updatedFields)) {
            payload = updatedFields;
          }
        }
        if (isEmpty(payload)) {
          showSnackbar({
            message: 'No changes found',
            severity: 'error',
          });
          return;
        }
        if (isDefaultDataEmpty) {
          callPracticeSettingSaveAPI({ data: { ...payload } }, `/`);
        } else {
          callPracticeSettingSaveAPI({ ...payload }, `/`);
        }
      },
      [practiceSetting]
    );

      useEffect(() => {
        if (!isEmpty(practiceData)) {
          showSnackbar({
            message: successMessage.update,
            severity: 'success',
          });
          clearPractice();
        }
      }, [practiceData]);
      

    useEffect(() => {
        if (getPracticeSettingResponse) {
          setPracticeSetting(getPracticeSettingResponse);
          setTimeout(() => {
            setValue('timezone', getPracticeSettingResponse?.timezone);
          }, 200);
          clearPracticeSetting(true);
        }
      }, [clearPracticeSetting, getPracticeSettingResponse]);


    return (
      <Container loading={practiceLoading || getPracticeSettingLoading}>
        <Box style={{margin: '10px'}} >
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
                register={register('logo')}
                textLabel={
                  <Box style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <Box
                      style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
                    >
                      <Typography
                        color={palette.text.primary}
                        style={{
                          fontSize: 12,
                          lineHeight: '18px',
                          fontWeight: 500,
                        }}
                      >
                        Upload Practice Logo
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
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <Box style={{}}>
                <CustomForm
                  formGroups={practiceSettingFormField}
                  columnsPerRow={1}
                  form={form}
                  defaultValue={practiceSetting || {}}
                />
              </Box>
              <Box style={{ display: 'flex', gap: 20 }}>
                <LoadingButton
                  label="Cancel"
                  variant="outlinedSecondary"
                  onClick={() => navigate(-1)}
                />
                <LoadingButton
                  onClick={handleSubmit(handleSavePracticeSettingDetails)}
                  label="Save"
                  loading={practiceLoading || getPracticeSettingLoading}
                />
              </Box>
            </Box>
          </Box>
        </Box>
        </Container>
    )
}

export default PracticeSettings;