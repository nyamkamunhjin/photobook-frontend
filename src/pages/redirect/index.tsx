import React, { FC, useEffect } from 'react'
import { FormattedMessage } from 'react-intl'
import { useDispatch } from 'react-redux'
import { useRouter } from 'components'
import { loadUser } from 'redux/actions/auth'

const Redirect: FC = () => {
  const router = useRouter()
  const dispatch = useDispatch()
  useEffect(() => {
    if (router.query.token) {
      localStorage.setItem('token', router.query.token)
      if (router.query.googleAccessToken) {
        localStorage.setItem('googleAccessToken', router.query.googleAccessToken)
      }

      if (router.query.facebookAccessToken) {
        localStorage.setItem('facebookAccessToken', router.query.facebookAccessToken)
      }

      dispatch(loadUser())

      if (window.opener && window.opener !== window) {
        window.close()
      } else {
        router.push('/')
      }
    }
  }, [router, dispatch])

  return <FormattedMessage id="please_wait" />
}

export default Redirect
