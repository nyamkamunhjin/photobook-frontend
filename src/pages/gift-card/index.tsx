import React, { useState } from 'react'
import { CustomButton, ProductWrapper, useRouter } from 'components'
import WidthLimiter from 'layouts/main/components/width-limiter'
import { useRequest } from 'ahooks'
import { activateGiftCard, buyGiftCard, listGiftCardType } from 'api'
import { FormattedMessage, useIntl } from 'react-intl'
import { currencyFormat } from 'utils'
import { Input, notification } from 'antd'

const GiftCards: React.FC = () => {
  const giftCardTypes = useRequest(listGiftCardType)
  return (
    <ProductWrapper bannerImageUrl="1623985460961-thumb_8044457_cover_header.jpeg">
      <WidthLimiter className="flex flex-col justify-center items-center gap-10">
        <div className="w-full p-4 flex flex-col justify-center items-center bg-blue-50 h-80">
          <p className="text-xl font-semibold">
            <FormattedMessage id="activate_gift_card" />
          </p>
          <ActivateGiftCard />
        </div>
        <div className="flex flex-col justify-center items-center">
          <p className="text-xl font-semibold">
            <FormattedMessage id="buy_gift_cards" />
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 mb-96">
            {giftCardTypes.data && giftCardTypes.data.map((each: any) => <GiftCard {...each} />)}
          </div>
        </div>
      </WidthLimiter>
    </ProductWrapper>
  )
}

export default GiftCards

interface GiftCard {
  id: number
  name: string
  description: string
  imageUrl: string
  tempUrl: string
  discountAmount: number
}

const GiftCard: React.FC<GiftCard> = ({ id, imageUrl, name, description, discountAmount }) => {
  const intl = useIntl()
  const router = useRouter()
  return (
    <div
      className="flex flex-grow flex-col w-full bg-gray-50 rounded-lg shadow-lg transform hover:-translate-y-1 hover:shadow-2xl transition-all ease-out"
      style={{ maxWidth: '384px' }}
    >
      <img
        className="h-32 object-cover rounded-t-lg"
        src={`${process.env.REACT_APP_PUBLIC_IMAGE}${imageUrl}`}
        alt="gift-card"
      />
      <div className="flex flex-col p-2">
        <span className="text-base font-bold">{name}</span>
        <span> {description}</span>
        <span className="text-base">{currencyFormat(discountAmount)} ₮</span>
        <CustomButton
          className="btn-primary self-end"
          onClick={() => {
            buyGiftCard(id).then((res) => {
              notification.success({ message: intl.formatMessage({ id: 'success!' }) })
              router.push('/profile?tab=my_info')
            })
          }}
        >
          <FormattedMessage id="buy" />
        </CustomButton>
      </div>
    </div>
  )
}

const ActivateGiftCard: React.FC = () => {
  const intl = useIntl()
  const [input, setInput] = useState<string>('')
  return (
    <div className="flex gap-2 ">
      <Input value={input} onChange={(e) => setInput(e.target.value)} />
      <CustomButton
        className="btn-primary"
        onClick={() => {
          activateGiftCard(input).then((res) => {
            if (res) {
              notification.success({ message: intl.formatMessage({ id: 'success!' }) })
            } else {
              notification.warning({ message: intl.formatMessage({ id: 'wrong_gift_card_code' }) })
            }
          })
        }}
      >
        <FormattedMessage id="activate" />
      </CustomButton>
    </div>
  )
}
