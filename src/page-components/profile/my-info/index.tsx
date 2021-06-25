import { Form, Input, notification, List } from 'antd'
import React, { FC, useState, useEffect } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { useDispatch, useSelector } from 'react-redux'
import { RootInterface, ShippingAddress, User } from 'interfaces'
import { HiCheck } from 'react-icons/hi'
import { deleteShippingAddress, listShippingAddress, updateCurrentUser, verifyEmail } from 'api'
import { loadUser } from 'redux/actions/auth'
import { CustomButton } from 'components'
import { useRequest } from 'ahooks'
import ShippingAddressModal from './shipping-address-modal'
import VoucherList from './voucher-list'
import BoughtGiftCards from './bought-gift-cards'
import ActivatedGiftCards from './activated-gift-cards'

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

    if (values.password?.trim() === '') delete values.password
    if (values.phoneNumber) values.phoneNumber = values.phoneNumber.toString()
    updateCurrentUser(values)
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
      <span className="font-semibold text-xl">
        <FormattedMessage id="my_info" />
      </span>
      <hr className="my-1" />
      <div className="mt-4 flex flex-col gap-2">
        <Form
          className="w-full"
          size="large"
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
          <Form.Item
            className="flex-1"
            name="avatarUrl"
            label={
              <span className="font-semibold text-gray-500">
                <FormattedMessage id="avatar_url" />
              </span>
            }
            rules={[
              {
                type: 'string',
                message: <FormattedMessage id="wrong_avatar_url" />,
              },
              {
                // required: true,
                message: <FormattedMessage id="please_input_avatar_url" />,
              },
            ]}
          >
            <Input />
          </Form.Item>
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
          <div className="flex gap-2 items-center">
            <Form.Item
              className="w-full"
              name="email"
              label={
                <span className="font-semibold text-gray-500">
                  <FormattedMessage id="email" />
                </span>
              }
              rules={[
                {
                  type: 'email',
                  message: <FormattedMessage id="wrong_email" />,
                },
                {
                  // required: true,
                  message: <FormattedMessage id="please_input_email" />,
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              className="w-full"
              name="phoneNumber"
              label={
                <span className="font-semibold text-gray-500">
                  <FormattedMessage id="phone_number" />
                </span>
              }
              rules={[
                {
                  // type: 'number',
                  message: <FormattedMessage id="wrong_phone_number" />,
                },
              ]}
            >
              <Input className="w-full text-left" />
            </Form.Item>
          </div>
          {user?.email &&
            (user?.emailConfirmed ? (
              <CustomButton
                className="btn-text cursor-default whitespace-nowrap"
                icon={<HiCheck className="text-xl text-green-300" />}
                iconPosition="right"
              >
                <FormattedMessage id="email_verified" />
              </CustomButton>
            ) : (
              <CustomButton
                className="btn-primary whitespace-nowrap"
                onClick={() => {
                  verifyEmail().then(() => {
                    notification.info({
                      message: intl.formatMessage({
                        id: 'email_verification_sent',
                      }),
                    })
                  })
                }}
              >
                <FormattedMessage id="verify_email" />
              </CustomButton>
            ))}

          {/* <Form.Item
            name="password"
            label={
              <span className="font-semibold text-gray-500">
                <FormattedMessage id="password" />
              </span>
            }
            rules={[
              {
                // required: true,
                message: <FormattedMessage id="please_input_password" />,
              },
            ]}
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
                // required: true,
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

        <hr className="my-1" />

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

        <hr className="my-1" />
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
            dataSource={shippingAddresses.data?.list || []}
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
                    <FormattedMessage id="remove" />
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
      <VoucherList />
      <BoughtGiftCards />
      <ActivatedGiftCards />
    </div>
  )
}

export default MyInfo
