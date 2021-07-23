import React, { useState } from 'react'
import { Form, Input, notification } from 'antd'
import { useDispatch } from 'react-redux'
import { FormattedMessage, useIntl } from 'react-intl'
import { signIn } from 'api'
import { LOGIN_FAIL, LOGIN_SUCCESS } from 'redux/actions/types'
import { CustomButton, useRouter } from 'components'
import { loadUser } from 'redux/actions/auth'
import { FcGoogle } from 'react-icons/fc'
import { SiFacebook } from 'react-icons/si'

const Login: React.FC = () => {
  const router = useRouter()
  const intl = useIntl()
  const [loading, setLoading] = useState(false)
  const dispatch = useDispatch()

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
      .then((user) => {
        dispatch({
          type: LOGIN_SUCCESS,
          payload: user,
        })
        // notification.success({
        //   message: intl.formatMessage({ id: 'sign_in_success' }),
        // })
        dispatch(loadUser())
        router.push('/')
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

  return (
    <div className="w-full h-screen bg-gray-100">
      <div className="w-96 flex flex-col gap-4 bg-white rounded-lg p-6 shadow-md mx-auto mt-10">
        <div className="ml-auto">
          <CustomButton className="btn-text text-xs text-blue-400" onClick={() => router.push('/auth/forgot-password')}>
            <FormattedMessage id="forgot_password" />?
          </CustomButton>
        </div>
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
      </div>
    </div>
  )
}

export default Login
