import React, { createContext, useState, useContext } from 'react';

const TemplateContext = createContext();

export const TemplateProvider = ({ children }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedDiagnosis, setSelectedDiagnosis] = useState(null);
  const [problems, setProblems] = useState({});
  const [selectedProblems, setSelectedProblems] = useState({});
  const [behaviors, setBehaviors] = useState({});
  const [selectedBehaviors, setSelectedBehaviors] = useState({});
  const [goals, setGoals] = useState({});
  const [selectedGoals, setSelectedGoals] = useState({});
  const [objectives, setObjectives] = useState({});
  const [selectedObjectives, setSelectedObjectives] = useState({});
  const [interventions, setInterventions] = useState({});
  const [selectedInterventions, setSelectedInterventions] = useState({});

  return (
    <TemplateContext.Provider
      value={{
        activeStep,
        setActiveStep,
        selectedDiagnosis,
        setSelectedDiagnosis,
        problems,
        setProblems,
        selectedProblems,
        setSelectedProblems,
        behaviors,
        setBehaviors,
        selectedBehaviors,
        setSelectedBehaviors,
        goals,
        setGoals,
        selectedGoals,
        setSelectedGoals,
        objectives,
        setObjectives,
        selectedObjectives,
        setSelectedObjectives,
        interventions,
        setInterventions,
        selectedInterventions,
        setSelectedInterventions,
      }}
    >
      {children}
    </TemplateContext.Provider>
  );
};

export const useTemplate = () => useContext(TemplateContext);
