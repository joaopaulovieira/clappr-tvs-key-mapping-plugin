/* eslint-disable camelcase */
import { KeyNames as BrowserKeyNames } from './devices/browser'
import { KeyNames as TizenKeyNames } from './devices/samsung_tizen'
import { KeyNames as PanasonicKeyNames } from './devices/panasonic'

export const KeyMap = {
  browser: BrowserKeyNames,
  panasonic: PanasonicKeyNames,
  samsung_tizen: TizenKeyNames,
}
