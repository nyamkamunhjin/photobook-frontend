import { useRequest } from 'ahooks'
import { List } from 'antd'
import React, { FC } from 'react'
import { FormattedMessage } from 'react-intl'
import { listVoucher } from '../../../../api'

interface Props {
  test?: string
}

const VoucherList: FC<Props> = (props) => {
  const shippingAddresses = useRequest(
    ({ current, pageSize }, pageNumber) => listVoucher({ current, pageSize }, {}, pageNumber),
    {
      // manual: true,
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
        // itemLayout="vertical"
        dataSource={shippingAddresses.data?.list || []}
        loading={shippingAddresses.loading}
        pagination={{
          ...shippingAddresses.pagination,
          onChange: shippingAddresses.pagination.changeCurrent,
        }}
        renderItem={(item, index) => (
          <List.Item className="rounded p-2 hover:bg-gray-50" key={item.id}>
            <List.Item.Meta
              title={
                <span className="font-semibold text-lg">
                  {index + 1} <span className="text-sm text-gray-500">{item.address}</span>
                </span>
              }
              description={
                <div className="flex flex-col gap-2">
                  <span className="font-semibold text-xs">
                    <FormattedMessage id="delivery_first_name" />: {item.firstName}
                  </span>
                  <span className="font-semibold text-xs">
                    <FormattedMessage id="delivery_last_name" />: {item.lastName}
                  </span>
                  <span className="font-semibold text-xs">
                    <FormattedMessage id="delivery_company_name" />: {item.companyName}
                  </span>
                  <span>{item.description}</span>
                </div>
              }
            />
          </List.Item>
        )}
      />
    </div>
  )
}

export default VoucherList
