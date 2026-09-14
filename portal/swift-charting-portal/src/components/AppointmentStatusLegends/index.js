import React, { useEffect } from 'react';
// import classNames from 'classnames';
import useCRUD from 'src/hooks/useCRUD';

import { API_URL, REQUEST_METHOD } from 'src/api/constants';

import './appointmentStatusLegends.scss';

const AppointmentStatusLegends = () => {
  const code = 'appointment_status';
  const [getResponse, , , getAPI, clearGetData] = useCRUD({
    id:'Appointemt-legends',
    url: `${API_URL.getMasters}/${code}`,
    type: REQUEST_METHOD.get,
  });

  useEffect(() => {
      getAPI();
  }, []);

  return(
    <div className="dashboard-legends-container">
      {getResponse?.results?.map((data) => {
        return (
          <div key={data} className="legends-item">
            <div className='color-item' style={{ backgroundColor: data?.colorCode}} />
            <div className="color-label">{data?.name}</div>
          </div>
        )
      })}
    </div>
  );
} 

export default AppointmentStatusLegends;
