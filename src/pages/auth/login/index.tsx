import React, { useState } from 'react'
import { Form, Input, Button, notification } from 'antd'
import { useDispatch } from 'react-redux'
import { FacebookFilled, GoogleOutlined } from '@ant-design/icons'
import { FormattedMessage, useIntl } from 'react-intl'
import { signIn } from 'api'
import { LOGIN_FAIL, LOGIN_SUCCESS } from 'redux/actions/types'
import { useRouter } from 'components'
import './style.css'
import { loadUser } from 'redux/actions/auth'

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
    // dispatch(loginUser(email, password)) // redux yaj message haruulahaa oilgodoggue ee

    signIn(email, password)
      .then((user) => {
        dispatch({
          type: LOGIN_SUCCESS,
          payload: user,
        })
        notification.success({
          message: intl.formatMessage({ id: 'sign-in-success' }),
        })
        dispatch(loadUser())
        router.push('/')
      })
      .catch(() => {
        dispatch({ type: LOGIN_FAIL })
        notification.warning({
          message: intl.formatMessage({ id: 'sign-in-error' }),
        })
      })
      .finally(() => {
        setLoading(false)
      })
  }

  return (
    <div className="w-96 bg-white rounded-lg p-6 shadow-md mx-auto">
      <Button className="my-3" icon={<GoogleOutlined />} onClick={googleSignin}>
        Sign in with Google
      </Button>
      <Button className="my-3" icon={<FacebookFilled />} onClick={facebookSignin}>
        Sign in with Facebook
      </Button>
      <Form
        name="basic"
        layout="vertical"
        initialValues={{
          email: 'admin@example.com',
          password: 'FERNANDOtorres_9',
        }}
        onFinish={(values) => onFinish(values)}
      >
        <Form.Item label="Email" name="email" rules={[{ required: true, message: 'Please input your email!' }]}>
          <Input />
        </Form.Item>

        <Form.Item
          label="Password"
          name="password"
          rules={[{ required: true, message: 'Please input your password!' }]}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item>
          <Button loading={loading} type="primary" htmlType="submit">
            <FormattedMessage id="sign-in" />
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}

export default Login
