/* eslint-disable no-unused-vars */
import Box from '@mui/material/Box';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import isEmpty from 'lodash/isEmpty';
import { useCallback, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';

import { useParams } from 'react-router-dom';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import LoadingButton from 'src/components/CustomButton/loadingButton';
import Typography from 'src/components/Typography';
import CustomForm from 'src/components/form';
import useCRUD from 'src/hooks/useCRUD';
import {
  hourOptions,
  meridianOptions,
  minuteOptions,
  regDecimal,
  requiredField,
  successMessage
} from 'src/lib/constants';
import { decrypt } from 'src/lib/encryption';
import Events from 'src/lib/events';
import {
  getCurrentMeridien,
  getUTCDateTime,
  getUpdatedFieldsValue,
  showSnackbar
} from 'src/lib/utils';
import { SAVE_VITALS_DATA } from 'src/store/types';
import palette from 'src/theme/palette';
import {
  WiredSelect
} from 'src/wiredComponent/Form/FormFields';



const VitalsForm = ({ modalCloseAction, refetchData, defaultData }) => {
  const form = useForm({ mode: 'onChange' });
  const { handleSubmit, setValue } = form;
  const params = useParams();
  let { patientId } = params || {};
  patientId =decrypt(patientId);

  const bmiCalculate = useCallback((data,form) => {
    if(data.lsb && data.ft){
      let weight = parseFloat(data.lsb || 0) + parseFloat(data.oz || 0) / 16; // Convert to pounds
      let height = (parseFloat(data.ft || 0) * 12) + parseFloat(data.in || 0); // Convert to total inches
  
      weight = parseFloat(weight) * 0.453592; 
      height = parseFloat(height) * 0.0254;
  
      const bmi = parseFloat(weight) / (parseFloat(height) ** 2);
      form.setValue('bmi', bmi.toFixed(6));
    }
    return {hide:false}
  },[]);
  
  const id = defaultData?.id;
  const vitalsFormGroups = useMemo(()=>[
    {
      inputType: 'date',
      type: 'text',
      name: 'recordDate',
      label: 'Recorded',
      required: requiredField,
      colSpan: 0.5,
    },
    {
      ...WiredSelect({
        name: 'hour',
        label: ' ',
        required: requiredField,
        valueAccessor: 'value',
        labelAccessor: 'label',
        url: null,
        options: hourOptions,
        labelProps: { style: { height: 18 }, required: false },
        placeholder: '11',
        showRadio: false,
      }),
      colSpan: 0.15,
    },
    {
      ...WiredSelect({
        name: 'minute',
        label: ' ',
        required: requiredField,
        valueAccessor: 'value',
        labelAccessor: 'label',
        url: null,
        options: minuteOptions,
        labelProps: { style: { height: 18 }, required: false },
        cstSx: { paddingLeft: '10px !important' },
        showRadio: false,
        placeholder: '28',
      }),
      colSpan: 0.15,
    },
    {
      ...WiredSelect({
        name: 'meridien',
        label: ' ',
        required: requiredField,
        valueAccessor: 'value',
        labelAccessor: 'label',
        url: null,
        options: meridianOptions,
        cstSx: { paddingLeft: '10px !important' },
        labelProps: { style: { height: 18 }, required: false },
        placeholder: 'AM',
        showRadio: false,
      }),
      colSpan: 0.15,
    },
    {
      type: 'text',
      label: 'Weight',
      colSpan: 0.3333,
      fields: [
        {
          inputType: 'text',
          type: 'text',
          name: 'lsb',
          label: '  ',
          colSpan: 0.3,
          placeholder: 'lsb',
          pattern: regDecimal,
          maxLength: { value: 3 },
        },
        {
          colSpan: 0.2,
          component: () => (
            <div
              style={{
                border: `1px solid ${palette.border.main}`,
                backgroundColor: palette.background.paper,
                height: 46,
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                justifyContent: 'center',
                borderRadius: 4,
              }}
            >
              <Typography
                color={palette.text.secondary}
                style={{ fontSize: 12, lineHeight: '18px', fontWeight: 400 }}
              >
                lsb
              </Typography>
            </div>
          ),
        },
        {
          inputType: 'text',
          type: 'text',
          name: 'oz',
          label: '  ',
          colSpan: 0.4,
          placeholder: 'oz',
          maxLength: { value: 3 },
          pattern: regDecimal,
        },
        {
          colSpan: 0.1,
          component: () => (
            <div
              style={{
                border: `1px solid ${palette.border.main}`,
                backgroundColor: palette.background.paper,
                height: 46,
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                justifyContent: 'center',
                borderRadius: 4,
              }}
            >
              <Typography
                color={palette.text.secondary}
                style={{ fontSize: 12, lineHeight: '18px', fontWeight: 400 }}
              >
                oz
              </Typography>
            </div>
          ),
        },
      ],
    },

    {
      type: 'text',
      label: 'Height',
      colSpan: 0.3333,
      fields: [
        {
          inputType: 'text',
          type: 'text',
          name: 'ft',
          label: '  ',
          colSpan: 0.4,
          placeholder: 'ft',
          pattern: regDecimal,
          maxLength: { value: 3 },
        },
        {
          colSpan: 0.1,
          component: () => (
            <div
              style={{
                border: `1px solid ${palette.border.main}`,
                backgroundColor: palette.background.paper,
                height: 46,
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                justifyContent: 'center',
                borderRadius: 4,
              }}
            >
              <Typography
                color={palette.text.secondary}
                style={{ fontSize: 12, lineHeight: '18px', fontWeight: 400 }}
              >
                ft
              </Typography>
            </div>
          ),
        },
        {
          inputType: 'text',
          type: 'text',
          name: 'in',
          label: '  ',
          colSpan: 0.4,
          placeholder: 'in',
          pattern: regDecimal,
          maxLength: { value: 3 },
        },
        {
          colSpan: 0.1,
          component: () => (
            <div
              style={{
                border: `1px solid ${palette.border.main}`,
                backgroundColor: palette.background.paper,
                height: 46,
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                justifyContent: 'center',
                borderRadius: 4,
              }}
            >
              <Typography
                color={palette.text.secondary}
                style={{ fontSize: 12, lineHeight: '18px', fontWeight: 400 }}
              >
                in
              </Typography>
            </div>
          ),
        },
      ],
    },
    {
      inputType: 'text',
      type: 'text',
      name: 'bmi',
      textLabel: 'BMI',
      colSpan: 0.3333,
      placeholder: 'BMI',
      pattern: regDecimal,
      dependencies: {
        keys: ['lsb','oz','ft','in'],
        calc: bmiCalculate,
      },
    },
    {
      inputType: 'text',
      type: 'text',
      name: 'tempreature',
      textLabel: 'Temperature (°F)',
      colSpan: 0.3333,
      placeholder: 'Temperature',
      pattern: regDecimal,
      maxLength: { value: 3 },
    },
    {
      type: 'text',
      label: 'Blood Pressure (Systolic)',
      colSpan: 0.3333,
      fields: [
        {
          inputType: 'text',
          type: 'text',
          name: 'bloodPressure',
          colSpan: 0.7,
          placeholder: 'Blood Pressure',
          pattern: regDecimal,
          maxLength: { value: 3 },
        },
        {
          colSpan: 0.3,
          component: () => (
            <div
              style={{
                backgroundColor: palette.background.babyBlue,
                height: 46,
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                justifyContent: 'center',
                borderRadius: 4,
              }}
            >
              <Typography
                color={palette.text.secondary}
                style={{ fontSize: 12, lineHeight: '18px', fontWeight: 400 }}
              >
                (mm/hg)
              </Typography>
            </div>
          ),
        },
      ],
    },
    {
      type: 'text',
      label: '(Diastolic)',
      colSpan: 0.3333,
      fields: [
        {
          inputType: 'text',
          type: 'text',
          name: 'diastolic',
          colSpan: 0.7,
          placeholder: 'Diastolic',
          pattern: regDecimal,
          maxLength: { value: 3 },
        },
        {
          colSpan: 0.3,
          component: () => (
            <div
              style={{
                backgroundColor: palette.background.babyBlue,
                height: 46,
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                justifyContent: 'center',
                borderRadius: 4,
              }}
            >
              <Typography
                color={palette.text.secondary}
                style={{ fontSize: 12, lineHeight: '18px', fontWeight: 400 }}
              >
                (mm/hg)
              </Typography>
            </div>
          ),
        },
      ],
    },
    {
      type: 'text',
      label: 'Respiratory Rate',
      colSpan: 0.3333,
      fields: [
        {
          inputType: 'text',
          type: 'text',
          name: 'respiratoryRate',
          label: ' ',
          colSpan: 0.8,
          placeholder: 'Respiratory Rate',
          pattern: regDecimal,
          maxLength: { value: 3 },
        },
        {
          component: () => (
            <div
              style={{
                border: `1px solid ${palette.border.main}`,
                backgroundColor: palette.background.paper,
                height: 46,
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                borderRadius: 4,
                padding: '12px 13px',
              }}
            >
              <Typography
                color={palette.text.secondary}
                style={{ fontSize: 12, lineHeight: '18px', fontWeight: 400 }}
              >
                rpm
              </Typography>
            </div>
          ),
          colSpan: 0.2,
        },
      ],
    },
  
    {
      type: 'text',
      label: 'Pulse',
      colSpan: 0.3333,
      fields: [
        {
          inputType: 'text',
          type: 'text',
          name: 'pulse',
          label: ' ',
          colSpan: 0.8,
          placeholder: 'Pulse',
          pattern: regDecimal,
          
        },
        {
          component: () => (
            <div
              style={{
                border: `1px solid ${palette.border.main}`,
                backgroundColor: palette.background.paper,
                height: 46,
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                borderRadius: 4,
                padding: '12px 13px',
              }}
            >
              <Typography
                color={palette.text.secondary}
                style={{ fontSize: 12, lineHeight: '18px', fontWeight: 400 }}
              >
                bmp
              </Typography>
            </div>
          ),
          colSpan: 0.2,
        },
      ],
    },
    {
      inputType: 'text',
      type: 'text',
      name: 'bloodSugar',
      textLabel: 'Blood Sugar',
      colSpan: 0.3333,
      placeholder: 'Blood Sugar',
      pattern: regDecimal,
    },
    {
      inputType: 'select',
      name: 'fasting',
      label: 'Fasting',
      valueAccessor: 'value',
      labelAccessor: 'name',
      options: [
        {name:'Fasting',value:'fasting'},
        {name:'Non-fasting',value:'non-fasting'}
      ],
      placeholder: 'Fasting',
      colSpan: 0.3333,
    },
    
    {
      type: 'text',
      label: '02 Saturation',
      colSpan: 0.3333,
      fields: [
        {
          inputType: 'text',
          type: 'text',
          name: 'saturation2',
          label: ' ',
          colSpan: 0.8,
          placeholder: 'Saturation',
          pattern: regDecimal,
        },
        {
          component: () => (
            <div
              style={{
                border: `1px solid ${palette.border.main}`,
                backgroundColor: palette.background.paper,
                height: 46,
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                borderRadius: 4,
                padding: '12px 13px',
              }}
            >
              <Typography
                color={palette.text.secondary}
                style={{ fontSize: 12, lineHeight: '18px', fontWeight: 400 }}
              >
                %
              </Typography>
            </div>
          ),
          colSpan: 0.2,
        },
      ],
    },
    {
      type: 'text',
      label: 'Head Circumference',
      colSpan: 0.3333,
      fields: [
        {
          inputType: 'text',
          type: 'text',
          name: 'headCircumference',
          label: ' ',
          colSpan: 0.8,
          placeholder: 'Head Circumference',
          pattern: regDecimal,
        },
        {
          component: () => (
            <div
              style={{
                border: `1px solid ${palette.border.main}`,
                backgroundColor: palette.background.paper,
                height: 46,
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                borderRadius: 4,
                padding: '12px 13px',
              }}
            >
              <Typography
                color={palette.text.secondary}
                style={{ fontSize: 12, lineHeight: '18px', fontWeight: 400 }}
              >
                in
              </Typography>
            </div>
          ),
          colSpan: 0.2,
        },
      ],
    },
    {
      type: 'text',
      label: 'Neck',
      colSpan: 0.3333,
      fields: [
        {
          inputType: 'text',
          type: 'text',
          name: 'neck',
          label: ' ',
          colSpan: 0.8,
          placeholder: 'Neck',
          pattern: regDecimal,
        },
        {
          component: () => (
            <div
              style={{
                border: `1px solid ${palette.border.main}`,
                backgroundColor: palette.background.paper,
                height: 46,
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                borderRadius: 4,
                padding: '12px 13px',
              }}
            >
              <Typography
                color={palette.text.secondary}
                style={{ fontSize: 12, lineHeight: '18px', fontWeight: 400 }}
              >
                in
              </Typography>
            </div>
          ),
          colSpan: 0.2,
        },
      ],
    },
    {
      type: 'text',
      label: 'Shoulders',
      colSpan: 0.3333,
      fields: [
        {
          inputType: 'text',
          type: 'text',
          name: 'shoulders',
          label: ' ',
          colSpan: 0.8,
          placeholder: 'Shoulders',
          pattern: regDecimal,
        },
        {
          component: () => (
            <div
              style={{
                border: `1px solid ${palette.border.main}`,
                backgroundColor: palette.background.paper,
                height: 46,
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                borderRadius: 4,
                padding: '12px 13px',
              }}
            >
              <Typography
                color={palette.text.secondary}
                style={{ fontSize: 12, lineHeight: '18px', fontWeight: 400 }}
              >
                in
              </Typography>
            </div>
          ),
          colSpan: 0.2,
        },
      ],
    },
    {
      type: 'text',
      label: 'Chest',
      colSpan: 0.3333,
      fields: [
        {
          inputType: 'text',
          type: 'text',
          name: 'chest',
          label: ' ',
          colSpan: 0.8,
          placeholder: 'Chest',
          pattern: regDecimal,
        },
        {
          component: () => (
            <div
              style={{
                border: `1px solid ${palette.border.main}`,
                backgroundColor: palette.background.paper,
                height: 46,
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                borderRadius: 4,
                padding: '12px 13px',
              }}
            >
              <Typography
                color={palette.text.secondary}
                style={{ fontSize: 12, lineHeight: '18px', fontWeight: 400 }}
              >
                in
              </Typography>
            </div>
          ),
          colSpan: 0.2,
        },
      ],
    },
    {
      type: 'text',
      label: 'Waist',
      colSpan: 0.3333,
      fields: [
        {
          inputType: 'text',
          type: 'text',
          name: 'waist',
          label: ' ',
          colSpan: 0.8,
          placeholder: 'Waist',
          pattern: regDecimal,
        },
        {
          component: () => (
            <div
              style={{
                border: `1px solid ${palette.border.main}`,
                backgroundColor: palette.background.paper,
                height: 46,
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                borderRadius: 4,
                padding: '12px 13px',
              }}
            >
              <Typography
                color={palette.text.secondary}
                style={{ fontSize: 12, lineHeight: '18px', fontWeight: 400 }}
              >
                in
              </Typography>
            </div>
          ),
          colSpan: 0.2,
        },
      ],
    },
    {
      type: 'text',
      label: 'Hips',
      colSpan: 0.3333,
      fields: [
        {
          inputType: 'text',
          type: 'text',
          name: 'hips',
          label: ' ',
          colSpan: 0.8,
          placeholder: 'Hips',
          pattern: regDecimal,
        },
        {
          component: () => (
            <div
              style={{
                border: `1px solid ${palette.border.main}`,
                backgroundColor: palette.background.paper,
                height: 46,
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                borderRadius: 4,
                padding: '12px 13px',
              }}
            >
              <Typography
                color={palette.text.secondary}
                style={{ fontSize: 12, lineHeight: '18px', fontWeight: 400 }}
              >
                in
              </Typography>
            </div>
          ),
          colSpan: 0.2,
        },
      ],
    },
    {
      type: 'text',
      label: 'Lean Body Mass',
      colSpan: 0.3333,
      fields: [
        {
          inputType: 'text',
          type: 'text',
          name: 'leanBodyMass',
          label: ' ',
          colSpan: 0.8,
          placeholder: 'Lean Body Mass',
          pattern: regDecimal,
        },
        {
          component: () => (
            <div
              style={{
                border: `1px solid ${palette.border.main}`,
                backgroundColor: palette.background.paper,
                height: 46,
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                borderRadius: 4,
                padding: '12px 13px',
              }}
            >
              <Typography
                color={palette.text.secondary}
                style={{ fontSize: 12, lineHeight: '18px', fontWeight: 400 }}
              >
                in
              </Typography>
            </div>
          ),
          colSpan: 0.2,
        },
      ],
    },
    {
      type: 'text',
      label: 'Left Forearm',
      colSpan: 0.3333,
      fields: [
        {
          inputType: 'text',
          type: 'text',
          name: 'leftForearm',
          label: ' ',
          colSpan: 0.8,
          placeholder: 'Left Forearm',
          pattern: regDecimal,
        },
        {
          component: () => (
            <div
              style={{
                border: `1px solid ${palette.border.main}`,
                backgroundColor: palette.background.paper,
                height: 46,
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                borderRadius: 4,
                padding: '12px 13px',
              }}
            >
              <Typography
                color={palette.text.secondary}
                style={{ fontSize: 12, lineHeight: '18px', fontWeight: 400 }}
              >
                in
              </Typography>
            </div>
          ),
          colSpan: 0.2,
        },
      ],
    },
    {
      type: 'text',
      label: 'Left Wrist',
      colSpan: 0.3333,
      fields: [
        {
          inputType: 'text',
          type: 'text',
          name: 'leftWrist',
          label: ' ',
          colSpan: 0.8,
          placeholder: 'Left Wrist',
          pattern: regDecimal,
        },
        {
          component: () => (
            <div
              style={{
                border: `1px solid ${palette.border.main}`,
                backgroundColor: palette.background.paper,
                height: 46,
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                borderRadius: 4,
                padding: '12px 13px',
              }}
            >
              <Typography
                color={palette.text.secondary}
                style={{ fontSize: 12, lineHeight: '18px', fontWeight: 400 }}
              >
                in
              </Typography>
            </div>
          ),
          colSpan: 0.2,
        },
      ],
    },
    {
      type: 'text',
      label: 'Right Forearm',
      colSpan: 0.3333,
      fields: [
        {
          inputType: 'text',
          type: 'text',
          name: 'rightForearm',
          label: ' ',
          colSpan: 0.8,
          placeholder: 'Right Forearm',
          pattern: regDecimal,
        },
        {
          component: () => (
            <div
              style={{
                border: `1px solid ${palette.border.main}`,
                backgroundColor: palette.background.paper,
                height: 46,
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                borderRadius: 4,
                padding: '12px 13px',
              }}
            >
              <Typography
                color={palette.text.secondary}
                style={{ fontSize: 12, lineHeight: '18px', fontWeight: 400 }}
              >
                in
              </Typography>
            </div>
          ),
          colSpan: 0.2,
        },
      ],
    },
    {
      type: 'text',
      label: 'Right Wrist',
      colSpan: 0.3333,
      fields: [
        {
          inputType: 'text',
          type: 'text',
          name: 'rightWrist',
          label: ' ',
          colSpan: 0.8,
          placeholder: 'Right Wrist',
          pattern: regDecimal,
        },
        {
          component: () => (
            <div
              style={{
                border: `1px solid ${palette.border.main}`,
                backgroundColor: palette.background.paper,
                height: 46,
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                borderRadius: 4,
                padding: '12px 13px',
              }}
            >
              <Typography
                color={palette.text.secondary}
                style={{ fontSize: 12, lineHeight: '18px', fontWeight: 400 }}
              >
                in
              </Typography>
            </div>
          ),
          colSpan: 0.2,
        },
      ],
    },
    {
      type: 'text',
      label: 'Left Bicep',
      colSpan: 0.3333,
      fields: [
        {
          inputType: 'text',
          type: 'text',
          name: 'leftBicep',
          label: ' ',
          colSpan: 0.8,
          placeholder: 'Left Bicep',
          pattern: regDecimal,
        },
        {
          component: () => (
            <div
              style={{
                border: `1px solid ${palette.border.main}`,
                backgroundColor: palette.background.paper,
                height: 46,
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                borderRadius: 4,
                padding: '12px 13px',
              }}
            >
              <Typography
                color={palette.text.secondary}
                style={{ fontSize: 12, lineHeight: '18px', fontWeight: 400 }}
              >
                in
              </Typography>
            </div>
          ),
          colSpan: 0.2,
        },
      ],
    },
    {
      type: 'text',
      label: 'Right Bicep',
      colSpan: 0.3333,
      fields: [
        {
          inputType: 'text',
          type: 'text',
          name: 'rightBicep',
          label: ' ',
          colSpan: 0.8,
          placeholder: 'Right Bicep',
          pattern: regDecimal,
        },
        {
          component: () => (
            <div
              style={{
                border: `1px solid ${palette.border.main}`,
                backgroundColor: palette.background.paper,
                height: 46,
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                borderRadius: 4,
                padding: '12px 13px',
              }}
            >
              <Typography
                color={palette.text.secondary}
                style={{ fontSize: 12, lineHeight: '18px', fontWeight: 400 }}
              >
                in
              </Typography>
            </div>
          ),
          colSpan: 0.2,
        },
      ],
    },
    {
      type: 'text',
      label: 'Left Thigh',
      colSpan: 0.3333,
      fields: [
        {
          inputType: 'text',
          type: 'text',
          name: 'leftThigh',
          label: ' ',
          colSpan: 0.8,
          placeholder: 'Left Thigh',
          pattern: regDecimal,
        },
        {
          component: () => (
            <div
              style={{
                border: `1px solid ${palette.border.main}`,
                backgroundColor: palette.background.paper,
                height: 46,
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                borderRadius: 4,
                padding: '12px 13px',
              }}
            >
              <Typography
                color={palette.text.secondary}
                style={{ fontSize: 12, lineHeight: '18px', fontWeight: 400 }}
              >
                in
              </Typography>
            </div>
          ),
          colSpan: 0.2,
        },
      ],
    },
    {
      type: 'text',
      label: 'Right Thigh',
      colSpan: 0.3333,
      fields: [
        {
          inputType: 'text',
          type: 'text',
          name: 'rightThigh',
          label: ' ',
          colSpan: 0.8,
          placeholder: 'Right Thigh',
          pattern: regDecimal,
        },
        {
          component: () => (
            <div
              style={{
                border: `1px solid ${palette.border.main}`,
                backgroundColor: palette.background.paper,
                height: 46,
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                borderRadius: 4,
                padding: '12px 13px',
              }}
            >
              <Typography
                color={palette.text.secondary}
                style={{ fontSize: 12, lineHeight: '18px', fontWeight: 400 }}
              >
                in
              </Typography>
            </div>
          ),
          colSpan: 0.2,
        },
      ],
    },
    {
      type: 'text',
      label: 'Left Calf',
      colSpan: 0.3333,
      fields: [
        {
          inputType: 'text',
          type: 'text',
          name: 'leftCalf',
          label: ' ',
          colSpan: 0.8,
          placeholder: 'Left Calf',
          pattern: regDecimal,
        },
        {
          component: () => (
            <div
              style={{
                border: `1px solid ${palette.border.main}`,
                backgroundColor: palette.background.paper,
                height: 46,
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                borderRadius: 4,
                padding: '12px 13px',
              }}
            >
              <Typography
                color={palette.text.secondary}
                style={{ fontSize: 12, lineHeight: '18px', fontWeight: 400 }}
              >
                in
              </Typography>
            </div>
          ),
          colSpan: 0.2,
        },
      ],
    },
    {
      type: 'text',
      label: 'Right Calf',
      colSpan: 0.3333,
      fields: [
        {
          inputType: 'text',
          type: 'text',
          name: 'rightCalf',
          label: ' ',
          colSpan: 0.8,
          placeholder: 'Right Calf',
          pattern: regDecimal,
        },
        {
          component: () => (
            <div
              style={{
                border: `1px solid ${palette.border.main}`,
                backgroundColor: palette.background.paper,
                height: 46,
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                borderRadius: 4,
                padding: '12px 13px',
              }}
            >
              <Typography
                color={palette.text.secondary}
                style={{ fontSize: 12, lineHeight: '18px', fontWeight: 400 }}
              >
                in
              </Typography>
            </div>
          ),
          colSpan: 0.2,
        },
      ],
    },
    {
      type: 'text',
      label: 'Body Fat',
      colSpan: 0.3333,
      fields: [
        {
          inputType: 'text',
          type: 'text',
          name: 'bodyFat',
          label: ' ',
          colSpan: 0.8,
          placeholder: 'Body Fat',
          pattern: regDecimal,
        },
        {
          component: () => (
            <div
              style={{
                border: `1px solid ${palette.border.main}`,
                backgroundColor: palette.background.paper,
                height: 46,
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                borderRadius: 4,
                padding: '12px 13px',
              }}
            >
              <Typography
                color={palette.text.secondary}
                style={{ fontSize: 12, lineHeight: '18px', fontWeight: 400 }}
              >
                %
              </Typography>
            </div>
          ),
          colSpan: 0.2,
        },
      ],
    },

  ],[bmiCalculate]);
  const [response, , loading, callVitalsSaveAPI, clearData] = useCRUD({
    id: SAVE_VITALS_DATA,
    url: API_URL.vitals,
    type: isEmpty(defaultData) ? REQUEST_METHOD.post : REQUEST_METHOD.update,
  });

  const initialData = useMemo(()=>{
    
    const currentMeridien = getCurrentMeridien();

    return {
      hour: currentMeridien.hour,
      minute: currentMeridien.minute,
      meridien:currentMeridien.meridien,
      heightUnit: 'cm',
      headCircUnit: 'cm',
      weightUnit: 'kg',
      // tempreatureUnit: '°C',
      recordDate:currentMeridien.now,
    };
  },[])

  const onHandleSubmit = useCallback(
    (data) => {
      if (data?.hour && data.minute && data.meridien && data.recordDate) {
        const { hour, minute, meridien, recordDate } = data || {};
        const datetime = getUTCDateTime(recordDate, {hour,minute,meridien});
        data.recordDateTime = datetime;
        data.recordTime = `${hour}:${minute} ${meridien}`;
        delete data.hour;
        delete data.minute;
        delete data.meridien;
      }
      if (isEmpty(defaultData)) {
        const newData = data;
        callVitalsSaveAPI({ data: { ...newData, patientId } });
      } else {
        const updatedFields = getUpdatedFieldsValue(data, defaultData);
        if (!isEmpty(updatedFields)) {
          callVitalsSaveAPI({ ...updatedFields }, `/${id}`);
        } else {
          showSnackbar({
            message: 'No changes found',
            severity: 'error',
          });
        }
      }
    },
    [callVitalsSaveAPI, defaultData, id]
  );

  useEffect(() => {
    if (!isEmpty(response)) {
      showSnackbar({
        message: isEmpty(defaultData)
          ? successMessage.create
          : successMessage.update,
        severity: 'success',
      });
      Events.trigger(`ADD_VITAL_ON_ENCOUNTER`,response);
      
      clearData();
      refetchData();
      modalCloseAction();
    }
  }, [refetchData, response]);

  return (
    <Box>
      <CardContent>
        <CustomForm
          form={form}
          formGroups={vitalsFormGroups}
          columnsPerRow={1}
          defaultValue={isEmpty(defaultData) ? initialData : defaultData}
        />
      </CardContent>
      <CardActions
        sx={{
          justifyContent: 'flex-start',
          paddingLeft: '24px',
          paddingRight: '24px',
        }}
      >
        <LoadingButton
          variant="outlinedSecondary"
          onClick={modalCloseAction}
          label="Cancel"
        />
        <LoadingButton
          loading={loading}
          onClick={handleSubmit(onHandleSubmit)}
          label="Save"
        />
      </CardActions>
    </Box>
  );
};

export default VitalsForm;
