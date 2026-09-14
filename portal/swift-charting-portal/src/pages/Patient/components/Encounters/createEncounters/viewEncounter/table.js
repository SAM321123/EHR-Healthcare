import React from 'react';
import { LAB_RADIOLOGY_COLUMNS, ALLERGIES_COLUMNS, VITALS_COLUMN, MEDICATION_COLUMNS, DIAGNOSIS_COLUMN } from 'src/lib/tableConstants';

import Table from 'src/components/Table';

const ViewSelectedFormTable = ({type, data}) => {
    let tableColumn;
    if(type === 'Allergies'){
        tableColumn = ALLERGIES_COLUMNS
    }
    if(type === "Medications"){
        tableColumn = MEDICATION_COLUMNS
    } 
    if(type === "Diagnosis"){
        tableColumn = DIAGNOSIS_COLUMN
    } 
    if(type === "Vitals"){
        tableColumn = VITALS_COLUMN
    } 
    if(type === "LabRadiologies"){
        tableColumn = LAB_RADIOLOGY_COLUMNS
    } 
    
    return(
      <div style={{marginTop:'20px'}}>  <Table
          data={data}
          totalCount={data?.length}
          columns={tableColumn}
          wrapperStyle={{ boxShadow: 'none', borderRadius: 0 }}
          timezone
        />
        </div>
    )
}

export default ViewSelectedFormTable;

