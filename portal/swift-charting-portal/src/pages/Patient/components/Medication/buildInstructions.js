/* eslint-disable no-unused-vars */
import React from 'react';
import Box from '@mui/material/Box';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import LoadingButton from 'src/components/CustomButton/loadingButton';
import { useForm } from 'react-hook-form';
import CustomForm from 'src/components/form';
import { WiredMasterField, WiredSelect } from 'src/wiredComponent/Form/FormFields';
import { useSelector } from 'react-redux';

const BuildInstructions = ({ modalCloseAction, defaultData, saveInstructions, requiredField }) => {
  
  const form = useForm({ defaultValues: defaultData || {} });
  const { handleSubmit } = form;

  const onHandleSubmit = (data) => {
    saveInstructions(data) 
  }

  const buildInstructionsFormGroups  = [
    {
      ...WiredMasterField({
        code: 'dose_type',
        filter:{limit:20},
        name: 'doseCode',
        label:"Dose",
        labelAccessor:'name',
        valueAccessor:'code',
        colSpan:0.25,
        required: requiredField,
      }),
    },
    {
      ...WiredMasterField({
        code: 'unit_type',
        filter:{limit:20},
        name: 'unitCode',
        label:"Unit",
        labelAccessor:'name',
        valueAccessor:'code',
        colSpan:0.25,
        required: requiredField,
  
      }),
    },
    {
      ...WiredMasterField({
        code: 'dose_form_type',
        filter:{limit:20},
        name: 'doseFormCode',
        label:"Dosage Form",
        labelAccessor:'name',
        valueAccessor:'code',
        colSpan:0.25,
        required: requiredField,
      }),
    },
    {
      ...WiredMasterField({
        code: 'route_type',
        filter:{limit:20},
        name: 'routeCode',
        label:"Route",
        labelAccessor:'name',
        valueAccessor:'code',
        colSpan:0.25,
        required: requiredField,
      }),
     },
    {
      ...WiredMasterField({
        code: 'frequency_type',
        filter:{limit:20},
        name: 'frequencyCode',
        label:"Frequency",
        labelAccessor:'name',
        valueAccessor:'code',
        colSpan:0.25,
        required: requiredField,
      }),
     },
    {
      ...WiredMasterField({
        code: 'direction_type',
        filter:{limit:20},
        name: 'directionCode',
        label:"Directions",
        labelAccessor:'name',
        valueAccessor:'code',
        colSpan:0.25,
        required: requiredField,
      }),
     },
     {
      type: 'text',
      label: 'Duration',
      colSpan: 0.25,
      required: requiredField,
      fields: [
        {
          inputType:'text',
          type:'number',
          name:'duration',
          colSpan:0.5,
          required: requiredField,
        },
        {
          ...WiredMasterField({
            code: 'duration_type',
            filter:{limit:20},
            name: 'durationCode',
            label:"Duration",
            labelAccessor:'name',
            valueAccessor:'code',
            colSpan:0.5,
            required: requiredField,
          }),
         },
      ],
    },
    
  ]


  return (
    <div style={{ width: '-webkit-fill-available' }}>
      <Box>
        <CardContent>
          <div>
            <CustomForm 
              formGroups={buildInstructionsFormGroups}
              columnsPerRow={1}
              form={form}
              style={{ width: '100%'}}
            />

          </div>
        </CardContent>
        <CardActions
          sx={{
            justifyContent: 'flex-start',
            paddingLeft:'24px',
            paddingRight:'24px',
          }}
        >
          <LoadingButton
            variant="outlinedSecondary"
            onClick={modalCloseAction}
            label="Cancel"
          />
          <LoadingButton
            // loading={loading}
            onClick={handleSubmit(onHandleSubmit)}
            label="Save"
          />
        </CardActions>
      </Box>
    </div>
  );
};

 export default BuildInstructions;
