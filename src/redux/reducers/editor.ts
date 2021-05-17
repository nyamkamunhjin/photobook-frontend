import { EditorInterface } from 'interfaces'
import { SET_IMAGE_TYPE, SET_DRAG_START, SET_BACKGROUND_EDIT, TOGGLE_SIDEBAR } from '../actions/types'

const initialState: EditorInterface = {
  imageType: 'layouts',
  type: 'background',
  dragStart: false,
  backgroundEdit: false,
  sidebarOpen: false,
  loading: true,
}

const editor = (state = initialState, action: any) => {
  const { type, payload }: { type: string; payload: any } = action

  switch (type) {
    case SET_IMAGE_TYPE:
      return {
        ...state,
        type: payload,
        loading: false,
      }
    case SET_DRAG_START:
      return {
        ...state,
        dragStart: payload,
        loading: false,
      }
    case SET_BACKGROUND_EDIT:
      return {
        ...state,
        backgroundEdit: payload,
        loading: false,
      }
    case TOGGLE_SIDEBAR:
      return {
        ...state,
        sidebarOpen: !state.sidebarOpen,
        loading: false,
      }
    default:
      return state
  }
}

export default editor
