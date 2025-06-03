import React, { useCallback } from "react";
import styles from "./styles.module.scss";
import { IoCloseCircle } from "react-icons/io5";

export const ChipGroup: React.FC<{
  labels: string[];
  activeLabels: string[];
  setActiveLabels: (newLabels: string[]) => void;
}> = ({ labels, activeLabels, setActiveLabels }) => {

  const toggleLabel = useCallback((label: string) => {
    if (activeLabels.includes(label)) {
      setActiveLabels(activeLabels.filter(l => l !== label));
    } else {
      setActiveLabels([ ...activeLabels, label ]);
    }
  }, [ activeLabels ])

  return <div className={ styles.chips }>
    { labels.map(label => <Chip key={ label }
                                label={ label }
                                isActive={ activeLabels.includes(label) }
                                toggleActive={ () => toggleLabel(label) }/>) }
  </div>
}

export const Chip: React.FC<{
  label: string;
  isActive: boolean;
  toggleActive: () => void;
}> = ({ label, isActive, toggleActive }) => (

  <div className={ [ styles.chip, isActive ? styles.active : '' ].join(' ') }
       onClick={ toggleActive }>
    { label }
    <IoCloseCircle/>
  </div>
)
