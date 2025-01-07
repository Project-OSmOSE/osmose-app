import React, { ReactNode } from "react";

import './table.css'

interface TableProps {
  columns: number;
  children: Iterable<ReactNode>;
  isFirstColumnSticky?: boolean;
  className?: string;
}

export const Table: React.FC<TableProps> = ({
                                              children,
                                              columns,
                                              className,
                                              isFirstColumnSticky
                                            }) => (
  <div
    className={ [ className, 'table-aplose', isFirstColumnSticky && 'first-column-sticky', `columns-${ columns }` ].join(' ') }
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
  className?: string;
  disabled?: boolean;
}

export const TableHead: React.FC<CellProps> = ({
                                                 children,
                                                 isFirstColumn,
                                                 onClick,
                                                 className,
                                                 disabled,
                                               }) => (
  <div className={ `table-head ${ isFirstColumn ? 'first' : '' } ${ disabled ? 'disabled' : '' } ${ className ?? '' }` }
       onClick={ onClick }>
    { children }
  </div>
)

export const TableContent: React.FC<CellProps> = ({
                                                    children,
                                                    isFirstColumn,
                                                    onClick,
                                                    className,
                                                    disabled,
                                                  }) => (
  <div className={ `table-content ${ isFirstColumn ? 'first' : '' } ${ disabled ? 'disabled' : '' } ${ className ?? '' }` }
       onClick={ onClick }>
    { children }
  </div>
)


export const TableDivider: React.FC = () => <div className="divider"/>
