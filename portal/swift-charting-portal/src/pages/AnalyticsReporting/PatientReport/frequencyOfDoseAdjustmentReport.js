import {  useEffect, useMemo, useState } from 'react';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import Container from 'src/components/Container';
import FilterComponents from 'src/components/FilterComponents';
import Table from 'src/components/Table';
import useCRUD from 'src/hooks/useCRUD';
import { DOSE_FREQUENCY_COLUMN } from 'src/lib/tableConstants';
import { GET_FREQUENCY_OF_DOSE_ADJUSTMENT } from 'src/store/types';


const FrequencyOfDoseAdjustmentReport = () => {
  const columns = [...DOSE_FREQUENCY_COLUMN];
  const [searchText , setSearchText] = useState(null)

  const responseModifier = (medicationResponse) => {
    return medicationResponse?.flatMap((medication) => {
      const { patientId, patient, items: currentItems = [], patientMedicationHistory = [] } = medication;
  
      // Flatten history items for comparison
      const historyItems = patientMedicationHistory.flatMap((history) => history.items || []);
  
      return currentItems.map((currentItem) => {
        const { genericDrug, brandNameDrug, amount, unitCode } = currentItem;
  
        // Group historical items matching the current drug and brand
        const matchingHistoryItems = historyItems.filter(
          (historyItem) =>
            historyItem.genericDrug === genericDrug && historyItem.brandNameDrug === brandNameDrug
        );
  
        // If no matching historical items, return with zero changes
        if (matchingHistoryItems.length === 0) {
          return {
            patient,
            patientId,
            genericDrug,
            brandNameDrug,
            frequencyOfAmountChanges: 0,
            frequencyOfUnitCodeChanges: 0,
          };
        }
  
        // Initialize counters
        let frequencyOfAmountChanges = 0;
        let frequencyOfUnitCodeChanges = 0;
  
        // Compare consecutive historical items and the last historical item with the current item
        for (let i = 0; i < matchingHistoryItems.length; i++) {
          const currentHistoryItem = matchingHistoryItems[i];
          const nextHistoryItem = matchingHistoryItems[i + 1];
  
          // Compare with next historical item (if exists)
          if (nextHistoryItem) {
            if (nextHistoryItem.amount !== currentHistoryItem.amount) frequencyOfAmountChanges++;
            if (nextHistoryItem.unitCode !== currentHistoryItem.unitCode) frequencyOfUnitCodeChanges++;
          }
  
          // Compare the last historical item with the current item
          if (i === 0) {
            if (currentHistoryItem.amount !== amount) frequencyOfAmountChanges++;
            if (currentHistoryItem.unitCode !== unitCode) frequencyOfUnitCodeChanges++;
          }
          // if (i === matchingHistoryItems.length - 1) {
          //   if (currentHistoryItem.amount !== amount) frequencyOfAmountChanges++;
          //   if (currentHistoryItem.unitCode !== unitCode) frequencyOfUnitCodeChanges++;
          // }
        }
  
        return {
          patient,
          patientId,
          genericDrug,
          brandNameDrug,
          frequencyOfAmountChanges,
          frequencyOfUnitCodeChanges,
        };
      });
    })
    .filter(
      (item) => item.frequencyOfAmountChanges !== 0 || item.frequencyOfUnitCodeChanges !== 0
    );
  };
  
    const [response, ,loading , getDoseAdjustmentApi, ] = useCRUD({
       id: GET_FREQUENCY_OF_DOSE_ADJUSTMENT,
       url: `${API_URL.analyticsAndReporting}/frequency-of-dose-adjustment`,
       type: REQUEST_METHOD.get,
       responseModifier,
     });
   useEffect(()=>{
    getDoseAdjustmentApi({searchText})
   },[searchText])
   const handleFilters = (value) => {
     const {searchText} = value
     setSearchText(searchText)
   }
   const FilterCollectionHeader = useMemo(
    () =>
      FilterComponents({
        leftComponents: [
          {
            type: 'search',
            filterProps: {
              placeholder: 'Search medicine',
            },
            name: 'searchText',
          },
        ],
      }),
    []
  );
  return (
    <Container
      style={{ display: 'flex', flexDirection: 'column' }}
      loading={loading}
    >
      <Table
       headerComponent={
        <FilterCollectionHeader onFilterChange={handleFilters}/>
      }
        isScroll={true}
        data={response}
        columns={columns}
        wrapperStyle={{ boxShadow: 'none', borderRadius: 0 }}
        timezone
      />
    </Container>
  );
};

export default FrequencyOfDoseAdjustmentReport;
