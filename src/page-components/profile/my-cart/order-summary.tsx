import React from 'react'
import { FormattedMessage } from 'react-intl'
import { CustomButton } from 'components'
import { currencyFormat } from 'utils'

interface OrderSummaryProps {
  price: number
  vatFee: number
  discountedPrice: number
  totalPrice: number
  daysToDeliver: number
  shippingFee: number
  giftCardUpdate: {
    update: boolean
    usedAmount: number
  }
  onCreateOrder: (shipping: boolean) => void
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  price,
  vatFee,
  discountedPrice,
  totalPrice,
  daysToDeliver,
  shippingFee,
  giftCardUpdate,
  onCreateOrder,
}) => {
  const actualPrice = price + discountedPrice
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
        <span className="font-light">{currencyFormat(actualPrice)} ₮</span>
      </div>
      {discountedPrice !== 0 && (
        <div className="flex justify-between">
          <span className="text-sm font-light text-gray-700">
            <FormattedMessage id="total_discount" />
          </span>
          <span className="font-light text-red-500">-{currencyFormat(discountedPrice)} ₮</span>
        </div>
      )}

      <hr className="border-t border-solid border-gray-300" />
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
      {giftCardUpdate?.update && (
        <>
          <div className="flex justify-between">
            <span className="text-sm font-light text-gray-700">
              <FormattedMessage id="price" />
            </span>
            <span className="font-light">{currencyFormat(giftCardUpdate.usedAmount + totalPrice)} ₮</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-light text-gray-700">
              <FormattedMessage id="gift_card_discount" />
            </span>
            <span className="font-light text-red-500">{currencyFormat(-giftCardUpdate.usedAmount)} ₮</span>
          </div>
        </>
      )}
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

export default OrderSummary
