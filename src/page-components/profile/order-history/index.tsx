import { useAntdTable } from 'ahooks'
import { Table } from 'antd'
import { ColumnsType } from 'antd/es/table/interface'
import React from 'react'
import { FormattedMessage } from 'react-intl'
import { listOrder } from 'api'

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
      title: () => <FormattedMessage id="status" />,
      dataIndex: 'status',
      key: 'status',
      align: 'center',
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
        {...tableProps}
        dataSource={tableProps.dataSource.map((each) => {
          return { ...each, ...each.payment, key: each.id }
        })}
        loading={loading}
      />
    </div>
  )
}

export default OrderHistory
