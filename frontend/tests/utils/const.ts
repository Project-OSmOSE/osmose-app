import { CAMPAIGN } from "../fixtures";

export const ESSENTIAL = { tag: '@essential' };

export const URL = {
  OSmOSE: '/',
  doc: '/doc/',
  admin: '/backend/admin'
}

export const API_URL = {
  collaborators: '/api/collaborators/on_aplose_home',
  token: '/api/token/',
  user: {
    list: /api\/user\/?/g,
    self: /api\/user\/self\/?/g
  },
  campaign: {
    list: /\/api\/annotation-campaign\/?\??.*/g,
    create: '/api/annotation-campaign/',
    detail: `/api/annotation-campaign/${ CAMPAIGN.id }/`,
    archive: /\/api\/annotation-campaign\/-?\d\/archive\/?/g,
  },
  phase: {
    list: /\/api\/annotation-campaign-phase\/?\?/g,
    detail: /\/api\/annotation-campaign-phase\/\d\/?/g,
    report: /\/api\/annotation-campaign-phase\/-?\d\/report/g,
    reportStatus: /\/api\/annotation-campaign-phase\/-?\d\/report-status/g
  },
  dataset: {
    list: '/api/dataset/',
    detail: /\/api\/dataset\/-?\d\/?/g,
    list_to_import: /\/api\/dataset\/list_to_import\/?/g,
    import: '/api/dataset/datawork_import/',
  },
  fileRanges: {
    list: /api\/annotation-file-range(?!\/phase\/\d\/files)\/?/g,
    file: /\/api\/annotation-file-range\/phase\/-?\d\/files/g,
    post: /\/api\/annotation-file-range\/phase\/-?\d\//g,
  },
  annotatorGroup: {
    list: /\/api\/annotator-group\/?/g,
    detail: /\/api\/annotator-group\/-?\d\//g,
  },
  spectrogram: {
    list: /\/api\/spectrogram-configuration\/?.*/g,
    export: /\/api\/spectrogram-configuration\/export\/?/g,
  },
  audio: {
    list: /\/api\/audio-metadata\/?/g,
    export: /\/api\/audio-metadata\/export\/?/g,
  },
  label: {
    list: /\/api\/label-set\/?/g,
    detail: /\/api\/label-set\/-?\d\/?/g,
  },
  confidence: {
    list: /\/api\/confidence-indicator\/?/g,
    detail: /\/api\/confidence-indicator\/-?\d\/?/g,
  },
  annotator: /api\/annotator\/campaign\/-?\d\/phase\/-?\d\/file\/-?\d/g,
  result: {
    import: /api\/annotation-result\/campaign\/-?\d\/phase\/-?\d\/import\//g
  },
  detector: {
    list: /api\/detector/g
  }
}
