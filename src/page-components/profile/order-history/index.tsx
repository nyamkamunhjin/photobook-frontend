import { useAntdTable } from 'ahooks'
import { List, Table, Tooltip } from 'antd'
import { ColumnsType } from 'antd/es/table/interface'
import React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { OrderItem } from 'interfaces'
import { listOrder } from 'api'
import { currencyFormat } from 'utils'
import OrderStatus from './order-status'

const OrderHistory: React.FC = () => {
  const { tableProps, loading } = useAntdTable(listOrder, {
    defaultPageSize: 10,
  })

  const columnsOrder: ColumnsType<any> = [
    {
      title: () => <FormattedMessage id="order_id" />,
      dataIndex: 'id',
      key: 'id',
      align: 'center',
      width: 50,
      render: (text) => <span>{text}</span>,
    },
    {
      title: () => <FormattedMessage id="date" />,
      dataIndex: 'createdAt',
      key: 'createdAt',
      align: 'center',
      render: (text) => <span>{new Date(text).toLocaleDateString()}</span>,
    },
    {
      title: () => <FormattedMessage id="price" />,
      dataIndex: 'amount',
      key: 'amount',
      align: 'center',
      render: (value) => <span>{currencyFormat(value)} ₮</span>,
    },
    {
      title: () => <FormattedMessage id="payment_amount_vat_included" />,
      dataIndex: 'paymentAmount',
      key: 'paymentAmount',
      align: 'center',
      render: (value) => `${currencyFormat(value)} ₮`,
    },
    {
      title: () => <FormattedMessage id="shipping" />,
      dataIndex: 'address',
      key: 'address',
      align: 'center',
      render: (value) =>
        value ? (
          <Tooltip placement="top" title={value}>
            <p className="truncate m-0">{value}</p>
          </Tooltip>
        ) : (
          '-'
        ),
    },
    {
      title: () => <FormattedMessage id="status" />,
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      render: (value) => <OrderStatus status={value} />,
    },
  ]

  return (
    <div className="p-2">
      <span className="font-semibold text-xl">
        <FormattedMessage id="order_history" />
      </span>
      <Table
        className="mt-4"
        scroll={{ x: 400 }}
        columns={columnsOrder}
        expandable={{
          expandedRowRender: ({ orderItems, giftCardDiscountAmount }) => (
            <OrderItemsInfo orderItems={orderItems} giftCardDiscountAmount={giftCardDiscountAmount} />
          ),
        }}
        {...tableProps}
        dataSource={tableProps.dataSource.map((each) => {
          return { ...each, ...each.payment, ...each.address, key: each.id, id: each.id }
        })}
        loading={loading}
      />
    </div>
  )
}

export default OrderHistory

interface OrderItemProps {
  orderItems?: OrderItem[]
  giftCardDiscountAmount: number
}

const OrderItemsInfo: React.FC<OrderItemProps> = ({ orderItems, giftCardDiscountAmount }) => {
  const intl = useIntl()

  return (
    <>
      {orderItems && (
        <List
          itemLayout="horizontal"
          dataSource={orderItems}
          footer={
            <div className="flex justify-end">
              {giftCardDiscountAmount > 0 && (
                <span>
                  <span className="font-bold">
                    <FormattedMessage id="gift_card_discount" />
                  </span>
                  : <span className="font-bold text-red-500">-{currencyFormat(giftCardDiscountAmount)} ₮</span>
                </span>
              )}
            </div>
          }
          renderItem={(item) => (
            <List.Item className="flex flex-wrap gap-4 rounded p-2 hover:bg-gray-50" key={item.id}>
              <div className="flex gap-2">
                <img
                  className="w-28 h-28 rounded"
                  src={`${process.env.REACT_APP_PUBLIC_IMAGE}${item.project.imageUrl}`}
                  alt="project"
                />
                <div className="flex flex-col gap-2">
                  <span className="font-semibold text-base">
                    {item.project.name}{' '}
                    <span className="font-light text-sm text-gray-500">({item.project.templateType?.name})</span>
                  </span>
                  <span className="">
                    <FormattedMessage id="quantity" />: <span className="font-semibold">{item.quantity}</span>
                  </span>
                </div>
              </div>
              <div className="border-t border-gray-500 flex flex-col">
                {item.appliedDiscountTypes.length > 0 && (
                  <span className="text-gray-500">
                    <FormattedMessage id="applied_discounts" />:{' '}
                    <span className="">
                      {item.appliedDiscountTypes.map((each) => intl.formatMessage({ id: each })).join(', ')}
                    </span>
                  </span>
                )}
                {item.discountedPrice !== 0 && (
                  <div className="flex justify-end items-center gap-1">
                    <span className="text-xs line-through">{currencyFormat(item.discountedPrice + item.price)} ₮</span>
                    <span className="font-bold text-red-500">
                      (-{Math.round((1 - item.price / (item.discountedPrice + item.price)) * 100)}%)
                    </span>
                  </div>
                )}
                <span className="text-sm text-gray-700 text-right">{currencyFormat(item.price)} ₮</span>
              </div>
            </List.Item>
          )}
        />
      )}
    </>
  )
}
