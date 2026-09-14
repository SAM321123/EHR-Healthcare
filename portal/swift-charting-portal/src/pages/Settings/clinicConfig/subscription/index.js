import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { useForm } from 'react-hook-form';
import useCRUD from 'src/hooks/useCRUD';
import { FORGOT_PASSWORD, TEMP_PRACTICE, CREATE_SUBSCRIPTION, GET_SUBSCRIPTION } from 'src/store/types';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import CustomForm from 'src/components/form';
import { maxLength, regEmail, regexCardExpiry, regexCommonText, regexDomain, requiredField, successMessage } from 'src/lib/constants';
import { convertWithTimezone, showSnackbar } from 'src/lib/utils';
import LoadingButton from 'src/components/CustomButton/loadingButton';
import Typography from 'src/components/Typography';
import palette from 'src/theme/palette';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { navigateTo, UI_ROUTES } from 'src/lib/routeConstants';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { decrypt, encrypt } from 'src/lib/encryption';
import { Card, CardContent, Divider, Link, Chip, Button, Stack } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import { get, isEmpty } from 'lodash';
import ModalComponent from 'src/components/modal';
import CardActions from '@mui/material/CardActions';
import Esignature from 'src/components/E-Signature';
import AlertDialog from 'src/components/AlertDialog';
import Accordion from 'src/components/Accordion';
import { dateFormats } from 'src/lib/constants';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import Container from 'src/components/Container';
import useAuthenticatedUser from 'src/hooks/useAuthenticatedUser';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { PlayArrow, Stop, Cancel, AddCircle } from "@mui/icons-material";
import CreateSubscription from './createSubscriptionForm';

const Subscription = () => {
  const form = useForm({ mode: 'onChange' });
  const params = useParams();
  const { handleSubmit, register, setValue } = form;
  const navigate = useNavigate();
  const [subscriptionStatus, setSubscriptionStatus] = useState(false);
  const [activateSubscription, setActivateSubscription] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [subscriptionUpdate, setSubscriptionUpdate] = useState(false);
  const [createSubscription, setCreateSubscription] = useState(false);
  const [cancelSubscription, setCancelSubscription] = useState(false);

  const userData = useAuthenticatedUser();

  const [getSubscriptionData, ,getSubscriptionLoading ,getSubscription, clearSubscription] = useCRUD({
    id: GET_SUBSCRIPTION,
    url: `${API_URL.clinic}/subscription`,
    type: REQUEST_METHOD.get,
    subscribeSocket: true,
  });

  const [response, , loading, callSubscriptionFormAPI, clearData] = useCRUD({
    id: CREATE_SUBSCRIPTION,
    url: `${API_URL.clinic}/subscription/${userData?.tenantId}`,
    type: REQUEST_METHOD.update,
  });
    
  // let getSubscriptionResponse = getSubscriptionData?.results || {};
  let getSubscriptionResponse = getSubscriptionData?.subscription?.results || {};
  const {history} = getSubscriptionData || {};

  useEffect(() => {
    getSubscription({id: userData?.tenantId });
  }, []);

  useEffect(() => {
    if (!isEmpty(getSubscriptionResponse)) {
      setSubscriptionData(getSubscriptionResponse);
    }
  }, [getSubscriptionResponse]);


  useEffect(() => {
    if (!isEmpty(response)) {
      showSnackbar({
        message: successMessage.update,
        severity: 'success',
      });
      window.location.reload();
      clearData(true);
      getSubscription({id: userData?.tenantId });
      setSubscriptionStatus(false)
      setSubscriptionUpdate(true);
    }
  }, [response, clearData]);

  const handleUpdateStatus = useCallback(async () => {
    try {
      await callSubscriptionFormAPI({
        data: { isActive: activateSubscription }
      });
    } catch (error) {
      console.error('Failed to update subscription', error);
    }
  }, [activateSubscription]);

  const handleCancelSubscription = useCallback(async () => {
    try {
      await callSubscriptionFormAPI({
        data: { isCancel: true }
      });
      setCancelSubscription(false);
    } catch (error) {
      console.error('Failed to cancel subscription', error);
    }
  }, []);


  const statusAction = useMemo(
    () => [
      {
        title: 'Cancel',
        action: () => setSubscriptionStatus(false),
        // actionStyle: { color: palette.common.black, padding: '8px' },
        variant: 'outlinedSecondary',
      },
      {
        title: 'Confirm',
        action: handleUpdateStatus,
        variant: "contained",
        // actionStyle: { color: palette.primary.main, padding: '8px' },
      },
    ],
    [handleUpdateStatus]
  );

  const cancelAction = useMemo(
    () => [
      {
        title: 'Cancel',
        action: () => setCancelSubscription(false),
        // actionStyle: { color: palette.common.black, padding: '8px' },
        variant: 'outlinedSecondary',
      },
      {
        title: 'Confirm',
        action: handleCancelSubscription,
        variant: "contained",
        // actionStyle: { color: palette.primary.main, padding: '8px' },
      },
    ],
    [handleCancelSubscription]
  );

  const handleDeactivate = () => {
    setSubscriptionStatus(true);
  }
  const handleCancel = () => {
    setCancelSubscription(true);
  }
  const handleActivate = () => {
    setActivateSubscription(true);
    setSubscriptionStatus(true);
  }
  const handleCreate = () => {
    setCreateSubscription(true);
  }
  const closeCreateSubscriptionModal = () => {
    setCreateSubscription(false);
  }
  const today = new Date();

  let subscriptionLabel = "Inactive";

  if (subscriptionData?.endDate && today > new Date(subscriptionData?.endDate) && getSubscriptionResponse?.isCancel) {
    subscriptionLabel = "Canceled";
  } else if (getSubscriptionResponse?.isCancel) {
    subscriptionLabel = "Will deactivate at cycle end";
  } else if (subscriptionData?.isActive) {
    subscriptionLabel = "Active";
  }

  const subscriptionColor = subscriptionData?.isCancel || !subscriptionData?.isActive
    ? "error"
    : "success";

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 6 }} loading ={getSubscriptionLoading}>
      <Card
        elevation={6}
        sx={{
          borderRadius: 4,
          overflow: 'hidden',
          background: 'linear-gradient(180deg, #f9fafb 0%, #ffffff 100%)',
          p: 3,
        }}
      >
  {/* Subscription Update Banner */}
  {/* {subscriptionUpdate && (
    <Box
      sx={{
        backgroundColor: '#e3f2fd',
        borderLeft: `4px solid ${palette.info.main}`,
        p: 2,
        borderRadius: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        mb: 3,
      }}
    >
      <AccessTimeIcon fontSize="small" sx={{ color: palette.info.main }} />
      <Typography variant="body2" fontWeight={600} color={palette.text.primary}>
        Changes may take a few moments to reflect.  
        Your payment details remain secure and processing is handled via Stripe.
      </Typography>
    </Box>
  )} */}

  <CardContent>
    {/* Header */}
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mb: 3,
      }}
    >
      {/* Left Side: Title */}
      <Typography variant="h5" fontWeight={700} color="primary">
        Subscription Overview
      </Typography>

      {/* Right Side: Status */}
      <Chip
        label={subscriptionLabel}
        color={subscriptionColor}
        variant="outlined"
        sx={{
          fontWeight: 600,
          fontSize: "14px",
          px: 1.5,
          py: 0.5,
          borderRadius: "8px",
        }}
      />
    </Box>


    <Divider sx={{ mb: 3 }} />

    {/* Details Grid */}
    <Grid container spacing={3}>
      <Grid item xs={6}>
        <Typography fontWeight={600} color="text.secondary">
          Subscription Start Date
        </Typography>
        <Typography>
          {convertWithTimezone(getSubscriptionResponse?.startDate, { format: dateFormats.YYYYMMDD }) || 'N/A'}
        </Typography>
      </Grid>
      <Grid item xs={6}>
        <Typography fontWeight={600} color="text.secondary">
          Subscription End Date
        </Typography>
        <Typography>
          {convertWithTimezone(subscriptionData?.endDate, { format: dateFormats.YYYYMMDD }) || 'N/A'}
        </Typography>
      </Grid>

      <Grid item xs={6}>
        <Typography fontWeight={600} color="text.secondary">
          Base Price ($99.00 + Clinic Admin)
        </Typography>
        <Typography variant="body2">1</Typography>
      </Grid>
      <Grid item xs={6}>
        <Typography fontWeight={600} color="text.secondary">
          Practitioner Count ($49.00)
        </Typography>
        <Typography variant="body2">{subscriptionData?.practitionerCount - 1 || 0}</Typography>
      </Grid>

      <Grid item xs={6}>
        <Typography fontWeight={600} color="text.secondary">
          Prescriber Add-on ($37.99)
        </Typography>
        <Typography variant="body2">{subscriptionData?.prescriberCount || 0}</Typography>
      </Grid>
      <Grid item xs={6}>
        <Typography fontWeight={600} color="text.secondary">
          RN/ Medical Assistant Count ($25.00)
        </Typography>
        <Typography variant="body2">{subscriptionData?.rnCount || 0}</Typography>
      </Grid>

      <Grid item xs={6}>
        <Typography fontWeight={600} color="text.secondary">
          Payment Method
        </Typography>
        <Box display="flex" alignItems="center" gap={1}>
          <CreditCardIcon fontSize="small" color="action" />
          <Typography variant="body1">
            Card (**** **** **** {subscriptionData?.cardNo || 'N/A'})
          </Typography>
        </Box>
      </Grid>
    </Grid>

    {/* Total Price */}
    <Divider sx={{ my: 3 }} />
    <Box display="flex" justifyContent="flex-end">
      <Box
        px={3}
        py={1.5}
        borderRadius={3}
        boxShadow={2}
        display="flex"
        alignItems="center"
        gap={2}
        bgcolor="#f4f6f8"
      >
        <Typography fontWeight={700}>Total Price:</Typography>
        <Typography variant="h6" color="primary" fontWeight={700}>
          {/* ${getSubscriptionResponse?.cost || 'N/A'} */}
          {getSubscriptionResponse?.cost != null
           ? `$${Number(getSubscriptionResponse.cost).toFixed(2)}`
            : 'N/A'}
        </Typography>
      </Box>

       {/* Next Invoice */}
          <Box
            px={3}
            py={1.5}
            ml={2}
            borderRadius={3}
            boxShadow={2}
            bgcolor="#fff4e5"
            display="flex"
            alignItems="center"
            gap={2}
          >
            <ReceiptLongIcon color="warning" />
            <Box>
              <Typography fontWeight={600} variant="body1" color="text.primary">
                Next Invoice
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {/* ${getSubscriptionResponse?.cost }  */}
                {getSubscriptionResponse?.cost != null
                  ? `$${Number(getSubscriptionResponse.cost).toFixed(2)}`
                  : 'N/A'}{" "}
                on{" "}
                {convertWithTimezone(getSubscriptionResponse?.endDate, {
                  format: dateFormats.MMMDDYYYY,
                })}
              </Typography>
            </Box>
          </Box>
    </Box>

    <Stack direction="row" spacing={3} sx={{ mt: 4 }}>
    {/* Activate / Deactivate */}
    {!getSubscriptionResponse?.isCancel && (
      <Card variant="outlined" sx={{ borderRadius: 2, flex: 1 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {getSubscriptionResponse?.isActive ? "Deactivate Subscription" : "Activate Subscription"}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {getSubscriptionResponse?.isActive
              ? "Deactivating will pause all subscription benefits. You can reactivate anytime."
              : "Activating will resume subscription benefits and allow access to features."}
          </Typography>
          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            {getSubscriptionResponse?.isActive ? (
              <Button
                variant="contained"
                color="error"
                startIcon={<Stop />}
                onClick={handleDeactivate}
              >
                Deactivate
              </Button>
            ) : (
              <Button
                variant="contained"
                color="success"
                startIcon={<PlayArrow />}
                onClick={handleActivate}
              >
                Activate
              </Button>
            )}
          </Stack>
        </CardContent>
      </Card>
    )}

      {/* Cancel / Create */}
      <Card variant="outlined" sx={{ borderRadius: 2, flex: 1 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {getSubscriptionResponse?.isCancel ? "Create Subscription" : "Cancel Subscription"}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {getSubscriptionResponse?.isCancel
              ? "Create a new subscription to start features."
              : "Cancelling will permanently stop billing and remove subscription access."}
          </Typography>
          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            {!getSubscriptionResponse?.isCancel ? (
              <Button
                variant="contained"
                color="error"
                startIcon={<Cancel />}
                onClick={handleCancel}
              >
                Cancel
              </Button>
            ) : (
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddCircle />}
                onClick={handleCreate}
              >
                Create
              </Button>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Stack>

    {history && history.length > 0 ? (
      <div>
        <Typography
          sx={{
            fontSize: '16px',
            my: '10px',
            fontWeight: 600,
            color: palette.background.main,
            mt: '50px'
          }}
        >
          Subscription History
        </Typography>

        {history
          .slice()
          .reverse()
          ?.map((group, groupIndex) => (
            <Accordion
              key={groupIndex}
              style={{
                backgroundColor: "#e3f2fd",
                borderRadius: "8px",
                marginBottom: "12px",
                padding: "6px 10px"
              }}
              textLabels={[
                {
                  type: "text",
                  label: (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        flexWrap: "wrap"
                      }}
                    >
                      {/* Date Range */}
                      <Typography
                        sx={{ fontWeight: 600, fontSize: "14px", color: "#222" }}
                      >
                        {convertWithTimezone(group[0].startDate, {
                          format: dateFormats.MMMDDYYYY,
                        })} –{" "}
                        {convertWithTimezone(group[0].endDate, {
                          format: dateFormats.MMMDDYYYY,
                        })}
                      </Typography>

                      {/* Record Count */}
                      {group.length > 1 && (
                        <Chip
                          label={`${group.length} records`}
                          size="small"
                          sx={{ fontSize: "12px", fontWeight: 500, bgcolor: "#fff" }}
                        />
                      )}

                      {/* Subscription ID */}
                      <Chip
                        label={`ID: ${group[0]?.subscriptionId || "N/A"}`}
                        size="small"
                        sx={{ fontSize: "12px", fontWeight: 500, bgcolor: "#fff" }}
                      />
                    </div>
                  ),
                },
              ]}
            >
              <div style={{ padding: "10px" }}>
                {group
                .slice()
                .reverse()                
                ?.map((item, idx) => (
                  <Card
                    key={item.id || idx}
                    sx={{
                      mb: 2,
                      p: 2,
                      borderRadius: 3,
                      boxShadow: "0 3px 8px rgba(0,0,0,0.12)",
                      backgroundColor: "#ffffff",
                    }}
                  >
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography sx={{ fontSize: 14, color: "#444" }}>
                          <strong> Subscription updatedAt:{" "}</strong> {convertWithTimezone(item.createdAt, {
                              format: dateFormats.MMMDDYYYYHHMMSS,
                            })}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography sx={{ fontSize: 14, color: "#444" }}>
                          <strong>Subscription Status:</strong>
                          <Chip
                             label={
                              item?.isCancel
                                ? "Canceled"
                                : item?.isActive
                                ? "Active"
                                : "Inactive"
                            }
                            color={
                              item?.isCancel
                                ? "error"
                                : item?.isActive
                                ? "success"
                                : "error"
                            }
                            variant="filled"
                            size="small"
                            sx={{ fontWeight: 500, ml: 1 }}
                            />
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography sx={{ fontSize: 14, color: "#444" }}>
                          <strong> Base Price ($99.00 + Clinic Admin):</strong> {1}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography sx={{ fontSize: 14, color: "#444" }}>
                          <strong>Practitioner Count:</strong> {item?.practitionerCount -1 || 0}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography sx={{ fontSize: 14, color: "#444" }}>
                          <strong>RN/Medical Assistant:</strong> {item?.rnCount || 0}
                        </Typography>
                      </Grid>

                      <Grid item xs={6}>
                        <Typography sx={{ fontSize: 14, color: "#444" }}>
                          <strong>Add-on Prescribers:</strong> {item?.prescriberCount || 0}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography sx={{ fontSize: 14, color: "#444" }}>
                          <strong>Price:</strong> ${item?.cost || 0}
                        </Typography>
                      </Grid>

                    </Grid>
                  </Card>
                ))}

              </div>
            </Accordion>
          ))}
      </div>
    ) : null}

  </CardContent>
</Card>

      <AlertDialog
        open={subscriptionStatus}
        boxStyle={{maxWidth:'100000px',width:'100%'}}
        content={
        <>
          <Typography
            variant="body2"
            style={{
            fontStyle: 'italic',
            color: 'gray',
            marginTop: '10px',
            }}
          >
            Are you sure you want to{' '}
            <span style={{ color: activateSubscription ? 'green' : 'red', fontWeight: 'bold' }}>
            {activateSubscription ? 'Activate' : 'Deactivate'}
            </span> this Subscription ?
          </Typography>
       </>
      }
      actions={statusAction}
    />
    <AlertDialog
      open={cancelSubscription}
      boxStyle={{maxWidth:'100000px',width:'100%'}}
      content={
      <>
        <Typography
          variant="body2"
          style={{
          fontStyle: 'italic',
          color: 'gray',
          marginTop: '10px',
          }}
        >
          Are you sure you want to{' '}
          <span style={{ color: 'red', fontWeight: 'bold' }}>
          Cancel
          </span> this Subscription ?
        </Typography>
      </>
      }
      actions={cancelAction}
    />
    {createSubscription && (
      <ModalComponent
        open={createSubscription}
        header={{
          title: 'Create Subscription',
          closeIconAction: closeCreateSubscriptionModal,
        }}
      >
        <CreateSubscription
          practitionerCount={subscriptionData?.practitionerCount || 0}
          rnCount={subscriptionData?.rnCount || 0}
          prescriberCount={subscriptionData?.prescriberCount || 0}
          closeCreateSubscriptionModal={closeCreateSubscriptionModal} 
          getSubscription={getSubscription}
          cost={subscriptionData?.cost || 0}
        />
      </ModalComponent>
    )}
    </Container>
  );

}


export default Subscription;
