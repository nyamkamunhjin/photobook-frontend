import axios from 'axios'
import { Dispatch } from 'redux'
import { REGISTER_SUCCESS, REGISTER_FAIL, USER_LOADED, AUTH_ERROR, LOGIN_SUCCESS, LOGIN_FAIL, LOGOUT } from './types'
import { getCurrentUser, signIn } from '../../api'

// Load User
export const loadUser = (): any => async (dispatch: Dispatch) => {
  try {
    const user = await getCurrentUser()
    if (user) {
      dispatch({
        type: USER_LOADED,
        payload: user?.data.user,
      })
    } else {
      dispatch({
        type: LOGIN_FAIL,
      })
    }
    // }
  } catch (err) {
    console.log('error : ')
    console.log(err)
    dispatch({
      type: AUTH_ERROR,
    })
  }
}

// Register user
export const register =
  ({ name, email, password }: { name: string; email: string; password: string }) =>
  async (dispatch: Dispatch) => {
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    }

    const body = JSON.stringify({ name, email, password })

    try {
      const res = await axios.post('/api/users', body, config)

      dispatch({
        type: REGISTER_SUCCESS,
        payload: res.data,
      })

      dispatch(loadUser())
    } catch (err) {
      console.error(err)
      // const { errors } = err.response.data

      // if (errors) {
      //   console.log('error')
      //   console.log(errors)
      // }

      dispatch({
        type: REGISTER_FAIL,
      })
    }
  }

// Login user
export const loginUser = (email: string, password: string) => async (dispatch: any) => {
  try {
    // const user = await Auth.signIn(email, password)
    const user = await signIn(email, password)

    if (user?.data) {
      dispatch({
        type: LOGIN_SUCCESS,
        payload: user,
      })
    } else {
      dispatch({
        type: LOGIN_FAIL,
      })
    }
  } catch (err: unknown) {
    // const { errors } = err.response.data

    // if (errors) {
    //   console.log('error')
    //   console.log(errors)
    // }
    console.error(err)

    dispatch({
      type: LOGIN_FAIL,
    })
  }
}

// Logout / Clear Profile
export const logout = (history: any) => async (dispatch: Dispatch) => {
  try {
    // dispatch({
    //   type: CLEAR_PROFILE,
    // })
    dispatch({
      type: LOGOUT,
    })

    history.push('/')
  } catch (error) {
    console.log(error)
  }
}
