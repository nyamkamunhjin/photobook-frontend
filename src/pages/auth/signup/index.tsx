import { CustomButton, useRouter } from 'components'
import React, { useState } from 'react'
import { Form, Input, notification } from 'antd'
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

    signUp(values)
      .then(() => {
        dispatch({
          type: REGISTER_SUCCESS,
        })
        notification.success({
          message: intl.formatMessage({ id: 'sign_up_success' }),
        })
        router.push('/auth/signin')
      })
      .catch(() => {
        // dispatch({ type: REGISTER_FAIL })

        notification.warning({
          message: intl.formatMessage({ id: 'sign_up_error' }),
        })
      })
      .finally(() => setLoading(false))
  }

  return (
    <div className="w-full h-screen bg-gray-100">
      <div className="w-96 bg-white rounded-lg p-6 shadow-md mx-auto mt-10">
        <Form name="basic" layout="vertical" onFinish={(values) => onFinish(values)}>
          <div className="flex gap-4">
            <Form.Item
              className="flex-1"
              name="firstName"
              label={
                <span className="font-semibold text-gray-500">
                  <FormattedMessage id="first_name" />
                </span>
              }
              rules={[
                {
                  type: 'string',
                  message: <FormattedMessage id="wrong_first_name" />,
                },
                {
                  // required: true,
                  message: <FormattedMessage id="please_input_first_name" />,
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              className="flex-1"
              name="lastName"
              label={
                <span className="font-semibold text-gray-500">
                  <FormattedMessage id="last_name" />
                </span>
              }
              rules={[
                {
                  type: 'string',
                  message: <FormattedMessage id="wrong_last_name" />,
                },
                {
                  // required: true,
                  message: <FormattedMessage id="please_input_last_name" />,
                },
              ]}
            >
              <Input />
            </Form.Item>
          </div>
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
          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            label={
              <span className="font-semibold text-gray-500">
                <FormattedMessage id="confirm_password" />
              </span>
            }
            rules={[
              {
                required: true,
                message: <FormattedMessage id="please_input_confirm_password" />,
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve()
                  }
                  return Promise.reject(new Error('The two passwords that you entered do not match!'))
                },
              }),
            ]}
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
