import Box from '@mui/material/Box';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import isEmpty from 'lodash/isEmpty';
import { useForm } from 'react-hook-form';
 
import LoadingButton from 'src/components/CustomButton/loadingButton';
import CustomForm from 'src/components/form';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import { CHECK_ELIGIBILITY, SAVE_MASTER_DATA } from 'src/store/types';
import useCRUD from 'src/hooks/useCRUD';
import {
  getUpdatedFieldsValues,
  showSnackbar,
} from 'src/lib/utils';
import ParseX12Data from '../EligibilityCheckHistory/Parser/parserX12';
import ModalComponent from 'src/components/modal';
import ViewHistoryResultData from '../EligibilityCheckHistory/historyResult';

const CheckEligibilityData = ({
  checkModalCloseAction = () => {},
  refetchData,
  patientId,
  defaultData,
}) => {
  const form = useForm({ mode: 'onChange' });
  const { handleSubmit, watch } = form;
  const [masterFormGroups, setMasterFormGroups] = useState();
  const [openResultModal , setOpenResultModal] = useState(false);


  const [res, , load, checkEligibilityAPI, clear] = useCRUD({
    id: CHECK_ELIGIBILITY,
    url: API_URL.eligibilityCheck,
    type: REQUEST_METHOD.post,
  });
  useEffect(() => {
    if (!isEmpty(res)) {
      if(res?.status===false)
      {
        showSnackbar({
          message: res?.msg,
          severity: 'error',
        });
        clear(true);
      }
      else
      {
      showSnackbar({
        message: res?.msg,
        severity: 'success',
      });
      if(res?.data)
      {
      const pasredResult =ParseX12Data(res?.data);
      setOpenResultModal(true);
      }
      //checkModalCloseAction();
    }
    }
  }, [refetchData, res]);
  
  const onHandleSubmit = useCallback(
    (data) => {
      checkEligibilityAPI({ data });
    },
    [checkEligibilityAPI]
  );


  const closeOpenResultModal = useCallback(() => {
    clear(true);
   // refetchData();
    setOpenResultModal(false);
    checkModalCloseAction();
  }, [checkModalCloseAction, clear]);
  useEffect(() => {
    // const newMasterFormGroups = [
    //   {
    //     ...WiredStaffField({
    //       name: 'primaryProviderId',
    //       label:"Select Provider",
    //       colSpan:2,
    //       placeholder:'Select',
    //       required: requiredField,
    //     }),
    //   },
    
    // ];

   

    //setMasterFormGroups(newMasterFormGroups);
  }, []);
 
  return (
    <Box>
      <CardContent>
        <CustomForm
          form={form}
          formGroups={masterFormGroups}
          columnsPerRow={2}
          defaultValue={isEmpty(defaultData) ? {} : defaultData}
        />
        <div id="DataResult" 
        style={{
        margin: '2em 0em',
      }}>Click the submit button to check the Insurance Eligibility!</div>
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
          onClick={checkModalCloseAction}
          label="Cancel"
        />
        <LoadingButton
          loading={load}
          onClick={handleSubmit(onHandleSubmit)}
          label="Save"
        />
      </CardActions>

      {openResultModal && (
        <ModalComponent
          open={openResultModal}
          header={{
            title: defaultData ? 'Check Eligibilty' :'Check Eligibilty',
            closeIconAction: closeOpenResultModal,
          }}
          modalStyle={{ minWidth: '450px' }} // Add minWidth style
          >
          <ViewHistoryResultData
            modalCloseAction={closeOpenResultModal}
            //refetchData={handleOnFetchDataList}
            defaultData={res?.data} 
            fromMain={true}
          />

        </ModalComponent>
      )}
    </Box>
  );
};
 
export default CheckEligibilityData;
 