const { requiredField } = require("src/lib/constants");
const { WiredMasterField } = require("src/wiredComponent/Form/FormFields");

const showOtherSocialHistory =(data)=>{
  if (data?.socialHistoryCode === 'other_social_history_code') {
    return { hide: false };
  }
  return { hide: true };
}
const SocialHistoryFormGroups = [
    {
        ...WiredMasterField({
          code: 'social_history_code',
          filter:{limit:20},
          name: 'socialHistoryCode',
          label:"Social History",
          labelAccessor:'name',
          valueAccessor:'code',
          colSpan:0.3,
          placeholder:'Select',
          required: requiredField,
    
        }),
      },
      {
        inputType: 'text',
        name: 'socialHistoryOther',
        textLabel: 'Social History (Other)',
        colSpan: 0.3,
        dependencies: {
          keys: ['socialHistoryCode'],
          calc: showOtherSocialHistory,
        },
      },
      {
        inputType: 'date',
        name: 'date',
        textLabel: 'Date',
        colSpan: 0.3,
        disableFuture: true,
        required: requiredField,
      },
      {
        ...WiredMasterField({
          code: 'status_code',
          filter:{limit:20},
          name: 'statusCode',
          label:"Status",
          labelAccessor:'name',
          valueAccessor:'code',
          colSpan:0.4,
          placeholder:'Select',
          required: requiredField,
    
        }),
        },

 
      {
        inputType: 'textArea',
        name: 'description',
        textLabel: 'Description',
        colSpan: 1,
      },
]

export default SocialHistoryFormGroups;