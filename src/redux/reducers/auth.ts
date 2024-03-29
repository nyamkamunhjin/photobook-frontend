import { UserInterface } from 'interfaces'
import {
  REGISTER_SUCCESS,
  REGISTER_FAIL,
  USER_LOADED,
  AUTH_ERROR,
  LOGIN_SUCCESS,
  LOGIN_FAIL,
  LOGOUT,
  ACCOUNT_DELETED,
  AUTH_LOADING,
} from '../actions/types'

const defaultState: UserInterface = {
  isAuthenticated: false,
  loading: false,
  user: null,
  token: localStorage.getItem('token'),
}

const auth = (state = defaultState, action: any) => {
  const { type, payload }: { type: string; payload: any } = action

  switch (type) {
    case USER_LOADED:
      return {
        ...state,
        user: payload,
        isAuthenticated: true,
        loading: false,
      }
    case AUTH_LOADING:
      return {
        ...state,
        loading: true,
      }
    case REGISTER_SUCCESS:
      return state
    case LOGIN_SUCCESS: {
      const { token } = payload.data
      localStorage.setItem('token', token)
      return {
        ...state,
        token,
        isAuthenticated: true,
        loading: false,
      }
    }
    case REGISTER_FAIL:
    case AUTH_ERROR:
    case LOGIN_FAIL:
      return {
        ...state,
        token: null,
        isAuthenticated: false,
        loading: false,
      }
    case LOGOUT:
      localStorage.clear()
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
      }
    case ACCOUNT_DELETED:
      localStorage.removeItem('token')
      return {
        ...state,
        token: null,
        isAuthenticated: false,
        loading: false,
      }
    default:
      return state
  }
}

export default auth
