/* eslint-disable no-unused-vars */
/* eslint-disable no-param-reassign */
import isEmpty from 'lodash/isEmpty';
import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  Badge,
  Checkbox,
  FormControl,
  FormLabel,
  Grid,
  ListItemText,
  ListSubheader,
  MenuItem,
  Select as MuiSelect
} from '@mui/material';

import filterIcon from "src/assets/images/filterIcon.png";
import useReduxState from 'src/hooks/useReduxState';
import Typography from '../../components/Typography';
import './filterSelect.scss';
import palette from 'src/theme/palette';
import ClearIcon from '@mui/icons-material/Clear';

const MenuProps = {
  PaperProps: {
    style: {
      width: 250,
      maxHeight: 400,
    },
  },
};

const PlaceHolderComponent = ({selectedFilter}) => (
  <div className="placeholder-wrapper">
        <Badge
      color="primary"
      overlap="circular"
      badgeContent={
        selectedFilter?.length ? (
          <Typography>{selectedFilter?.length}</Typography>
        ) : null
      }
    >
      <img src={filterIcon} alt="filter" style={{width:14.6,height:14.6}}/>
    </Badge>
    <Typography color="#666666" style={{fontSize:13.63,lineHeight:'20px',fontWeight:400}} className="filter-heading">Filter</Typography>
   
  </div>
);

const FilterSelect = ({
  variant,
  label,
  control,
  loading,
  onChange,
  defaultValue,
  gridProps,
  size = 'medium',
  reduxId='appointment-calendar-filters',
  filterData=[],
  clearOnUnmount=false,
  ...restProps
}) => {
  const [selectedValue, setSelectedValue] = useState([]);
  const [filters, setFilters] = useReduxState(
    reduxId,
    {}
  );

  const filterOptions = useMemo(() => {
    const parsedOptions = { };
    filterData?.forEach(item=>{
      parsedOptions[item?.label]=item?.data
    })

    return parsedOptions;
  }, [filterData]);

  useEffect(() => {
    if (!isEmpty(filters)) {
      const filterValues = [];
      Object.keys(filters)?.forEach((key) => {
        filterValues.push(...filters[key]);
      }, []);
      setSelectedValue(filterValues);
    }
  }, []);

  useEffect(()=>{
      return ()=>{
        if(clearOnUnmount){
          setFilters()
          setSelectedValue([])
      }
    }
  },[]);

  const renderSelectOptions = useCallback(
    (options, dataType) => {
      const items = options[dataType]?.map((item) => (
        <MenuItem
          name={dataType}
          key={item?.code}
          value={item?.code}
          sx={{
            fontSize: '14px',
            paddingLeft: '4px',
            textWrap: 'wrap',
          }}
          size="small"
        >
          <Checkbox checked={selectedValue.indexOf(item.code) > -1} />
          <ListItemText
            className="list-item-text"
            primary={
              <Typography variant="body2" style={{ fontSize: '14px' }}>
                {item.name}
              </Typography>
            }
          />
        </MenuItem>
      ));
      return [
        <ListSubheader key={dataType} sx={{ fontWeight: 400 }}>
          Filter by {dataType}
        </ListSubheader>,
        items,
      ];
    },
    [selectedValue]
  );

  const handleChange = useCallback(
    (event, otherInfo) => {
      const { target: { value } = {} } = event;
      const { props } = otherInfo;
      const reduxFilters = { ...filters };

      if (reduxFilters[props.name]) {
        const index = reduxFilters[props.name].indexOf(props.value);
        if (index > -1) {
          reduxFilters[props.name].splice(index, 1);
        } else {
          reduxFilters[props.name].push(props.value);
        }
      } else {
        reduxFilters[props.name] = [props.value];
      }
      setFilters({ ...reduxFilters });
      setSelectedValue(typeof value === 'string' ? value.split(',') : value);
    },
    [filters, setFilters]
  );

  const handleFilterClose = useCallback(() => {
    // eslint-disable-next-line no-param-reassign
    onChange({ ...filters });
  }, [
    onChange,
    filters,
  ]);
  const clearFilter = useCallback((e)=>{
    e.stopPropagation()
    setFilters()
    setSelectedValue([])
    onChange({});

  },[])
  return (
    <Grid item xs={12} md={6} {...gridProps} style={{position:'relative'}} className="filter-select-wrapper">
      <FormControl
        variant={variant}
        size={size}
        sx={{
          '& .MuiFormLabel-root': {
            fontSize: '12px',
            marginBottom:'4px',
            color:palette.text.primary,
            lineHeight:'18px',
            fontWeight:500,
          },
          '& .MuiSelect-select':{
            padding:'12px !important'
          },
          '& .MuiTypography-root':{
            fontSize: '12px',
            color:palette.text.secondary,
            lineHeight:'18px',
            fontWeight:400,
          },
          '& .MuiBadge-badge .MuiTypography-root':{
            color:palette.background.paper,

          },
          '& .MuiSvgIcon-root':{
            color:palette.text.offGray
          },
          '& .MuiButtonBase-root.MuiButtonBase-root':{
            display:'none'
          },
          '& .Mui-selected':{
            fontWeight:600,
            color:palette.background.main
        },
        '& .MuiSvgIcon-root.MuiSelect-icon':{
          display:'none'
        },
        }}
        {...restProps}
      >
        <FormLabel/>
        <MuiSelect
          labelId="demo-multiple-checkbox-label"
          id="filter-select-multiple-checkbox"
          label={label}
          multiple
          onChange={handleChange}
          displayEmpty
          value={selectedValue}
          renderValue={(selectedFilter) => (
            <PlaceHolderComponent selectedFilter={selectedFilter} />
          )}
          onClose={handleFilterClose}
          MenuProps={MenuProps}
        >
          {Object.keys(filterOptions)?.map((dataType) =>
            renderSelectOptions(filterOptions, dataType)
          )}
        </MuiSelect>
      </FormControl>
      {!!selectedValue?.length  && <div  style={{display:'flex',borderRadius:'50%',position:'absolute',top:0,right:0,backgroundColor:palette.background.main}} onClick={clearFilter}>
<ClearIcon style={{width:20,height:20,color:palette.background.paper}}  />
    </div>}

    </Grid>
  );
};

export default FilterSelect;
