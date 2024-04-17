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
  children: ReactNode;
  isFirstColumn?: boolean;
}

export const TableHead: React.FC<CellProps> = ({
                                                 children,
                                                 isFirstColumn
                                               }) => (
  <div className={ `table-head ${ isFirstColumn ? 'first' : '' }` }>
    { children }
  </div>
)

export const TableContent: React.FC<CellProps> = ({
                                                    children,
                                                    isFirstColumn,
                                                  }) => (
  <div className={ `table-content ${ isFirstColumn ? 'first' : '' }` }>
    { children }
  </div>
)


export const TableDivider: React.FC = () => <div className="divider"/>
