const getMaximumScore = (matrix) => {
  let maxScore = 0;
  const rows = matrix?.[0]?.rowData?.length;
  matrix?.[0]?.columns?.forEach((col) => {
    if (parseInt(col.score, 10) > maxScore) {
      maxScore = parseInt(col.score, 10);
    }
  });

  return maxScore * rows;
};

const getAchievedScore = (matrix, formData) => {
  let achievedScore = 0;
  Object.values(formData)?.forEach((value) => {
    const columns = matrix?.[0]?.columns || [];
    const res = columns?.find((item) => item?.dataKey === value);
    if (res) {
      achievedScore += parseInt(res.score, 10);
    }
  });
  return achievedScore;
};

const getMatrixCalculation = (formData, formGroups) => {
  const matrix = {};
  formGroups?.forEach((section) => {
    section?.fields?.forEach((fields) => {
      fields?.forEach((field) => {
        if (field?.inputType === 'matrix' && field?.enableScore) {
          matrix[`${field.id}`] = {
            id: field.id,
            achievedScore: getAchievedScore(field?.matrix, formData),
            maximumScore: getMaximumScore(field?.matrix),
          };
        }
      });
    });
  });
  return matrix;
};

export default getMatrixCalculation;
