import React, { useCallback, useEffect } from 'react';
import styles from './styles.module.scss';
import { Kbd } from '@/components/ui';
import { useAnnotatorCanNavigate, useOpenAnnotator } from './hooks';
import { useAnnotatorSubmit } from '@/features/Annotator';
import { useLoaderData, useParams, useSearch } from '@tanstack/react-router';
import { queryClient } from '@/api/queryClient';
import { Popover } from '@/components/base/Popover';
import { AltArrowLeft, AltArrowRight } from '@solar-icons/react';
import { AnnotationSpectrogramAPI } from '@/features/AnnotationSpectrogram';
import { useHotkey } from '@tanstack/react-hotkeys';

export const NavigationButtons: React.FC = () => {
    const { user } = useLoaderData({ from: '/_authenticated' })
    const params = useParams({ from: '/_authenticated/annotation-campaign/$campaignID/phase/$phaseType/spectrogram/$spectrogramID' })
    const search = useSearch({ from: '/_authenticated/annotation-campaign/$campaignID/phase/$phaseType/spectrogram/$spectrogramID' })
    const {
        info,
        isEditionAuthorized,
    } = useLoaderData({ from: '/_authenticated/annotation-campaign/$campaignID/phase/$phaseType/spectrogram/$spectrogramID' })
    const canNavigate = useAnnotatorCanNavigate()
    const openAnnotator = useOpenAnnotator()
    const { submit, isPending } = useAnnotatorSubmit()

    const navPrevious = useCallback(async () => {
        if (isPending) return;
        if (!info?.previousSpectrogramId) return;
        if (await canNavigate()) openAnnotator(info.previousSpectrogramId, { replace: true })
    }, [ openAnnotator, isPending, info, canNavigate ])
    const navNext = useCallback(async () => {
        if (isPending) return;
        if (!info?.nextSpectrogramId) return;
        if (await canNavigate()) openAnnotator(info.nextSpectrogramId, { replace: true })
    }, [ canNavigate, openAnnotator, isPending, info ])

    useHotkey('ArrowLeft', navPrevious)
    useHotkey('ArrowRight', navNext)

    useEffect(() => {
        if (!info?.nextSpectrogramId) return
        queryClient.prefetchQuery(AnnotationSpectrogramAPI.getQuery({
            ...params,
            ...search,
            annotatorID: user.id,
            spectrogramID: info.nextSpectrogramId,
        }))
    }, [ info ]);

    return (
        <div className={ styles.navigation }>
            <Popover.Root>
                <Popover.Trigger color="medium"
                                 disabled={ isPending || !info?.previousSpectrogramId }
                                 onClick={ navPrevious }>
                    <AltArrowLeft weight="Linear" size={ 24 }/>
                </Popover.Trigger>
                <Popover.Content>
                    <Popover.Title>Shortcut</Popover.Title>
                    <Kbd keys="left"/> : Load previous recording
                </Popover.Content>
            </Popover.Root>

            { isEditionAuthorized &&
                <Popover.Root>
                    <Popover.Trigger color="medium"
                                     disabled={ isPending }
                                     onClick={ submit }>
                        Submit &amp; load next recording
                    </Popover.Trigger>
                    <Popover.Content>
                        <Popover.Title>Shortcut</Popover.Title>
                        <Kbd keys={ 'enter' }/> : Submit & load next recording
                    </Popover.Content>
                </Popover.Root> }

            <Popover.Root>
                <Popover.Trigger color="medium"
                                 disabled={ isPending || !info?.nextSpectrogramId }
                                 onClick={ navNext }>
                    <AltArrowRight weight="Linear" size={ 20 }/>
                </Popover.Trigger>
                <Popover.Content>
                    <Popover.Title>Shortcut</Popover.Title>
                    <Kbd keys="right"/> : Load next recording
                </Popover.Content>
            </Popover.Root>
        </div>
    )
}