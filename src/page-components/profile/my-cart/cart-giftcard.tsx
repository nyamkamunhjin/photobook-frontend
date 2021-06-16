import React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { notification, Select } from 'antd'
import { SelectValue } from 'antd/lib/select'
import { GiftCard } from 'interfaces'
import { addGiftCardToShoppingCart } from 'api'

interface Props {
  giftCards: GiftCard[]
  selected: SelectValue
  setSelected: React.Dispatch<React.SetStateAction<SelectValue>>
  refresh: () => void
}

const CartGiftCard: React.FC<Props> = ({ giftCards, selected, setSelected, refresh }) => {
  const intl = useIntl()
  return (
    <div className="flex flex-col gap-4 w-full">
      <span className="text-sm font-semibold">
        <FormattedMessage id="gift_card" />
      </span>
      <Select
        value={selected}
        onChange={(value) => {
          // console.log(value)
          setSelected(value)
          if (value) {
            addGiftCardToShoppingCart(value as string, 'attach')
              .then((res) => {
                if (res) {
                  refresh()
                  notification.success({ message: intl.formatMessage({ id: 'added_gift_card' }) })
                }
              })
              .catch(() => {
                setSelected(undefined)
              })
          }
        }}
        allowClear
        onClear={() => {
          addGiftCardToShoppingCart(selected as string, 'detach')
            .then((res) => {
              if (res) {
                refresh()
                notification.info({ message: intl.formatMessage({ id: 'removed_gift_card' }) })
              }
            })
            .catch(() => {
              setSelected(undefined)
            })
        }}
      >
        {giftCards?.map((item) => (
          <Select.Option key={item.id} value={item.id}>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">{item.id}</span>
              <span className="font-semibold text-xs">
                <FormattedMessage id="credits" />: {item.remainingAmount} / {item.discountAmount}
              </span>
            </div>
            <img className="w-10 h-10 object-contain" src={item.imageUrl || ''} alt="gift-card" />
          </Select.Option>
        ))}
      </Select>
    </div>
  )
}

export default CartGiftCard
