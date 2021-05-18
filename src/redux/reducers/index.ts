/* eslint-disable import/no-extraneous-dependencies */
import { combineReducers } from 'redux'
import { connectRouter } from 'connected-react-router'
import { History } from 'history'
import project from './project'
import editor from './editor'
import image from './image'
import auth from './auth'
import settings from './settings'

const Reducers = (history: History) =>
  combineReducers({
    project,
    editor,
    image,
    auth,
    settings,
    router: connectRouter(history),
  })
export default Reducers
