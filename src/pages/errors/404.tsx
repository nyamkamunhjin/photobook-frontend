import { Button, Result } from 'antd'
import React from 'react'
import { FormattedMessage } from 'react-intl'
import { Link } from 'react-router-dom'

const NotFound: React.FC = () => {
  return (
    <Result
      title="404"
      status="404"
      subTitle={<FormattedMessage id="404" />}
      extra={
        <Link to="/">
          <Button type="primary">
            <FormattedMessage id="back_home" />
          </Button>
        </Link>
      }
    />
  )
}

export default NotFound
