import { RootInterface } from 'interfaces'
import { Badge } from 'antd'
import React, { useEffect } from 'react'
import { FormattedMessage } from 'react-intl'
import { useSelector } from 'react-redux'
import { HiOutlineShoppingCart } from 'react-icons/hi'
import { listShoppingCart } from 'api'
import { Link } from 'react-router-dom'
import { CustomButton, useRouter } from 'components'
import { useRequest } from 'ahooks'
import { LanguageSwitch, UserInfo } from './components'
import HeaderMenu from './components/HeaderMenu'

const Topbar: React.FC = () => {
  const user = useSelector((state: RootInterface) => state.auth.user)
  const router = useRouter()
  const shoppingCart = useRequest(listShoppingCart, {
    throttleInterval: 500,
    manual: true,
  })

  useEffect(() => {
    if (user) {
      shoppingCart.run()
    }
  }, [user, router])

  return (
    <header className="shadow-md z-10 bg-white">
      <div className="px-4 mx-auto w-full max-w-7xl">
        <div className="flex  items-center p-2">
          <Link className="text-2xl font-bold text-black" to="/">
            LOGO
          </Link>
          <div className="ml-auto space-x-2">
            {!user && (
              <>
                <button type="button" className="btn-text" onClick={() => router.push('/auth/signin')}>
                  <FormattedMessage id="sign-in" />
                </button>
                <button type="button" className="btn-warning" onClick={() => router.push('/auth/signup')}>
                  <FormattedMessage id="sign-up" />
                </button>
              </>
            )}
            {user && (
              <div className="flex items-center gap-3">
                <LanguageSwitch />
                <Badge count={shoppingCart.data?.cartItems?.length} size="small">
                  <CustomButton
                    className="text-xl focus:outline-none"
                    onClick={() => router.push('/profile?tab=my_cart')}
                  >
                    <HiOutlineShoppingCart />
                  </CustomButton>
                </Badge>
                <UserInfo avatarUrl={user.avatarUrl} />
              </div>
            )}
          </div>
        </div>
        <div className="mx-auto">
          <HeaderMenu />
        </div>
      </div>
    </header>
  )
}

export default Topbar
