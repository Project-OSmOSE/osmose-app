import React, { Fragment, useEffect, useRef, useState } from "react";
import { HeatmapData } from "@/view/heatmap/utils.ts";
import { GridComponent, TooltipComponent, VisualMapComponent } from 'echarts/components';
import { HeatmapChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import { EChartsType, init, use } from "echarts/core";

use([
  TooltipComponent,
  GridComponent,
  VisualMapComponent,
  HeatmapChart,
  CanvasRenderer
]);

interface Props {
  title: string;
  data?: HeatmapData;
}

export const EchartsHeatmap: React.FC<Props> = ({ title, data }) => {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current || !data) return;

    const newData = []
    let min = data.data[0];
    let max = data.data[0];
    for (let x = 0; x < data.time.length; x++) {
      for (let y = 0; y < data.frequency.length; y++) {
        const d = data.data[y * data.time.length + x];
        newData.push([x, y, d]);
        if (min > d) min = d;
        if (max < d) max = d;
      }
    }

    const heatmap = init(container.current);
    heatmap.setOption({
      xAxis: {
        type: 'category',
        data: data.time
      },
      yAxis: {
        type: 'category',
        data: data.frequency
      },
      series: {
        type: 'heatmap',
        data: newData,
        emphasis: {
          itemStyle: {
            borderColor: '#333',
            borderWidth: 1
          }
        },
        progressive: 1000,
        animation: false
      },
      visualMap: {
        min,
        max,
        calculable: true,
        realtime: false,
        inRange: {
          color: [
            '#313695',
            '#4575b4',
            '#74add1',
            '#abd9e9',
            '#e0f3f8',
            '#ffffbf',
            '#fee090',
            '#fdae61',
            '#f46d43',
            '#d73027',
            '#a50026'
          ]
        }
      },
    })
  }, [data]);

  return (
    <Fragment>
      <div ref={ container } style={ { width: '1000px', height: '500px' } }/>
    </Fragment>
  );
};
