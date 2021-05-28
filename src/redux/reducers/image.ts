import { ImageInterface } from 'interfaces'
import {
  GET_IMAGES,
  ADD_IMAGE,
  IMAGE_ERROR,
  ADD_IMAGES,
  UPLOAD_IMAGES,
  GET_CATEGORIES,
  REMOVE_IMAGES,
} from '../actions/types'

const initialState: ImageInterface = {
  images: [],
  categories: [],
  loading: true,
}

const image = (state = initialState, action: any) => {
  const { type, payload }: { type: string; payload: any } = action

  switch (type) {
    case UPLOAD_IMAGES:
      return {
        ...state,
        loading: true,
      }
    case REMOVE_IMAGES:
      return {
        ...state,
        images: state.images.filter((each) => !payload.includes(each.id)),
        loading: false,
      }
    case GET_IMAGES:
      return {
        ...state,
        images: payload,
        loading: false,
      }
    case GET_CATEGORIES:
      return {
        ...state,
        categories: payload,
        loading: false,
      }
    case ADD_IMAGE:
      return {
        ...state,
        images: [...state.images, payload],
        loading: false,
      }
    case ADD_IMAGES:
      return {
        ...state,
        images: [...state.images, ...payload],
        loading: false,
      }
    case IMAGE_ERROR:
      return {
        ...state,
        loading: false,
      }
    default:
      return state
  }
}

export default image
