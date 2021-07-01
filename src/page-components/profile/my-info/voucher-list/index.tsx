import { useRequest } from 'ahooks'
import { List } from 'antd'
import React, { FC } from 'react'
import { FormattedMessage } from 'react-intl'
import { listVoucher } from 'api'
import { Voucher } from 'interfaces'

interface Props {
  test?: string
}

const VoucherList: FC<Props> = () => {
  const vouchers = useRequest(
    ({ current, pageSize }, pageNumber) => listVoucher({ current, pageSize }, {}, pageNumber),
    {
      paginated: true,
    }
  )
  return (
    <div>
      <span className="font-semibold text-xl">
        <FormattedMessage id="vouchers" />
      </span>
      <hr className="my-1" />

      <List
        className="mt-4"
        dataSource={vouchers.data?.list || []}
        loading={vouchers.loading}
        pagination={{
          ...vouchers.pagination,
          onChange: vouchers.pagination.changeCurrent,
        }}
        renderItem={(item: Voucher) => {
          const isExpired = new Date(item.expireDate) < new Date()
          // eslint-disable-next-line no-nested-ternary
          const status = item.isUsed ? 'used' : isExpired ? 'expired' : 'not_used'
          // eslint-disable-next-line no-nested-ternary
          const color = status === 'used' ? 'bg-gray-300' : status === 'expired' ? 'bg-red-300' : 'bg-green-300'

          return (
            <List.Item className="rounded p-2 hover:bg-gray-50" key={item.id}>
              <div className="flex gap-2 w-full px-2">
                <img
                  className="w-20 h-20"
                  // eslint-disable-next-line react/jsx-curly-brace-presence
                  src={`${process.env.REACT_APP_PUBLIC_IMAGE}${item.template?.imageUrl || ''}`}
                  alt="template"
                />
                <div className="flex flex-col items-start justify-between">
                  <span className="text-sm font-semibold">{item.template?.name}</span>
                  <span className="">
                    {item.discountPercent}% <FormattedMessage id="discount" />
                  </span>
                  <span className="text-gray-500">{new Date(item.expireDate).toLocaleString()}</span>
                </div>
                <span className={`text-xs font-semibold py-1 px-3 rounded-sm ${color} text-white ml-auto self-center`}>
                  <FormattedMessage id={status} />
                </span>
              </div>
            </List.Item>
          )
        }}
      />
    </div>
  )
}

export default VoucherList
