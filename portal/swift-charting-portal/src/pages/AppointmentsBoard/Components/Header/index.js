import { useCallback } from 'react';
import { API_URL } from 'src/api/constants';

import PageHeader from 'src/components/PageHeader';
import WiredSelect from 'src/wiredComponent/Select';
import MonthlyDatePicker from '../MonthlyDatePicker';

import './header.scss';

const RightContent = ({ handleFilter, setStatsFilters }) => {
  const handleChange = useCallback(
    (value) => {
      if (value === 'ALL') {
        handleFilter({ practitioner: undefined });
      } else {
        handleFilter({ practitioner: value });
      }
    },
    [handleFilter]
  );

  return (
    <div className="header-container-right-content">
      <MonthlyDatePicker setStatsFilters={setStatsFilters} />
      <WiredSelect
        name="practitioner"
        url={API_URL.practitioner}
        params={{ isActive: true, limit: 300 }}
        size="small"
        style={{ width: '250px', marginBottom: '10px' }}
        onChange={handleChange}
        labelAccessor={['firstName', 'lastName']}
        valueAccessor="id"
        isAllOptionNeeded
        defaultValue="ALL"
        allOptionLabel="All Practitioners"
        cache={false}
      />
    </div>
  );
};

const Header = ({ handleFilter, setStatsFilters }) => (
  <div className="dashboard-header">
    <PageHeader
      title="Dashboard"
      rightContent={[
        {
          render: (
            <RightContent
              handleFilter={handleFilter}
              setStatsFilters={setStatsFilters}
            />
          ),
        },
      ]}
    />
  </div>
);

export default Header;
