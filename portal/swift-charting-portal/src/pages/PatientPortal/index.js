import React, { useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import isEmpty from 'lodash/isEmpty';

import useCRUD from 'src/hooks/useCRUD';
import { API_URL,  REQUEST_METHOD } from 'src/api/constants';
import { GET_PRACTICE } from 'src/store/types';
import Loader from 'src/components/Loader';
import useSearchQuery from 'src/hooks/useSearchQuery';
import { getInitialRoute } from 'src/routes';
import { getImageUrl } from 'src/lib/utils';
import Locations from './Booking';
import Services from './Booking/services';
import ChooseDateTime from './Booking/ChooseDateTime';
import PatientInfo from './Booking/PatientInfo';

const BookingPortal = () => {
  const navigate = useNavigate();
  const form = useForm({});
  const [step, setStep] = useState(0);
  const [bookingData, setBookingData] = useState({});
  const practiceId = useSearchQuery().get('practiceId');
  const serviceId = useSearchQuery().get('serviceId');

  const [
    getPracticeResponse,
    ,
    getPracticeResponseLoading,
    getPractice,
    clearGetPractice,
  ] = useCRUD({
    id: GET_PRACTICE,
    url: `${API_URL.bookingPractice}?practice=${practiceId}${
      serviceId ? `&service=${serviceId}` : ``
    }`,
    type: REQUEST_METHOD.get,
  });
  
  const getURL = useCallback(() => {
    if (getPracticeResponse) {
      const imageUrl = getImageUrl(getPracticeResponse?.practice?.logo?.name, {  practice: getPracticeResponse?.practice?.id, isPublicURI: true});
      return imageUrl;
    }
    return null;
  }, [getPracticeResponse]);

  useEffect(() => {
    const loginUserRole = localStorage.getItem('userRole');
    if (loginUserRole) {
      navigate(getInitialRoute(loginUserRole), {
        state: { openBookingPage: true },
      });
    } else {
      getPractice();
    }
  }, []);

  useEffect(() => {
    if (!isEmpty(getPracticeResponse) && !step) {
      setBookingData((curr) => ({
        ...curr,
        practiceId,
        practice: getPracticeResponse?.practice,
        practiceLocation: getPracticeResponse?.practiceLocation,
        services: getPracticeResponse?.service,
        timeZone: getPracticeResponse?.practice?.timezone,
      }));
      clearGetPractice();
    }
  }, [getPracticeResponse, practiceId, step, clearGetPractice]);

  const getStepContent = useCallback(() => {
    switch (step) {
      case 0:
        return (
          <Locations
            setStep={setStep}
            getURL={getURL}
            bookingData={bookingData}
            setBookingData={setBookingData}
          />
        );
      case 1:
        return (
          <Services
            setStep={setStep}
            getURL={getURL}
            bookingData={bookingData}
            setBookingData={setBookingData}
          />
        );
      case 2:
        return (
          <ChooseDateTime
            setStep={setStep}
            getURL={getURL}
            bookingData={bookingData}
            setBookingData={setBookingData}
          />
        );
      case 3:
        return (
          <PatientInfo
            setStep={setStep}
            getURL={getURL}
            form={form}
            bookingData={bookingData}
            setBookingData={setBookingData}
          />
        );
      default:
        return null;
    }
  }, [step, form, getURL, bookingData]);

  if (getPracticeResponseLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
        }}
      >
        <Loader type="circular" loading />
      </div>
    );
  }

  return getStepContent();
};

export default BookingPortal;
