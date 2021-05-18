/* eslint-disable camelcase */
import { Loading } from 'components'
import { RootInterface, UserInterface } from 'interfaces'
import React from 'react'
import { useSelector } from 'react-redux'
import { RouteComponentProps, withRouter } from 'react-router'
import MainLayout from './main'

const Layout: React.FC<RouteComponentProps> = ({ children }) => {
  const { isAuthenticated, loading } = useSelector<RootInterface, UserInterface>((state) => state.auth)

  const GetLayout = () => {
    return MainLayout
  }
  const Container = GetLayout()
  const BootstrappedLayout = () => {
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
