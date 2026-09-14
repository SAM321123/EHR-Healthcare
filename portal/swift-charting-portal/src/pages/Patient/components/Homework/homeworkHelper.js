import { convertWithTimezone } from "src/lib/utils";

export const getHomeworkEditData = (data)=>{
    const editData={
        id:data.id,
        title:data.title,
        ICDId:data.diagnosisIcd,
        goalsOfExcercise:data.goalsOfExcercise,
        suggestions:data.suggestions,
        statusCode: data.statusCode,
        startDate:convertWithTimezone(data.startDate,{requiredPlain:true}),
        endDate:convertWithTimezone(data.endDate,{requiredPlain:true}),
      };

      return editData;
}