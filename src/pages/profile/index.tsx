import { useRequest } from 'ahooks'
import { Table, Tag } from 'antd'
import React, { FC, useState } from 'react'
import { getCurrentUser } from 'api'
import { Loading } from 'components'
import { User } from 'interfaces'
import { FormattedMessage } from 'react-intl'
import { ColumnsType } from 'antd/lib/table'
import WidthLimiter from 'layouts/main/components/width-limiter'
import { useQueryState } from 'react-router-use-location-state'

type tabState = 'order_history' | 'my_projects' | 'my_cart' | 'my_info'

const Profile: FC = () => {
  const [user, setUser] = useState<User>()
  const [tabState, setTabState] = useQueryState<tabState>('tab', 'order_history')
  useRequest(getCurrentUser, {
    onSuccess: (res: any) => {
      // console.log({ res })
      setUser(res.data.user)
    },
  })

  return (
    <WidthLimiter className="min-h-screen bg-blue-200">
      {user ? (
        <div className="flex flex-col gap-2 items-center sm:flex-row sm:items-start p-2">
          <div className="flex flex-col items-center gap-2 bg-yellow-300 p-2 sm:h-full">
            {user.avatarUrl && (
              <div className="w-56 h-56">
                <img className="rounded-full" src={user.avatarUrl} alt="profile" />
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              {user.firstName && <span className="font-semibold text-xl">{user.firstName}</span>}
              {user.lastName && <span className="font-semibold text-xl">{user.lastName}</span>}
            </div>
            <div className="flex gap-2 sm:flex-col sm:items-center">
              <button type="button" onClick={() => setTabState('order_history')}>
                <FormattedMessage id="order_history" />
              </button>
              <button type="button" onClick={() => setTabState('my_projects')}>
                <FormattedMessage id="my_projects" />
              </button>
              <button type="button" onClick={() => setTabState('my_cart')}>
                <FormattedMessage id="my_cart" />
              </button>
              <button type="button" onClick={() => setTabState('my_info')}>
                <FormattedMessage id="my_info" />
              </button>
            </div>
          </div>
          <div className="w-full bg-green-300 px-4">{tabState === 'order_history' && <OrderHistory />}</div>
        </div>
      ) : (
        <Loading />
      )}
    </WidthLimiter>
  )
}

export default Profile

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
      render: (text) => <Tag className="w-28 bg-green-400 text-white font-semibold">{text}</Tag>,
    },
  ]

  return (
    <div className="p-2">
      <span className="font-semibold text-xl">
        <FormattedMessage id="order_history" />
      </span>
      <Table
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
        pagination={false}
      />
    </div>
  )
}
