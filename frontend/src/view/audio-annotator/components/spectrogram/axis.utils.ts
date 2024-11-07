import { LinearScale, MultiLinearScale } from "@/services/spectrogram";

export interface AxisProps {
  height: number,
  width: number,
  linear_scale?: LinearScale | null,
  multi_linear_scale?: MultiLinearScale | null,
  max_value: number,
  style: any
}

export const TimeAxis = {
  formatTime: (rawSeconds: number, withMs: boolean = false) => {
    const hours: number = Math.floor(rawSeconds / 3600);
    const minutes: number = Math.floor(rawSeconds / 60) % 60;
    const seconds: number = Math.floor(rawSeconds) % 60;
    const ms: number = rawSeconds - seconds;

    const hPart: string = (hours > 0) ? (String(hours).padStart(2, '0') + ':') : '';
    const mPart: string = String(minutes).padStart(2, '0') + ':';
    const sPart: string = String(seconds).padStart(2, '0');
    const msPart: string = withMs ? ('.' + ms.toFixed(3).slice(-3)) : '';

    return `${ hPart }${ mPart }${ sPart }${ msPart }`;
  }
}
