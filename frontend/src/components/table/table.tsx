import React, { ReactNode } from "react";

import './table.css'

interface TableProps {
  columns: number;
  children: ReactNode;
  isFirstColumnSticky?: boolean;
  className?: string;
  size?: 'small' | 'medium';
}

export const Table: React.FC<TableProps> = ({
                                              children,
                                              columns,
                                              className,
                                              isFirstColumnSticky,
                                              size = 'medium',
                                            }) => (
  <div
    className={ [ className, 'table-aplose', isFirstColumnSticky && 'first-column-sticky', `columns-${ columns }`, size ].join(' ') }
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
  topSticky?: boolean;
  leftSticky?: boolean;
}

export const TableHead: React.FC<CellProps> = ({
                                                 children,
                                                 isFirstColumn,
                                                 onClick,
                                                 className,
                                                 disabled,
                                                 topSticky,
                                                 leftSticky,
                                               }) => (
  <div className={ `table-head ${ isFirstColumn ? 'first' : '' } ${ disabled ? 'disabled' : '' } ${ className ?? '' }` }
       style={ {
         position: topSticky || leftSticky ? 'sticky' : undefined,
         top: topSticky ? '0' : undefined,
         left: leftSticky ? '0' : undefined,
         backgroundColor: topSticky || leftSticky ? 'white' : undefined,
         zIndex: leftSticky ? 2 : undefined,
       } }
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
                                                    leftSticky
                                                  }) => (
  <div
    className={ `table-content ${ isFirstColumn ? 'first' : '' } ${ disabled ? 'disabled' : '' } ${ className ?? '' }` }
    style={ {
      position: leftSticky ? 'sticky' : undefined,
      left: leftSticky ? '0' : undefined,
      backgroundColor: leftSticky ? 'white' : undefined,
    } }
    onClick={ onClick }>
    { children }
  </div>
)


export const TableDivider: React.FC<{ className?: string }> = ({ className }) => <div
  className={ [ "divider", className ].join(' ') }/>
