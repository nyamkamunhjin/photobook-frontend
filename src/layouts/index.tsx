/* eslint-disable camelcase */
import { Loading } from 'components'
import { RootInterface, UserInterface } from 'interfaces'
import React from 'react'
import { useSelector } from 'react-redux'
import { RouteComponentProps, withRouter } from 'react-router'
import MainLayout from './main'
import PublicLayout from './public'

let isPublic = false

const Layout: React.FC<RouteComponentProps> = ({ children }) => {
  const { isAuthenticated, loading } = useSelector<RootInterface, UserInterface>((state) => state.auth)
  const { pathname } = window.location
  const GetLayout = () => {
    if (/^\/editor(?=\/|$)/i.test(pathname)) {
      isPublic = true
      return PublicLayout
    }
    return MainLayout
  }
  const Container = GetLayout()
  const BootstrappedLayout = () => {
    if (isPublic) return <Container>{children}</Container>
    if (loading && !isAuthenticated) {
      return (
        <div className="w-full h-full">
          <Loading />
        </div>
      )
    }
    return <Container>{children}</Container>
  }

  return <>{BootstrappedLayout()}</>
}

export default withRouter(Layout)
