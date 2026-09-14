import { Box, CardActions, CardContent } from '@mui/material';
import isEmpty from 'lodash/isEmpty';
import { useCallback, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import LoadingButton from 'src/components/CustomButton/loadingButton';
import CustomForm from 'src/components/form';
import useCRUD from 'src/hooks/useCRUD';
import userIcon from 'src/assets/images/user.png';
import { roleTypes, successMessage } from 'src/lib/constants';
import { getUpdatedFieldsValues, showSnackbar } from 'src/lib/utils';
import { SAVE_STAFF_DATA } from 'src/store/types';
import { formFields } from './formFields';
import Typography from 'src/components/Typography';
import palette from 'src/theme/palette';
import UploadFile from 'src/components/form/UploadFile';
import PageContent from 'src/components/PageContent';
import useStaffDetail from 'src/hooks/useStaffDetail';
import { useNavigate, useParams } from 'react-router-dom';
import { decrypt } from 'src/lib/encryption';
import { UI_ROUTES } from 'src/lib/routeConstants';
import Events from 'src/lib/events';

const PersonalInfoForm = () => {
  const navigate = useNavigate();
  const params = useParams();
  let { staffId } = params || {};
  if (staffId) {
    staffId = decrypt(staffId);
  }
  const form = useForm({ mode: 'onChange' });
  const { handleSubmit, register, setValue } = form;

  const [response, , loading, callStaffSaveAPI, clearData] = useCRUD({
    id: SAVE_STAFF_DATA,
    url: API_URL.staff,
    type: staffId ? REQUEST_METHOD.update : REQUEST_METHOD.post,
  });
  const [staffData, staffDataLoading, getDetail, clearResponse] =
    useStaffDetail({
      staffId,
    });

    const goToStaffList = () => {
      navigate(UI_ROUTES.staff);
    };

  const defaultData = useMemo(() => {
    if (isEmpty(staffData)) return {};
    const clonedData = { ...staffData };
    const defaultData = {};
    formFields.map((item) => {
      if (item.name === 'roleIds') {
        defaultData[item.name] =
          clonedData?.user?.roles
            ?.filter((item) => item.code !== roleTypes.patient)
            .map((item) => item.id) || [];
      } else if (item.name === 'address') {
        defaultData[item.name] = clonedData[item.name] || {};
      } else {
        defaultData[item.name] = clonedData[item.name];
      }
    });
    const phoneFields = [
      "phone",
      "preferredPhone",
    ];
    
    phoneFields.forEach(field => {
      if (defaultData[field] === null) {
        delete defaultData[field];
      }
    });
    defaultData.file = clonedData?.file;

    return defaultData;
  }, [staffData]);

  useEffect(() => {
    if (staffData) {
      setValue('file', staffData.file);
    }
  }, [staffData, setValue]);
  const onHandleSubmit = useCallback(
    (data) => {
      const isDefaultDataEmpty = isEmpty(defaultData);
      if (isDefaultDataEmpty) {
        callStaffSaveAPI({ data: { ...data } });
      } else {
        const updatedFields = getUpdatedFieldsValues(data, defaultData);
        if (isEmpty(updatedFields)) {
          showSnackbar({
            message: 'No changes found',
            severity: 'error',
          });
          return;
        } else {
          if (updatedFields.email) {
            updatedFields.roleIds = data.roleIds;
          }
          callStaffSaveAPI({ ...updatedFields }, `/${staffId}`);
        }
      }
    },
    [callStaffSaveAPI, defaultData]
  );

  useEffect(() => {
    if (!isEmpty(response)) {
      showSnackbar({
        message: staffId
          ? successMessage.update
          : successMessage.create,
        severity: 'success',
      });
      clearData(true);
      staffId && Events.trigger(`REFRESH-STAFF-DETAIL-${staffId}`);
      goToStaffList()
    }
  }, [response, clearData, staffId]);

  const initialValues = useMemo(() => {
    return isEmpty(defaultData) ? { titleCode: 'mr.' } : defaultData;
  }, [defaultData]);

  return (
    <PageContent loading={loading || staffDataLoading}>
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
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <CardContent>
            <CustomForm
              form={form}
              formGroups={formFields}
              columnsPerRow={1}
              defaultValue={initialValues}
              // defaultValue={defaultData}
            />
          </CardContent>
          <CardActions
            sx={{
              justifyContent: 'flex-start',
              paddingLeft: '24px',
              paddingRight: '24px',
            }}
          >
            <LoadingButton
              variant="outlinedSecondary"
              onClick={goToStaffList}
              label="Cancel"
            />
            <LoadingButton
              loading={loading}
              onClick={handleSubmit(onHandleSubmit)}
              label="Save"
            />
          </CardActions>
        </Box>
      </Box>
    </PageContent>
  );
};

export default PersonalInfoForm;
