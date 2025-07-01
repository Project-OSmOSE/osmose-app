import React, { useCallback, useMemo, useRef, useState } from "react";
import styles from "./panel.module.scss";
import { IoClose, IoFunnel, IoFunnelOutline, IoRefresh } from "react-icons/io5";
import { FilterRef, SampleRateFilter } from "./Filters";
import { Deployment } from "../../../pages/Projects/ProjectDetail/ProjectDetail";

type FilterProps = {
  allDeployments: Array<Deployment>,
  onFilter: (filteredDeployments: Array<Deployment>) => void
}
export const FilterPanel: React.FC<FilterProps> = ({
                                                     allDeployments,
                                                     onFilter
                                                   }) => {
  const [ isOpen, setIsOpen ] = useState<boolean>(false);

  const sampleRate = useRef<FilterRef | null>(null);

  const isFiltering = useMemo(() => sampleRate.current?.isFiltering, [ sampleRate.current ]);

  const reset = () => {
    sampleRate.current?.reset();
  }

  const updateFilter = useCallback(() => {
    const filteredList = allDeployments.filter(d => sampleRate.current?.filterDeployment(d));
    onFilter(filteredList);
  }, [ allDeployments, onFilter ])

  if (!isOpen) {
    return <div className={ [ styles.panel, styles.filter, styles.empty ].join(' ') }
                onClick={ () => setIsOpen(true) }>
      <FilterIcon isFiltering={ isFiltering === undefined ? false : isFiltering }/>
    </div>
  }
  return <div className={ [ styles.panel, styles.filter ].join(' ') }>
    <div className={ styles.head }>
      <FilterIcon isFiltering={ isFiltering === undefined ? false : isFiltering }/>
      { isFiltering && <button onClick={ () => reset() }><IoRefresh/></button> }
      <button onClick={ () => setIsOpen(false) }><IoClose/></button>
    </div>
    <div className={ styles.content }>
      {/*<DateFilter ref={ ref => filters.current.set('date', ref) } deployments={ allDeployments }/>*/ }
      <SampleRateFilter ref={ sampleRate } deployments={ allDeployments } onUpdates={ updateFilter }/>
    </div>
  </div>
}

const FilterIcon: React.FC<{ isFiltering: boolean }> = ({ isFiltering }) => {
  if (isFiltering) return <IoFunnel/>
  else return <IoFunnelOutline/>
}
