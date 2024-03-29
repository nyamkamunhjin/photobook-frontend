import React, { useState, useEffect } from 'react'
import { Form, Input, notification } from 'antd'
import { useDispatch, useSelector } from 'react-redux'
import { FormattedMessage, useIntl } from 'react-intl'
import { signIn } from 'api'
import { LOGIN_FAIL, LOGIN_SUCCESS } from 'redux/actions/types'
import { CustomButton, useRouter } from 'components'
import { loadUser } from 'redux/actions/auth'
import { FcGoogle } from 'react-icons/fc'
import { SiFacebook } from 'react-icons/si'
import { RootInterface } from 'interfaces'

const Login: React.FC = () => {
  const user = useSelector((state: RootInterface) => state.auth.user)
  const router = useRouter()
  const dispatch = useDispatch()
  const intl = useIntl()
  const [loading, setLoading] = useState(false)

  const googleSignin = () => {
    const popupWindow = window.open(`${process.env.REACT_APP_BACK_URL}/auth/google`, '_blank', 'width=600, height=600')
    if (popupWindow) popupWindow.focus()
  }

  const facebookSignin = () => {
    const popupWindow = window.open(
      `${process.env.REACT_APP_BACK_URL}/auth/facebook`,
      '_blank',
      'width=600, height=600'
    )
    if (popupWindow) popupWindow.focus()
  }

  const onFinish = (values: any) => {
    setLoading(true)
    const { email, password } = values

    signIn(email, password)
      .then((signedUser) => {
        dispatch({
          type: LOGIN_SUCCESS,
          payload: signedUser,
        })
        dispatch(loadUser())
      })
      .catch(() => {
        dispatch({ type: LOGIN_FAIL })
        notification.warning({
          message: intl.formatMessage({ id: 'sign_in_error' }),
        })
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    if (user) {
      router.history.push('/')
    }
  }, [user])

  return (
    <div className="w-full h-screen bg-gray-100">
      <div className="w-96 flex flex-col gap-4 bg-white rounded-lg p-6 shadow-md mx-auto mt-10">
        <h1 className="text-bold self-center text-xl">
          <FormattedMessage id="sign-in" />
        </h1>
        <CustomButton
          className="btn-primary bg-white text-black border border-solid"
          icon={<FcGoogle fontSize={15} />}
          onClick={googleSignin}
        >
          Sign in with Google
        </CustomButton>
        <CustomButton
          className="btn-primary border border-solid"
          icon={<SiFacebook fontSize={15} />}
          onClick={facebookSignin}
          style={{ background: '#5890FF' }}
        >
          Sign in with Facebook
        </CustomButton>

        <Form name="basic" layout="vertical" onFinish={onFinish}>
          <Form.Item
            label={
              <span className="font-semibold text-gray-500">
                <FormattedMessage id="email" />
              </span>
            }
            name="email"
            rules={[{ required: true, message: 'Please input your email!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label={
              <span className="font-semibold text-gray-500">
                <FormattedMessage id="password" />
              </span>
            }
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item>
            <CustomButton className="btn-primary" loading={loading} type="submit">
              <FormattedMessage id="sign-in" />
            </CustomButton>
          </Form.Item>
        </Form>
        <div className="ml-auto flex flex-col items-end">
          <CustomButton className="btn-text text-xs text-blue-400" onClick={() => router.push('/auth/signup')}>
            <FormattedMessage id="sign-up" />
          </CustomButton>
          <CustomButton className="btn-text text-xs text-blue-400" onClick={() => router.push('/auth/forgot-password')}>
            <FormattedMessage id="forgot_password" />?
          </CustomButton>
        </div>
      </div>
    </div>
  )
}

export default Login
