import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from 'app'
import { Amplify } from 'aws-amplify'
import config from 'config'
import reportWebVitals from './reportWebVitals'
import 'antd/dist/antd.css'
import 'tippy.js/dist/tippy.css'

Amplify.configure({
  Auth: {
    mandatorySignIn: false,
    region: config.cognito.REGION,
    identityPoolId: config.cognito.IDENTITY_POOL_ID,
    federationTarget: 'COGNITO_USER_POOLS',
  },
  Storage: {
    region: config.s3.REGION,
    bucket: config.s3.BUCKET,
  },
})

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
