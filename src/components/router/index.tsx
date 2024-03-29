/* eslint-disable @typescript-eslint/no-var-requires */
import { useMemo } from 'react'
import { useParams, useLocation, useHistory, useRouteMatch } from 'react-router-dom'

const queryString = require('query-string')

function useRouter() {
  const params = useParams()
  const location = useLocation()
  const history = useHistory()
  const match = useRouteMatch()

  return useMemo(() => {
    return {
      push: history.push,
      replace: history.replace,
      pathname: location.pathname,
      query: {
        ...queryString.parse(location.search),
        ...params,
      },
      match,
      location,
      history,
    }
  }, [params, match, location, history])
}

export default useRouter
