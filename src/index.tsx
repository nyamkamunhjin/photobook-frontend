/* eslint-disable import/no-extraneous-dependencies */
import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from 'app'
import Amplify from 'aws-amplify'
import config from 'config'
import reportWebVitals from './reportWebVitals'
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

ReactDOM.render(<App />, document.getElementById('root'))

reportWebVitals()
// test
