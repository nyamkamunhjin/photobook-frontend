import React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import ActivateGiftCard from 'pages/gift-card/components/activate-gift-card'
import { CustomButton } from 'components'
import { notification } from 'antd'
import { addGiftCardToShoppingCart } from 'api'
import { GiftCard } from 'interfaces'
import { HiOutlineClipboardCopy } from 'react-icons/hi'
import { currencyFormat } from 'utils'

interface Props {
  giftCard?: GiftCard
  setGiftCard: React.Dispatch<React.SetStateAction<GiftCard | undefined>>
  refresh: () => void
}

const CartGiftCard: React.FC<Props> = ({ giftCard, setGiftCard, refresh }) => {
  const intl = useIntl()
  return (
    <div className="flex flex-col gap-4 w-full">
      {giftCard && (
        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold">
            <FormattedMessage id="gift_card" />
          </span>
          <div className="flex gap-2 items-center">
            <div className="flex gap-2 w-full px-2">
              <img
                className="w-20 h-20 object-contain"
                // eslint-disable-next-line react/jsx-curly-brace-presence
                src={`${process.env.REACT_APP_PUBLIC_IMAGE}${giftCard.imageUrl}`}
                alt="template"
              />
              <div className="flex flex-col items-start">
                <span className="text-sm font-semibold">{giftCard.name}</span>
                <span className="">
                  {currencyFormat(giftCard.remainingAmount)} ₮ / {currencyFormat(giftCard.discountAmount)} ₮
                </span>
              </div>
            </div>
            <CustomButton
              className="btn-cancel ml-auto"
              onClick={() => {
                addGiftCardToShoppingCart(giftCard.code, 'detach').then((result) => {
                  if (result) {
                    notification.info({ message: intl.formatMessage({ id: 'removed_gift_card' }) })
                    setGiftCard(undefined)
                  } else {
                    notification.warning({ message: intl.formatMessage({ id: 'wrong_gift_card_code' }) })
                  }
                  if (refresh) refresh()
                })
              }}
            >
              <FormattedMessage id="remove" />
            </CustomButton>
          </div>
        </div>
      )}
      <div className="flex flex-col gap-2">
        <span className="text-sm font-semibold">
          <FormattedMessage id="activate_gift_card" />
        </span>
        <ActivateGiftCard refresh={refresh} />
      </div>
    </div>
  )
}

export default CartGiftCard
