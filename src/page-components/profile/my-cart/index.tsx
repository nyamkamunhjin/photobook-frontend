import { useRequest } from 'ahooks'
import { List, Popconfirm, InputNumber, Checkbox, Select, message } from 'antd'
import React, { useEffect, useState } from 'react'
import { FormattedMessage } from 'react-intl'
import { createOrder, deleteCartItem, listShippingAddress, listShoppingCart, updateCartItem } from 'api'
import { Payment, CartItem, RootInterface, ShippingAddress, User } from 'interfaces'
import { useSelector } from 'react-redux'
import { useHistory } from 'react-router'
import { CustomButton } from 'components'
import { SelectValue } from 'antd/lib/select'

interface CreateOrder {
  user: User['id']
  address: ShippingAddress['id']
  payment: Partial<Payment>
  cartItemIds: CartItem['id'][]
  deliveryDays: number
}

const MyCart: React.FC = () => {
  const history = useHistory()
  const [checked, setChecked] = useState(false)
  const [selectedAddress, setSelectedAddress] = useState<SelectValue>()
  const [price, setPrice] = useState(0)
  const [shippingFee, setShippingFee] = useState(0)
  const [days, setDays] = useState(0)
  const user = useSelector((state: RootInterface) => state.auth.user)
  const shippingAddresses = useRequest(() =>
    listShippingAddress({ current: 0, pageSize: 100 }, { userId: user?.id.toString() })
  )
  const shoppingCart = useRequest(listShoppingCart, {
    manual: true,
  })

  const calculate: (cartItems: CartItem[], shipping?: boolean) => { price: number; days: number } = (
    cartItems,
    shipping
  ) => {
    const result = cartItems.reduce(
      (acc, cur) => {
        acc.price += (cur.project.price || 0) * cur.quantity
        acc.days += cur.quantity
        return acc
      },
      { price: 0, days: 0, shippingFee: 0 }
    )

    if (shipping) {
      result.days += 1
      setShippingFee(3000)
    } else {
      setShippingFee(0)
    }

    setPrice(result.price)
    setDays(result.days)
    return result
  }

  const onCreateOrder = (shipping: boolean) => {
    const { cartItems } = shoppingCart.data

    if (user && cartItems) {
      const result = calculate(cartItems, shipping)
      const order: CreateOrder = {
        user: user?.id,
        address: selectedAddress as number,
        cartItemIds: shoppingCart.data.cartItems.map((each: CartItem) => each.id),
        payment: {
          paymentAmount: result.price,
        },
        deliveryDays: result.days,
      }

      createOrder(order).then(() => {
        message.success('success')
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

  useEffect(() => {
    if (shoppingCart.data) {
      calculate(shoppingCart.data.cartItems, checked)
    }
  }, [shoppingCart.data, checked])

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
              <div className="flex flex-col">
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
                <span className="text-sm text-gray-700">{Intl.NumberFormat().format(item.project.price || 0)} ₮</span>
              </div>
            </List.Item>
          )}
        />
      </div>
      {shoppingCart.data?.cartItems.length > 0 && (
        <div className="flex flex-col lg:flex-row justify-between gap-4 mt-8">
          <div className="w-full">
            <Checkbox checked={checked} onChange={(e) => setChecked(e.target.checked)}>
              <FormattedMessage id="delivery" />
            </Checkbox>
            {checked && <Address shippingAddresses={shippingAddresses.data?.list} setSelected={setSelectedAddress} />}
          </div>
          <OrderSummary
            price={price}
            daysToDeliver={days}
            shippingFee={shippingFee}
            onCreateOrder={() => onCreateOrder(checked)}
          />
        </div>
      )}
    </div>
  )
}

export default MyCart

interface OrderSummaryProps {
  price: number
  daysToDeliver: number
  shippingFee: number
  onCreateOrder: () => void
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ price, daysToDeliver, shippingFee, onCreateOrder }) => {
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
        <span className="font-light">{Intl.NumberFormat().format(price)} ₮</span>
      </div>

      <div className="flex justify-between">
        <span className="text-sm font-light text-gray-700">
          <FormattedMessage id="shipping_fee" />
        </span>
        <span className="font-light">{Intl.NumberFormat().format(shippingFee)} ₮</span>
      </div>

      <div className="flex justify-between">
        <span className="text-sm font-light text-gray-700">
          <FormattedMessage id="tax_amount" />
        </span>
        <span className="font-light">{Intl.NumberFormat().format(price / 10)} ₮</span>
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
          <FormattedMessage id="order_subtotal" />
        </span>
        <span className="font-light">{Intl.NumberFormat().format(price * 1.1 + shippingFee)} ₮</span>
      </div>
      <CustomButton className="mt-4 btn-accept" onClick={onCreateOrder}>
        <FormattedMessage id="order_now" />
      </CustomButton>
    </div>
  )
}

interface ShippingAddressProps {
  shippingAddresses: ShippingAddress[]
  setSelected: React.Dispatch<React.SetStateAction<SelectValue>>
}

const Address: React.FC<ShippingAddressProps> = ({ shippingAddresses, setSelected }) => {
  return (
    <div className="flex flex-col gap-4 w-full">
      <Select defaultValue={shippingAddresses[0]?.id} onChange={setSelected}>
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
