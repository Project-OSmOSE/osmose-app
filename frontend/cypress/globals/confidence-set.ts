interface Indicator {
  label: string,
  level: number,
  isDefault?: boolean
}

export const INDICATOR_NOT_CONFIDENT: Indicator = {
  label: 'not confident',
  level: 0
}

export const INDICATOR_CONFIDENT: Indicator = {
  label: 'confident',
  level: 1,
  isDefault: true
}

export const CONFIDENCE_SET = {
  id: 1,
  name: "Confident/NotConfident",
  indicators: [
    INDICATOR_CONFIDENT,
    INDICATOR_NOT_CONFIDENT
  ]
}
