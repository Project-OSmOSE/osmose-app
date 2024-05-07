import JSZip from 'jszip';
import JSZipUtils from 'jszip-utils';
import npyjs from "npyjs";

export interface HeatmapData {
  frequency: Array<number>;
  time: Array<number>;
  data: Array<number>;
}

export async function getHeatmapData(filename: string): Promise<HeatmapData> {
  const buffer = await new Promise<ArrayBuffer>((resolve, reject) => {
    JSZipUtils.getBinaryContent(filename, async (err: Error, data: ArrayBuffer) => {
      if (err) return reject(err);
      resolve(data)
    });
  });

  const jsZip: JSZip = new JSZip()
  const npzFiles = await jsZip.loadAsync(buffer)

  const frequencyFile = npzFiles.files['Freq.npy'];
  const timeFile = npzFiles.files['Time.npy'];
  const dataFile = npzFiles.files['log_spectro.npy'];

  if (!frequencyFile || !timeFile || !dataFile) throw new Error('Miss a file');

  const _npyjs_ = new npyjs()

  const frequency: Array<number> = await frequencyFile.async("arraybuffer")
    .then(buffer => _npyjs_.parse(buffer))
    .then(parsedBuffer => parsedBuffer.data)
    .then(data => [].slice.call(data));

  const time: Array<number> = await timeFile.async("arraybuffer")
    .then(buffer => _npyjs_.parse(buffer))
    .then(parsedBuffer => parsedBuffer.data)
    .then(data => [].slice.call(data));

  return {
    frequency,
    time,
    data: await dataFile.async("arraybuffer")
      .then(buffer => _npyjs_.parse(buffer))
      .then(parsedBuffer => parsedBuffer.data)
      .then(data => [].slice.call(data))
  }
}
