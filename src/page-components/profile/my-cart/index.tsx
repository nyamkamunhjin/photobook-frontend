import { useRequest } from 'ahooks'
import { List, Popconfirm, InputNumber, Checkbox, Select, notification } from 'antd'
import React, { useEffect, useState } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import {
  createOrder,
  deleteCartItem,
  getShoppingCartSummary,
  listShippingAddress,
  listShoppingCart,
  updateCartItem,
} from 'api'
import { CartItem, RootInterface, ShippingAddress } from 'interfaces'
import { useSelector } from 'react-redux'
import { useHistory } from 'react-router'
import { CustomButton } from 'components'
import { SelectValue } from 'antd/lib/select'
import { currencyFormat } from 'utils'

const MyCart: React.FC = () => {
  const intl = useIntl()
  const history = useHistory()
  const [deliveryChecked, setDeliveryChecked] = useState(false)
  const [selectedAddress, setSelectedAddress] = useState<SelectValue>()

  const user = useSelector((state: RootInterface) => state.auth.user)
  const shippingAddresses = useRequest(() =>
    listShippingAddress({ current: 0, pageSize: 100 }, { userId: user?.id.toString() })
  )
  const summary = useRequest(getShoppingCartSummary, {
    manual: true,
  })

  const shoppingCart = useRequest(listShoppingCart, {
    manual: true,
  })

  const onCreateOrder = (shipping: boolean) => {
    const { cartItems } = shoppingCart.data
    const order: { isShipping: boolean; address?: number } = {
      isShipping: false,
    }
    if (user && cartItems) {
      if (shipping && selectedAddress) {
        order.address = selectedAddress as number
        order.isShipping = true
      }

      createOrder(order).then(() => {
        notification.success({
          message: intl.formatMessage({ id: 'success!' }),
        })
        history.push('/profile?tab=order_history')
      })
    }
  }

  useEffect(() => {
    if (user?.id) {
      shoppingCart.run()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  // get shopping cart price summary
  useEffect(() => {
    summary.run({
      isShipping: deliveryChecked,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shoppingCart.data, deliveryChecked, selectedAddress])

  return (
    <div className="p-2">
      <span className="font-semibold text-xl">
        <FormattedMessage id="my_cart" />
      </span>
      <div>
        <List
          itemLayout="horizontal"
          dataSource={shoppingCart.data?.cartItems}
          loading={shoppingCart.loading}
          renderItem={(item: CartItem) => (
            <List.Item
              className="flex flex-wrap gap-4 rounded p-2 hover:bg-gray-50"
              key={item.id}
              actions={[
                <InputNumber
                  defaultValue={item.quantity}
                  min={1}
                  style={{ width: '4rem' }}
                  onChange={(value) => {
                    updateCartItem(item.id, {
                      quantity: value,
                    }).then(() => {
                      shoppingCart.refresh()
                    })
                  }}
                />,
                <Popconfirm
                  title={<FormattedMessage id="delete-confirm-text" />}
                  onConfirm={() => {
                    deleteCartItem({
                      ids: [item.id],
                    }).then(() => {
                      shoppingCart.refresh()
                    })
                  }}
                  okText={<FormattedMessage id="yes" />}
                  cancelText={<FormattedMessage id="no" />}
                >
                  <CustomButton className="btn-cancel" type="button">
                    <FormattedMessage id="delete" />
                  </CustomButton>
                </Popconfirm>,
              ]}
            >
              <div className="flex">
                <img
                  className="w-28 h-28 rounded"
                  src={`${process.env.REACT_APP_PUBLIC_IMAGE}${item.project.imageUrl}`}
                  alt="project"
                />
                <span className="font-semibold text-base">
                  {item.project.name}{' '}
                  <span className="font-light text-sm text-gray-500">({item.project.templateType?.name})</span>
                </span>
              </div>
              <div className="ml-auto flex flex-col text-right">
                {/* <span className="text-gray-500">{item.project.paperMaterial?.name}</span>
                <span className="text-gray-500">{item.project.paperSize?.size}</span>
                <span className="text-gray-500">{item.project.bindingType?.name}</span>
                <span className="text-gray-500">{item.project.coverType?.name}</span>
                <span className="text-gray-500">{item.project.frameMaterial?.name}</span> */}
                <span className="text-gray-500">Photo printing</span>
                <span className="text-gray-500">20x30 large</span>
                <span className="text-gray-500">Premium Layflat Binding</span>
                <span className="text-gray-500">Deluxe Hardcover</span>
                <span className="text-gray-500">Glass Frame</span>
                <div className="border-t border-gray-300">
                  {/* <span className="text-sm text-gray-700">{item.userDiscount?.discountPercent}</span> */}
                  <span className="text-sm text-gray-700">{currencyFormat(item.project.price || 0)} ₮</span>
                </div>
              </div>
            </List.Item>
          )}
        />
      </div>
      {shoppingCart.data?.cartItems.length > 0 && (
        <div className="flex flex-col lg:flex-row justify-between gap-4 mt-8">
          <div className="w-full">
            <Checkbox checked={deliveryChecked} onChange={(e) => setDeliveryChecked(e.target.checked)}>
              <FormattedMessage id="delivery" />
            </Checkbox>
            {deliveryChecked && (
              <Address
                shippingAddresses={shippingAddresses.data?.list}
                selected={selectedAddress}
                setSelected={setSelectedAddress}
              />
            )}
          </div>
          <OrderSummary {...summary.data} onCreateOrder={() => onCreateOrder(deliveryChecked)} />
        </div>
      )}
    </div>
  )
}

export default MyCart

interface OrderSummaryProps {
  price: number
  vatFee: number
  totalPrice: number
  daysToDeliver: number
  shippingFee: number
  onCreateOrder: (shipping: boolean) => void
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  price,
  vatFee,
  totalPrice,
  daysToDeliver,
  shippingFee,
  onCreateOrder,
}) => {
  return (
    <div className="flex flex-col gap-2 bg-gray-100 max-w-xs w-full p-4">
      <div className="flex justify-between">
        <span className="text-sm font-light text-gray-700">
          <FormattedMessage id="order_summary" />
        </span>
      </div>
      <hr className="border-t border-solid border-gray-300" />
      <div className="flex justify-between">
        <span className="text-sm font-light text-gray-700">
          <FormattedMessage id="order_subtotal" />
        </span>
        <span className="font-light">{currencyFormat(price)} ₮</span>
      </div>

      <div className="flex justify-between">
        <span className="text-sm font-light text-gray-700">
          <FormattedMessage id="shipping_fee" />
        </span>
        <span className="font-light">{currencyFormat(shippingFee)} ₮</span>
      </div>

      <div className="flex justify-between">
        <span className="text-sm font-light text-gray-700">
          <FormattedMessage id="vat_fee" />
        </span>
        <span className="font-light">{currencyFormat(vatFee)} ₮</span>
      </div>
      <div className="flex justify-between">
        <span className="text-sm font-light text-gray-700">
          <FormattedMessage id="delivery_date" />
        </span>
        <span className="font-light">
          {daysToDeliver} <FormattedMessage id="day" />
        </span>
      </div>
      <hr className="border-t border-solid border-gray-300" />
      <div className="flex justify-between">
        <span className="text-sm font-light text-gray-700">
          <FormattedMessage id="total" />
        </span>
        <span className="font-light">{currencyFormat(totalPrice)} ₮</span>
      </div>
      <CustomButton className="mt-4 btn-accept" onClick={() => onCreateOrder(shippingFee !== 0)}>
        <FormattedMessage id="order_now" />
      </CustomButton>
    </div>
  )
}

interface ShippingAddressProps {
  shippingAddresses: ShippingAddress[]
  selected: SelectValue
  setSelected: React.Dispatch<React.SetStateAction<SelectValue>>
}

const Address: React.FC<ShippingAddressProps> = ({ shippingAddresses, selected, setSelected }) => {
  return (
    <div className="flex flex-col gap-4 w-full">
      <Select value={selected} onChange={setSelected}>
        {shippingAddresses?.map((item) => (
          <Select.Option key={item.id} value={item.id}>
            <div className="flex flex-col gap-2">
              <span className="text-sm text-gray-500">{item.address}</span>
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
          </Select.Option>
        ))}
      </Select>
    </div>
  )
}
