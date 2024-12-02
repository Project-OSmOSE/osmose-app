import { MutableRefObject, useMemo, useRef } from "react";
import { ScaleMapping } from "@/services/spectrogram";
import { useAppDispatch, useAppSelector } from "@/slices/app.ts";
import { AnnotatorActions } from "@/slices/annotator/global-annotator.ts";
import { buildErrorMessage } from "@/services/utils/format.tsx";
import { getFileDuration } from '@/service/dataset';
import { AnnotationResultBounds } from '@/service/campaign/result';

export const useSpectrogramService = (
  canvas: MutableRefObject<HTMLCanvasElement | null>,
  xAxis: MutableRefObject<ScaleMapping | null>,
  yAxis: MutableRefObject<ScaleMapping | null>,
) => {

  const {
    time, // TODO: check if there is a need to put it in a ref
  } = useAppSelector(state => state.annotator.audio);
  const {
    file
  } = useAppSelector(state => state.annotator.global);
  const {
    configurations,
    selectedID,
    currentZoom
  } = useAppSelector(state => state.annotator.spectro);
  const dispatch = useAppDispatch()

  const duration = useMemo(() => getFileDuration(file), [ file ]);

  const images = useRef<Map<number, Array<HTMLImageElement | undefined>>>(new Map);

  function areAllImagesLoaded(): boolean {
    const zoom = currentZoom - 1;
    const imagesCount = 2 ** zoom;
    const currentImages = images.current.get(zoom);
    return currentImages?.filter(i => !!i).length === imagesCount
  }

  async function loadImages() {
    const currentConfiguration = configurations.find(c => c.id === selectedID);
    if (!currentConfiguration || !file) {
      images.current = new Map();
      return;
    }

    const zoom = currentZoom - 1;
    const imagesCount = 2 ** zoom;
    if (areAllImagesLoaded()) return;

    const filename = file.filename.split('.')[0]
    return Promise.all(
      new Array<HTMLImageElement | undefined>(imagesCount).map(async (element, index) => {
        if (element) return element;
        const image = new Image();
        image.src = `${ filename }_${ currentZoom }_${ index }.png`;
        return await new Promise<HTMLImageElement | undefined>((resolve) => {
          image.onload = () => {
            resolve(image);
          }
          image.onerror = e => {
            dispatch(AnnotatorActions.setDangerToast(`Cannot load spectrogram image with source: ${ image.src } [${ buildErrorMessage(e as any) }]`))
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

    const currentImages = images.current.get(currentZoom - 1)
    if (!currentImages) return;
    for (const i in currentImages) {
      const index: number | undefined = i ? +i : undefined;
      if (index === undefined) continue;
      const start = index * duration / currentZoom;
      const end = (index + 1) * duration / currentZoom;
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
    context.fillRect(xAxis.current!.valueToPosition(time), 0, 1, canvas.current.height);
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