import { MutableRefObject, useMemo, useRef } from "react";
import { useAppSelector } from '@/service/app';
import { buildErrorMessage } from "@/services/utils/format.tsx";
import { getFileDuration } from '@/service/dataset';
import { AnnotationResultBounds } from '@/service/campaign/result';
import { useToast } from '@/services/utils/toast.ts';
import { ScaleMapping } from '@/service/dataset/spectrogram-configuration/scale';

export const useSpectrogramService = (
  canvas: MutableRefObject<HTMLCanvasElement | null>,
  xAxis: MutableRefObject<ScaleMapping | null>,
  yAxis: MutableRefObject<ScaleMapping | null>,
) => {

  const {
    audio,
    file,
    spectrogram_configurations,
    userPreferences,
  } = useAppSelector(state => state.annotator);
  const toast = useToast();

  const duration = useMemo(() => getFileDuration(file), [ file ]);

  const images = useRef<Map<number, Array<HTMLImageElement | undefined>>>(new Map);

  function areAllImagesLoaded(): boolean {
    const zoom = userPreferences.zoomLevel - 1;
    const imagesCount = 2 ** zoom;
    const currentImages = images.current.get(zoom);
    return currentImages?.filter(i => !!i).length === imagesCount
  }

  async function loadImages() {
    const currentConfiguration = spectrogram_configurations?.find(c => c.id === userPreferences.spectrogramConfigurationID);
    if (!currentConfiguration || !file) {
      images.current = new Map();
      return;
    }

    const zoom = userPreferences.zoomLevel - 1;
    const imagesCount = 2 ** zoom;
    if (areAllImagesLoaded()) return;

    const filename = file.filename.split('.')[0]
    return Promise.all(
      Array.from(new Array<HTMLImageElement | undefined>(imagesCount)).map(async (element, index) => {
        if (element) return element;
        const image = new Image();
        image.src = `${ currentConfiguration.folder_path }/${ filename }_${ userPreferences.zoomLevel }_${ index }.png`;
        return await new Promise<HTMLImageElement | undefined>((resolve) => {
          image.onload = () => {
            resolve(image);
          }
          image.onerror = e => {
            toast.presentError(`Cannot load spectrogram image with source: ${ image.src } [${ buildErrorMessage(e as any) }]`)
            resolve(undefined);
          }
        })
      })
    ).then(loadedImages => {
      images.current.set(zoom, loadedImages)
    })
  }

  function resetCanvas() {
    const context = canvas.current?.getContext('2d', { alpha: false });
    if (!canvas.current || !context) return;
    context.clearRect(0, 0, canvas.current.width, canvas.current.height);
  }

  async function drawSpectrogram() {
    const context = canvas.current?.getContext('2d', { alpha: false });
    if (!canvas.current || !context) return;

    if (!areAllImagesLoaded()) await loadImages();
    if (!areAllImagesLoaded()) return;

    const currentImages = images.current.get(userPreferences.zoomLevel - 1)
    if (!currentImages) return;
    for (const i in currentImages) {
      const index: number | undefined = i ? +i : undefined;
      if (index === undefined) continue;
      const start = index * duration / userPreferences.zoomLevel;
      const end = (index + 1) * duration / userPreferences.zoomLevel;
      const image = currentImages[index];
      if (!image) continue
      context.drawImage(
        image,
        xAxis.current!.valueToPosition(start),
        0,
        Math.floor(xAxis.current!.valuesToPositionRange(start, end)),
        canvas.current.height
      )
    }
  }

  function drawProgressBar() {
    const context = canvas.current?.getContext('2d', { alpha: false });
    if (!canvas.current || !context) return;
    context.fillStyle = 'rgba(0, 0, 0)';
    context.fillRect(xAxis.current!.valueToPosition(audio.time), 0, 1, canvas.current.height);
  }

  function drawResult(result: AnnotationResultBounds) {
    const context = canvas.current?.getContext('2d', { alpha: false });
    if (!canvas.current || !context || !xAxis.current || !yAxis.current
      || result.start_time === null || result.end_time === null || result.start_frequency === null || result.end_frequency === null) return;
    context.strokeStyle = 'blue';
    context.strokeRect(
      xAxis.current.valueToPosition(Math.min(result.start_time, result.end_time)),
      yAxis.current.valueToPosition(Math.max(result.start_frequency, result.end_frequency)),
      Math.floor(xAxis.current.valuesToPositionRange(result.start_time, result.end_time)),
      yAxis.current.valuesToPositionRange(result.start_frequency, result.end_frequency)
    );

  }

  return {
    resetCanvas,
    drawSpectrogram,
    drawProgressBar,
    drawResult,
  }
}