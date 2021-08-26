import React, { useEffect } from 'react'
import { Provider } from 'react-redux'
import store, { history } from 'redux/store'
import Localization from 'language'
import { loadUser } from 'redux/actions/auth'
import './style.css'
import Router from 'route'
import { ConfigProvider } from 'antd'
import { FormattedMessage } from 'react-intl'

const App = () => {
  useEffect(() => {
    store.dispatch(loadUser())
  }, [])

  return (
    <Provider store={store}>
      <Localization>
        <ConfigProvider
          renderEmpty={() => (
            <div className="w-full flex flex-col gap-4">
              <span className="text-base text-gray-500">
                <FormattedMessage id="empty" />
              </span>
            </div>
          )}
        >
          <div className="App">
            <Router history={history} />
          </div>
        </ConfigProvider>
      </Localization>
    </Provider>
  )
}

export default App
