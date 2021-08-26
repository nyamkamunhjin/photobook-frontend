import React, { FC } from 'react'
import { Loading } from 'components'
import { RootInterface } from 'interfaces'
import { FormattedMessage } from 'react-intl'
import WidthLimiter from 'layouts/main/components/width-limiter'
import { useQueryState } from 'react-router-use-location-state'
import OrderHistory from 'page-components/profile/order-history'
import MyProjects from 'page-components/profile/my-projects'
import MyInfo from 'page-components/profile/my-info'
import MyCart from 'page-components/profile/my-cart'
import PhotoTrade from 'page-components/profile/photo-trade'
import { useSelector } from 'react-redux'

type tabState = 'order_history' | 'my_projects' | 'my_cart' | 'my_info' | 'photo_trade'
const tabStates: tabState[] = ['order_history', 'my_projects', 'my_cart', 'photo_trade', 'my_info']

const Profile: FC = () => {
  const user = useSelector((state: RootInterface) => state.auth.user)
  const [tabState, setTabState] = useQueryState<tabState>('tab', 'order_history')

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
      case 'photo_trade':
        return <PhotoTrade />
      default:
        return <OrderHistory />
    }
  }

  return (
    <WidthLimiter className="min-h-screen bg-gray-100">
      {user ? (
        <div className="flex flex-col min-h-screen gap-2 p-2 items-center sm:flex-row sm:items-start">
          {/* side menu */}
          <div
            className="flex flex-col items-center gap-2 w-full sm:w-auto p-4 sm:h-full bg-white rounded-lg sm:sticky sm:top-2 shadow"
            style={{ minWidth: '16rem' }}
          >
            <div className="w-40 h-40">
              {user.avatarUrl ? (
                <img className="rounded-full w-full h-full object-cover" src={user.avatarUrl} alt="profile" />
              ) : (
                <div className="bg-green-500 rounded-full w-full h-full" />
              )}
            </div>

            <div className="flex flex-wrap gap-2 justify-center">
              {user.firstName && <span className="font-semibold text-lg">{user.firstName}</span>}
              {user.lastName && <span className="font-semibold text-lg">{user.lastName}</span>}
            </div>
            <div className="flex gap-2 w-full flex-col items-center">
              {tabStates.map((state) => (
                <button
                  key={state}
                  className={`${state === tabState ? 'btn-primary' : 'btn-text'} max-w-xs w-full`}
                  type="button"
                  onClick={() => setTabState(state)}
                >
                  <FormattedMessage id={state} />
                </button>
              ))}
            </div>
          </div>
          {/* content */}
          <div className="w-full min-h-screen px-4 bg-white rounded-lg shadow">{menuSwitch(tabState)}</div>
        </div>
      ) : (
        <Loading />
      )}
    </WidthLimiter>
  )
}

export default Profile
