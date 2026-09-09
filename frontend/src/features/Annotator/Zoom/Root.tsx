import React, { createContext, type HTMLProps, useCallback, useContext, useMemo, useState } from 'react';
import { Signal } from 'signal-ts';
import type { CampaignAnalysisFragment, GetCampaignQuery } from '@/features/AnnotationCampaign';
import type { TimeFreqPosition } from '@/features/Annotator/Pointer';

type ZoomInfo = {
    level: number;
    type: 'preprocessed' | 'digital';
    origin?: TimeFreqPosition;
}
export type OnZoomInfoCallback = (zoomInfo: ZoomInfo) => void;

type ZoomContext = {
    zoomLevel: number;
    zoomType: 'preprocessed' | 'digital';

    canZoomIn: boolean | 'digital';
    zoomInLevel: number | null;
    zoomIn: (origin?: TimeFreqPosition) => void;

    canZoomOut: boolean | 'digital';
    zoomOutLevel: number | null;
    zoomOut: (origin?: TimeFreqPosition) => void;

    resetZoom: () => void;

    maxPreProcessedZoomLevel: number;
    onZoomUpdatedSignal: Signal<ZoomInfo>;
}
const ZoomContext = createContext<ZoomContext>({
    canZoomIn: false,
    canZoomOut: false,
    onZoomUpdatedSignal: new Signal<ZoomInfo>(),
    zoomIn: () => undefined,
    zoomOut: () => undefined,
    resetZoom: () => undefined,
    zoomInLevel: null,
    zoomLevel: 0,
    zoomOutLevel: null,
    maxPreProcessedZoomLevel: 0,
    zoomType: 'preprocessed',
})

/** Zoom.useContext
 *
 * Use within Zoom.Root
 */
export const useZoomContext = () => {
    const context = useContext(ZoomContext);
    if (!context) {
        throw new Error('Zoom.useContext must be used within a Zoom.Root');
    }
    return context;
}

/**
 * Absolute Max zoom due to HTML Canvas element size limitation
 * - Maximum canvas width (on FF) = 32_767 px
 * - Tile width = 1_813 px
 * - 16 x Tile width = 29_008 < max canvas width
 *
 * https://jhildenbiddle.github.io/canvas-size/#/?id=test-results
 */
const ABSOLUTE_MAX_ZOOM_LEVEL = 16

type Props = Pick<HTMLProps<HTMLDivElement>, 'children'> & {
    campaign: NonNullable<GetCampaignQuery['annotationCampaignById']>;
    analysis: CampaignAnalysisFragment | null
}
export const ZoomRoot: React.FC<Props> = ({ children, campaign, analysis }) => {
    const [ signal ] = useState(new Signal<ZoomInfo>())

    const [ zoomLevel, setZoomLevel ] = useState<number>(1);
    const maxPreProcessedZoomLevel: number = useMemo(() => {
        const maxPreProcessed = analysis?.legacyConfiguration?.zoomLevel ?? 0;
        return 2 ** maxPreProcessed;
    }, [ analysis ])
    const isDigitalZoomAllowed: boolean = useMemo(() => {
        return campaign.allowDigitalZoom
    }, [ campaign ])

    const zoomInLevel: number | null = useMemo(() => {
        const nextZoomLevel = zoomLevel * 2;

        if (nextZoomLevel <= maxPreProcessedZoomLevel)
            return nextZoomLevel

        if (isDigitalZoomAllowed && nextZoomLevel <= ABSOLUTE_MAX_ZOOM_LEVEL)
            return nextZoomLevel

        return null
    }, [ maxPreProcessedZoomLevel, zoomLevel, isDigitalZoomAllowed ])
    const zoomOutLevel: number | null = useMemo(() => {
        const nextZoomLevel = zoomLevel / 2;

        if (nextZoomLevel >= 1)
            return nextZoomLevel

        return null
    }, [ zoomLevel ])

    const zoomIn = useCallback((origin?: TimeFreqPosition) => {
        console.debug('zoomIn', origin)
        if (zoomInLevel === null) return;
        signal.emit({
            level: zoomInLevel,
            type: zoomInLevel > maxPreProcessedZoomLevel ? 'digital' : 'preprocessed',
            origin,
        })
        setZoomLevel(zoomInLevel)
    }, [ zoomInLevel, signal, maxPreProcessedZoomLevel ])
    const zoomOut = useCallback((origin?: TimeFreqPosition) => {
        if (zoomOutLevel === null) return;
        signal.emit({
            level: zoomOutLevel,
            type: zoomOutLevel > maxPreProcessedZoomLevel ? 'digital' : 'preprocessed',
            origin,
        })
        setZoomLevel(zoomOutLevel)
    }, [ zoomOutLevel, signal, maxPreProcessedZoomLevel ])

    const resetZoom = useCallback(() => {
        signal.emit({
            level: 1,
            type: 'preprocessed',
        })
        setZoomLevel(1)
    }, [ signal ])

    return <ZoomContext.Provider value={ {
        zoomLevel,
        zoomType: isDigitalZoomAllowed && zoomLevel > maxPreProcessedZoomLevel ? 'digital' : 'preprocessed',

        canZoomIn: zoomInLevel === null ? false : zoomInLevel > maxPreProcessedZoomLevel ? 'digital' : true,
        zoomInLevel,
        zoomIn,

        canZoomOut: zoomOutLevel === null ? false : zoomOutLevel > maxPreProcessedZoomLevel ? 'digital' : true,
        zoomOutLevel,
        zoomOut,

        resetZoom,

        maxPreProcessedZoomLevel,
        onZoomUpdatedSignal: signal,
    } } children={ children }/>
}