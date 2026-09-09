import React, { MouseEvent, UIEvent, useCallback, useEffect, useRef, WheelEvent } from 'react';
import styles from './styles.module.scss';
import { FrequencyAxis, TimeAxis } from '@/features/Annotator/Axis';
import { TimeBar } from './TimeBar';
import {
    selectAllAnnotations,
    selectTempAnnotation,
    StrongAnnotation,
    useDrawTempAnnotation,
    useTempAnnotationsEvents,
} from '@/features/Annotator/Annotation';
import { useWindowContainerWidth, useWindowHeight, useWindowWidth, Y_AXIS_WIDTH } from './window.hooks';
import { useGetFreqTime, useIsHoverCanvas, usePointer } from '@/features/Annotator/Pointer';
import { Zoom } from '@/features/Annotator/Zoom';
import { useAudio } from '@/features/Audio';
import { useAnnotatorCanvasContext } from '@/features/Annotator/Canvas/context';
import { useAppDispatch, useAppSelector } from '@/features/App';
import { setAllFileAsSeen } from '@/features/Annotator/UX/slice';
import { AnnotationType } from '@/api';
import { AcousticFeatures } from '@/features/Annotator/AcousticFeatures';
import { useAnnotatorAnalysis } from '@/features/Annotator/Analysis';
import { useLoaderData } from '@tanstack/react-router';
import { useCanDraw } from '@/features/Annotator/UX/hooks';
import type { OnZoomInfoCallback } from '@/features/Annotator/Zoom/Root';
import { Spectrogram } from '../Spectrogram';

export const AnnotatorCanvasWindow: React.FC = () => {
    const { spectrogram } = useLoaderData({ from: '/_authenticated/annotation-campaign/$campaignID/phase/$phaseType/spectrogram/$spectrogramID' })
    const width = useWindowWidth()
    const height = useWindowHeight()
    const containerWidth = useWindowContainerWidth()
    const {
        interactionCanvasRef, windowCanvasRef,
        setLeft,
    } = useAnnotatorCanvasContext()
    const { onStartTempAnnotation } = useTempAnnotationsEvents()
    const getFreqTime = useGetFreqTime()
    const {
        zoomLevel,
        zoomType,
        zoomIn,
        zoomOut,
        onZoomUpdatedSignal,
    } = Zoom.useContext()
    const canDraw = useCanDraw()
    const { seek } = useAudio()
    const allAnnotations = useAppSelector(selectAllAnnotations)
    const drawTempAnnotation = useDrawTempAnnotation()
    const dispatch = useAppDispatch()
    const pointer = usePointer()

    const refreshInteractionCanvas = useCallback(() => {
        const context = interactionCanvasRef?.current?.getContext('2d');
        if (!context) return;

        // Reset
        context.clearRect(0, 0, width, height);
        drawTempAnnotation(context)
    }, [ drawTempAnnotation, width, height, interactionCanvasRef ]);

    const preventDefault = useCallback((e: Event) => {
        const event = (e || window.event) as unknown as WheelEvent
        if (!event.shiftKey && event.preventDefault) {
            event.preventDefault()
        }
    }, [])
    const disableScroll = useCallback(() => {
        document.addEventListener('wheel', preventDefault, { passive: false })
    }, [ pointer ]);
    const clearPointer = useCallback(() => {
        pointer.clearPosition()

        // Enable scroll
        document.removeEventListener('wheel', preventDefault, false)
    }, [ pointer ]);

    const onFileScrolled = useCallback((event: UIEvent<HTMLDivElement>) => {
        if (event.type !== 'scroll') return;
        const div = event.currentTarget;
        const left = div.scrollWidth - div.scrollLeft - div.clientWidth;
        if (left <= 0) dispatch(setAllFileAsSeen())
        setLeft(div.scrollLeft)
    }, [ dispatch, setLeft ])

    const onWheel = useCallback((event: WheelEvent) => {
        // Disable zoom if the user wants horizontal scroll
        if (event.shiftKey) return;

        const origin = getFreqTime(event);
        if (!origin) return;
        if (event.deltaY < 0) zoomIn(origin)
        else if (event.deltaY > 0) zoomOut(origin)
    }, [ zoomIn, zoomOut, getFreqTime ])

    const seekAudio = useCallback((event: MouseEvent<HTMLCanvasElement>) => {
        seek(getFreqTime(event)?.time ?? 0)
    }, [ seek, getFreqTime ])

    // Global updates
    const tempAnnotation = useAppSelector(selectTempAnnotation)
    const { selectedAnalysis } = useAnnotatorAnalysis()
    useEffect(() => {
        refreshInteractionCanvas()
    }, [
        // On current newAnnotation changed
        tempAnnotation?.endTime, tempAnnotation?.endFrequency, tempAnnotation,
        // On Spectrogram or analysis changed
        spectrogram, selectedAnalysis,
        // On window dimensions change
        containerWidth,
    ])


    // Time update
    const { time } = useAudio()
    const oldTime = useRef<number>(0)
    useEffect(() => {
        // Scroll if progress bar reach the right edge of the screen
        if (!windowCanvasRef?.current || !spectrogram) return;
        const oldX: number = Math.floor(width * oldTime.current / spectrogram.duration);
        const newX: number = Math.floor(width * time / spectrogram.duration);

        if ((oldX - windowCanvasRef.current.scrollLeft) < containerWidth && (newX - windowCanvasRef.current.scrollLeft) >= containerWidth) {
            windowCanvasRef.current.scrollLeft += containerWidth;
        }
        oldTime.current = time
    }, [
        // On time changed
        time, spectrogram?.duration,
    ])


    // Zoom update
    const isHoverCanvas = useIsHoverCanvas()
    const onZoomUpdated: OnZoomInfoCallback = useCallback(({ level, origin }) => {
        const mainBounds = interactionCanvasRef?.current?.getBoundingClientRect()
        if (!window || !spectrogram || !mainBounds) return;

        // New timePxRatio
        const newTimePxRatio: number = containerWidth * level / spectrogram.duration;

        // Compute new center (before resizing)
        let newCenter: number;
        if (origin) {
            newCenter = origin.time * newTimePxRatio
        } else {
            // If no x-coordinate: center on currentTime
            newCenter = oldTime.current * newTimePxRatio;
        }
        const left = Math.floor(newCenter - containerWidth / 2)
        setTimeout(() => requestAnimationFrame(() => {
            windowCanvasRef?.current?.scrollTo({ left, behavior: 'instant' })
        }))
        refreshInteractionCanvas()
    }, [ refreshInteractionCanvas, isHoverCanvas, pointer, getFreqTime, interactionCanvasRef, spectrogram, containerWidth, windowCanvasRef ])
    useEffect(() => {
        onZoomUpdatedSignal.add(onZoomUpdated)
        return () => {
            onZoomUpdatedSignal.remove(onZoomUpdated)
        }
    }, [ onZoomUpdatedSignal ]);
    useEffect(() => {
        onZoomUpdated({
            level: zoomLevel,
            type: zoomType,
        })
    }, [ spectrogram?.duration ]);

    return <div className={ styles.spectrogramWindow }
                ref={ windowCanvasRef }
                onScroll={ onFileScrolled }
                style={ { width: `${ Y_AXIS_WIDTH + containerWidth }px` } }>

        <TimeAxis/>
        <FrequencyAxis/>

        <div className={ styles.spectrogram }
             onWheel={ onWheel }
             onPointerEnter={ disableScroll }
             onPointerLeave={ clearPointer }
             onMouseDown={ e => e.stopPropagation() }>

            { spectrogram && selectedAnalysis &&
                <Spectrogram.Display spectrogram={ spectrogram }
                                     analysis={ selectedAnalysis }/> }
            <canvas className={ [ styles.interaction, canDraw ? styles.drawable : '' ].join(' ') }
                    data-testid="drawable-canvas"
                    ref={ interactionCanvasRef }
                    height={ height }
                    width={ width }
                    onMouseDown={ onStartTempAnnotation }
                    onClick={ seekAudio }/>

            <TimeBar/>

            { allAnnotations.filter(a => a.type !== AnnotationType.Weak).map(annotation => <StrongAnnotation
                key={ annotation.id } annotation={ annotation }/>) }
        </div>

        <AcousticFeatures/>

    </div>
}
