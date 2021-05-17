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
    path: '/category/layout',
    component: LoadableLoader(() => import('pages/category/layout')),
    exact: true,
  },
  {
    path: '/category/frame',
    component: LoadableLoader(() => import('pages/category/frame')),
    exact: true,
  },
  {
    path: '/category/clipart',
    component: LoadableLoader(() => import('pages/category/clipart')),
    exact: true,
  },
  {
    path: '/category/background',
    component: LoadableLoader(() => import('pages/category/background')),
    exact: true,
  },
  {
    path: '/category/template',
    component: LoadableLoader(() => import('pages/category/template')),
    exact: true,
  },
  {
    path: '/category/mask',
    component: LoadableLoader(() => import('pages/category/mask')),
    exact: true,
  },
  {
    path: '/files/layout',
    component: LoadableLoader(() => import('pages/files/layout')),
    exact: true,
  },
  {
    path: '/files/frame',
    component: LoadableLoader(() => import('pages/files/frame')),
    exact: true,
  },
  {
    path: '/files/clipart',
    component: LoadableLoader(() => import('pages/files/clipart')),
    exact: true,
  },
  {
    path: '/files/background',
    component: LoadableLoader(() => import('pages/files/background')),
    exact: true,
  },
  {
    path: '/files/mask',
    component: LoadableLoader(() => import('pages/files/mask')),
    exact: true,
  },
  {
    path: '/material/binding-type',
    component: LoadableLoader(() => import('pages/material/binding-type')),
    exact: true,
  },
  {
    path: '/material/paper-material',
    component: LoadableLoader(() => import('pages/material/paper-material')),
    exact: true,
  },
  {
    path: '/material/paper-size',
    component: LoadableLoader(() => import('pages/material/paper-size')),
    exact: true,
  },
  {
    path: '/material/cover-material',
    component: LoadableLoader(() => import('pages/material/cover-material')),
    exact: true,
  },
  {
    path: '/material/cover-type',
    component: LoadableLoader(() => import('pages/material/cover-type')),
    exact: true,
  },
  {
    path: '/material/frame-material',
    component: LoadableLoader(() => import('pages/material/frame-material')),
    exact: true,
  },
  {
    path: '/material/cover-material-color',
    component: LoadableLoader(() => import('pages/material/cover-material-color')),
    exact: true,
  },
  {
    path: '/photobook',
    component: LoadableLoader(() => import('pages/photobook/editor')),
    exact: true,
  },
  {
    path: '/photobook/layout',
    component: LoadableLoader(() => import('pages/photobook/layout')),
    exact: true,
  },
  {
    path: '/photobook/cover',
    component: LoadableLoader(() => import('pages/photobook/cover')),
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
  }, [])

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
