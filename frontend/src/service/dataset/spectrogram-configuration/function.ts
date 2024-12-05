import { SpectrogramConfiguration } from './type';

export function getScaleName(configuration: SpectrogramConfiguration): string {
  if (configuration.linear_frequency_scale) return configuration.linear_frequency_scale.name ?? 'Linear';
  if (configuration.multi_linear_frequency_scale) return configuration.multi_linear_frequency_scale.name ?? 'Multi-linear';
  return 'Default'
}