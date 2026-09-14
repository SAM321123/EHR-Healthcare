import React from 'react';
import PracticeMembershipForm from 'src/sections/auth/practiceSetup/practiceMembershipForm';
import PageContainer from 'src/components/PageContainer';


const PracticeMembershipPage = () => (
    <>
        <PageContainer label="Start Your Subscription" title="Start Your Subscription" subTitle=" Complete the form below to activate your clinic's Swift Charting subscription." login={false} component={PracticeMembershipForm} />
    </>
    
);

export default PracticeMembershipPage;