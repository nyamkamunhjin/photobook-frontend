/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react'
import { Form, Input, notification } from 'antd'
import { FormattedMessage, useIntl } from 'react-intl'
import { changePassword } from 'api'
import { CustomButton, useRouter } from 'components'

const ChangePassword: React.FC = () => {
  const [email, setEmail] = useState()
  const [token, setToken] = useState<string>()
  const router = useRouter()
  const intl = useIntl()
  const [loading, setLoading] = useState(false)

  const onFinish = (values: any) => {
    setLoading(true)
    if (!token) return

    changePassword(token, values)
      .then((res) => {
        if (res?.status) {
          notification.success({ message: intl.formatMessage({ id: 'success' }) })
          router.push('/auth/signin')
        }
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    setEmail(router.query.email)
    setToken(router.query.token)
  }, [])

  return (
    <div className="w-full h-screen bg-gray-100">
      <div className="w-96 flex flex-col gap-4 bg-white rounded-lg p-6 shadow-md mx-auto mt-10">
        <span className="font-semibold">{email}</span>
        <Form name="basic" layout="vertical" onFinish={onFinish}>
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
              <FormattedMessage id="sign-in" />
            </CustomButton>
          </Form.Item>
        </Form>
      </div>
    </div>
  )
}

export default ChangePassword
