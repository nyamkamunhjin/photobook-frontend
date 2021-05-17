/* eslint-disable camelcase */
import { Loading, useRouter } from 'components'
import { RootInterface, UserInterface } from 'interfaces'
import React from 'react'
import { useSelector } from 'react-redux'
import { RouteComponentProps, withRouter } from 'react-router'
import { Redirect } from 'react-router-dom'
import MainLayout from './main'

const Layout: React.FC<RouteComponentProps> = ({ children, location }) => {
  const { isAuthenticated, loading } = useSelector<RootInterface, UserInterface>((state) => state.auth)
  // const router = useRouter()
  // const { pathname } = location

  const GetLayout = () => {
    // if (pathname === '/') {
    //   isAuthLayout = false
    //   return PublicLayout
    // }
    // if (/^\/auth(?=\/|$)/i.test(pathname)) {
    // return AuthLayout
    // }
    // if (/^\/photobook(?=\/|$)/i.test(pathname)) {
    //   return PublicLayout
    // }
    // if (/^\/public(?=\/|$)/i.test(pathname)) {
    //   isAuthLayout = false
    //   isPublic = true
    //   return PublicLayout
    // }
    return MainLayout
  }
  const Container = GetLayout()
  const BootstrappedLayout = () => {
    // if (isPublic) return <Container>{children}</Container>
    if (loading && !isAuthenticated) {
      return (
        <div className="w-full h-full">
          <Loading />
        </div>
      )
    }
    // if (!isAuthLayout && !isAuthenticated) {
    //   return <Redirect to="/auth/signin" />
    // }
    // if (isAuthenticated) {
    //   return <Redirect to="/" />
    // }
    return <Container>{children}</Container>
  }

  return <>{BootstrappedLayout()}</>
}

export default withRouter(Layout)
