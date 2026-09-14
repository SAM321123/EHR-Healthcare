import React, { useEffect, useState } from "react";
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { Card, CardContent, Divider, Link, Chip, Button, Stack } from '@mui/material';
import Container from "src/components/Container";
import Typography from "src/components/Typography";
import { convertWithTimezone } from "src/lib/utils";
import { GET_SUBSCRIPTION_DATA } from "src/store/types";
import { API_URL, REQUEST_METHOD } from "src/api/constants";
import useCRUD from "src/hooks/useCRUD";
import { dateFormats } from "src/lib/constants";
import { AddCircle } from "@mui/icons-material";
import ModalComponent from 'src/components/modal';
import CreateSubscription from './createSubscriptionForm';

const TrialSubscription = () => {
    const [data, setData] = useState ({});
    const [getSubscriptionResponse, ,getSubscriptionLoading ,getSubscription, clearSubscription] = useCRUD({
        id: GET_SUBSCRIPTION_DATA,
        url: `${API_URL.clinic}/subscription-data`,
        type: REQUEST_METHOD.get,
    });


    useEffect(()=>{
        if(getSubscriptionResponse)
            setData(getSubscriptionResponse?.data)
    }, [getSubscriptionResponse])

    const [createSubscription, setCreateSubscription] = useState(false);

    const handleCreate = () => {
        setCreateSubscription(true);
    }
    const closeCreateSubscriptionModal = () => {
        setCreateSubscription(false);
    }


    return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 6 }} loading={getSubscriptionLoading}>
        <Card
            elevation={6}
            sx={{
                borderRadius: 4,
                overflow: 'hidden',
                background: 'linear-gradient(180deg, #f9fafb 0%, #ffffff 100%)',
                p: 3,
            }}
        >
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
                    <Typography variant="h5" fontWeight={700} color="primary">
                        Subscription Overview
                    </Typography>

                    <Chip
                        label={!getSubscriptionResponse?.isTrialPeriodOver ? "Trial" : "Trial Period is Over"}
                        color={!getSubscriptionResponse?.isTrialPeriodOver ? "warning" : "error"}
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

                <Grid container spacing={3}>
                    <Grid item xs={6}>
                        <Typography fontWeight={600} color="text.secondary">
                        Trial Start Date
                        </Typography>
                        <Typography>
                        {convertWithTimezone(data?.startDate, { format: dateFormats.YYYYMMDD }) || 'N/A'}
                        </Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography fontWeight={600} color="text.secondary">
                        Trial End Date
                        </Typography>
                        <Typography>
                        {convertWithTimezone(data?.endDate, { format: dateFormats.YYYYMMDD }) || 'N/A'}
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
                        <Typography variant="body2">{data?.practitionerCount -1 || 0}</Typography>
                    </Grid>


                    <Grid item xs={6}>
                        <Typography fontWeight={600} color="text.secondary">
                            Prescriber Add-on ($37.99)
                        </Typography>
                        <Typography variant="body2">{data?.prescriberCount || 0}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                        <Typography fontWeight={600} color="text.secondary">
                            RN/ Medical Assistant Count ($25.00)
                        </Typography>
                        <Typography variant="body2">{data?.rnCount || 0}</Typography>
                    </Grid>

                </Grid>

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
                        {/* ${data?.cost|| 'N/A'} */}
                         {data?.cost !== undefined && data?.cost !== null
                           ? `$${Number(data.cost).toFixed(2)}`
                           : 'N/A'}
                    </Typography>
                    </Box>
                </Box>

                <Box sx={{ mt: 4 }}>
                <Card
                    variant="outlined"
                    sx={{
                    borderRadius: 2,
                    flex: 1,
                    opacity: 1, // greyed out in trial
                    backgroundColor: "inherit",
                    pointerEvents: "auto", // disable clicks
                    }}
                >
                    <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Upgrade Subscription
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        To continue accessing all features without interruption, please upgrade to a paid subscription.
                    </Typography>

                    <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                        <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddCircle />}
                        onClick={handleCreate}
                        // disabled={!getSubscriptionResponse?.isTrialPeriodOver} // safety check
                        >
                        Upgrade
                        </Button>
                    </Stack>
                    </CardContent>
                </Card>
                {!getSubscriptionResponse?.isTrialPeriodOver && (
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 2, textAlign: "center", fontStyle: "italic" }}
                    >
                        🚧 You are currently on a free trial until{" "}
                        <strong>
                        {convertWithTimezone(getSubscriptionResponse?.trialEndDate, {
                            format: dateFormats.MMMDDYYYY,
                        })}
                        </strong>.
                        <br />
                        Once you upgrade your subscription, the number of staff you add will be reflected in your plan, and the corresponding billing amount will be charged immediately. Please add staff carefully to avoid unnecessary charges.
                    </Typography>
                )}
                </Box>
                {createSubscription && (
                    <ModalComponent
                        open={createSubscription}
                        header={{
                        title: 'Create Subscription',
                        closeIconAction: closeCreateSubscriptionModal,
                        }}
                    >
                        <CreateSubscription
                            practitionerCount={data?.practitionerCount || 1}
                            rnCount={data?.rnCount || 0}
                            prescriberCount={data?.prescriberCount || 0}
                            closeCreateSubscriptionModal={closeCreateSubscriptionModal} 
                            getSubscription={getSubscription}
                            cost={data?.cost || 0}
                            isTrial={true}
                        />
                    </ModalComponent>
                )}
            </CardContent>
        </Card>
    </Container>
    );

}

export default TrialSubscription