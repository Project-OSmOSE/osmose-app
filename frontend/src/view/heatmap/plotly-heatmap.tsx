import React, { Fragment, useEffect, useState } from "react";
import { HeatmapData } from "@/view/heatmap/utils.ts";
import Plot from 'react-plotly.js';
import { AxisType } from "plotly.js";

interface Props {
  title: string;
  data?: HeatmapData;
}

export const PlotlyHeatmap: React.FC<Props> = ({ title, data }) => {
  const [colormap, setColormap] = useState<string>('Viridis');
  const [timeTicksFormat, setTimeTicksFormat] = useState<string>();
  const [yDisplay, setYDisplay] = useState<AxisType>('linear');
  const [content, setContent] = useState<Array<number[]>>([]);

  useEffect(() => {
    if (!data) return;

    const newData = []
    for (const f in data.frequency) {
      newData.push(data.data.slice(+f * data.time.length, (+f + 1) * data.time.length))
    }
    setContent(newData)

    const maxTime = Math.max(...data.time);
    let format = "%Ss";
    if (maxTime <= 60) format = `${ format }.%s`;
    if (maxTime > 60) format = `%M:${ format }`;
    if (maxTime > 3600) format = `%H:${ format }`;
    setTimeTicksFormat(format);
  }, [data]);

  return (
    <Fragment>
      <Plot
        data={ [{
          type: 'heatmap',
          x: data?.time.map(t => new Date(t * 1000)),
          y: data?.frequency,
          z: content,
          colorscale: colormap,
          showscale: false
        }] }
        layout={ {
          title,
          // uirevision: 'true', // Prevent graph reload when react page reloads?
          xaxis: {
            tickformat: timeTicksFormat,
          },
          yaxis: {
            ticksuffix: 'Hz',
            type: yDisplay
          },
          dragmode: 'pan',
          margin: {
            t: 50,
            l: 50,
            b: 50,
            r: 50,
          }
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
        onClick={ console.info }
      />
      <select value={ yDisplay } onChange={ e => setYDisplay(e.target.value) }>
        <option value="linear">Linear</option>
        <option value="log">Log</option>
      </select>

      <select value={ colormap } onChange={ e => setColormap(e.target.value) }>
        <option value="Viridis">Viridis</option>
        <option value="Greys">Greys</option>
        <option value="Blackbody">Blackbody</option>
        <option value="Hot">Hot</option>
      </select>
    </Fragment>
  );
};
