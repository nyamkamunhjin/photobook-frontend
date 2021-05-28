import React from 'react'
import { FormattedMessage } from 'react-intl'

const Empty = () => {
  return (
    <div>
      <p className="phrase-add">
        <FormattedMessage id="empty" />
      </p>
    </div>
  )
}

export default Empty
