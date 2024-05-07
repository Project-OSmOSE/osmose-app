import React, { Fragment, useEffect, useState } from "react";
import { PlotlyHeatmap } from "@/view/heatmap/plotly-heatmap.tsx";
import { getHeatmapData, HeatmapData } from "@/view/heatmap/utils.ts";
import { EchartsHeatmap } from "@/view/heatmap/echarts-heatmap.tsx";
import { HomemadeSvgHeatmap } from "@/view/heatmap/homemade-svg-heatmap.tsx";
import { HomemadeCanvasHeatmap } from "@/view/heatmap/homemade-canvas-heatmap.tsx";
import { NivoHeatmap } from "@/view/heatmap/nivo-heatmap.tsx";

export const Heatmap: React.FC = () => {

  const filename = "http://localhost:5173/backend/static/datawork/dataset/2023_02_05T10_51_29_1_0.npz"
  const [data, setData] = useState<HeatmapData>();


  useEffect(() => {
    getHeatmapData(filename).then(setData);
  }, []);

  return (
    <Fragment>
      <PlotlyHeatmap title={ filename } data={ data }/>
      {/*<EchartsHeatmap title={ filename } data={ data }/>*/}
      {/*<HomemadeSvgHeatmap title={ filename } data={ data }/>*/}
      {/*<HomemadeCanvasHeatmap title={ filename } data={ data }/>*/}
      {/*<NivoHeatmap title={ filename } data={ data }/>*/}
    </Fragment>
  );
};
