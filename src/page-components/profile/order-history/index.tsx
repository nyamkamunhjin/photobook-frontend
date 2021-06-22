import { useAntdTable } from 'ahooks'
import { List, Table } from 'antd'
import { ColumnsType } from 'antd/es/table/interface'
import React from 'react'
import { FormattedMessage } from 'react-intl'
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
      title: () => <FormattedMessage id="date" />,
      dataIndex: 'createdAt',
      key: 'createdAt',
      align: 'center',
      render: (text) => <span>{new Date(text).toLocaleDateString()}</span>,
    },
    {
      title: () => <FormattedMessage id="order_id" />,
      dataIndex: 'id',
      key: 'id',
      align: 'center',
      render: (text) => <span>{text}</span>,
    },
    {
      title: () => <FormattedMessage id="price" />,
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      align: 'center',
      render: (text) => <span>{text} ₮</span>,
    },
    {
      title: () => <FormattedMessage id="shipping" />,
      dataIndex: 'address',
      key: 'address',
      align: 'center',
      render: (value) => value || <FormattedMessage id="no" />,
    },
    {
      title: () => <FormattedMessage id="payment_amount_vat_included" />,
      dataIndex: 'paymentAmount',
      key: 'paymentAmount',
      align: 'center',
      render: (value) => `${currencyFormat(value)} ₮`,
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
        scroll={{ x: '100%' }}
        columns={columnsOrder}
        expandable={{
          expandedRowRender: ({ orderItems }) => <OrderItemsInfo orderItems={orderItems} />,
        }}
        {...tableProps}
        dataSource={tableProps.dataSource.map((each) => {
          return { ...each, ...each.payment, ...each.address, key: each.id }
        })}
        loading={loading}
      />
    </div>
  )
}

export default OrderHistory

interface OrderItemProps {
  orderItems?: OrderItem[]
}

const OrderItemsInfo: React.FC<OrderItemProps> = ({ orderItems }) => {
  return (
    <>
      {orderItems && (
        <List
          itemLayout="horizontal"
          dataSource={orderItems}
          renderItem={(item) => (
            <List.Item className="flex flex-wrap gap-4 rounded p-2 hover:bg-gray-50" key={item.id}>
              <div className="flex">
                <img
                  className="w-28 h-28 rounded"
                  src={`${process.env.REACT_APP_PUBLIC_IMAGE}${item.project.imageUrl}`}
                  alt="project"
                />
                <span className="font-semibold text-base">
                  {item.project.name}{' '}
                  <span className="font-light text-sm text-gray-500">({item.project.templateType?.name})</span>
                </span>
              </div>
              <div className="ml-auto flex flex-col text-right">
                <span className="text-sm text-gray-700">{currencyFormat((item.amount || 0) * item.quantity)} ₮</span>
              </div>
            </List.Item>
          )}
        />
      )}
    </>
  )
}
