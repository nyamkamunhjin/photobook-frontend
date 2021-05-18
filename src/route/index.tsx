/* eslint-disable import/no-extraneous-dependencies */
import React, { useEffect } from 'react'
import { Route, Switch } from 'react-router-dom'
import { ConnectedRouter } from 'connected-react-router'
import NotFound from 'pages/not-found'
import { History } from 'history'
import { loadUser } from 'redux/actions/auth'
import Layout from 'layouts'
import Loadable from 'react-loadable'
import { Loading } from 'components'
import { RouteInterface } from 'interfaces'
import { NotAuthorized } from 'pages/errors'
import { useDispatch } from 'react-redux'

const LoadableLoader = (loader: any) =>
  Loadable({
    loader,
    delay: false,
    loading: () => <Loading fill={false} />,
  })
const routes: RouteInterface[] = [
  {
    path: '/profile',
    component: LoadableLoader(() => import('pages/profile')),
    exact: true,
  },
  {
    path: '/product/photobook/template/:id',
    component: LoadableLoader(() => import('pages/product/photobook/template')),
    exact: true,
  },
  {
    path: '/product/canvas/template/:id',
    component: LoadableLoader(() => import('pages/product/canvas/template')),
    exact: true,
  },
  {
    path: '/product/frame/template/:id',
    component: LoadableLoader(() => import('pages/product/frame/template')),
    exact: true,
  },
  {
    path: '/product/photobook',
    component: LoadableLoader(() => import('pages/product/photobook')),
    exact: true,
  },
  {
    path: '/product/canvas',
    component: LoadableLoader(() => import('pages/product/canvas')),
    exact: true,
  },
  {
    path: '/product/frame',
    component: LoadableLoader(() => import('pages/product/frame')),
    exact: true,
  },

  {
    path: '/',
    component: LoadableLoader(() => import('pages/landing')),
    exact: true,
  },
  {
    path: '/auth/signin',
    component: LoadableLoader(() => import('pages/auth/login')),
    exact: true,
  },
  {
    path: '/auth/signup',
    component: LoadableLoader(() => import('pages/auth/signup')),
    exact: true,
  },
  {
    path: '/redirect',
    component: LoadableLoader(() => import('pages/redirect')),
    exact: true,
  },
  {
    path: '/auth/forget',
    component: LoadableLoader(() => import('pages/auth/login')),
    exact: true,
  },
  {
    path: '/editor',
    component: LoadableLoader(() => import('pages/editor/editor')),
    exact: true,
  },
  // {
  //   path: '/templates',
  //   component: LoadableLoader(() => import('pages/templates')),
  //   exact: true,
  // },
]
interface RouterProps {
  history: History
}

const Router: React.FC<RouterProps> = ({ history }) => {
  const dispatch = useDispatch()

  useEffect(() => {
    // listen storage change
    const storageListener = (event: StorageEvent) => {
      if (event.storageArea?.getItem('token')) {
        dispatch(loadUser())
        history.push('/')
      }
    }

    window.addEventListener('storage', storageListener)

    return () => {
      window.removeEventListener('storage', storageListener)
    }
  }, [dispatch, history])

  return (
    <ConnectedRouter history={history}>
      <Layout>
        <Switch>
          {routes.map((route) => (
            <Route key={route.path} path={route.path} component={route.component} exact={route.exact} />
          ))}
          <Route exact path="403" component={NotAuthorized} />
          <Route component={NotFound} />
        </Switch>
      </Layout>
    </ConnectedRouter>
  )
}

export default Router
