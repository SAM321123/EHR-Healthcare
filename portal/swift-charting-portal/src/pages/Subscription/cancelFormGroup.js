const { requiredField, regTextArea, regexCustomText } = require('src/lib/constants');
const {
  WiredMasterAutoComplete,
  WiredMasterField,
} = require('src/wiredComponent/Form/FormFields');

const showOtherCancelReason = (data) => {
  console.log("🚀 ~ showOtherCancel ~ data:", data)
  if (data?.cancelReason === 'subscription_cancel_reason_other') {
    return { hide: false };
  }
  return { hide: true };
};

const cancelFormGroups = [
    {
        ...WiredMasterField({
            code: 'subsription_cancel_reason',
            filter:{limit:20},
            name: 'cancelReason',
            label:"Cancel Reason",
            labelAccessor: ['name', 'description'],
            valueAccessor:'code',
            placeholder:'Select ',
            required: requiredField,
            cache:false,
        }),
    },
    {
        inputType: 'text',
        name: 'otherCancelReason',
        textLabel: 'Cancel Reason (Other)',
        pattern: regexCustomText,
        dependencies: {
            keys: ['cancelReason'],
            calc: showOtherCancelReason,
        },
    },
];

export default cancelFormGroups;