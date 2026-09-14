/* eslint-disable no-unused-vars */

import { Route, Routes } from 'react-router-dom';
import EncountersList from './encounterList';
import CreateEncounters from '../Patient/components/Encounters/createEncounters';


const Encounter = () => (
  <Routes>
    <Route path="/" element={<EncountersList />} />
    <Route path="/edit/:encounterId" element={<CreateEncounters fromMain={true} />} />
    <Route path="/create" element={<CreateEncounters fromMain={true} />} />    
  </Routes>
);

export default Encounter;
