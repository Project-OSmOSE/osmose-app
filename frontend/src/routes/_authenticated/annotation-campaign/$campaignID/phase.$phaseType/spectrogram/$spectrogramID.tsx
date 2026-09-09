import React, { Fragment, MouseEvent, useCallback, useEffect, useMemo, useRef } from 'react';
import { createFileRoute, notFound } from '@tanstack/react-router'

import { AnnotationPhaseType } from '@/api';
import { CurrentTime, PlaybackRateSelect, PlayPauseButton } from '@/features/Audio';
import { usePointer } from '@/features/Annotator/Pointer';
import { AnnotatorSkeleton } from '@/features/Annotator/Skeleton';
import { AnnotatorCanvasWindow } from '@/features/Annotator/Canvas';
import { NavigationButtons } from '@/features/Annotator/Navigation';
import { blur, FocusedAnnotationBloc } from '@/features/Annotator/Annotation';
import { LabelsBloc } from '@/features/Annotator/Label';
import { ConfidenceBloc } from '@/features/Annotator/Confidence';
import { CommentBloc } from '@/features/Annotator/Comment';
import { AnnotationsBloc } from '@/features/Annotator/Annotation/AnnotationsBloc';

import styles from './$spectrogramID.module.scss';
import { type AllSpectrogramsFilters, AnnotationSpectrogramAPI } from '@/features/AnnotationSpectrogram';
import { ensureValidQueryData } from '@/api/utils';
import { UserAPI } from '@/features/User';
import { ConfigBar } from '@/features/Annotator/ConfigBar';
import { DownloadButtons } from '@/features/Annotator/DownloadButtons';
import { CampaignAPI } from '@/features/AnnotationCampaign';
import { useAppDispatch } from '@/features/App';

const AnnotatorPage: React.FC = () => {
    const { spectrogram, isEditionAuthorized } = Route.useLoaderData()
    const dispatch = useAppDispatch()
    const safeEscapeSpacesRef = useRef<Array<Element | null>>([])

    const pointer = usePointer()
    useEffect(() => {
        if (pointer.position) { // Disable scroll
            document.getElementsByTagName('html')[0].style.overflowY = 'hidden';
        } else { // Enable scroll
            document.getElementsByTagName('html')[0].style.overflowY = 'unset';
        }
    }, [ pointer.position ]);

    const escape = useCallback((event: MouseEvent) => {
        const inSafeSpace = safeEscapeSpacesRef.current.reduce((prev, el) => prev || event.target === el, false)
        if (inSafeSpace) dispatch(blur())
    }, [ dispatch ])

    return useMemo(() => {
        return <AnnotatorSkeleton>
            <div className={ styles.annotator }
                 ref={ el => safeEscapeSpacesRef.current.push(el) }
                 onClick={ escape }>

                <div className={ styles.spectrogramContainer }
                     ref={ el => safeEscapeSpacesRef.current.push(el) }>

                    <ConfigBar/>

                    <AnnotatorCanvasWindow/>

                    <div className={ styles.spectrogramNavigation }
                         ref={ el => safeEscapeSpacesRef.current.push(el) }>
                        <div className={ styles.audioNavigation }>
                            <PlayPauseButton/>
                            <PlaybackRateSelect/>
                        </div>
                        <NavigationButtons/>
                        <CurrentTime/>
                    </div>
                </div>

                <div className={ styles.blocContainer }
                     ref={ el => safeEscapeSpacesRef.current.push(el) }>
                    { isEditionAuthorized && <Fragment>
                        <FocusedAnnotationBloc/>
                        <LabelsBloc/>
                        <ConfidenceBloc/>
                        <CommentBloc/>
                        <AnnotationsBloc/>
                    </Fragment> }
                </div>

                <DownloadButtons/>
            </div>
        </AnnotatorSkeleton>
    }, [ spectrogram, isEditionAuthorized, escape ])
}

export const Route = createFileRoute(
    '/_authenticated/annotation-campaign/$campaignID/phase/$phaseType/spectrogram/$spectrogramID',
)({
    validateSearch: (search: Record<string, unknown>) => search as AllSpectrogramsFilters,
    params: {
        parse: rawParams => rawParams as { campaignID: string, spectrogramID: string, phaseType: AnnotationPhaseType },
    },
    loaderDeps: ({ search }) => search as AllSpectrogramsFilters,
    loader: async ({ params: { campaignID, phaseType, spectrogramID }, deps }) => {
        const user = await ensureValidQueryData(UserAPI.currentQuery)
        const [
            { spectrogram, ...data },
            { analysis },
        ] = await Promise.all([
            ensureValidQueryData(AnnotationSpectrogramAPI.getQuery({
                campaignID, phaseType, spectrogramID, ...deps, annotatorID: user!.id,
            })),
            ensureValidQueryData(CampaignAPI.byIdQuery({ id: campaignID })),
        ])
        if (!spectrogram) throw notFound()
        const baseScaleAnalysis = analysis.find(a =>
            !a.frequencyScaleParts || a.frequencyScaleParts.length == 0 ||
            (a.frequencyScaleParts.length == 1 && a.frequencyScaleParts[0]!.minValue == 0 && a.frequencyScaleParts[0]!.maxValue == a.fft.samplingFrequency / 2),
        );
        const minID = Math.min(...analysis.map(a => +a!.id))?.toString();
        const defaultAnalysis = minID ? analysis.find(a => a.id === (baseScaleAnalysis?.id ?? minID)) : undefined

        if (defaultAnalysis) {
            await ensureValidQueryData(AnnotationSpectrogramAPI.getPathQuery({
                spectrogramID: spectrogram.id,
                analysisID: defaultAnalysis.id,
            }))
        }
        return { spectrogram, defaultAnalysis, ...data }
    },
    component: AnnotatorPage,
})
