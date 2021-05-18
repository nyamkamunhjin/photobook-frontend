/* eslint-disable import/no-extraneous-dependencies */
import { createStore, applyMiddleware } from 'redux'
import { composeWithDevTools } from 'redux-devtools-extension/developmentOnly'
import thunk from 'redux-thunk'
import { createBrowserHistory } from 'history'
import reducers from './reducers'

const initialState = {}

export const history = createBrowserHistory()

const middleware = [thunk]

const store = createStore(reducers(history), initialState, composeWithDevTools(applyMiddleware(...middleware)))

export default store
