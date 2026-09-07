import React, { Fragment, type HTMLProps, ReactNode, useCallback, useEffect, useMemo } from 'react';
import { Footer, Navigation } from '@/components/layout';
import styles from './styles.module.scss';
import { AnnotationTaskStatus } from '@/api';
import { useAppDispatch } from '@/features/App';
import { AnnotatorCanvasContextProvider } from '@/features/Annotator/Canvas';
import { PointerProvider } from '@/features/Annotator/Pointer/context';
import { useLoaderData, useParams, useSearch } from '@tanstack/react-router';
import { AnnotatorConfidenceSlice } from '@/features/Annotator/Confidence';
import { AnnotatorAnalysisProvider, useAnnotatorAnalysis } from '@/features/Annotator/Analysis';
import { AnnotatorLabelSlice } from '@/features/Annotator/Label';
import { AnnotatorUXSlice } from '@/features/Annotator/UX';
import { AnnotatorCommentSlice } from '@/features/Annotator/Comment';
import { cleanGqlList } from '@/api/utils';
import { AnnotatorAnnotationSlice, convertGqlToAnnotations } from '@/features/Annotator/Annotation';
import { Note, Progress } from '@/components/base';
import { AltArrowRight, CheckCircle } from '@solar-icons/react';
import { useQuery } from '@tanstack/react-query';
import { AnnotationSpectrogramAPI } from '@/features/AnnotationSpectrogram';
import { Zoom } from './Zoom';
import type { OnZoomInfoCallback } from '@/features/Annotator/Zoom/Root';
import { ImageSettings } from './ImageSettings';
import type { Colormap } from '@/features/Colormap';
import { useAudio } from '@/features/Audio';

export const AnnotatorSkeleton: React.FC<{ children?: ReactNode }> = ({ children }) => (
    <PointerProvider>
        <AnnotatorCanvasContextProvider>
            <AnnotatorAnalysisProvider>
                <ZoomProvider>
                    <ImageSettingsProvider>
                        <InnerAnnotatorSkeleton children={ children }/>
                    </ImageSettingsProvider>
                </ZoomProvider>
            </AnnotatorAnalysisProvider>
        </AnnotatorCanvasContextProvider>
    </PointerProvider>
)

const InnerAnnotatorSkeleton: React.FC<{ children?: ReactNode }> = ({ children }) => {
    const { user } = useLoaderData({ from: '/_authenticated' })
    const {
        campaign,
        confidences,
    } = useLoaderData({ from: '/_authenticated/annotation-campaign/$campaignID' })
    const { phase } = useLoaderData({ from: '/_authenticated/annotation-campaign/$campaignID/phase/$phaseType' })
    const {
        info,
        isEditionAuthorized,
        spectrogram,
    } = useLoaderData({ from: '/_authenticated/annotation-campaign/$campaignID/phase/$phaseType/spectrogram/$spectrogramID' })
    //TODO!!
    // const canNavigate = useAnnotatorCanNavigate()
    // const isUpdated = useAppSelector(selectUpdated);
    // const { } = useBlocker({
    //     withResolver: true,
    //     shouldBlockFn: ({current, next}) => {
    //
    //     }
    // })
    const {
        campaignID,
        phaseType,
        spectrogramID,
    } = useParams({ from: '/_authenticated/annotation-campaign/$campaignID/phase/$phaseType/spectrogram/$spectrogramID' })
    const search = useSearch({ from: '/_authenticated/annotation-campaign/$campaignID/phase/$phaseType/spectrogram/$spectrogramID' })
    const { data, isFetching } = useQuery(AnnotationSpectrogramAPI.getQuery({
        campaignID, phaseType, spectrogramID, ...search, annotatorID: user.id,
    }))
    const {
        zoomLevel,
        resetZoom,
        onZoomUpdatedSignal,
    } = Zoom.useContext()
    const {
        setColormap, setIsColormapInverted,
        resetBrightness, resetContrast,
    } = ImageSettings.useContext()
    const { selectedAnalysis } = useAnnotatorAnalysis()
    const {
        data: paths,
    } = useQuery({
        ...AnnotationSpectrogramAPI.getPathQuery({
            spectrogramID: spectrogram.id,
            analysisID: selectedAnalysis?.id ?? '',
        }),
        enabled: !!selectedAnalysis,
        refetchOnMount: true,
    });
    const audio = useAudio()
    const dispatch = useAppDispatch()

    // On campaign updated
    useEffect(() => {
        dispatch(AnnotatorAnnotationSlice.actions.initCampaign())
        dispatch(AnnotatorConfidenceSlice.actions.initCampaign({
            default: confidences?.find(c => c?.isDefault) ?? confidences.length ? confidences[0].label : undefined,
        }))
        dispatch(AnnotatorLabelSlice.actions.initCampaign())

        // Set default colormap & inversion
        setColormap((campaign.colormapDefault ?? null) as Colormap | null)
        setIsColormapInverted(campaign.colormapInvertedDefault ?? false)

        // Reset audio
        audio.setPlaybackRate(1)
    }, [ campaign ]);

    // On spectrogram updated
    useEffect(() => {
        if (!data) return
        dispatch(AnnotatorUXSlice.actions.initSpectrogram({ zoomLevel }))

        const allAnnotations = convertGqlToAnnotations(data.annotations, phase.phase, user.id)
        const defaultAnnotation = [ ...allAnnotations ].pop()
        dispatch(AnnotatorConfidenceSlice.actions.initSpectrogram({
            focus: defaultAnnotation?.confidence ?? undefined,
        }))
        dispatch(AnnotatorLabelSlice.actions.initSpectrogram({
            focus: defaultAnnotation?.label ?? undefined,
        }))
        dispatch(AnnotatorCommentSlice.actions.initSpectrogram({
            taskComments: cleanGqlList(data.spectrogram?.task?.userComments?.results),
        }))
        dispatch(AnnotatorAnnotationSlice.actions.initSpectrogram({
            all: allAnnotations,
            default: defaultAnnotation,
        }))
        resetBrightness()
        resetContrast()
        resetZoom()
    }, [ data ]);

    // On paths updated
    useEffect(() => {
        if (paths?.audioPath) audio.setSource(paths.audioPath)
        else audio.clearSource()

        return () => {
            audio.clearSource() // TODO: check behavior when navigating between files
        }
    }, [paths]);

    // Handle zoom updates
    const onZoomUpdated: OnZoomInfoCallback = useCallback(({ level }) => {
        if (level === 1) dispatch(AnnotatorUXSlice.actions.setAllFileAsSeen())
    }, [ dispatch ])
    useEffect(() => {
        onZoomUpdatedSignal.add(onZoomUpdated)
        return () => {
            onZoomUpdatedSignal.remove(onZoomUpdated)
        }
    }, [ onZoomUpdatedSignal ]);

    return <div className={ styles.page }>
        <Navigation.Annotator loading={ isFetching }>
            { data?.spectrogram && <div className={ styles.info }>
                <div className={ styles.file }>
                    <Note color="medium">{ campaign.name }</Note>
                    <Note color="medium"><AltArrowRight weight="Linear" size={ 20 }/></Note>
                    <Note color="medium">{ data.spectrogram.filename }</Note>
                    { data.spectrogram.task?.status === AnnotationTaskStatus.Finished &&
                        <Note color="medium"><CheckCircle weight="Linear" size={ 20 }/></Note> }
                </div>
                { isEditionAuthorized && info?.totalCount &&
                    <Progress color="medium"
                              value={ (info.currentIndex ?? 0) + 1 }
                              max={ info.totalCount }/> }

                { campaign.archive ? <Note>You cannot annotate an archived campaign.</Note> :
                    phase?.endedAt ? <Note>You cannot annotate an ended phase.</Note> :
                        !data.spectrogram.isAssigned ?
                            <Note>You are not assigned to annotate this file.</Note> :
                            <Fragment/>
                }
            </div> }
        </Navigation.Annotator>

        { children }

        <Footer/>
    </div>
}

const ZoomProvider: React.FC<Pick<HTMLProps<HTMLDivElement>, 'children'>> = ({ children }) => {
    const { campaign } = useLoaderData({
        from: '/_authenticated/annotation-campaign/$campaignID',
        select: ({ campaign }) => ({ campaign }),
    })
    const { selectedAnalysis } = useAnnotatorAnalysis()
    return <Zoom.Root campaign={ campaign }
                      analysis={ selectedAnalysis }
                      children={ children }/>
}

const ImageSettingsProvider: React.FC<Pick<HTMLProps<HTMLDivElement>, 'children'>> = ({ children }) => {
    const { campaign } = useLoaderData({
        from: '/_authenticated/annotation-campaign/$campaignID',
        select: ({ campaign }) => ({ campaign }),
    })
    const { selectedAnalysis } = useAnnotatorAnalysis()

    const allowColormapChange = useMemo(() => {
        if (!campaign.allowColormapTuning) return false;
        return selectedAnalysis?.colormap.name === 'Greys' as Colormap
    }, [ campaign, selectedAnalysis ])
    return <ImageSettings.Root allowColormapChange={ allowColormapChange }
                               allowImageTuning={ campaign.allowImageTuning }
                               children={ children }/>
}
