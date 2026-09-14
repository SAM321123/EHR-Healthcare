import React, { useCallback, useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import { Controller } from 'react-hook-form';
import usePlacesService from 'react-google-autocomplete/lib/usePlacesAutocompleteService';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

import { googleMapApiKey } from 'src/lib/constants';
import { getFormattedAddressNew } from 'src/lib/utils';
import palette from 'src/theme/palette';
import { FormLabel } from '@mui/material';

const FormMapAutocomplete = ({
  label,
  register,
  control,
  setValue,
  getOptions = () => {},
  size,
  ...restProps
}) => (
    <Controller
      control={control}
      {...register}
      render={(props) =>(<AutoCompleteRenderer 
        getOptions={getOptions} 
        label={label} 
        setValue={setValue}
        register={register}
        restProps={restProps} size={size} {...props}/>)}
    />
  );

const AutoCompleteRenderer =   ({ field, fieldState: { error }, getOptions, label, restProps, size, setValue, register }) => {
  const { ref, onChange, value } = field;
  const {
    placesService,
    placePredictions,
    getPlacePredictions,
    isPlacePredictionsLoading,
  } = usePlacesService({
    apiKey: googleMapApiKey,
  });

  const [searchText, setSearchText] = useState();

  const handleSearch = useCallback((event) => {
    setSearchText(event.target.value)
      getPlacePredictions({ input: event.target.value });
  }, [getPlacePredictions]);

  useEffect(()=> {
    if(searchText) {
      setValue(register?.name, {description: searchText}, { shouldTouch: true });
      onChange({description: searchText})
    }
  }, [isPlacePredictionsLoading])

  const onPlaceSelect = useCallback(
    (place) => {
      if(place===null){
        setValue(register?.name, {description: searchText}, { shouldTouch: true });
        onChange({ description : '', stateCode: '' , postalCode: '', countryCode:''})
      }
      placesService?.getDetails(
        {
          placeId: place?.place_id,
        },
        (placeDetails) => {
          const location = getFormattedAddressNew(placeDetails);
          setValue(register?.name, location);
          onChange(location);
          setSearchText()
        }
      );
    },
    [placesService]
  );
  return (
    <Autocomplete
        size={size}
        freeSolo
        loading={isPlacePredictionsLoading}
        getOptionLabel={(option) => option.description || ''}
        options={placePredictions}
        {...field}
        value={value || ''}
        onChange={(event, newValue) => onPlaceSelect(newValue)}
        onFocus={getOptions}
        renderInput={(params) => (
          <>
          {label && <FormLabel required={restProps?.required?.value} sx={{ fontSize:12,lineHeight:'18px',fontWeight:500, }}>{label}</FormLabel>}
          <TextField
            {...params}
            // label={label}
            error={error?.message}
            placeholder='Enter here'
            helperText={error?.message || null}
            required={restProps?.required?.value}
            inputRef={ref}
            onChange={handleSearch}
          />
          </>
          )}
          {...restProps}
          sx={{
            '& .MuiFormLabel-root': {
              fontSize: '12px',
              marginBottom:'4px',
              color:palette.text.primary,
              lineHeight:'18px',
              fontWeight:500,
            },
            '& .MuiInputBase-root':{
              padding:'13px 12px !important',
            },
            '& .MuiTypography-root':{
              fontSize: '12px',
              color:palette.text.secondary,
              lineHeight:'18px',
              fontWeight:400,
            },
            '& .MuiSvgIcon-root':{
              color:palette.text.offGray
            },
            '& input::placeholder':{
              fontSize: '12px',
              color:palette.text.secondary,
              lineHeight:'18px',
              fontWeight:400,
            },
            '& input':{
              padding:'0px !important'
            },
            '& .MuiButtonBase-root.MuiButtonBase-root':{
              display:'none'
            },
            '& .Mui-selected':{
              fontWeight:600,
              color:palette.background.main
          },
          width:'100%',
          }}
      />
  );
}

FormMapAutocomplete.defaultProps = {
  label: '',
  register: {},
  error: '',
  size: 'small',
};

FormMapAutocomplete.propTypes = {
  label: PropTypes.string,
  register: PropTypes.instanceOf(Object),
  error: PropTypes.string,
  size: PropTypes.string,
};

export default FormMapAutocomplete;
