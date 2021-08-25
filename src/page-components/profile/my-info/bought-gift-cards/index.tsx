import { useRequest } from 'ahooks'
import { List, notification } from 'antd'
import React, { FC } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { listBoughtGiftCard } from 'api'
import { GiftCard } from 'interfaces'
import { currencyFormat } from 'utils'
import { CustomButton } from 'components'
import { RiFileCopyLine } from 'react-icons/ri'

interface Props {
  test?: string
}

const BoughtGiftCards: FC<Props> = () => {
  const intl = useIntl()
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

      <List
        className="mt-4"
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
                <span className="flex gap-2 ml-auto self-center">
                  <FormattedMessage id="code" />:{' '}
                  <button className="cursor-pointer filter blur-sm focus:blur-0 outline-none" type="button">
                    {item.code}
                  </button>
                  <CustomButton
                    className="text-base text-gray-500 hover:text-gray-800 focus:outline-none"
                    onClick={() => {
                      navigator.clipboard.writeText(item.code)
                      notification.success({ message: intl.formatMessage({ id: 'copied_to_clipboard' }) })
                    }}
                  >
                    <RiFileCopyLine />
                  </CustomButton>
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
