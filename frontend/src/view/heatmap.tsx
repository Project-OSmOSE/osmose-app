import React, { Fragment, useEffect, useState } from "react";
import npyjs from 'npyjs'
import JSZip from 'jszip'
import JSZipUtils from 'jszip-utils'
import Plot from 'react-plotly.js';
import { AxisType } from "plotly.js";

export const Heatmap: React.FC = () => {

  const filename = "http://localhost:5173/backend/static/datawork/dataset/2023_02_05T10_51_29_1_0.npz"

  const [data, setData] = useState<Array<number[]>>([]);
  const [time, setTime] = useState<Array<number>>([]);
  const [timeTicksFormat, setTimeTicksFormat] = useState<string>();
  const [frequency, setFrequency] = useState<Array<number>>([]);
  const [yDisplay, setYDisplay] = useState<AxisType>('linear');

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

      setData(dataContent);
      setTime(timeContent);
      setFrequency(frequencyContent);

      // Converted in seconds
      const maxTime = Math.max(...timeContent);
      let format = "%Ss";
      if (maxTime > 60) format = `%M:${ format }`;
      if (maxTime > 3600) format = `%H:${ format }`;
      setTimeTicksFormat(format);
    })
  }, []);

  return (
    <Fragment>
      <Plot
        data={ [{
          type: 'heatmap',
          x: time.map(t => new Date(t * 1000)),
          y: frequency,
          z: data,
          colorscale: 'Viridis',
        }] }
        layout={ {
          title: filename,
          // uirevision: 'true', // Prevent graph reload when react page reloads?
          xaxis: {
            tickformat: timeTicksFormat,
            spikethickness: 1,
          },
          yaxis: {
            ticksuffix: 'Hz',
            spikethickness: 1,
            type: yDisplay
          },
          dragmode: 'pan',
        } }
        config={ {
          scrollZoom: true,
          displaylogo: false,
          modeBarButtonsToAdd: [
            "togglespikelines",
          ],
          modeBarButtonsToRemove: [
            'resetScale2d',
          ]
        } }
      />

      <select value={ yDisplay } onChange={e => setYDisplay(e.target.value)}>
        <option value="linear">Linear</option>
        <option value="log">Log</option>
      </select>
    </Fragment>
  );
};
