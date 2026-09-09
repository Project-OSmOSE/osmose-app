import React, { Fragment, MouseEvent, useCallback, useMemo } from 'react';
import styles from './styles.module.scss';
import { Kbd } from '@/components/ui';
import {
    focusAnnotation,
    selectAllAnnotations,
    selectAnnotation,
    useAddAnnotation,
    useGetAnnotation,
    useRemoveAnnotation,
    useUpdateAnnotation,
} from '@/features/Annotator/Annotation';
import { AnnotationType } from '@/api';
import { selectDefaultConfidence } from '@/features/Annotator/Confidence';
import { useAppDispatch, useAppSelector } from '@/features/App';
import { setHiddenLabels } from './slice';
import { selectFocusLabel, selectHiddenLabels } from './selectors';
import { NBSP } from '@/service/type';
import { useLoaderData } from '@tanstack/react-router';
import { Popover } from '@/components/base/Popover';
import { Chip, type ChipProps, ChipRemove } from '@/components/base';
import { Eye, EyeClosed, Unread } from '@solar-icons/react';
import { useHotkeySequence } from '@tanstack/react-hotkeys';
import type { Hotkey } from '@tanstack/hotkeys/src/hotkey';

export const AlphanumericKeys = [ 'à', '&', 'é', '"', '\'', '(', '-', 'è', '_', 'ç' ]

export const LabelChip: React.FC<{
    label: string;
}> = ({ label }) => {
    const { labels } = useLoaderData({ from: '/_authenticated/annotation-campaign/$campaignID' })
    const focusedLabel = useAppSelector(selectFocusLabel)
    const hiddenLabels = useAppSelector(selectHiddenLabels)
    const defaultConfidence = useAppSelector(selectDefaultConfidence);
    const addAnnotation = useAddAnnotation()
    const updateAnnotation = useUpdateAnnotation()
    const focusedAnnotation = useAppSelector(selectAnnotation)
    const allAnnotations = useAppSelector(selectAllAnnotations)
    const getAnnotation = useGetAnnotation()
    const removeAnnotation = useRemoveAnnotation()
    const index = useMemo(() => labels.map(l => l.name).indexOf(label), [ labels, label ])
    const numberShortcuts = useMemo(() => (index + 1).toString()?.split('') as Hotkey[], [ index ]);
    const keyShortcuts = useMemo(() => (index + 1).toString()?.split('').map(i => AlphanumericKeys[+i]) as Hotkey[], [ index ]);
    const isUsed = useMemo(() => allAnnotations.some(a => a.label === label), [ allAnnotations, label ])
    const isHidden = useMemo(() => hiddenLabels.includes(label), [ hiddenLabels, label ])
    const dispatch = useAppDispatch()

    const select = useCallback(() => {
        const weakProperties = {
            type: AnnotationType.Weak,
            label,
        }

        const weak = getAnnotation(weakProperties)
        if (!weak) addAnnotation({ ...weakProperties, confidence: defaultConfidence })

        if (focusedAnnotation && focusedAnnotation.type !== AnnotationType.Weak) {
            updateAnnotation(focusedAnnotation, { label })
        } else if (weak) {
            return dispatch(focusAnnotation(weak))
        }
    }, [ focusedAnnotation, updateAnnotation, label, getAnnotation, dispatch, addAnnotation, defaultConfidence ])
    useHotkeySequence(numberShortcuts, () => select())
    useHotkeySequence(keyShortcuts, () => select())

    const show = useCallback((event: MouseEvent) => {
        event.stopPropagation();
        // Hide all but current if ctrlKey pressed
        if (event.ctrlKey) dispatch(setHiddenLabels(labels.map(l => l.name).filter(l => l !== label)))
        else dispatch(setHiddenLabels(hiddenLabels.filter(l => l !== label)))
    }, [ label, hiddenLabels, dispatch, labels ])

    const hide = useCallback((event: MouseEvent) => {
        event.stopPropagation();
        // Hide all but current if ctrlKey pressed => show
        if (event.ctrlKey) show(event)
        else dispatch(setHiddenLabels([ ...hiddenLabels, label ]))
    }, [ label, show, dispatch, hiddenLabels ])

    const remove = useCallback(() => {
        const annotation = getAnnotation({ label, type: AnnotationType.Weak })
        if (!annotation) return;
        removeAnnotation(annotation)
    }, [ label, getAnnotation, removeAnnotation ])

    return (
        <Chip data-testid="label-chip"
              onClick={ select }
              { ...(isUsed ? { annotationColorIndex: index } : { color: 'medium' }) as Partial<ChipProps> }>
            { focusedLabel === label && <Unread weight="Linear" size={ 20 }/> }

            <Popover.Root>
                <Popover.Trigger render={ <span/> } nativeButton={ false }>
                    { label }
                </Popover.Trigger>
                <Popover.Content>
                    <Popover.Title>Shortcut</Popover.Title>
                    <Kbd keys={ numberShortcuts } annotationColorIndex={ index }/>:
                    { NBSP }Choose this label
                </Popover.Content>
            </Popover.Root>


            { isUsed && <Fragment>
                <Popover.Root>
                    <Popover.Trigger render={ <div/> } nativeButton={ false } className={ styles.button }>
                        { isHidden ?
                            <EyeClosed weight="Linear" size={ 20 } onClick={ show }/> :
                            <Eye weight="Linear" size={ 20 } onClick={ hide }/> }
                    </Popover.Trigger>
                    <Popover.Content>
                        <p>{ isHidden ? 'Show' : 'Hide' } corresponding annotations on spectrogram</p>
                        <p>Press <Kbd keys={ 'ctrl' }/> to show only this labels annotations</p>
                    </Popover.Content>
                </Popover.Root>

                <Popover.Root>
                    <Popover.Trigger render={ <div/> } nativeButton={ false } className={ styles.button }>
                        <ChipRemove onClick={ remove } data-testid="remove-label"/>
                    </Popover.Trigger>
                    <Popover.Content>Remove corresponding annotations</Popover.Content>
                </Popover.Root>
            </Fragment> }
        </Chip>
    )
}