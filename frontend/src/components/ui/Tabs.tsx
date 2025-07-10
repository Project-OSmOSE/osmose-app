import React, { ReactNode } from "react";
import styles from './ui.module.scss'
import { Link, LinkProps } from "@/components/ui/Link.tsx";

export const Tabs: React.FC<{ children: ReactNode }> = ({ children }) =>
  <div className={ styles.tabs } children={ children }/>

// noinspection RequiredAttributes: Warning for missing required children attributes, but children is required in LinkProps anyway
export const Tab: React.FC<LinkProps & { active?: boolean }> = ({ className, active, ...props }) =>
  <Link { ...props }
        className={ [ styles.tab, active ? styles.active : '', className ].join(' ') }
        color='medium'/>