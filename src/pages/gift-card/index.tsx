import React from 'react'
import { CustomButton, ProductWrapper, useRouter } from 'components'
import WidthLimiter from 'layouts/main/components/width-limiter'
import { useRequest } from 'ahooks'
import { buyGiftCard, listGiftCardType } from 'api'
import { FormattedMessage, useIntl } from 'react-intl'
import { currencyFormat } from 'utils'
import { notification } from 'antd'

const GiftCards: React.FC = () => {
  const giftCardTypes = useRequest(listGiftCardType)
  return (
    <ProductWrapper bannerImageUrl="1623985460961-thumb_8044457_cover_header.jpeg">
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
