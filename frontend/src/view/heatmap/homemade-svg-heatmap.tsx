import React, { useEffect, useRef, useState } from "react";
import { HeatmapData } from "@/view/heatmap/utils.ts";

interface Props {
  title: string;
  data?: HeatmapData;
}


// const viridis: [
//   { "index": 0, "rgb": [68, 1, 84] },
//   { "index": 0.13, "rgb": [71, 44, 122] },
//   { "index": 0.25, "rgb": [59, 81, 139] },
//   { "index": 0.38, "rgb": [44, 113, 142] },
//   { "index": 0.5, "rgb": [33, 144, 141] },
//   { "index": 0.63, "rgb": [39, 173, 129] },
//   { "index": 0.75, "rgb": [92, 200, 99] },
//   { "index": 0.88, "rgb": [170, 220, 50] },
//   { "index": 1, "rgb": [253, 231, 37] }
// ];
//
export const HomemadeSvgHeatmap: React.FC<Props> = ({ title, data }) => {
  const container = useRef<HTMLDivElement | null>(null);

  const [minFrequency, setMinFrequency] = useState<number>();
  const [maxFrequency, setMaxFrequency] = useState<number>();
  const [minTime, setMinTime] = useState<number>();
  const [maxTime, setMaxTime] = useState<number>();
  const [minData, setMinData] = useState<number>();
  const [maxData, setMaxData] = useState<number>();

  const [itemWidth, setItemWidth] = useState<number>(0);
  const [itemHeight, setItemHeight] = useState<number>(0);

  const [items, setItems] = useState<Array<number[]>>([]);

  useEffect(() => {
    if (!data || !container.current) return;
    setMinFrequency(Math.min(...data.frequency));
    setMaxFrequency(Math.max(...data.frequency));
    setMinTime(Math.min(...data.time));
    setMaxTime(Math.max(...data.time));
    // setMinData(Math.min(...data.data));
    // setMaxData(Math.max(...data.data));

    setItemWidth(container.current.clientWidth / data.time.length);
    setItemWidth(container.current.clientHeight / data.frequency.length);

    const newData = [];
    let min = data.data[0];
    let max = data.data[0]
    for (let x = 0; x < data.time.length; x++) {
      for (let y = 0; y < data.frequency.length; y++) {
        const d = data.data[y * data.time.length + x];
        newData.push([x, y, d]);
        if (min > d) min = d;
        if (max < d) max = d;
      }
    }
    setItems(newData)
    setMinData(min);
    setMaxData(max);
  }, [data]);

  return (
    <div id="homemade-svg-heatmap" ref={ container }>
      <svg width={ container.current?.clientWidth } height={ container.current?.clientHeight }>
        { items.map(([x, y, z]) => (
          <rect key={`${x}-${y}`}
                width={ itemWidth } height={ itemHeight }
                x={ x * itemWidth } y={ y * itemHeight }
          />
        )) }
      </svg>
    </div>
  )
}
