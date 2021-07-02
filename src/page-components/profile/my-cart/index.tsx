import { useRequest } from 'ahooks'
import { List, Popconfirm, InputNumber, Checkbox, notification } from 'antd'
import React, { useEffect, useState } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import {
  createOrder,
  deleteCartItem,
  getShoppingCartSummary,
  listActivatedGiftCard,
  listShippingAddress,
  listShoppingCart,
  listVoucher,
  listPaymentTypes,
  updateCartItem,
} from 'api'

import { CartItem, GiftCard, PaymentType, RootInterface, Voucher } from 'interfaces'
import { useSelector } from 'react-redux'
import { useHistory } from 'react-router'
import { CustomButton } from 'components'
import { SelectValue } from 'antd/lib/select'
import { currencyFormat } from 'utils'
import CartAddress from './cart-address'
import OrderSummary from './order-summary'
import CartVoucher from './cart-voucher'
import CartGiftCard from './cart-giftcard'

const MyCart: React.FC = () => {
  const intl = useIntl()
  const history = useHistory()
  const [deliveryChecked, setDeliveryChecked] = useState(false)
  const [selectedAddress, setSelectedAddress] = useState<SelectValue>()
  const [selectedVoucher, setSelectedVoucher] = useState<SelectValue>()
  const [selectedGiftCard, setSelectedGiftCard] = useState<SelectValue>()
  const paymentTypes = useRequest<PaymentType>(listPaymentTypes)

  const user = useSelector((state: RootInterface) => state.auth.user)
  const shippingAddresses = useRequest(() =>
    listShippingAddress({ current: 0, pageSize: 100 }, { userId: user?.id.toString() })
  )

  const vouchers = useRequest(listVoucher, {
    onSuccess: (res) => {
      vouchers.mutate(
        res.filter((each: Voucher) => {
          if (each.isUsed) return false
          if (new Date(each.expireDate) <= new Date()) return false
          return true
        })
      )
    },
  })
  const giftCards = useRequest(listActivatedGiftCard, {
    onSuccess: (res) => {
      giftCards.mutate(res.filter((each: GiftCard) => each.remainingAmount > 0))
    },
  })

  const summary = useRequest(getShoppingCartSummary, {
    manual: true,
    debounceInterval: 1500,
    // throttleInterval: 1000,
  })

  const shoppingCart = useRequest(listShoppingCart, {
    manual: true,
    throttleInterval: 500,
    onSuccess: (res) => {
      if (res?.giftCardId) {
        setSelectedGiftCard(res?.giftCardId)
      }
    },
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
          className="mt-4"
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
                    }).then((res) => {
                      if (res) {
                        summary.refresh()
                      }
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
                    <FormattedMessage id="remove" />
                  </CustomButton>
                </Popconfirm>,
              ]}
            >
              <div className="flex gap-2">
                <img
                  className="w-28 h-28 rounded "
                  src={`${process.env.REACT_APP_PUBLIC_IMAGE}${item.project.imageUrl}`}
                  alt="project"
                />
                <div className="flex flex-col items-start">
                  <span className="font-semibold text-base">
                    {item.project.name} <span className="text-xs text-gray-500">({item.project.template?.name})</span>
                  </span>
                  <span className="font-light text-sm text-gray-500">({item.project.templateType?.name})</span>

                  {item.voucher && (
                    <div className="flex flex-col items-start">
                      <span>
                        <FormattedMessage id="voucher" />: {item.voucherId}
                      </span>
                      <CustomButton
                        className="btn-cancel"
                        onClick={() => {
                          updateCartItem(item.id, {
                            voucherId: null,
                          }).then(() => {
                            notification.info({ message: intl.formatMessage({ id: 'voucher_removed' }) })
                            shoppingCart.refresh()
                          })
                        }}
                      >
                        <FormattedMessage id="remove_voucher" />
                      </CustomButton>
                    </div>
                  )}
                </div>
              </div>
              <div className="ml-auto flex flex-col text-right">
                <span className="text-gray-500">{item.project.paperMaterial?.name}</span>
                <span className="text-gray-500">{item.project.paperSize?.size}</span>
                <span className="text-gray-500">{item.project.bindingType?.name}</span>
                <span className="text-gray-500">{item.project.coverType?.name}</span>
                <span className="text-gray-500">{item.project.frameMaterial?.name}</span>
                {/* <span className="text-gray-500">Photo printing</span>
                <span className="text-gray-500">20x30 large</span>
                <span className="text-gray-500">Premium Layflat Binding</span>
                <span className="text-gray-500">Deluxe Hardcover</span>
                <span className="text-gray-500">Glass Frame</span> */}
                <div className="border-t border-gray-300 flex flex-col">
                  {item.appliedDiscountTypes.length > 0 && (
                    <span className="text-gray-500">
                      <FormattedMessage id="applied_discounts" />:{' '}
                      <span className="">
                        {item.appliedDiscountTypes.map((each) => intl.formatMessage({ id: each })).join(', ')}
                      </span>
                    </span>
                  )}
                  {item.discountedPrice !== 0 && (
                    <div className="flex justify-end items-center gap-1">
                      <span className="text-xs line-through">
                        {currencyFormat(item.discountedPrice + item.price)} ₮
                      </span>
                      <span className="text-red-500">
                        (-{Math.round((1 - item.price / (item.discountedPrice + item.price)) * 100)}%)
                      </span>
                    </div>
                  )}
                  <span className="text-sm text-gray-700">{currencyFormat(item.price)} ₮</span>
                </div>
              </div>
            </List.Item>
          )}
        />
      </div>
      {shoppingCart.data?.cartItems.length > 0 && (
        <div className="flex flex-col lg:flex-row justify-between gap-4 mt-8">
          <div className="flex flex-col gap-2 w-full justify-evenly">
            <Checkbox checked={deliveryChecked} onChange={(e) => setDeliveryChecked(e.target.checked)}>
              <FormattedMessage id="delivery" />
            </Checkbox>
            {deliveryChecked && (
              <CartAddress
                shippingAddresses={shippingAddresses.data?.list}
                selected={selectedAddress}
                setSelected={setSelectedAddress}
              />
            )}
            <CartVoucher
              vouchers={vouchers.data}
              selected={selectedVoucher}
              setSelected={setSelectedVoucher}
              refresh={() => shoppingCart.refresh()}
            />
            <CartGiftCard
              giftCards={giftCards.data}
              selected={selectedGiftCard}
              setSelected={setSelectedGiftCard}
              refresh={() => shoppingCart.refresh()}
            />
          </div>
          <OrderSummary {...summary.data} onCreateOrder={() => onCreateOrder(deliveryChecked)} />
        </div>
      )}
    </div>
  )
}

export default MyCart
