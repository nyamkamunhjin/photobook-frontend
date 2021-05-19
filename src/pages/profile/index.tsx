import { useRequest } from 'ahooks'
import React, { FC, useState } from 'react'
import { getCurrentUser } from 'api'
import { Loading } from 'components'
import { User } from 'interfaces'
import { FormattedMessage } from 'react-intl'
import WidthLimiter from 'layouts/main/components/width-limiter'
import { useQueryState } from 'react-router-use-location-state'
import OrderHistory from 'page-components/profile/order-history'
import MyProjects from '../../page-components/profile/my-projects'
import MyInfo from '../../page-components/profile/my-info'
import MyCart from '../../page-components/profile/my-cart'

type tabState = 'order_history' | 'my_projects' | 'my_cart' | 'my_info'
const tabStates: tabState[] = ['order_history', 'my_projects', 'my_cart', 'my_info']

const Profile: FC = () => {
  const [user, setUser] = useState<User>()
  const [tabState, setTabState] = useQueryState<tabState>('tab', 'order_history')
  useRequest(getCurrentUser, {
    onSuccess: (res: any) => {
      setUser(res.data.user)
    },
  })

  const menuSwitch: (state: tabState) => any = (state) => {
    switch (state) {
      case 'order_history':
        return <OrderHistory />
      case 'my_projects':
        return <MyProjects />
      case 'my_info':
        return <MyInfo />
      case 'my_cart':
        return <MyCart />
      default:
        return <OrderHistory />
    }
  }

  return (
    <WidthLimiter className="min-h-screen bg-gray-100 w-full">
      {user ? (
        <div className="flex flex-col gap-2 items-center sm:flex-row sm:items-start p-2">
          {/* side menu */}
          <div className="flex flex-col items-center gap-2 w-full sm:w-auto p-4 sm:h-full bg-white rounded-lg">
            <div className="w-56 h-56">
              <img className="rounded-full" src={user.avatarUrl || undefined} alt="profile" />
            </div>

            <div className="flex flex-wrap gap-2">
              {user.firstName && <span className="font-semibold text-xl">{user.firstName}</span>}
              {user.lastName && <span className="font-semibold text-xl">{user.lastName}</span>}
            </div>
            <div className="flex gap-2 w-full flex-col items-center">
              {tabStates.map((state) => (
                <button
                  key={state}
                  className={`${state === tabState ? 'btn-accept' : 'btn-primary'} max-w-xs w-full`}
                  type="button"
                  onClick={() => setTabState(state)}
                >
                  <FormattedMessage id={state} />
                </button>
              ))}
            </div>
          </div>
          <div className="w-full px-4 bg-white rounded-lg">{menuSwitch(tabState)}</div>
        </div>
      ) : (
        <Loading />
      )}
    </WidthLimiter>
  )
}

export default Profile
