import { Form, Input, notification } from 'antd'
import React, { FC } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { useDispatch, useSelector } from 'react-redux'
import { RootInterface, User } from 'interfaces'
import { updateCurrentUser } from 'api'
import { loadUser } from 'redux/actions/auth'

const MyInfo: FC = () => {
  const intl = useIntl()
  const user = useSelector((state: RootInterface) => state.auth.user)
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

  const onFinish = (values: Partial<User>) => {
    updateCurrentUser(values)
      .then(() => {
        dispatch(loadUser())
        notification.success({ message: intl.formatMessage({ id: 'success' }) })
      })
      .catch(() => {
        notification.error({ message: 'bzbxzbzbzzzzz' })
      })
  }

  return (
    <div className="p-2">
      <span className="font-semibold text-xl bo">
        <FormattedMessage id="my_info" />
      </span>
      <div className="border-b-2 my-2 border-gray-300" />
      <div className="mt-4 flex flex-col gap-2">
        <Form
          className="w-full"
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            firstName: user?.firstName,
            lastName: user?.lastName,
            email: user?.email,
            avatarUrl: user?.avatarUrl,
          }}
        >
          <div className="flex gap-4">
            <Form.Item
              className="flex-1"
              name="firstName"
              label={<FormattedMessage id="first_name" />}
              rules={[
                {
                  type: 'string',
                  message: <FormattedMessage id="wrong_first_name" />,
                },
                {
                  required: true,
                  message: <FormattedMessage id="please_input_first_name" />,
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              className="flex-1"
              name="lastName"
              label={<FormattedMessage id="last_name" />}
              rules={[
                {
                  type: 'string',
                  message: <FormattedMessage id="wrong_last_name" />,
                },
                {
                  required: true,
                  message: <FormattedMessage id="please_input_last_name" />,
                },
              ]}
            >
              <Input />
            </Form.Item>
          </div>
          <Form.Item
            className="flex-1"
            name="avatarUrl"
            label={<FormattedMessage id="avatar_url" />}
            rules={[
              {
                type: 'string',
                message: <FormattedMessage id="wrong_avatar_url" />,
              },
              {
                required: true,
                message: <FormattedMessage id="please_input_avatar_url" />,
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label={<FormattedMessage id="email" />}
            rules={[
              {
                type: 'email',
                message: <FormattedMessage id="wrong_email" />,
              },
              {
                required: true,
                message: <FormattedMessage id="please_input_email" />,
              },
            ]}
          >
            <Input disabled />
          </Form.Item>
          {/* <Form.Item
            name="password"
            label={<FormattedMessage id="password" />}
            rules={[
              {
                required: true,
                message: <FormattedMessage id="please_input_password" />,
              },
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            label={<FormattedMessage id="confirm_password" />}
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
          </Form.Item> */}
          <Form.Item>
            <button className="btn-accept w-full" type="submit">
              <FormattedMessage id="update" />
            </button>
          </Form.Item>
        </Form>
        <span className="font-semibold text-xl">
          <FormattedMessage id="my_info" />
        </span>
        <div className="border-b-2 my-2 border-gray-300" />

        <div className="w-full flex flex-col gap-2">
          <span className="text-xl">
            <FormattedMessage id="google" />
          </span>
          {user?.googleId ? (
            <span className="btn-accept w-32 grid place-items-center">
              <FormattedMessage id="connected" />
            </span>
          ) : (
            <button className="btn bg-blue-400" type="button" onClick={googleSignin}>
              <FormattedMessage id="connect_google" />
            </button>
          )}
          <span className="text-xl">
            <FormattedMessage id="facebook" />
          </span>
          {user?.facebookId ? (
            <span className="btn-accept w-32 grid place-items-center">
              <FormattedMessage id="connected" />
            </span>
          ) : (
            <button className="btn bg-blue-400" type="button" onClick={facebookSignin}>
              <FormattedMessage id="connect_facebook" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default MyInfo
