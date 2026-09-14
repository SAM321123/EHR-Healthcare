import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Popover } from '@mui/material';

import { Iconify } from 'src/components/iconify';
import palette from 'src/theme/palette';
import TagsInput from 'src/components/TagsInput';
import ActionButton from "src/components/ActionButton";

const DropDownModal = ({ onSubmitOption, columnId, defaultOptions }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [options, setOptions] = useState(defaultOptions);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'modal-popover' : undefined;

  const handleChange = (event) => {
    const selectedValues = event?.map((option) => ({
      label: option,
      value: option,
    }));
    setOptions(selectedValues);
  };
  const handleSubmit = () => {
    onSubmitOption({ options, columnId });
    handleClose();
  };

  return (
    <div>
       <Iconify
        color={palette.grey[700]}
        onClick={handleClick}
        icon="eva:more-vertical-fill"
        cursor="pointer"
      />
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            backgroundColor: 'white',
          },
        }}
      >
        <div style={{ padding: 10, width: 214 }}>
          <div>Enter Options</div>  
          <TagsInput
            sx={{
              maxWidth: '300px',
              minWidth: '200px',
              maxHeight: '100px',
              marginBottom: '10px',
            }}
            defaultValue={options?.map((option)=> option.value)}
            name="drop"
            onChange={handleChange}
          />
           <div style={{marginTop: 4}}>
              <ActionButton onClick={handleSubmit}>
                OK
              </ActionButton>
           </div>

        </div>
      </Popover>
    </div>
  );
};

DropDownModal.defaultProps = {
  data: {},
  actions: [],
};

DropDownModal.propTypes = {
  data: PropTypes.instanceOf(Object),
  actions: PropTypes.instanceOf(Object),
};

export default DropDownModal;
