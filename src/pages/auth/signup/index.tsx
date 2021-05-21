import { CustomButton, useRouter } from 'components'
import React, { useState } from 'react'
import { Form, Input, Button, notification } from 'antd'
import { useDispatch } from 'react-redux'
import './style.css'
import { FormattedMessage, useIntl } from 'react-intl'
import { signUp } from 'api'
import { REGISTER_SUCCESS } from 'redux/actions/types'

const Signup: React.FC = () => {
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const intl = useIntl()
  const dispatch = useDispatch()

  const onFinish = (values: any) => {
    setLoading(true)
    const { email, password } = values

    signUp(email, password)
      .then(() => {
        dispatch({
          type: REGISTER_SUCCESS,
        })
        notification.success({
          message: intl.formatMessage({ id: 'sign-up-success' }),
        })
        router.push('/auth/signin')
      })
      .catch(() => {
        // dispatch({ type: REGISTER_FAIL })

        notification.warning({
          message: intl.formatMessage({ id: 'sign-up-error' }),
        })
      })
      .finally(() => setLoading(false))
  }

  return (
    <div className="w-full h-screen bg-gray-100">
      <div className="w-96 bg-white rounded-lg p-6 shadow-md mx-auto mt-10">
        <Form
          name="basic"
          layout="vertical"
          initialValues={{
            email: 'admin@example.com',
            password: 'FERNANDOtorres_9',
          }}
          onFinish={(values) => onFinish(values)}
        >
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
            <CustomButton className="btn-warning" loading={loading} type="submit">
              <FormattedMessage id="sign-up" />
            </CustomButton>
          </Form.Item>
        </Form>
      </div>
    </div>
  )
}

export default Signup
