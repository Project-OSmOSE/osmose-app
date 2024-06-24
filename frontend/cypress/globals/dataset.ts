

export const SPECTROGRAM_CONFIGURATION = {
  id: 1,
  name: '4096_4096_90',
  nfft: 4096,
  winsize: 4096,
  overlap: 90
}
export const DATASET = {
  id: 1,
  name: 'Test Dataset',
  filesType: '.wav',
  spectrogramConfigurations: [SPECTROGRAM_CONFIGURATION]
}
