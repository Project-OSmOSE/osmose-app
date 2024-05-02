import React, { useEffect } from "react";
import npyjs from 'npyjs'
import JSZip from 'jszip'
import JSZipUtils from 'jszip-utils'
import { newPlot } from 'plotly.js-dist'

export const Heatmap: React.FC = () => {

  const filename = "http://localhost:5173/backend/static/datawork/dataset/2023_02_05T10_51_29_1_0.npz"


  useEffect(() => {
    console.debug("Loading", new Date())

    JSZipUtils.getBinaryContent(filename, async (err: Error, data: ArrayBuffer) => {
      if (err) throw err;
      console.debug("JSZipUtils.getBinaryContent:", data)

      const jsZip: JSZip = new JSZip()
      const npzFiles = await jsZip.loadAsync(data)
      console.debug("jsZip.loadAsync:", npzFiles)

      const frequencyFile = npzFiles.files['Freq.npy'];
      const timeFile = npzFiles.files['Time.npy'];
      const dataFile = npzFiles.files['log_spectro.npy'];

      if (!frequencyFile || !timeFile || !dataFile) throw new Error('Miss a file');

      const _npyjs_ = new npyjs()
      const frequencyContent: Array<number> = await frequencyFile.async("arraybuffer")
        .then(buffer => _npyjs_.parse(buffer))
        .then(parsedBuffer => parsedBuffer.data)
        .then(data => [].slice.call(data));

      const timeContent: Array<number> = await timeFile.async("arraybuffer")
        .then(buffer => _npyjs_.parse(buffer))
        .then(parsedBuffer => parsedBuffer.data)
        .then(data => [].slice.call(data));

      const dataContent: Array<number[]> = await dataFile.async("arraybuffer")
        .then(buffer => _npyjs_.parse(buffer))
        .then(parsedBuffer => parsedBuffer.data)
        .then(data => [].slice.call(data))
        .then(array => {
          const table: number[][] = [];
          for (const f in frequencyContent) {
            table.push(array.slice(+f * timeContent.length, (+f + 1) * timeContent.length))
          }
          return table
        });

      draw(dataContent, timeContent, frequencyContent);
    })
  }, []);

  const draw = (data: number[][], time: number[], frequency: number[]) => {
    console.debug('Draw', new Date())
    newPlot('heatmap', [
      {
        z: data,
        x: time,
        y: frequency,
        type: 'heatmap',
        colorscale: 'Viridis'
      }
    ])
  }

  return (
    <div id="heatmap"></div>
  );
};
