/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { useState } from 'react';

import CollapsibleList from '../CollapsibleList';

const MultiList = ({ data = [], ...restProps }) => {
  const [isOpenList, setIsOpenList] = useState(data.map(() => false));

  const toggleList = (index) => {
    setIsOpenList((prevOpenList) => ({
      ...prevOpenList,
      [index]: !isOpenList[index],
    }));
  };

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column' }}
      className="dashboard-list-container"
    >
      {data?.map((item, index) => (
        <div key={item?.label} style={{ width: '100%' }}>
          <CollapsibleList
            data={item?.appointmentData}
            status={item?.status}
            toggleList={toggleList}
            setIsOpenList={setIsOpenList}
            isOpenList={isOpenList}
            listIndex={index}
            label={item?.label}
            color={item?.color}
            {...restProps}
          />
        </div>
      ))}
    </div>
  );
};

export default MultiList;
