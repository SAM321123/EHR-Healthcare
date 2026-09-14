import { Navigate, useRoutes } from 'react-router-dom';
// layouts
import { useEffect } from 'react';
import { DashboardLayout } from './layouts/dashboard';
import { SimpleLayout } from './layouts/simple';
//
import LoginPage from './pages/LoginPage';
import Page404 from './pages/Page404';
import Account from './pages/Account/Account';
import SignUp from './pages/SignUp';
import ResetPasswordPage from './pages/RessetPasswordPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import Bookings from './pages/Booking';
import BookingSettingContainer from './pages/BookingSetting';
import WaitingRoom from './pages/VideoCall';
import PatientList from './pages/Patient';
import Invoice from './pages/Invoice';
import Message from './pages/Message/Message';
import Fax from './pages/Fax';
import LabRadiologyList from './pages/LabRadiology';
// import LabRadiologyResultList from './pages/LabRadiologyResult';
import LabRadiologyResultList from './pages/LabRadiology/labReport';
import LabRequest from './pages/LabRadiology/labRequest';
import Staff from './pages/Staff';
import AnalyticsReporting from './pages/AnalyticsReporting';

////////////////////////// PATIENT PORTAL IMPORTS/////////////
import Dashboard from './pages/PatientPortal/Dashboard';
import Appointment from './pages/PatientPortal/Appointments';
import Forms from './pages/PatientPortal/Forms';
import Medication from './pages/PatientPortal/Medications';
import MedicationView from './pages/PatientPortal/Medications/medicationView';
import LabRadiology from './pages/PatientPortal/LabRadiology';
import PatientLabReport from './pages/PatientPortal/LabRadiology/labReport';
import PatientLabRequestData from './pages/PatientPortal/LabRadiology/labRequest';
import PatientFormList from './pages/PatientPortal/Forms';
import PublicFormPage from './pages/PatientPortal/Forms/PublicFormPage';
import PublicConsentFormPage from './pages/PatientPortal/Forms/PublicConsentFormPage';
///////////////////////////////////////////////////////////////
import EligibilityCheckHistory from './pages/Patient/components/EligibilityCheckHistory';

// import DashboardAppPage from './pages/DashboardAppPage';
// import Forms from './pages/Forms';
// import Payment from './pages/Payment';
// import AppointmentHistory from './pages/AppointmentHistory';
// import BookingForm from './pages/Booking/BookingForm';
// import BookingSlots from './pages/Booking/BookingSlots';
// import AddClinic from './pages/admin/AddClinic';
// import Teams from './pages/Team';
// import AddTeamMember from './pages/Team/AddTeamMember';
// import MasterFormPage from './pages/Masters/masterForm';
// import AddPateint from './pages/Patient/AddPatient';

import { UI_ROUTES } from './lib/routeConstants';
import { roleTypes } from './lib/constants';
import BookingPortal from './pages/PatientPortal';
import PatientAppointmentList from './pages/Patient/components/Appointment';
import PatientNotes from './pages/Patient/components/Comments';
import { getUserRole } from './lib/utils';
import Order from './pages/Order';
import Home from './pages/Patient/components/Home/Home';
import Clinic from './pages/Clinic';
import ClinicAdmin from './pages/Clinic/ClinicAdmin';
import GraphTracking from './pages/Patient/components/ActivityLogs/GraphTracking';
import EndCall from './pages/VideoCall/Components/EndCall';
import OpenTalkVideoRoom from './pages/VideoCall/OpenTalk/OpenTalkVideoRoom';
import useAuthUser from './hooks/useAuthUser';
import ChatLists from './pages/Chat';
import EPrescription from './pages/PatientPortal/EPrescription';
import FormHome from './pages/FormBuilder/MyFormsTabs';
import FormTabsShared from './pages/SharedForms/FormTabsShared';
// import PatientFormList from './pages/PatientPortal/Forms';
import DashboardHome from './pages/SuperAdminDashboard/DashboardHome';
import Masters from './pages/Masters';
import AppointmentsBoard from './pages/AppointmentsBoard';
import ClinicMedInstructionList from './pages/MedInstrcution';
import ClientHome from './pages/Home';
import Page404Section from './pages/Page404Section';
import FormBuilderPDF from './pages/FormBuilder/PDF';
import SettingsTab from './pages/Settings/SettingsTab';
import Encounter from './pages/Encounter';
import FormLibraryPDF from './pages/FormBuilder/FromLibraryPdf';
import AddStaff from './pages/Staff/addStaff';
import BookingSettings from './pages/BookingSettings';
import PatientAllergiesList from './pages/PatientPortal/Allergies';
import ZoomSessionScreen from './pages/ZoomSession';
import { isEmpty } from 'lodash';
import MedicalBilling from './pages/MedicalBilling';
import { API_URL, MODULE, REQUEST_METHOD } from './api/constants';
import useCRUD from './hooks/useCRUD';
import { AUTHENTICATE_USER, GET_SUBSCRIPTION_DATA } from './store/types';
// import FormLink from './pages/Settings/FormLink';
/////////////////SUPER ADMIN PORTAL///////////////////
import SuperAdminLogin from './pages/SuperAdminLoginPage';
import useLoggedInUser from './hooks/useLoggedInUser';
import useAuthenticatedUser from './hooks/useAuthenticatedUser';
/////////////////////////////////////////////////////
//////////////////PRACTICE REGISTRATION//////////////
import PracticeRegisterationPage from './pages/PracticeRegistrationPage';
import PracticeRegisterationVerifyEmailPage from './pages/PracticeVerifyEmail';
import EmailVerificationPage from './pages/EmailVerificationPage';
import GeneratePasswordPage from './pages/generatePasswordPage';
import PracticeMembershipPage from './pages/PracticeMembershipPage';
/////////////////////////////////////////////////////
//////////////////////SUBSCRIPTION////////////////////////////////////
import Subscription from './pages/Subscription';
import SubscriptionNotExists from './pages/subscriptionNotExistsPage';
import SubscriptionCancel from './pages/subscriptionCancelPage';
import SubscriptionTrialOver from './pages/subscriptionTrialOverPage';
import LoginActivity from './pages/LoginActivity';
import ClinicStaff from './pages/admin/clinicStaff';
import ClinicAppointment from './pages/admin/clinicAppointment';
import ClinicEmailLogs from './pages/admin/emailAudit';
import ClinicCronLogs from './pages/admin/cronLogs';
import SuperAdminEmailCampaign from './pages/SuperAdminEmailCampaign';
import FormLink from './pages/Settings/prospectRegistration/FormLink';
import OnlineBookingRegistration from './pages/OnlineBookingRegistration';
import Loader from './components/Loader';

///////////////////////////////////////////////////////////

// ----------------------------------------------------------------------

const allRoute = [
  { path: UI_ROUTES.accounts, element: <Account /> },
  { path: UI_ROUTES.booking, element: <Bookings /> },
  { path: UI_ROUTES.board, element: <AppointmentsBoard /> },
  { path: UI_ROUTES.clinics, element: <Clinic />, isNested: true },
  { path: UI_ROUTES.loginActivity, element: <LoginActivity /> },
  { path: UI_ROUTES.adminClinicStaff, element: <ClinicStaff /> },
  { path: UI_ROUTES.adminClinicAppointment, element: <ClinicAppointment /> },
  { path: UI_ROUTES.adminEmailLogs, element: <ClinicEmailLogs /> },
  { path: UI_ROUTES.adminCronLogs, element: <ClinicCronLogs /> },
  { path: UI_ROUTES.adminEmailCampaign, element: <SuperAdminEmailCampaign /> },

  {
    path: UI_ROUTES.clinic,
    element: <ClinicAdmin />,
    isNested: true,
  },
  { path: UI_ROUTES.masters, element: <Masters /> },
  {
    path: UI_ROUTES.bookingSetting,
    element: <BookingSettingContainer />,
  },
  {
    path: UI_ROUTES.patient,
    element: <PatientList />,
    isNested: true,
    moduleName: MODULE.patient,
  },
  {
    path: UI_ROUTES.appointment,
    element: <PatientAppointmentList />,
    moduleName: MODULE.paientAppointments,
  },
  { path: UI_ROUTES.invoice, element: <Invoice /> },
  {
    path: UI_ROUTES.messages,
    element: <Message />,
    moduleName: MODULE.messages,
  },
  {
    path: UI_ROUTES.singleChat,
    element: <Message />,
    moduleName: MODULE.messages,
  },
  {
    path: UI_ROUTES.singlePatientChat,
    element: <Message />,
    moduleName: MODULE.patientPortalMessages,
  },

  {
    path: UI_ROUTES.shared,
    element: <PatientFormList shared />,
    isNested: true,
  },
  { path: UI_ROUTES.fax, element: <Fax />, moduleName: MODULE.fax },
  { path: UI_ROUTES.files, element: <Message /> },
  { path: UI_ROUTES.chat, element: <ChatLists />, isNested: true },

  {
    path: UI_ROUTES.formBuilder,
    element: <FormHome />,
    moduleName: MODULE.formSettings,
  },
  // { path: UI_ROUTES.forms, element: <PatientFormList />, isNested: true },
  // { path: UI_ROUTES.order, element: <Order /> },
  // { path: UI_ROUTES.patientHome, element: <Home /> },
  // { path: UI_ROUTES.graphTracking, element: <GraphTracking /> },
  // { path: UI_ROUTES.prescription, element: <EPrescription />, isNested: true },
  // { path: UI_ROUTES.sharedForms, element: <FormTabsShared /> },
  // { path: UI_ROUTES.adminDashboard, element: <DashboardHome /> },
  // { path: UI_ROUTES.medInstruction, element: <ClinicMedInstructionList /> },

  {
    path: UI_ROUTES.scheduling,
    element: <Bookings />,
    moduleName: MODULE.appointments,
  },
  {
    path: UI_ROUTES.encounters,
    element: <Encounter />,
    isNested: true,
    moduleName: MODULE.encounters,
  },
  {
    path: UI_ROUTES.labRadiology,
    element: <LabRadiologyList />,
    moduleName: MODULE.labsRadiology,
  },
  {
    path: UI_ROUTES.medicalBilling,
    element: <MedicalBilling />,
    moduleName: MODULE.medicalBilling,
  },
  {
    path: UI_ROUTES.analyticsAndReporting,
    element: <AnalyticsReporting />,
    moduleName: MODULE.analyticsAndReport,
  },
  // { path: UI_ROUTES.messages, element: <Page404Section />, moduleName: MODULE.messages },
  {
    path: UI_ROUTES.alerts,
    element: <Page404Section />,
    moduleName: MODULE.alerts,
  },
  {
    path: UI_ROUTES.tasks,
    element: <Page404Section />,
    moduleName: MODULE.tasks,
  },
  {
    path: UI_ROUTES.systemSettings,
    element: <SettingsTab />,
    moduleName: MODULE.systemSettings,
  }, // setting
  { path: UI_ROUTES.adminDashboard, element: <DashboardHome /> },
  { path: UI_ROUTES.staff, element: <Staff />, moduleName: MODULE.staff },
  { path: UI_ROUTES.addStaff, element: <AddStaff />, moduleName: MODULE.staff },
  {
    path: UI_ROUTES.editStaff,
    element: <AddStaff />,
    moduleName: MODULE.staff,
  },
  {
    path: UI_ROUTES.labRadiologyResult,
    element: <LabRadiologyResultList />,
    moduleName: MODULE.labsRadiology,
  },
  {
    path: UI_ROUTES.labRequest,
    element: <LabRequest />,
    moduleName: MODULE.labsRadiology,
  },
  {
    path: UI_ROUTES.patientLabReport,
    element: <LabRadiologyResultList />,
    moduleName: MODULE.patientLabsRadiology,
  },
  {
    path: UI_ROUTES.patientLabRequest,
    element: <LabRequest />,
    moduleName: MODULE.patientLabsRadiology,
  },

  /////////////////////////////Booking setting route////////////////////
  {
    path: UI_ROUTES.bookingSettings,
    element: <BookingSettings />,
    moduleName: MODULE.appointments,
  },

  ////////////////////////PATIENT ROUTE/////////////////////////////
  { path: UI_ROUTES.patientDashboard, element: <Dashboard /> },
  {
    path: UI_ROUTES.patientMssages,
    element: <Message />,
    moduleName: MODULE.patientPortalMessages,
  },
  {
    path: UI_ROUTES.patientBooking,
    element: <Appointment />,
    moduleName: MODULE.patientPortalAppointment,
  },
  {
    path: UI_ROUTES.patientSharedForms,
    isNested: true,
    element: <Forms />,
    moduleName: MODULE.patientPortalSharedForms,
  },
  {
    path: UI_ROUTES.patientMedicationData,
    element: <Medication />,
    moduleName: MODULE.patientPortalMedication,
  },
  {
    path: UI_ROUTES.patientAllergyData,
    element: <PatientAllergiesList />,
    moduleName: MODULE.patientPortalAllergyData,
  },

  {
    path: UI_ROUTES.patientViewMedication,
    element: <MedicationView />,
    moduleName: MODULE.patientPortalMedication,
  },
  {
    path: UI_ROUTES.patientLabRadiologyData,
    element: <LabRadiology />,
    moduleName: MODULE.patientPortalLabRadiology,
  },
  {
    path: UI_ROUTES.patientLabRadiologyResultData,
    element: <PatientLabReport />,
    moduleName: MODULE.patientPortalLabRadiology,
  },
  {
    path: UI_ROUTES.patientLabRadiologyRequestData,
    element: <PatientLabRequestData />,
    moduleName: MODULE.patientPortalLabRadiology,
  },

  /////////////////////////////////////////////////////////////////

  //////////////////////////OFFICE ALLY ROUTES/////////////////////
  {
    path: UI_ROUTES.eligibilityCheckHistory,
    element: <EligibilityCheckHistory />,
    moduleName: MODULE.checkEligibility,
  },
  /////////////FORM LINKS ROUTES//////////////////////
  // {
  //   path: UI_ROUTES.formLink,
  //   element: <FormLink />,
  //   moduleName: MODULE.formLink,
  // },
  /////////////////////////////////////////////////////////////////

  ///////////////////////SUPER ADMIN ROUTES//////////////////////////////

  //////////////////////////////////////////////////////////////////////
  //////////////////////////SUBSCRIPTION////////////////////////////////
  { path: UI_ROUTES.subscription, element: <Subscription /> },
  //////////////////////////////////////////////////////////////////////
];

export const superAdminRoutes = [
  // UI_ROUTES.accounts,
  // UI_ROUTES.bookingSetting,
  UI_ROUTES.clinics,
  UI_ROUTES.loginActivity,
  UI_ROUTES.adminClinicStaff,
  UI_ROUTES.adminClinicAppointment,
  UI_ROUTES.adminEmailLogs,
  UI_ROUTES.adminCronLogs,
  UI_ROUTES.adminEmailCampaign,

  // UI_ROUTES.adminDashboard,
];
export const clinicAdminRoutes = [
  // UI_ROUTES.adminDashboard,
  // UI_ROUTES.accounts,
  // UI_ROUTES.bookingSetting,
  // UI_ROUTES.clinic,
  // UI_ROUTES.booking,
  // UI_ROUTES.patient,
  // UI_ROUTES.masters,
  // UI_ROUTES.fax,
  // UI_ROUTES.formBuilder,
  // UI_ROUTES.order,
  // UI_ROUTES.chat,
  // UI_ROUTES.sharedForms,
  // UI_ROUTES.graphTracking,
  // UI_ROUTES.board,
  // UI_ROUTES.medInstruction,
  // UI_ROUTES.adminDashboard,
  UI_ROUTES.formLink,
  UI_ROUTES.patient,

  UI_ROUTES.adminDashboard,
  UI_ROUTES.accounts,
  UI_ROUTES.scheduling,
  UI_ROUTES.encounters,
  UI_ROUTES.labRadiology,
  UI_ROUTES.medicalBilling,
  UI_ROUTES.analyticsAndReporting,
  UI_ROUTES.messages,
  UI_ROUTES.singleChat,
  UI_ROUTES.alerts,
  UI_ROUTES.tasks,
  UI_ROUTES.systemSettings,
  UI_ROUTES.formBuilder,
  UI_ROUTES.fax,
  UI_ROUTES.staff,
  UI_ROUTES.addStaff,
  UI_ROUTES.editStaff,
  UI_ROUTES.labRadiologyResult,
  UI_ROUTES.labRequest,
  UI_ROUTES.patientLabReport,
  UI_ROUTES.eligibilityCheckHistory,
  UI_ROUTES.subscription,
];
////////////////////////PATIENT ROUTES//////////////////////////////////
// export const patientUserRoutes = [
//   UI_ROUTES.patientDashboard,
//   UI_ROUTES.patientMssages,
//   UI_ROUTES.patientBooking,
//   UI_ROUTES.patientSharedForms,
//   UI_ROUTES.accounts,
//   UI_ROUTES.patientMedicationData,
//   UI_ROUTES.patientAllergyData,
//   UI_ROUTES.patientViewMedication,
//   UI_ROUTES.patientLabRadiologyData,
//   UI_ROUTES.patientLabRadiologyResultData,
//   UI_ROUTES.singlePatientChat,
//   UI_ROUTES.patientLabRadiologyRequestData,
//   UI_ROUTES.zoomSession,
// ];
///////////////////////////////////////////////////////////////////

// export const assistantRoutes = [...clinicAdminRoutes];

// export const practitionerRoutes = [
//   UI_ROUTES.patient,

//   // UI_ROUTES.adminDashboard,
//   UI_ROUTES.accounts,
//   UI_ROUTES.scheduling,
//   UI_ROUTES.encounters,
//   UI_ROUTES.labRadiology,
//   UI_ROUTES.medicalBilling,
//   UI_ROUTES.analyticsAndReporting,
//   UI_ROUTES.messages,
//   UI_ROUTES.singleChat,
//   UI_ROUTES.alerts,
//   UI_ROUTES.tasks,
//   UI_ROUTES.formBuilder,
//   UI_ROUTES.fax,
//   UI_ROUTES.addStaff,
//   UI_ROUTES.editStaff,
//   UI_ROUTES.labRadiologyResult,
//   UI_ROUTES.labRequest,
//   UI_ROUTES.patientLabReport,
//   UI_ROUTES.bookingSettings,
//   UI_ROUTES.zoomSession,
// ];

export const loggedInUserRoutes = [];

const syncLoggedInUserRoutes = (...routeGroups) => {
  const nextLoggedInRoutes = routeGroups.flat().filter(Boolean);
  loggedInUserRoutes.length = 0;
  loggedInUserRoutes.push(...new Set(nextLoggedInRoutes));
};

// export const patientRoutes = [...patientUserRoutes];

export const getInitialRoute = (
  role,
  isTrial,
  isActive,
  isTrailingPeriodOver,
  isTrialPeriodOver
) => {
  if (role === roleTypes.superAdmin) return UI_ROUTES.clinics;
  if (role === roleTypes.clinicAdmin && isActive && !isTrailingPeriodOver)
    return UI_ROUTES.adminDashboard;
  if (
    role === roleTypes.clinicAdmin &&
    (!isTrial || isTrialPeriodOver) &&
    (!isActive || isTrailingPeriodOver)
  )
    return UI_ROUTES.subscription;
  if (role === roleTypes.patient) return UI_ROUTES.patientDashboard;

  return UI_ROUTES.adminDashboard;
};
// if (role === roleTypes.patient) return patientRoutes[0];

const getAllowedRoute = (
  data,
  isTrial,
  isActive,
  isTrailingPeriodOver,
  isTrialPeriodOver
) => {
  let routes = [];
  const { userRole, permissions } = data;
  const role = userRole;
  const permissionRoutes = !isEmpty(permissions)
    ? Object.values(permissions)
        .map((entry) => entry?.route)
        .filter(Boolean)
    : [];

  if (role === roleTypes.superAdmin) {
    routes = allRoute.filter((route) => superAdminRoutes.includes(route?.path));
  }
  if (role === roleTypes.clinicAdmin) {
    // routes = allRoute;
    // const routeData = allRoute.map((item) => item?.path)
    routes = allRoute.filter((route) =>
      clinicAdminRoutes.includes(route?.path)
    );
    if (
      (!isTrial || isTrialPeriodOver) &&
      (!isActive || isTrailingPeriodOver)
    ) {
      routes = [
        {
          path: UI_ROUTES.subscription,
          element: <Subscription />,
          moduleName: MODULE.subscription,
        },
      ];
    }
  } else {
    if (!isEmpty(permissions)) {
      routes = allRoute.filter((route) => {
        // Check if moduleName exists as a key in permissions.permission
        if (Object.keys(permissions).includes(route.moduleName)) {
          return route;
        }
      });

      if (role === roleTypes?.patient) {
        // routes.push({ path: UI_ROUTES.patientDashboard, element: <Dashboard />})
      }
    }
    if (role === roleTypes?.patient) {
      routes.push({ path: UI_ROUTES.patientDashboard, element: <Dashboard /> });
    }
    if (role !== roleTypes?.patient && role !== roleTypes?.superAdmin) {
      routes.push({
        path: UI_ROUTES.adminDashboard,
        element: <DashboardHome />,
      });
    }
    routes.push({ path: UI_ROUTES.accounts, element: <Account /> });
    ////////////////////////////////////////////////////
    // else{
    //   routes.push({ path: UI_ROUTES.patientDashboard, element: <Dashboard />})
    //   loggedInUserRoutes.length = 0; // This empties the array
    //   loggedInUserRoutes.push(UI_ROUTES.patientDashboard);
    // }

    // routes = allRoute.filter((route) =>
    //   practitionerRoutes.includes(route?.path)
    // );
    // else
    //   routes = allRoute.filter((route) => loggedInUserRoutes.includes(route?.path));
  }

  syncLoggedInUserRoutes(
    routes.map((route) => route?.path),
    permissionRoutes
  );

  return routes?.map((route) => ({
    path: route.isNested ? `${route.path}/*` : route.path,
    element: route.element,
  }));
  // if (role === roleTypes.superAdmin)
  //   routes = allRoute.filter((route) => superAdminRoutes.includes(route?.path));
  // else if (role === roleTypes.patient)
  //   routes = allRoute.filter((route) => patientRoutes.includes(route?.path));
  // else if (role === roleTypes.clinicAdmin)
  //   routes = allRoute.filter((route) =>
  //     clinicAdminRoutes.includes(route?.path)
  //   );
  // else if (role === roleTypes.practitioner)
  //   routes = allRoute.filter((route) =>
  //     practitionerRoutes.includes(route?.path)
  //   );
  // else
  //   routes = allRoute.filter((route) => assistantRoutes.includes(route?.path));

  // return routes?.map((route) => ({
  //   path: route.isNested ? `${route.path}/*` : route.path,
  //   element: route.element,
  // }));
};

export default function Router() {
  const userRole = getUserRole();
  const userData = useAuthenticatedUser();

  const [
    getSubscriptionResponse,
    ,
    getSubscriptionLoading,
    getSubscription,
    clearSubscription,
  ] = useCRUD({
    id: GET_SUBSCRIPTION_DATA,
    url: `${API_URL.clinic}/subscription-data`,
    type: REQUEST_METHOD.get,
  });
  const isActive = getSubscriptionResponse?.isActive;
  const isTrial = getSubscriptionResponse?.isTrial;
  const today = new Date();
  const isTrailingPeriodOver =
    getSubscriptionResponse?.endDate &&
    today > new Date(getSubscriptionResponse?.endDate) &&
    getSubscriptionResponse?.isCancel;

  let isTrialPeriodOver;
  if (isTrial) {
    isTrialPeriodOver = getSubscriptionResponse?.isTrialPeriodOver;
  }

  useEffect(() => {
    getSubscription();
  }, []);

  const permissions = userData?.permission || []; // Default to an empty array
  const data = { userRole, permissions };
  // Show a loading spinner while permissions are being fetched
  const routes = useRoutes([
    {
      path: UI_ROUTES.dashboard,
      element: <DashboardLayout />,
      children: [
        {
          element: (
            <Navigate
              to={getInitialRoute(
                userRole,
                isTrial,
                isActive,
                isTrailingPeriodOver,
                isTrialPeriodOver
              )}
            />
          ),
          index: true,
        },
        ...getAllowedRoute(
          data,
          isTrial,
          isActive,
          isTrailingPeriodOver,
          isTrialPeriodOver
        ),
      ],
    },
    { path: UI_ROUTES.zoomSession, element: <ZoomSessionScreen /> },

    { path: UI_ROUTES.joinRoom, element: <OpenTalkVideoRoom /> },
    { path: UI_ROUTES.waitingroom, element: <WaitingRoom /> },
    { path: UI_ROUTES.endVideoCall, element: <EndCall /> },
    {
      path: UI_ROUTES.login,
      element: <LoginPage />,
    },
    {
      path: UI_ROUTES.emailVerification,
      element: <EmailVerificationPage />,
    },
    {
      path: UI_ROUTES.practiceRegisteration,
      element: <PracticeRegisterationPage />,
    },
    {
      path: UI_ROUTES.practiceMembership,
      element: <PracticeMembershipPage />,
    },
    {
      path: UI_ROUTES.practiceRegisterationVerifyEmail,
      element: <PracticeRegisterationVerifyEmailPage />,
    },
    {
      path: UI_ROUTES.adminLogin,
      element: <SuperAdminLogin />,
    },
    {
      path: UI_ROUTES.signup,
      element: <SignUp />,
    },
    {
      path: UI_ROUTES.generatepassword,
      element: <GeneratePasswordPage />,
    },
    {
      path: UI_ROUTES.resetpassword,
      element: <ResetPasswordPage />,
    },
    {
      path: UI_ROUTES.forgotpassword,
      element: <ForgotPasswordPage />,
    },
    {
      element: <SimpleLayout />,
      children: [
        { element: <Navigate to={UI_ROUTES.dashboard} />, index: true },
        { path: UI_ROUTES.NOTFound, element: <Page404 /> },
        {
          path: UI_ROUTES.subscriptionInactive,
          element: <SubscriptionNotExists />,
        },
        { path: UI_ROUTES.subscriptionCancel, element: <SubscriptionCancel /> },
        {
          path: UI_ROUTES.subscriptionTrialOver,
          element: <SubscriptionTrialOver />,
        },
        // { path: '*', element: <Navigate to={UI_ROUTES.NOTFound} /> },
      ],
    },

    //
    {
      path: UI_ROUTES.clientHome,
      element: <ClientHome />,
    },

    {
      path: UI_ROUTES.bookings,
      element: <BookingPortal />,
    },
    {
      path: UI_ROUTES.printForm,
      element: <FormBuilderPDF />,
    },
    { path: UI_ROUTES.formLink, element: <FormLink /> },
    { path: UI_ROUTES.onlineBookingRegistration, element: <OnlineBookingRegistration /> },
    {
      path: UI_ROUTES.viewConsentForm,
      element: <PublicConsentFormPage />,
    },
    {
      path: UI_ROUTES.viewForm,
      element: <PublicFormPage />,
    },
    {
      path: UI_ROUTES.formLibrary,
      element: <FormLibraryPDF />,
    },

    {
      path: '*',
      element: (
        <NotFoundHandler
          isActive={isActive}
          isTrailingPeriodOver={isTrailingPeriodOver}
          isTrial={isTrial}
          isTrialPeriodOver={isTrialPeriodOver}
        />
      ),
    },
  ]);

  // if (loading) {
  //   return <div>Loading...</div>; // Replace with your custom loading component
  // }

  return routes;
}

const NotFoundHandler = ({
  isActive,
  isTrailingPeriodOver,
  isTrial,
  isTrialPeriodOver,
}) => {
  const [user, , , , , validateToken] = useAuthUser();
  useEffect(() => {
    const accessToken = localStorage.getItem('access_token');
    if (accessToken) {
      validateToken();
    }
  }, []);

  if (user) {
    if (isTrialPeriodOver) {
      return <Navigate to={UI_ROUTES.subscriptionTrialOver} />;
    }
    if (isTrailingPeriodOver) {
      return <Navigate to={UI_ROUTES.subscriptionCancel} />;
    }
    if (!isActive && !isTrial) {
      return <Navigate to={UI_ROUTES.subscriptionInactive} />;
    }
    return <Navigate to={UI_ROUTES.NOTFound} />;
  }

  return <Loader loading />;
};
