const { maxLength, requiredField } = require('src/lib/constants');

const ENCOUNTER_NOTE_MAX_LENGTH = 10000;

export const encounterNoteFormGroup = [
  {
    inputType: 'textArea',
    name: 'description',
    textLabel: 'Description',
    required: requiredField,
    colSpan: 1,
    validation: 'commonText',
    maxLength: maxLength('Description', ENCOUNTER_NOTE_MAX_LENGTH),
  },
];
