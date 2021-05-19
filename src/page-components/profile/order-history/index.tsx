import { Tag, Table } from 'antd'
import { ColumnsType } from 'antd/es/table/interface'
import React, { FC } from 'react'
import { FormattedMessage } from 'react-intl'

const OrderHistory: FC = () => {
  const columnsOrder: ColumnsType<any> = [
    {
      title: () => <FormattedMessage id="date" />,
      dataIndex: 'date',
      key: 'date',
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
      title: () => <FormattedMessage id="order_name" />,
      dataIndex: 'orderName',
      key: 'orderName',
      align: 'center',
      render: (text) => <span>{text}</span>,
    },
    {
      title: () => <FormattedMessage id="price" />,
      dataIndex: 'price',
      key: 'price',
      align: 'center',
      render: (text) => <span>{text} ₮</span>,
    },
    {
      title: () => <FormattedMessage id="status" />,
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      render: (text) => <Tag className="w-28 bg-green-300 text-white font-semibold">{text}</Tag>,
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
        dataSource={[
          {
            id: 1,
            date: new Date().toISOString(),
            orderName: 'test',
            price: 12345.5,
            status: 'unconfirmed',
          },
          {
            id: 1,
            date: new Date().toISOString(),
            orderName: 'test',
            price: 12345.5,
            status: 'confirmed',
          },
          {
            id: 1,
            date: new Date().toISOString(),
            orderName: 'test',
            price: 12345.5,
            status: 'checked',
          },
          {
            id: 1,
            date: new Date().toISOString(),
            orderName: 'test',
            price: 12345.5,
            status: 'delivered',
          },
          {
            id: 1,
            date: new Date().toISOString(),
            orderName: 'test',
            price: 12345.5,
            status: 'expired',
          },
          ...[...Array(Math.floor(Math.random() * 50) + 1)].map(() => ({
            id: 1,
            date: new Date().toISOString(),
            orderName: 'test',
            price: 12345.5,
            status: 'expired',
          })),
        ]}
        // pagination={false}
      />
    </div>
  )
}

export default OrderHistory
