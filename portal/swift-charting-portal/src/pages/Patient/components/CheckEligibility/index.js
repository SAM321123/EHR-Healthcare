/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useCallback, useEffect, useState } from 'react';
import { Card, Typography, Button, Link, Grid, CardContent, Tooltip } from '@mui/material';
import palette from 'src/theme/palette';
import useCRUD from 'src/hooks/useCRUD';
import { UI_ROUTES } from 'src/lib/routeConstants';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import { useNavigate, generatePath, useParams } from 'react-router-dom';
import ModalComponent from 'src/components/modal';
import CheckEligibilityData from './checkEligibilityData';
import ParseX12Data from '../EligibilityCheckHistory/Parser/parserX12';
import { Cancel, CheckCircle, Visibility } from '@mui/icons-material';
import { green, red } from '@mui/material/colors';
import ViewHistoryResultData from '../EligibilityCheckHistory/historyResult';
import { findX12Details } from 'src/utils/decryption/X12Parser';
import { dateFormatter, showSnackbar } from 'src/lib/utils';

export const CheckEligibility = ({ patientId }) => {
  const [openModal , setOpenModal] = useState(false);
  const [defaultData, setDefaultData] = useState([]);
  const [openResultModal , setOpenResultModal] = useState(false);
  const [ediResponseData , setEdiResponseData] = useState();
  const [insurance, , , getAllInsurance] = useCRUD({
    id: `paitnet-insurance-${patientId}`,
    url: API_URL.insurance,
    type: REQUEST_METHOD.get,
  });
  
  const closeOpenModal = useCallback(() => {
    setOpenModal(false);
    getAllInsurance({patientId});
  }, []);
  useEffect(() => {
    getAllInsurance({patientId});
  }, [patientId]);

  const navigate = useNavigate();
  const params = useParams();


  const checkEligibility = (insuranceId) => {
    setDefaultData({insuranceId,patientId})
    setOpenModal(true);
  }
  const onAllClick = () => {
    navigate(
      generatePath(UI_ROUTES.eligibilityCheckHistory, {
        ...params,
      })
    );
  };
  const closeOpenResultModal = useCallback(() => {
    // clear(true);
    setOpenResultModal(false);
  }, []);
 
 
  const handleClick = (value) => {
    if (!value) {
      showSnackbar({
        message: 'No eligibility result is available yet. Please run Check Eligibility first.',
        severity: 'info',
      });
      return;
    }

    setEdiResponseData(value)
    setOpenResultModal(true)
  };
  return (
    <Card
      style={{
        border: '1px solid #E8E8E8',
        margin: '1em 2em',
      }}
    >
      <CardContent>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography
            style={{
              fontSize: '16px',
              fontWeight: 600,
              lineHeight: '20px',
              color: palette.text.dark,
            }}
          >
            Insurance
          </Typography>
          <Link
            onClick={onAllClick}
            style={{
              fontSize: '12px',
              fontWeight: 600,
              lineHeight: '20px',
              color: palette.background.main,
              cursor: 'pointer',
            }}
          >
            View Results
          </Link>
        </div>
        {insurance?.results?.slice().reverse().map((item,index) => {
          const result = item?.eligibilityData?.[0]?.ediResponse ? ParseX12Data(item.eligibilityData[0].ediResponse) : null;
          const errorDetails = findX12Details(result,"AAA_");
          const expireDetails = findX12Details(result,"DTP03_DateTimePeriod");
          return (

          <div style={{ marginTop: '2em' }}>
            <Grid container>
              <Grid item md={5}>
                <Typography
                  style={{
                    color: palette.text.offWhite,
                    fontSize: 14,
                    lineHeight: '20px',
                    fontWeight: 400,
                  }}
                >
               <p><b>Insurance Type: </b>  {index ===0 ? "Primary" : "Secondary"} </p>
               <p><b>Patient Name: </b> {item?.lastName} {item?.firstName} </p>
               <p><b>Group Name: </b> {item?.groupName} , {item?.groupNumber} </p>
               <p><b>Payer Name/Code: </b>  {item?.eligibilityCheckPayerData?.payerName} </p>
              </Typography>
              </Grid>
              <Grid item md={3}>
                <Button
            onClick={() => checkEligibility(item?.id)} // Wrap in an arrow function
            size="small"
                  variant="outlined"
                >
                  Check Eligibility
                </Button>
                
  {(errorDetails && errorDetails.length > 0) || !(expireDetails && expireDetails.length > 0) ? (
                <><div> Not Eligibile</div></>
              ): 
              <><div>
              {expireDetails && expireDetails.length > 0 ? (
  (() => {
    const [startDate, endDate] = expireDetails[0]?.split("-"); // Access the first element and split it
    return <p>Insurance Date: {dateFormatter(startDate,'MM/DD/YYYY')} - {dateFormatter(endDate,'MM/DD/YYYY')}</p>;
  })()
) : (
  ""
)}
              </div></>
              }
              </Grid>
              <Grid item md={2}>
              <p></p>
              <div>
  {errorDetails && errorDetails.length > 0 ? (
    <Tooltip title="Not Eligible">
      <Cancel sx={{ color: red[500], fontSize: 20 }} />
    </Tooltip>
  ) : expireDetails && expireDetails.length > 0 ? (
    <Tooltip title="Eligible">
      <CheckCircle sx={{ color: green[500], fontSize: 20 }} />
    </Tooltip>
  ) : (
    <Tooltip title="Not Eligible">
      <Cancel sx={{ color: red[500], fontSize: 20 }} />
    </Tooltip>
  )}

  <Tooltip title={item?.eligibilityData?.[0]?.ediResponse ? "View Details" : "No eligibility result available yet"}>
    <Visibility
      onClick={() =>
        handleClick(
          item?.eligibilityData?.[0]?.ediResponse
            ? item.eligibilityData[0].ediResponse
            : null
        )
      }
      sx={{ fontSize: 20 }}
    />
  </Tooltip>
</div>

              </Grid>
            </Grid>
          </div>
          )
        })}
      </CardContent>
      {openModal && (
        <ModalComponent
          open={openModal}
          header={{
            title: defaultData ? 'Check Eligibilty' :'Check Eligibilty',
            closeIconAction: closeOpenModal,
          }}
          modalStyle={{ minWidth: '450px' }} // Add minWidth style
          >
          <CheckEligibilityData
            checkModalCloseAction={closeOpenModal}
            refetchData={getAllInsurance}
            patientId={patientId}
            defaultData={defaultData} 
            fromMain={true}
          />

        </ModalComponent>
      )}

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
            defaultData={ediResponseData} 
            fromMain={true}
          />

        </ModalComponent>
      )}
    </Card>
  );
};
