import { MutableRefObject, useEffect, useMemo, useRef } from 'react';
import { SPECTRO_HEIGHT, SPECTRO_WIDTH } from './const.ts';
import { useAppSelector } from '@/service/app.ts';
import { BoxBounds, SpectrogramConfiguration } from "@/service/types";
import { useAxis } from '@/service/annotator/spectrogram/scale';
import { useToast } from '@/service/ui';
import { buildErrorMessage } from '@/service/function';
import { colorSpectro, interpolate } from '@/service/ui/color.ts';
import { useListSpectrogramForCurrentCampaign } from "@/service/api/spectrogram-configuration.ts";
import { useRetrieveAnnotator } from "@/service/api/annotator.ts";


export const useSpectrogramDimensions = () => {
  const { zoomLevel } = useAppSelector(state => state.annotator.userPreferences)
  const ratio = useMemo(() => {
    const screenRatio = (1920 / (window.screen.width * window.devicePixelRatio))
    return window.devicePixelRatio * screenRatio;
  }, [ window.devicePixelRatio, window.screen ]);
  const containerWidth = useMemo(() => SPECTRO_WIDTH / ratio, [ ratio ])
  const width = useMemo(() => containerWidth * zoomLevel, [ containerWidth, zoomLevel ])
  const height = useMemo(() => SPECTRO_HEIGHT / ratio, [ ratio ])
  return { width, containerWidth, height }
}

export const useCurrentConfiguration = (): SpectrogramConfiguration | undefined => {
  const { spectrogramConfigurationID } = useAppSelector(state => state.annotator.userPreferences)
  const { configurations } = useListSpectrogramForCurrentCampaign();

  return useMemo(() => {
    return configurations?.find(c => c.id === spectrogramConfigurationID)
  }, [ configurations, spectrogramConfigurationID ]);
}

export const useDisplaySpectrogram = (
  canvas: MutableRefObject<HTMLCanvasElement | null>,
) => {
  const { data } = useRetrieveAnnotator()
  const { xAxis, yAxis } = useAxis();
  const currentConfiguration = useCurrentConfiguration();

  const {
    spectrogramConfigurationID,
    zoomLevel,
    brightness,
    contrast,
    colormap,
    colormapInverted,
  } = useAppSelector(state => state.annotator.userPreferences);
  const toast = useToast();

  const images = useRef<Map<number, Array<HTMLImageElement | undefined>>>(new Map);
  const failedSources = useRef<string[]>([])

  useEffect(() => {
    images.current = new Map()
    failedSources.current = []
  }, [ spectrogramConfigurationID ]);

  function areAllImagesLoaded(): boolean {
    const currentImages = images.current.get(zoomLevel);
    return currentImages?.filter(i => !!i).length === zoomLevel
  }

  async function loadImages() {
    if (!currentConfiguration || !data?.file) {
      images.current = new Map();
      return;
    }

    if (areAllImagesLoaded()) return;

    const filename = data.file.filename.split('.')[0]
    return Promise.all(
      Array.from(new Array<HTMLImageElement | undefined>(zoomLevel)).map(async (_, index) => {
        const src = `${ currentConfiguration.folder_path.replaceAll('%5C', '/') }/${ filename }_${ zoomLevel }_${ index }.png`;
        if (failedSources.current.includes(src)) return;
        console.info(`Will load for zoom ${ zoomLevel }, image ${ index }`)
        const image = new Image();
        image.src = src;
        return await new Promise<HTMLImageElement | undefined>((resolve) => {
          image.onload = () => {
            console.info(`Image loaded: ${ image.src }`)
            resolve(image);
          }
          image.onerror = e => {
            failedSources.current.push(src)
            console.error(`Cannot load spectrogram image with source: ${ image.src } [${ buildErrorMessage(e as any) }]`, e)
            toast.presentError(`Cannot load spectrogram image with source: ${ image.src } [${ buildErrorMessage(e as any) }]`)
            resolve(undefined);
          }
        })
      })
    ).then(loadedImages => {
      images.current.set(zoomLevel, loadedImages)
    })
  }

  function resetCanvas() {
    const context = canvas.current?.getContext('2d', { alpha: false });
    if (!canvas.current || !context) return;
    context.clearRect(0, 0, canvas.current.width, canvas.current.height);
  }

  async function drawSpectrogram() {
    const context = canvas.current?.getContext('2d', { alpha: false });
    if (!canvas.current || !context || !data?.file) return;

    if (!areAllImagesLoaded()) await loadImages();
    if (!areAllImagesLoaded()) return;

    // Filter images (filter must be set before drawing)
    const compBrightness: number = Math.round(interpolate(brightness, 0, 100, 50, 150));
    const compContrast: number = Math.round(interpolate(contrast, 0, 100, 50, 150));
    context.filter = `brightness(${ compBrightness.toFixed() }%) contrast(${ compContrast.toFixed() }%)`;

    // Draw images
    const currentImages = images.current.get(zoomLevel)
    if (!currentImages) return;
    for (const i in currentImages) {
      const index: number | undefined = i ? +i : undefined;
      if (index === undefined) continue;
      const start = index * data.file.duration / zoomLevel;
      const end = (index + 1) * data.file.duration / zoomLevel;
      const image = currentImages[index];
      if (!image) continue
      context.drawImage(
        image,
        xAxis.valueToPosition(start),
        0,
        Math.floor(xAxis.valuesToPositionRange(start, end)),
        canvas.current.height
      )
    }

    // Color spectro images
    colorSpectro(canvas.current, colormap, colormapInverted);
  }

  function drawResult(result: BoxBounds) {
    const context = canvas.current?.getContext('2d', { alpha: false });
    if (!canvas.current || !context) return;
    context.strokeStyle = 'blue';
    context.strokeRect(
      xAxis.valueToPosition(Math.min(result.start_time, result.end_time)),
      yAxis.valueToPosition(Math.max(result.start_frequency, result.end_frequency)),
      Math.floor(xAxis.valuesToPositionRange(result.start_time, result.end_time)),
      yAxis.valuesToPositionRange(result.start_frequency, result.end_frequency)
    );

  }

  return {
    resetCanvas,
    drawSpectrogram,
    drawResult,
  }
}

export const useCurrentAnnotation = () => {
  const {
    results,
    focusedResultID,
  } = useAppSelector(state => state.annotator);

  const annotation = useMemo(() => results?.find(r => r.id === focusedResultID), [ results, focusedResultID ]);

  const duration = useMemo(() => {
    if (annotation?.type !== 'Box') return;
    const minTime = Math.min(annotation.start_time, annotation.end_time)
    const maxTime = Math.max(annotation.start_time, annotation.end_time)
    return +(maxTime - minTime).toFixed(3)
  }, [ annotation?.start_time, annotation?.end_time ]);
  return { annotation, duration }
}
