import { MultiLinearScale } from "@/services/api/annotation-task-api.service.tsx";
import { LinearScale } from "@/services/spectrogram/scale/linear.scale.ts";

export interface AxisProps {
  height: number,
  width: number,
  linear_scale?: LinearScale | null,
  multi_linear_scale?: MultiLinearScale | null,
  max_value: number,
  style: any
}
