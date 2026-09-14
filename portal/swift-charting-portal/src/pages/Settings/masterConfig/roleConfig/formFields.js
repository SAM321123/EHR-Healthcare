import { regexCustomText, requiredField } from "src/lib/constants";

export const roleFormGroups = [
    {
      inputType: 'text',
      type: 'text',
      name: 'name',
      required: requiredField,
      textLabel: 'Name',
      pattern: regexCustomText,
    },
    {
        inputType: 'textArea',
        name: 'description',
        textLabel: 'Description',
        pattern: regexCustomText,
        colSpan: 1,
    },
  ];