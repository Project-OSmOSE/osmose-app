import React, { ReactNode, useMemo } from "react";
import styles from './ui.module.scss'

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
                                              className: _className,
                                              isFirstColumnSticky,
                                              size = 'medium',
                                            }) => {
  const className = useMemo(() => {
    const classes = [ styles.table, 'table-aplose' ]; // .table-aplose used for testing purpose
    if (isFirstColumnSticky) classes.push(styles.firstColumnSticky)
    if (columns === 1) classes.push(styles.uniqueColumn)
    if (size === 'small') classes.push(styles.small)
    if (_className) classes.push(_className)
    return classes.join(' ')
  }, [ _className, isFirstColumnSticky, columns ])

  return <div
    className={ [ className, styles.table, isFirstColumnSticky && 'first-column-sticky', `columns-${ columns }`, size ].join(' ') }
    style={ {
      "--content-columns": columns
    } as React.CSSProperties }>
    { children }
  </div>
}

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
                                                 className: _className,
                                                 disabled,
                                                 topSticky,
                                                 leftSticky,
                                               }) => {
  const className = useMemo(() => {
    const classes = [ styles.head ];
    if (isFirstColumn) classes.push(styles.first)
    if (disabled) classes.push('disabled')
    if (_className) classes.push(_className)
    return classes.join(' ')
  }, [ _className, isFirstColumn, disabled ])

  return <div className={ className }
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
}

export const TableContent: React.FC<CellProps> = ({
                                                    children,
                                                    isFirstColumn,
                                                    onClick,
                                                    className: _className,
                                                    disabled,
                                                    leftSticky
                                                  }) => {
  const className = useMemo(() => {
    const classes = [ styles.content, 'table-content' ]; // table-content needed for test
    if (isFirstColumn) classes.push(styles.first)
    if (disabled) classes.push('disabled')
    if (_className) classes.push(_className)
    return classes.join(' ')
  }, [ _className, isFirstColumn, disabled ])

  return <div className={ className }
              style={ {
                position: leftSticky ? 'sticky' : undefined,
                left: leftSticky ? '0' : undefined,
                backgroundColor: leftSticky ? 'white' : undefined,
              } }
              onClick={ onClick }>
    { children }
  </div>

}


export const TableDivider: React.FC<{ className?: string }> = ({ className }) => <div
  className={ [ styles.divider, className ].join(' ') }/>
