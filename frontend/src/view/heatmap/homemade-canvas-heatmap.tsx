import React, { useEffect, useRef, useState } from "react";
import { HeatmapData } from "@/view/heatmap/utils.ts";
import { reduce } from "rxjs";

interface Props {
  title: string;
  data?: HeatmapData;
}


// Linear Interpolation
function interpolate(v0: number, v1: number, t: number): number {
  return v0 * (1 - t) + v1 * t;
}

const viridisMin = { index: 0, rgb: [68, 1, 84] }
const viridisMax = { index: 1, rgb: [253, 231, 37] }
const viridis = [
  viridisMin,
  { index: 0.13, rgb: [71, 44, 122] },
  { index: 0.25, rgb: [59, 81, 139] },
  { index: 0.38, rgb: [44, 113, 142] },
  { index: 0.5, rgb: [33, 144, 141] },
  { index: 0.63, rgb: [39, 173, 129] },
  { index: 0.75, rgb: [92, 200, 99] },
  { index: 0.88, rgb: [170, 220, 50] },
  viridisMax
];
const VIRIDIS_COLORMAP = [viridis[0]]
for (let i = 0; i < 255; i++) {
  const d = i / 255;
  const before = viridis.filter(c => c.index < d).reduce((a, b) => a.index > b.index ? a : b, viridisMin);
  const after = viridis.filter(c => c.index > d).reduce((a, b) => a.index > b.index ? b : a, viridisMax);
  VIRIDIS_COLORMAP.push({
    index: i,
    rgb: [
      interpolate(before.rgb[0], after.rgb[0], d),
      interpolate(before.rgb[1], after.rgb[1], d),
      interpolate(before.rgb[2], after.rgb[2], d),
    ]
  })
}

interface Item {
  x: number;
  y: number;
  z: number;
}

export const HomemadeCanvasHeatmap: React.FC<Props> = ({ title, data }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [minData, setMinData] = useState<number>();
  const [maxData, setMaxData] = useState<number>();

  const [itemWidth, setItemWidth] = useState<number>(0);
  const [itemHeight, setItemHeight] = useState<number>(0);

  const [items, setItems] = useState<Array<Item>>([]);

  useEffect(() => {
    if (!data || !canvasRef.current) return;

    setMinData(data.data.reduce((a, b) => a < b ? a : b, data.data[0]))
    setMaxData(data.data.reduce((a, b) => a > b ? a : b, data.data[0]))

    setItemWidth(canvasRef.current.clientWidth / data.time.length);
    setItemHeight(canvasRef.current.clientHeight / data.frequency.length);

    // const newData = [];
    // for (let x = 0; x < data.time.length; x++) {
    //   for (let y = 0; y < data.frequency.length; y++) {
    //     const z = data.data[y * data.time.length + x];
    //     newData.push({ x, y, z });
    //   }
    // }
    // setItems(newData)

    draw();
  }, [data?.data, canvasRef.current]);

  const draw = () => {
    const start = Date.now();
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!context || !canvas || !data) return;
    const dpr = window.devicePixelRatio;
    context.scale(dpr, dpr)

    context.clearRect(0, 0, canvas.width, canvas.height);

    for (let x = 0; x < data.time.length; x++) {
      for (let y = 0; y < data.frequency.length; y++) {
        const z = data.data[y * data.time.length + x];
        context.fillStyle = getColor(z);
        context.fillRect(x * itemWidth, canvas.height - y * itemHeight, itemWidth, itemHeight);
      }
    }

    // for (const item of items) {
    //   context.fillStyle = getColor(item.z);
    //   context.fillRect(item.x * itemWidth, canvas.height - item.y * itemHeight, itemWidth, itemHeight);
    // }
    const end = Date.now();
    console.info('Draw duration:', (end - start) / 1000, 's')
  }

  const getColor = (z: number): string => {
    if (!maxData || !minData) return 'white';
    const normalizedZ = (z - minData) / (maxData - minData);
    const before = viridis.filter(c => c.index < normalizedZ).reduce((a, b) => a.index > b.index ? a : b, viridisMin);
    const after = viridis.filter(c => c.index > normalizedZ).reduce((a, b) => a.index > b.index ? b : a, viridisMax);
    return `rgb(${ interpolate(before.rgb[0], after.rgb[0], normalizedZ) },${ interpolate(before.rgb[1], after.rgb[1], normalizedZ) },${ interpolate(before.rgb[2], after.rgb[2], normalizedZ) })`;
  }

  return <canvas id="homemade-svg-heatmap"
                 width={ data?.time.length }
                 height={ data?.frequency.length }
                 style={ { width: data?.time.length, height: data?.frequency.length } }
                 ref={ canvasRef }/>;
}
