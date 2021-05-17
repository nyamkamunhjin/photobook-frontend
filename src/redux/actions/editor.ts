import { SET_IMAGE_TYPE, SET_DRAG_START, SET_BACKGROUND_EDIT, TOGGLE_SIDEBAR } from './types'

// set image type
export const setType = (type: string) => async (dispatch: any) => {
  dispatch({
    type: SET_IMAGE_TYPE,
    payload: type,
  })
}

// set drag start
export const setDragStart = (dragStart: boolean) => async (dispatch: any) => {
  dispatch({
    type: SET_DRAG_START,
    payload: dragStart,
  })
}

// set drag start
export const setBackgroundEdit = (backgroundEdit: boolean) => async (dispatch: any) => {
  dispatch({
    type: SET_BACKGROUND_EDIT,
    payload: backgroundEdit,
  })
}

// toggle sidebar
export const toggleSidebar = () => async (dispatch: any) => {
  dispatch({
    type: TOGGLE_SIDEBAR,
  })
}
