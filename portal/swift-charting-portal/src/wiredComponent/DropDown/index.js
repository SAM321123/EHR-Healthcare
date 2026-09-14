import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useEffect, useState } from 'react';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import arrowDown from 'src/assets/images/arrowDownClient.png';
import useCRUD from 'src/hooks/useCRUD';
import { appointmentStatusCode } from 'src/lib/constants';
import Events from 'src/lib/events';
import { TABLE_DROPDOWN_DATA } from 'src/store/types';
import palette from 'src/theme/palette';

export default function TableDropDown({
  data,
  api,
  code,
  id,
  dataKey,
  eventId,
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [value, setValue] = useState(data);

  const [getResponse, , , getAPI, clearGetData] = useCRUD({
    id: `${TABLE_DROPDOWN_DATA}-get-${code}`,
    url: `${API_URL.getMasters}/${code}`,
    type: REQUEST_METHOD.get,
  });

  const [response, , , updateRowData, clearUpdateResponse] = useCRUD({
    id: `${TABLE_DROPDOWN_DATA}-${id}`,
    url: `${api}`,
    type: REQUEST_METHOD.update,
  });

  useEffect(()=>{
    setValue(data)
  },[data]);
  
  useEffect(() => {
    if (!getResponse) {
      getAPI();
    }
  }, [getAPI, getResponse]);

  useEffect(() => {
    if (response) {
      clearUpdateResponse(true);
      if (eventId) {
        Events.trigger(`REFRESH-TABLE-${eventId}`);
      }
    }
  }, [response]);

  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleSelect = (item) => {
    setValue(item);
    updateRowData({ [dataKey]: item.code });
    handleClose();
  };

  return (
    <div>
      <div
        style={{ display: 'flex', gap: 5, alignItems: 'center' }}
        onClick={handleClick}
      >
        <div
          id="basic-button"
          aria-controls={open ? 'basic-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
          style={{
            fontSize: 12,
            lineHeight: '20px',
            fontWeight: 400,
            color: value?.colorCode || palette.text.offWhite,
          }}
        >
          {value?.name || 'N/A'}
        </div>
        <img
          src={arrowDown}
          alt="arrow-down"
          style={{ width: 10, height: 6 }}
        />
      </div>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        {getResponse?.results
          .filter(
            (item) => item.code !== appointmentStatusCode.ONGOING && item.code !== appointmentStatusCode.COMPLETE && item.code !== appointmentStatusCode.MISSED
          )
          .map((item) => {
            const isSelected = value.code === item.code;
            return (
              <MenuItem
                key={item.code}
                style={{
                  fontSize: 12,
                  lineHeight: '20px',
                  fontWeight: 400,
                  color: item.colorCode || palette.text.offWhite,
                  ...(isSelected
                    ? { backgroundColor: palette.background.babyGreen }
                    : {}),
                }}
                onClick={() => handleSelect(item)}
              >
                {item.name}
              </MenuItem>
            );
          })}
      </Menu>
    </div>
  );
}
