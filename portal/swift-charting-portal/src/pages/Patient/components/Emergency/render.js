import { CircularProgress, IconButton } from '@mui/material';
import { clone, cloneDeep, isEmpty } from 'lodash';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import Typography from 'src/components/Typography';
import CustomForm from 'src/components/form';
import useCRUD from 'src/hooks/useCRUD';
import Events from 'src/lib/events';
import { GET_EMERGENCY_CONTACT, GET_FAMILY_HISTORY, UPDATE_EMERGENCY_CONTACT, UPDATE_FAMILY_HISTORY } from 'src/store/types';
import palette from 'src/theme/palette';
// import familyHistoryFormGroups from './formGroups';
import LoadingButton from 'src/components/CustomButton/loadingButton';
import { getUpdatedFieldsValue, showSnackbar } from 'src/lib/utils';
import { getAddress, successMessage } from 'src/lib/constants';
import del from 'src/assets/images/delimg.png';
import edit from 'src/assets/images/editimg.png';
import AlertDialog from 'src/components/AlertDialog';
import emergencyContactFormGroups from './formGroup';
import { useParams } from 'react-router-dom';
import { decrypt } from 'src/lib/encryption';
import { v4 } from 'uuid';

const EmergencyContactRendrer = ({ emergencyData = {} }) => {
  const params = useParams();
  let {patientId}= params || {}
  patientId =decrypt(patientId);
  const [mode, setMode] = useState('view');
  const [open, setOpen] = useState(false);

  const [response, , loading, callUpdateAPI, clearData] = useCRUD({
    id: `${UPDATE_EMERGENCY_CONTACT}-${emergencyData?.id}`,
    url: `${API_URL.emergencyContact}/${emergencyData?.id}`,
    type: REQUEST_METHOD.update,
  });
  const form = useForm({ mode: 'onChange' });
  const { handleSubmit, reset } = form;

  useEffect(() => {
    if (!isEmpty(response)) {
      Events.trigger(`REFRESH-TABLE-${GET_EMERGENCY_CONTACT}-${patientId}`);
      reset();
      showSnackbar({
        message: successMessage.update,
        severity: 'success',
      });
      setViewMode();
      clearData(true);
      setOpen(false);
    }
  }, [response]);

  const defaultValue = useMemo(() => {
    return emergencyContactFormGroups.reduce((acc, item) => {
      const clonedemergencyData = clone(emergencyData);
      acc[item.name] = clonedemergencyData[item.name] || '';
      return acc;
    }, {});
  }, [emergencyData]);

  const parsedFormGroup = useMemo(()=>{
    const temp = cloneDeep(emergencyContactFormGroups);
    return temp.map(item=>{
     item.extraId=v4();
     return item;
    })
   },[])

  const setEditMode = () => {
    setMode('edit');
  };
  const setViewMode = () => {
    setMode('view');
  };
  const deleteData = useCallback(() => {
    callUpdateAPI({ isDeleted: true });
  }, [callUpdateAPI]);

  const deleteDialogBox = useCallback((data) => {
    setOpen((value) => !value);
  }, []);

  const dialogActions = useMemo(
    () => [
      {
        title: 'Cancel',
        action: () => setOpen((current) => !current),
        actionStyle: { color: palette.common.black, padding: '8px' },
        variant: 'secondary',
      },
      {
        title: 'Confirm',
        action: deleteData,
        actionStyle: { color: palette.primary.main, padding: '8px' },
        variant: 'secondary',
      },
    ],
    [deleteData]
  );

  const onHandleSubmit = useCallback(
    (data) => {
      const updatedFields = getUpdatedFieldsValue(data, defaultValue);
      if (!isEmpty(updatedFields)) {
        callUpdateAPI(updatedFields);
      } else {
        showSnackbar({
          message: 'No changes found',
          severity: 'error',
        });
      }
    },
    [defaultValue]
  );
  return (
    <>
      {mode === 'edit' && (
        <div>
          <CustomForm
            form={form}
            formGroups={parsedFormGroup}
            columnsPerRow={1}
            defaultValue={defaultValue}
          />
          <div style={{ marginTop: 10, display: 'flex', gap: 10 }}>
            <LoadingButton
              onClick={setViewMode}
              label="Cancel"
              variant="outlinedSecondary"
            />
            <LoadingButton
              loading={loading}
              onClick={handleSubmit(onHandleSubmit)}
              label="Update"
            />
          </div>
        </div>
      )}
      {mode === 'view' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div
            style={{
              backgroundColor: '#F8F9FC',
              padding: 12,
              display: 'flex',
              justifyContent: 'space-between',
              gap: 82.25,
              borderRadius: 4,
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 10 }}>
                <div>
                  <Typography
                    style={{
                      fontSize: 12,
                      fontWeight: 500,
                      lineHeight: '18px',
                    }}
                  >{`${
                    emergencyData?.emergencyContactName || `N/A`
                  } -`}</Typography>
                </div>
                <div>
                  <Typography
                    style={{
                      fontSize: 12,
                      fontWeight: 500,
                      lineHeight: '18px',
                    }}
                  >{`${
                    emergencyData?.emergencyContactNo || `N/A`
                  } `}</Typography>
                </div>
                <div>
                  <Typography
                    style={{
                      fontSize: 12,
                      fontWeight: 500,
                      lineHeight: '18px',
                    }}
                  >{`${
                    emergencyData?.patientRelationCode==='emergency_contact_relation_other'?emergencyData?.patientRelationOther: emergencyData?.patientRelation?.name  || `N/A`
                  } `}</Typography>
                </div>
              </div>
              {/* <div
                style={{
                  border: `1px solid ${
                    emergencyData?.status?.colorCode || palette.border.main
                  }`,
                  borderRadius: 3.89,
                  padding: '5px 22px',
                }}
              >
                <Typography
                  color={emergencyData?.status?.colorCode}
                  style={{ fontSize: 12, fontWeight: 400, lineHeight: '18px' }}
                >
                  {emergencyData?.isActive || 'Unkown'}
                </Typography>
              </div> */}
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              {loading && <CircularProgress size={20} />}
              <IconButton
                onClick={setEditMode}
                style={{
                  backgroundColor: 'unset',
                  border: 'none',
                  padding: '0px',
                }}
              >
                <img
                  src={edit}
                  alt="edit"
                  style={{ width: '24px', height: '24px' }}
                />
              </IconButton>
              <IconButton
                onClick={deleteDialogBox}
                style={{
                  backgroundColor: 'unset',
                  border: 'none',
                  padding: '0px',
                }}
              >
                <img
                  src={del}
                  alt="del"
                  style={{ width: '24px', height: '24px' }}
                />
              </IconButton>
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              padding: 12,
              border: `1px solid ${palette.border.main}`,
              borderRadius: 4,
            }}
          >
            <div>
              <Typography
                style={{ fontSize: 12, fontWeight: 500, lineHeight: '18px' }}
              >
                Details
              </Typography>
            </div>
            <div>
              <Typography
                color={palette.text.secondary}
                style={{
                  fontSize: 12,
                  fontWeight: 400,
                  lineHeight: '18px',
                  width: '80%',
                }}
              >
                {emergencyData?.description || 'N/A'}
              </Typography>
            </div>
            <div>
              <Typography
                style={{ fontSize: 12, fontWeight: 500, lineHeight: '18px' }}
              >
                Address
              </Typography>
            </div>
            <div>
              <Typography
                color={palette.text.secondary}
                style={{
                  fontSize: 12,
                  fontWeight: 400,
                  lineHeight: '18px',
                  width: '80%',
                }}
              >
                {getAddress(emergencyData)  || 'N/A'}
              </Typography>
            </div>
          </div>
        </div>
      )}
      <AlertDialog
        open={open}
        content="Are you sure you want to delete?"
        actions={dialogActions}
      />
    </>
  );
};

export default EmergencyContactRendrer;
