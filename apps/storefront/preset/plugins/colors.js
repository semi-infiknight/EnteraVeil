// EnteraVeil brand color tokens.
// Brand palette (from PROJECT_CONFIG.env):
//   BG          #0A0A0A → 10 10 10
//   FG          #F5F5F4 → 245 245 244
//   ACCENT      #FFB627 → 255 182 39
//   ACCENT_DEEP #E8801A → 232 128 26
//   MUTED       #3F3F46 → 63 63 70
//   DANGER      #EF4444 → 239 68 68

const rootColors = {
  /*BACKGROUND*/

  '--bg-static': '10 10 10',
  '--bg-primary': '255 255 255',
  '--bg-secondary': '249 249 249',
  '--bg-brand': '255 182 39',
  '--bg-hover': '237 237 237',
  '--bg-pressed': '229 229 229',
  '--bg-disabled': '210 210 210',
  '--bg-skeleton-primary': '243 244 246',
  '--bg-skeleton-secondary': '229 231 235',

  /*FOREGROUND*/

  '--fg-primary': '10 10 10',
  '--fg-primary-hover': '17 17 17',
  '--fg-primary-pressed': '26 26 26',
  '--fg-secondary': '10, 10, 10, 0.1',
  '--fg-secondary-hover': '10, 10, 10, 0.2',
  '--fg-secondary-pressed': '10, 10, 10, 0.3',
  '--fg-tertiary': '255, 255, 255, 0.4',
  '--fg-tertiary-hover': '255, 255, 255, 0.2',
  '--fg-tertiary-pressed': '255, 255, 255, 0.3',
  '--fg-primary-negative': '239 68 68',
  '--fg-primary-negative-hover': '217 45 32',
  '--fg-primary-negative-pressed': '180 35 24',
  '--fg-secondary-negative': '239, 68, 68, 0.2',
  '--fg-positive': '3, 152, 85, 0.2',

  /*CONTENT*/

  '--content-static': '255 255 255',
  '--content-basic-primary': '10 10 10',
  '--content-inverse-primary': '255 255 255',
  '--content-secondary': '108 108 108',
  '--content-disabled': '140 140 140',
  '--content-action-primary': '232 128 26',
  '--content-action-primary-hover': '255 182 39',
  '--content-action-primary-pressed': '232 128 26',
  '--content-negative': '239 68 68',
  '--content-positive': '3 152 85',
  '--content-warning': '232 128 26',
  '--content-yellow': '255 182 39',

  /*BORDER*/

  '--border-basic-primary': '229 229 229',
  '--border-secondary': '10, 10, 10, 0.1',
  '--border-disabled': '140 140 140',
  '--border-action-primary': '10 10 10',
  '--border-action-primary-inverse': '255 255 255',
  '--border-action-primary-hover': '255 182 39',
  '--border-action-primary-pressed': '232 128 26',
  '--border-negative': '239 68 68',
  '--border-positive': '3 152 85',
  '--border-warning': '232 128 26',
}

const darkMode = {
  /*BACKGROUND*/

  '--bg-static': '10 10 10',
  '--bg-primary': '10 10 10',
  '--bg-secondary': '21 21 21',
  '--bg-brand': '255 182 39',
  '--bg-hover': '63 63 70',
  '--bg-pressed': '108 108 108',
  '--bg-disabled': '63 63 70',
  '--bg-skeleton-primary': '44 43 42',
  '--bg-skeleton-secondary': '11 11 11',

  /*FOREGROUND*/

  '--fg-primary': '245 245 244',
  '--fg-primary-hover': '237 237 237',
  '--fg-primary-pressed': '229 229 229',
  '--fg-secondary': '255, 255, 255, 0.1',
  '--fg-secondary-hover': '255, 255, 255, 0.2',
  '--fg-secondary-pressed': '255, 255, 255, 0.3',
  '--fg-tertiary': '255, 255, 255, 0.1',
  '--fg-tertiary-hover': '255, 255, 255, 0.2',
  '--fg-tertiary-pressed': '255, 255, 255, 0.3',
  '--fg-primary-negative': '239 68 68',
  '--fg-primary-negative-hover': '217 45 32',
  '--fg-primary-negative-pressed': '180 35 24',
  '--fg-secondary-negative': '239, 68, 68, 0.2',
  '--fg-positive': '3, 152, 85, 0.2',

  /*CONTENT*/

  '--content-static': '255 255 255',
  '--content-basic-primary': '245 245 244',
  '--content-inverse-primary': '10 10 10',
  '--content-secondary': '165 165 165',
  '--content-disabled': '108 108 108',
  '--content-action-primary': '255 182 39',
  '--content-action-primary-hover': '255 202 96',
  '--content-action-primary-pressed': '232 128 26',
  '--content-negative': '239 68 68',
  '--content-positive': '18 183 106',
  '--content-warning': '255 182 39',
  '--content-yellow': '255 182 39',

  /*BORDER*/

  '--border-basic-primary': '33 33 33',
  '--border-secondary': '255, 255, 255, 0.1',
  '--border-disabled': '108 108 108',
  '--border-action-primary': '245 245 244',
  '--border-action-primary-inverse': '10 10 10',
  '--border-action-primary-hover': '255 182 39',
  '--border-action-primary-pressed': '232 128 26',
  '--border-negative': '239 68 68',
  '--border-positive': '18 183 106',
  '--border-warning': '255 182 39',
}

module.exports = { rootColors, darkMode }
