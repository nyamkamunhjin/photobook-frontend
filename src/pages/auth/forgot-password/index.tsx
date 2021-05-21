import React, { useState } from 'react'
import { Form, Input, notification } from 'antd'
import { FormattedMessage, useIntl } from 'react-intl'
import { forgotPassword } from 'api'
import { CustomButton } from 'components'

const ForgotPassword: React.FC = () => {
  const intl = useIntl()
  const [loading, setLoading] = useState(false)

  const onFinish = (values: any) => {
    setLoading(true)
    const { email } = values

    forgotPassword(email)
      .then((res) => {
        notification.info({
          message: intl.formatMessage({ id: 'sent-password-change-link' }),
          description: <a href={res?.data}>link</a>,
        })
      })
      .finally(() => {
        setLoading(false)
      })
  }

  return (
    <div className="w-full h-screen bg-gray-100">
      <div className="w-96 flex flex-col gap-4 rounded-lg bg-white p-6 shadow-md mx-auto mt-10">
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
          <Form.Item>
            <CustomButton className="btn-warning" loading={loading} type="submit">
              <FormattedMessage id="send-password-change-link" />
            </CustomButton>
          </Form.Item>
        </Form>
      </div>
    </div>
  )
}

export default ForgotPassword
