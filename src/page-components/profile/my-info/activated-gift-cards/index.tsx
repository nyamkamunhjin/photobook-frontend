import { useRequest } from 'ahooks'
import { List } from 'antd'
import React, { FC } from 'react'
import { FormattedMessage } from 'react-intl'
import { listActivatedGiftCard } from 'api'
import { GiftCard } from 'interfaces'
import { currencyFormat } from 'utils'

interface Props {
  test?: string
}

const ActivatedGiftCards: FC<Props> = () => {
  const giftCards = useRequest(
    ({ current, pageSize }, pageNumber) => listActivatedGiftCard({ current, pageSize }, {}, pageNumber),
    {
      paginated: true,
    }
  )
  return (
    <div>
      <span className="font-semibold text-xl">
        <FormattedMessage id="activated_gift_card" />
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
              </div>
            </List.Item>
          )
        }}
      />
    </div>
  )
}

export default ActivatedGiftCards
