import React, { type HTMLAttributes, useMemo } from 'react';
import type { BaseColor } from '@/components/base/types';
import styles from './Note.module.scss'

export type NoteProps = HTMLAttributes<HTMLParagraphElement> &
    { color?: BaseColor } & { flex?: boolean, small?: boolean, data?: boolean };

export const Note: React.FC<NoteProps> = ({ className, color, flex, children, small, data, ...props }) => {
    const content = useMemo(() => {
        if (small) return <small>{ children }</small>
        return children
    }, [ small, children ])
    const classes = useMemo(() => {
        const classes = [ className, styles.Note ]
        if (color) classes.push(styles[color])
        if (flex) classes.push(styles.flex)
        if (data) classes.push(styles.data)
        return classes
    }, [ className, color, flex, data ])
    return <span className={ classes.join(' ') }
                 children={ content }
                 { ...props }/>
}
