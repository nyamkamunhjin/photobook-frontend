import React, { useEffect } from 'react'
import { Provider } from 'react-redux'
import store, { history } from 'redux/store'
import Localization from 'language'
import { loadUser } from 'redux/actions/auth'
import './style.css'
import Router from 'route'

const App = () => {
  useEffect(() => {
    store.dispatch(loadUser())
  }, [])

  return (
    <Provider store={store}>
      <Localization>
        <div className="App">
          <Router history={history} />
        </div>
      </Localization>
    </Provider>
  )
}

export default App
