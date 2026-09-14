import React, { useState, useRef, useCallback } from 'react';
import { TextField, List, ListItem, ListItemText, Popper, Paper, ClickAwayListener, InputAdornment } from '@mui/material';
import { generatePath, useNavigate, useParams } from 'react-router-dom';
import { Iconify } from '../../../components/iconify';
import useCRUD from 'src/hooks/useCRUD';
import { PATIENT_DATA, PATIENT_LIST } from 'src/store/types';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import { debounce } from 'lodash';
import { UI_ROUTES } from 'src/lib/routeConstants';
import { encrypt } from 'src/lib/encryption';
import Input from '@mui/material/Input';
import { getFullName } from 'src/lib/utils';
import { red } from '@mui/material/colors';

const PatientSearchBar = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [open, setOpen] = useState(false);
    const anchorEl = useRef(null); // Reference to the TextField (anchor for the Popper)
    const navigate = useNavigate();
    const params = useParams();

    const [
      response,
      ,
      loading,
      handleOnFetchDataList,
      clearData
    ] = useCRUD({
      id: `${PATIENT_LIST}` ,
      url: `${API_URL.patient}`,
      type: REQUEST_METHOD.get,
    });

    const handleSearch = async (e) => {
        const term = e.target.value;
        setSearchTerm(term);

        if (term.length > 2) {
            debouncedFetch(term);
            setOpen(true);
        } else {
            setOpen(false);
        }
    };

    const debouncedFetch = useCallback(
        debounce((term) => {
            handleOnFetchDataList({ searchText: term });
        }, 1000), []
    );

    const handleSelectPatient = useCallback(
      (patientId) => {
        console.log('patientId',patientId);
        setOpen(false);
        navigate(
          generatePath(UI_ROUTES.patientSummary, {
            ...params,
            patientId: encrypt(String(patientId)),
          })
        );
      },
      [navigate, params]
    );

    const handleClickAway = () => {
        setOpen(false);
    };

    return (
        <div 
          >
          <Input
            autoFocus
            fullWidth
            disableUnderline
            placeholder="Search by patient name or DOB"
            value={searchTerm}
            onChange={handleSearch}
            ref={anchorEl} 
            startAdornment={
              <InputAdornment position="start"
              >
                <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled', width: 20, height: 20 }} />
              </InputAdornment>
            }
            sx={{  fontFamily: 'Poppins' ,width: '20em'}}
            style={{
              padding: '0px 11px;',
              border: '0.97px solid #E8E8E8',
              borderRadius: '21.89px',
              display: 'flex',
              padding: '0px 8px 0px 9px'
            }}
            inputProps={{
              style: {
                fontWeight: 'unset', 
              },
            }}
          />
          
            {response && (
            <div >
              <Popper open={open && (response?.results).length > 0} anchorEl={anchorEl.current} placement="bottom-start"
              style={{
                zIndex:1300,
              }}>
                  <ClickAwayListener onClickAway={handleClickAway} >
                      <Paper style={{ width: anchorEl.current ? anchorEl.current.clientWidth : undefined, }} >
                          <List>
                              {(response?.results).map((patient) => (
                                  <ListItem
                                      button
                                      key={patient.id}
                                      onClick={() => handleSelectPatient(patient.id)}
                                  >
                                      <ListItemText primary={getFullName(patient) } />
                                  </ListItem>
                              ))}
                          </List>
                      </Paper>
                  </ClickAwayListener>
              </Popper>
              </div>
             )} 
        </div>
    );
};

export default PatientSearchBar;
