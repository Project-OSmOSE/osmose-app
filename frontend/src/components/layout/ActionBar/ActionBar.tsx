import React, { ReactNode } from "react";
import styles from "./action.module.scss";
import { Searchbar } from "@/components/ui/Searchbar.tsx";

export const ActionBar: React.FC<{
  search?: string;
  searchPlaceholder?: string;
  onSearchChange(search?: string): void;
  actionButton: ReactNode;
  children?: ReactNode;
}> = ({ search, searchPlaceholder = 'Search', onSearchChange, actionButton, children }) => (
  <div className={ styles.actionBar }>
    <Searchbar placeholder={ searchPlaceholder }
               onChange={ onSearchChange }
               search={ search }
               className={ styles.search }/>

    { actionButton }

    { children && <div className={ styles.filters }>{ children }</div> }
  </div>
)