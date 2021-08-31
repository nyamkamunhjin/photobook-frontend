import React from 'react'
import { FormattedMessage } from 'react-intl'
import { Select } from 'antd'
import { SelectValue } from 'antd/lib/select'
import { Voucher } from 'interfaces'
import { addVoucherToCartItem } from 'api'

interface Props {
  vouchers: Voucher[]
  selected: SelectValue
  setSelected: React.Dispatch<React.SetStateAction<SelectValue>>
  refresh: () => void
  setErrorAlert?: (message: string, description: string) => void
}

const CartVoucher: React.FC<Props> = ({ vouchers, selected, setSelected, refresh, setErrorAlert }) => {
  return (
    <div className="flex flex-col gap-4 w-full">
      <span className="text-sm font-semibold">
        <FormattedMessage id="voucher" />
      </span>
      <Select
        value={selected}
        onChange={(value) => {
          console.log(value)
          setSelected(value)
          if (value) {
            addVoucherToCartItem(value as string)
              .then((res) => {
                if (res) refresh()
              })
              .catch((err) => {
                setSelected(undefined)
                console.log({ err })
                if (err?.response?.data?.message && setErrorAlert) {
                  if (err?.response?.data?.message === 'no cart item.') {
                    setErrorAlert(err?.response?.data?.message, 'no_cart_item_description')
                  }
                }
              })
          }
        }}
        allowClear
      >
        {vouchers?.map((item) => (
          <Select.Option key={item.id} value={item.id}>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">{item.template?.name}</span>
              <span className="font-semibold text-xs">
                <FormattedMessage id="expire_date" />: {new Date(item.expireDate).toLocaleDateString()}
              </span>
              <span className="font-semibold text-xs">
                <FormattedMessage id="discount_percent" />: {item.discountPercent}%
              </span>
            </div>
          </Select.Option>
        ))}
      </Select>
    </div>
  )
}

export default CartVoucher
