import { Avatar, Button, Popover } from 'antd'
import { useDispatch } from 'react-redux'
import React, { useState } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { LOGOUT } from 'redux/actions/types'
import { useHistory } from 'react-router'
import styles from './styles.module.scss'

interface Props {
  avatarUrl: string | null
}

const UserInfo: React.FC<Props> = ({ avatarUrl }) => {
  const [visible, setVisible] = useState(false)
  const history = useHistory()
  const intl = useIntl()
  const dispatch = useDispatch()
  return (
    <Popover
      trigger="click"
      visible={visible}
      placement="bottomRight"
      content={
        <div className="flex flex-col gap-2">
          <button
            className="btn-primary"
            type="button"
            onClick={() => {
              setVisible(false)
              history.push('/profile?tab=order_history')
            }}
          >
            <FormattedMessage id="order_history" />
          </button>

          <button
            className="btn-primary"
            type="button"
            onClick={() => {
              setVisible(false)
              history.push('/profile?tab=my_cart')
            }}
          >
            <FormattedMessage id="my_cart" />
          </button>

          <button
            className="btn-primary"
            type="button"
            onClick={() => {
              setVisible(false)
              history.push('/profile?tab=my_info')
            }}
          >
            <FormattedMessage id="my_info" />
          </button>

          <button
            className="btn-cancel"
            type="button"
            onClick={() => {
              setVisible(false)
              dispatch({ type: LOGOUT })
            }}
          >
            <FormattedMessage id="log-out" />
          </button>
        </div>
      }
    >
      <Button type="link" className={styles.avatar} onClick={() => setVisible((prev) => !prev)}>
        <Avatar shape="square" size="small" src={avatarUrl} style={{ backgroundColor: '#0666b3' }} alt="user-avatar" />
      </Button>
    </Popover>
  )
}

export default UserInfo
