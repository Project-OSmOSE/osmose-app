export interface ConfidenceIndicator {
  id: number;
  label: string;
  level: number;
  is_default: boolean;
}

export interface ConfidenceIndicatorSet {
  id: number;
  name: string;
  desc: string;
  confidence_indicators: Array<ConfidenceIndicator>
}