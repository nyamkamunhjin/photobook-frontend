import { Locales, SettingsInterface } from 'interfaces'
import { COLLAPSE, FULLSCREEN, CLEAR, LOCALE } from '../actions/types'

const defaultSettings: SettingsInterface = {
  collapse: false,
  fullScreen: false,
  locale: 'mn',
}

export type Action =
  | { type: 'COLLAPSE'; collapse: boolean }
  | { type: 'FULLSCREEN' }
  | { type: 'CLEAR' }
  | { type: 'LOCALE'; locale: Locales }

const auth = (state = defaultSettings, action: Action) => {
  switch (action.type) {
    case COLLAPSE:
      return { ...state, collapse: action.collapse }
    case FULLSCREEN:
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen()
        return { ...state, fullScreen: true }
      }
      if (document.exitFullscreen) {
        document.exitFullscreen()
        return { ...state, fullScreen: false }
      }
      return { ...state }
    case LOCALE:
      return { ...state, locale: action.locale }
    case CLEAR:
      return defaultSettings
    default:
      return state
  }
}

export default auth
