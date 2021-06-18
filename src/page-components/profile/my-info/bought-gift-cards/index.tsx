import { useRequest } from 'ahooks'
import { List } from 'antd'
import React, { FC } from 'react'
import { FormattedMessage } from 'react-intl'
import { listBoughtGiftCard } from 'api'
import { GiftCard, Voucher } from 'interfaces'
import { currencyFormat } from '../../../../utils'

interface Props {
  test?: string
}

const BoughtGiftCards: FC<Props> = () => {
  const giftCards = useRequest(
    ({ current, pageSize }, pageNumber) => listBoughtGiftCard({ current, pageSize }, {}, pageNumber),
    {
      paginated: true,
    }
  )
  return (
    <div>
      <span className="font-semibold text-xl">
        <FormattedMessage id="bought_gift_card" />
      </span>
      <hr className="my-1" />

      <List
        dataSource={giftCards.data?.list || []}
        loading={giftCards.loading}
        pagination={{
          ...giftCards.pagination,
          onChange: giftCards.pagination.changeCurrent,
        }}
        renderItem={(item: GiftCard) => {
          return (
            <List.Item className="rounded p-2 hover:bg-gray-50" key={item.id}>
              <div className="flex gap-2 w-full px-2">
                <img
                  className="w-20 h-20 object-contain"
                  // eslint-disable-next-line react/jsx-curly-brace-presence
                  src={item?.imageUrl || ''}
                  alt="template"
                />
                <div className="flex flex-col items-start">
                  <span className="text-sm font-semibold">{item.name}</span>
                  <span className="">
                    {currencyFormat(item.remainingAmount)} ₮ / {currencyFormat(item.discountAmount)} ₮
                  </span>
                </div>
                <span className="ml-auto self-center">
                  <FormattedMessage id="code" />: <span className="filter blur-sm hover:blur-0">{item.code}</span>
                </span>
              </div>
            </List.Item>
          )
        }}
      />
    </div>
  )
}

export default BoughtGiftCards
