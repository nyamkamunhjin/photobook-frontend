import { Form, Input, notification, InputNumber, List } from 'antd'
import React, { FC, useState, useEffect } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { useDispatch, useSelector } from 'react-redux'
import { RootInterface, ShippingAddress, User } from 'interfaces'
import { deleteShippingAddress, listShippingAddress, updateCurrentUser } from 'api'
import { loadUser } from 'redux/actions/auth'
import { CustomButton } from 'components'
import { useRequest } from 'ahooks'
import ShippingAddressModal from './shipping-address-modal'

const MyInfo: FC = () => {
  const intl = useIntl()
  const user = useSelector((state: RootInterface) => state.auth.user)
  const [shippingAddressId, setShippingAddressId] = useState<number>()
  const [shippingType, setShippingType] = useState<'edit' | 'add'>()
  const [updateLoading, setUpdateLoading] = useState(false)
  const dispatch = useDispatch()

  const shippingAddresses = useRequest(
    ({ current, pageSize }, { userId }, pageNumber) =>
      listShippingAddress({ current, pageSize }, { userId }, pageNumber),
    {
      manual: true,
      paginated: true,
    }
  )

  useEffect(() => {
    if (user?.id) {
      shippingAddresses.run(
        { current: shippingAddresses.pagination.current, pageSize: shippingAddresses.pagination.pageSize },
        { userId: user.id.toString() },
        (shippingAddresses.pagination.current - 1) * shippingAddresses.pagination.pageSize
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, shippingType])

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
    setUpdateLoading(true)
    updateCurrentUser({ ...values, phoneNumber: values.phoneNumber?.toString() })
      .then(() => {
        dispatch(loadUser())
        notification.success({ message: intl.formatMessage({ id: 'success' }) })
        setUpdateLoading(false)
      })
      .catch(() => {
        notification.error({ message: 'bzbxzbzbzzzzz' })
        setUpdateLoading(false)
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
            phoneNumber: user?.phoneNumber && parseInt(user.phoneNumber, 10),
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
          <Form.Item
            name="phoneNumber"
            label={<FormattedMessage id="phone_number" />}
            rules={[
              {
                type: 'number',
                message: <FormattedMessage id="wrong_phone_number" />,
              },
              {
                required: true,
                message: <FormattedMessage id="please_input_phone_number" />,
              },
            ]}
          >
            <InputNumber className="w-full" />
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
            <CustomButton className="btn-accept w-full" loading={updateLoading} type="submit">
              <FormattedMessage id="update" />
            </CustomButton>
          </Form.Item>
        </Form>

        <span className="font-semibold text-xl">
          <FormattedMessage id="social_accounts" />
        </span>

        <div className="border-b-2 my-2 border-gray-300" />

        <div className="w-full flex flex-col gap-2 mb-4">
          <span className="text-xl">Google</span>
          {user?.googleId ? (
            <span className="btn-accept w-32 grid place-items-center">
              <FormattedMessage id="connected" />
            </span>
          ) : (
            <button className="btn bg-blue-400" type="button" onClick={googleSignin}>
              <FormattedMessage id="connect_google" />
            </button>
          )}
          <span className="text-xl">Facebook</span>
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

        <span className="font-semibold text-xl">
          <FormattedMessage id="addresses" />
        </span>

        <div className="border-b-2 my-2 border-gray-300" />
        <div className="flex flex-col">
          <CustomButton
            className="btn-accept ml-auto mr-4 my-2"
            style={{ minWidth: '6rem' }}
            onClick={() => {
              setShippingType('add')
            }}
          >
            <FormattedMessage id="add" />
          </CustomButton>
          <List
            // itemLayout="vertical"
            dataSource={shippingAddresses.data?.list}
            loading={shippingAddresses.loading}
            pagination={{
              ...shippingAddresses.pagination,
              onChange: shippingAddresses.pagination.changeCurrent,
            }}
            renderItem={(item: ShippingAddress, index) => (
              <List.Item
                className="rounded p-2 hover:bg-gray-50"
                key={item.id}
                actions={[
                  <CustomButton
                    className="btn-primary"
                    type="button"
                    onClick={() => {
                      setShippingAddressId(item.id)
                      setShippingType('edit')
                    }}
                  >
                    <FormattedMessage id="edit" />
                  </CustomButton>,
                  <CustomButton
                    className="btn-cancel"
                    type="button"
                    onClick={() => {
                      deleteShippingAddress(item.id).then(() => {
                        shippingAddresses.refresh()
                      })
                    }}
                  >
                    <FormattedMessage id="delete" />
                  </CustomButton>,
                ]}
              >
                <List.Item.Meta
                  title={
                    <span className="font-semibold text-lg">
                      {index + 1} <span className="text-sm text-gray-500">{item.address}</span>
                    </span>
                  }
                  description={
                    <div className="flex flex-col gap-2">
                      <span className="font-semibold text-xs">
                        <FormattedMessage id="delivery_first_name" />: {item.firstName}
                      </span>
                      <span className="font-semibold text-xs">
                        <FormattedMessage id="delivery_last_name" />: {item.lastName}
                      </span>
                      <span className="font-semibold text-xs">
                        <FormattedMessage id="delivery_company_name" />: {item.companyName}
                      </span>
                      <span>{item.description}</span>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </div>
      </div>
      {shippingType && (
        <ShippingAddressModal
          id={shippingAddressId}
          setId={setShippingAddressId}
          type={shippingType}
          setType={setShippingType}
        />
      )}
    </div>
  )
}

export default MyInfo
