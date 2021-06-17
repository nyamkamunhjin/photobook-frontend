import React from 'react'
import { CustomButton, ProductWrapper } from 'components'
import WidthLimiter from 'layouts/main/components/width-limiter'
import { useRequest } from 'ahooks'
import { listGiftCardType } from 'api'
import { FormattedMessage } from 'react-intl'
import { currencyFormat } from 'utils'

const GiftCards: React.FC = () => {
  const giftCardTypes = useRequest(listGiftCardType)
  return (
    <ProductWrapper bannerImageUrl="162392w-9674106-thumb_8044457_cover_header.jpeg">
      <WidthLimiter className="flex justify-center">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
          {giftCardTypes.data && giftCardTypes.data.map((each: any) => <GiftCard {...each} />)}
        </div>
      </WidthLimiter>
    </ProductWrapper>
  )
}

export default GiftCards

interface GiftCard {
  name: string
  description: string
  imageUrl: string
  tempUrl: string
  discountAmount: number
}

const GiftCard: React.FC<GiftCard> = ({ imageUrl, name, description, discountAmount }) => {
  return (
    <div
      className="flex flex-grow flex-col w-full bg-gray-50 rounded-lg shadow-lg transform hover:-translate-y-1 hover:shadow-2xl transition-all"
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
        <CustomButton className="btn-primary self-end">
          <FormattedMessage id="buy" />
        </CustomButton>
      </div>
    </div>
  )
}
