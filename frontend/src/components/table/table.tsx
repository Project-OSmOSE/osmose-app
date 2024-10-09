import React, { ReactNode } from "react";

import './table.css'

interface TableProps {
  columns: number;
  children: Iterable<ReactNode>;
  isFirstColumnSticky?: boolean;
}

export const Table: React.FC<TableProps> = ({
                                              children,
                                              columns,
                                              isFirstColumnSticky
                                            }) => (
  <div className={ `table-aplose ${ isFirstColumnSticky ? 'first-column-sticky' : '' }` }
       style={ {
         "--content-columns": columns
       } as React.CSSProperties }>
    { children }
  </div>
)

interface CellProps {
  children?: ReactNode;
  isFirstColumn?: boolean;
  onClick?: () => void;
}

export const TableHead: React.FC<CellProps> = ({
                                                 children,
                                                 isFirstColumn,
                                                 onClick,
                                               }) => (
  <div className={ `table-head ${ isFirstColumn ? 'first' : '' }` }
       onClick={ onClick }>
    { children }
  </div>
)

export const TableContent: React.FC<CellProps> = ({
                                                    children,
                                                    isFirstColumn,
                                                    onClick,
                                                  }) => (
  <div className={ `table-content ${ isFirstColumn ? 'first' : '' }` }
       onClick={ onClick }>
    { children }
  </div>
)


export const TableDivider: React.FC = () => <div className="divider"/>
