/* eslint-disable no-unused-vars */
import React from "react";
import HealthSolution from "src/pages/Home/HealthSolution";
import ResponsiveAppBar from "./header";
import AboutUs from "./About-us";
import OurServices from "./services";
import Treatment from "./treatment";
import Team from "./team";
import Contact from "./contact";
import FooterSection from "./footer";
import './common.css'
import HowItWork from "./howItWork";
// import AboutUs from "src/section/services";

export default function ClientHome() {
  return (<div className="cient-home">

      <ResponsiveAppBar/>
        <HealthSolution />
        <AboutUs/>
        <OurServices/>
        <Treatment/>
        <HowItWork/>
        <Team/>
        <Contact/>
        <FooterSection/>
    </div>
  );
}
