import React, { useState } from "react";
import { DeploymentAPI } from "@PAM-Standardization/metadatax-ts";
import styles from "./panel.module.scss";
import { IoFunnel, IoFunnelOutline } from "react-icons/io5";

export const FilterPanel: React.FC<{
  allDeployments: Array<DeploymentAPI>,
  onFilter: (filteredDeployments: Array<DeploymentAPI>) => void
}> = ({
        allDeployments,
      }) => {
  const [ isFiltered, setIsFiltered ] = useState<boolean>(false);
  const [ isOpen, setIsOpen ] = useState<boolean>(false);

  if (!isOpen) {
    return <div className={ [ styles.panel, styles.filter, styles.empty ].join(' ') }
                onClick={ () => setIsOpen(true) }>
      <FilterIcon isFiltered={ isFiltered }/>
    </div>
  }
  return <div className={ [styles.panel, styles.filter].join(' ') }>
    <FilterIcon isFiltered={ isFiltered }/>
  </div>
}

const FilterIcon: React.FC<{ isFiltered: boolean }> = ({ isFiltered }) => {
  if (isFiltered) return <IoFunnel/>
  else return <IoFunnelOutline/>
}