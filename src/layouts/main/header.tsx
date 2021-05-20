import { RootInterface } from 'interfaces'
import React, { FC } from 'react'
import { FormattedMessage } from 'react-intl'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { useRouter } from 'components'
import { UserInfo } from './components'
import HeaderMenu from './components/HeaderMenu'

const Topbar: FC = () => {
  const user = useSelector((state: RootInterface) => state.auth.user)
  const router = useRouter()
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
            {user && <UserInfo avatarUrl={user.avatarUrl} />}
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
