import React from "react";
import styles from "./ontology.module.scss";
import { Tab, Tabs } from "@/components/ui";
import { Outlet, useLocation } from "react-router-dom";

export const OntologyPage: React.FC = () => {

  const location = useLocation();

  return <div className={ styles.page }>

    <h2>Ontology</h2>

    <Tabs>
      <Tab appPath='/admin/ontology/source'
           active={ location.pathname.includes('source') }>
        Sources
      </Tab>
      <Tab appPath='/admin/ontology/sound'
           active={ location.pathname.includes('sound') }>
        Sounds
      </Tab>
    </Tabs>

    <Outlet/>
  </div>
}