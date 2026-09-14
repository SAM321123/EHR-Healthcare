const allergySeverities = [
  {
    name: 'Mild',
    code: 'mild_allergy',
    description: 'Mild symptoms that typically do not interfere with daily activities.',
    globalCategoryTypeCode: 'allergy_severities',
    isDeleted: false,
    isActive: true,
  },
  {
    name: 'Moderate',
    code: 'moderate_allergy',
    description: 'Symptoms that may cause discomfort and could interfere with daily activities.',
    globalCategoryTypeCode: 'allergy_severities',
    isDeleted: false,
    isActive: true,
  },
  {
    name: 'Severe',
    code: 'severe_allergy',
    description: 'Symptoms that significantly interfere with daily activities and may require medical attention.',
    globalCategoryTypeCode: 'allergy_severities',
    isDeleted: false,
    isActive: true,
  },
];

module.exports = {
  allergySeverities,
};
