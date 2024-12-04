export interface ConfidenceIndicator {
  id: number;
  label: string;
  level: number;
  isDefault: boolean;
}

export interface ConfidenceIndicatorSet {
  id: number;
  name: string;
  desc: string;
  confidence_indicators: Array<ConfidenceIndicator>
}