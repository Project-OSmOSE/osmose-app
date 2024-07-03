import { LinearScale, MultiLinearScale } from "@/services/spectrogram";

export interface AxisProps {
  height: number,
  width: number,
  linear_scale?: LinearScale | null,
  multi_linear_scale?: MultiLinearScale | null,
  max_value: number,
  style: any
}
