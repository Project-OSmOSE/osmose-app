import { type MutableRefObject, useCallback, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AnnotationSpectrogramAPI, type GetAnnotationSpectrogramQuery } from '@/features/AnnotationSpectrogram';
import type { CampaignAnalysisFragment } from '@/features/AnnotationCampaign';
import { SPECTRO_WIDTH, useWindowContainerWidth, useWindowHeight } from '@/features/Annotator/Canvas';
import { Zoom } from '../Zoom';
import { ImageSettings } from '../ImageSettings';

type TileManagerParams = {
    canvasRef: MutableRefObject<HTMLCanvasElement | null>,
    analysis: CampaignAnalysisFragment | null,
    spectrogram: GetAnnotationSpectrogramQuery['annotationSpectrogramById'],
    left: number,
    passive?: boolean
}
type TileManagerType = {
    update: (options?: { displayAllTiles?: boolean }) => Promise<void>,
}
const PRELOAD_MARGIN = 1;

export const useTileManager = ({
                                   canvasRef,
                                   analysis,
                                   spectrogram,
                                   left: _left,
                                   passive,
                               }: TileManagerParams): TileManagerType => {
    const { data: paths } = useQuery({
        ...AnnotationSpectrogramAPI.getPathQuery({
            spectrogramID: spectrogram?.id ?? '',
            analysisID: analysis?.id ?? '',
        }),
        enabled: !!analysis && !!spectrogram,
    });
    const {
        zoomLevel,
        zoomType,
        maxPreProcessedZoomLevel,
    } = Zoom.useContext()
    const {
        colormap,
        isColormapInverted,
        canvasFilter,
        applyImageToCanvas,
        setIsUpdating,
    } = ImageSettings.useContext()
    const getZoomLevelToLoad = useCallback((baseLevel: number) => {
        if (zoomType === 'preprocessed') return baseLevel
        else return maxPreProcessedZoomLevel
    }, [ maxPreProcessedZoomLevel, zoomType ])
    const tileHeight = useWindowHeight()

    const loadingTileIndexesRef = useRef<number[]>([])
    const loadedTileIndexesRef = useRef<Map<number, HTMLImageElement>>(new Map())

    const analysisRef = useRef<CampaignAnalysisFragment | null>(null)
    const spectrogramRef = useRef<GetAnnotationSpectrogramQuery['annotationSpectrogramById']>(null)
    const spectrogramPathRef = useRef<string | null | undefined>()

    const zoomRef = useRef<number>(1)
    const leftRef = useRef<number>(0)

    const clearCanvas = useCallback((): void => {
        const context = canvasRef.current?.getContext('2d', { alpha: false });
        if (!context || !canvasRef.current) return;
        context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    }, [ canvasRef ])

    const displayTile = useCallback(async (index: number): Promise<void> => {
        if (!canvasRef.current) return;
        const baseImage = loadedTileIndexesRef.current.get(index)
        if (!baseImage) return;

        const tileWidth = zoomType === 'preprocessed' ? SPECTRO_WIDTH : (SPECTRO_WIDTH * (zoomLevel / maxPreProcessedZoomLevel))
        await applyImageToCanvas(
            canvasRef.current, baseImage,
            index * tileWidth, 0,
            tileWidth, tileHeight,
        )
    }, [ canvasRef, tileHeight, zoomLevel, maxPreProcessedZoomLevel, zoomType, applyImageToCanvas ])

    const getTileURL = useCallback((index: number): string => {
        if (!analysisRef.current) throw Error('Missing analysis');
        if (!spectrogramRef.current) throw Error('Missing spectrogram');
        if (!spectrogramPathRef.current) throw Error('Missing spectrogram path');
        const src = spectrogramPathRef.current;
        const filename = spectrogramRef.current.filename
        if (analysisRef.current.legacy) {
            return `${ src.split(filename)[0] }${ filename }_${ getZoomLevelToLoad(zoomRef.current) }_${ index }${ src.split(filename)[1] }`
        }
        return src
    }, [ analysisRef, spectrogramRef, zoomRef, loadedTileIndexesRef, getZoomLevelToLoad ])

    const loadBaseImage = useCallback(async (index: number): Promise<void> => {
        if (loadedTileIndexesRef.current.has(index)) return;
        try {
            const url = getTileURL(index);
            const image = new Image();
            const loadPromise = new Promise((resolve, reject) => {
                image.onload = () => resolve(image);
                image.onerror = () => reject(`Could not resolve url: ${ url } [${ index }]`);
            });
            image.src = url;
            await loadPromise;
            loadedTileIndexesRef.current.set(index, image);
        } catch (error) {
            console.error(`Failed to load tile ${ zoomRef.current }-${ index }:`, error);
        }
    }, [ analysisRef, spectrogramRef, zoomRef, loadedTileIndexesRef, getZoomLevelToLoad, getTileURL ])

    const update = useCallback(async (options?: { displayAllTiles?: boolean }): Promise<void> => {
        setIsUpdating(true)
        const tileWidth = zoomType === 'preprocessed' ? SPECTRO_WIDTH : (SPECTRO_WIDTH * (zoomLevel / maxPreProcessedZoomLevel))
        const tilesCount = zoomType === 'preprocessed' ? zoomRef.current : maxPreProcessedZoomLevel

        const startTileIdx = Math.floor(leftRef.current / tileWidth);
        const endTileIdx = Math.ceil((leftRef.current + tileWidth) / tileWidth);

        let visible = new Set(Array.from(
            { length: endTileIdx - startTileIdx + 1 },
            (_, i) => Math.min(startTileIdx + i, tilesCount - 1),
        ));

        const min = Math.min(...visible);
        const max = Math.max(...visible);
        let preload = new Set([
            Math.max(0, min - PRELOAD_MARGIN),
            Math.min(tilesCount - 1, max + PRELOAD_MARGIN),
        ].filter(index => !visible.has(index)))

        if (options?.displayAllTiles) {
            preload = new Set(Array.from(
                { length: tilesCount },
                (_, i) => i,
            ));
            visible = new Set(Array.from(
                { length: tilesCount },
                (_, i) => i,
            ));
        }


        const newTiles = new Set([ ...visible, ...preload ].filter(index => !loadedTileIndexesRef.current.has(index) && !loadingTileIndexesRef.current.includes(index)));
        for (const index of newTiles) {
            await loadBaseImage(index)
        }
        for (const index of visible) {
            await displayTile(index)
        }
        setIsUpdating(false)
    }, [ leftRef, zoomRef, canvasRef, loadedTileIndexesRef, loadingTileIndexesRef, loadBaseImage, displayTile, maxPreProcessedZoomLevel, zoomType, zoomLevel, setIsUpdating ])

    // Check either the manager need to be reinitiated
    const init = useCallback(() => {
        loadingTileIndexesRef.current = [];
        loadedTileIndexesRef.current = new Map<number, HTMLImageElement>();
        clearCanvas()
        update()
    }, [ loadingTileIndexesRef, loadedTileIndexesRef, update, clearCanvas ])
    useEffect(() => {
        spectrogramPathRef.current = paths?.spectrogramPath
        analysisRef.current = analysis
        spectrogramRef.current = spectrogram
        if (passive) return
        init()
    }, [ paths ]);

    // On zoom updated
    useEffect(() => {
        if (zoomRef.current === zoomLevel) return;
        zoomRef.current = Math.max(0, zoomLevel)
        if (passive) return
        init()
    }, [ zoomLevel ]);

    // On left updated
    useEffect(() => {
        if (leftRef.current === _left || !canvasRef.current) return;
        leftRef.current = Math.min(Math.max(0, _left), canvasRef.current.width);
        if (passive) return
        update()
    }, [ _left ]);

    const containerWidth = useWindowContainerWidth()
    useEffect(() => {
        if (passive) return
        update()
    }, [
        canvasFilter, // brightness or contrast updated
        colormap, isColormapInverted, // colormap updated
        containerWidth, // container size updated
    ]);

    return { update }
}