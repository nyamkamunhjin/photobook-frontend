import { LogoutOutlined } from '@ant-design/icons'
import { Avatar, Button, Popover } from 'antd'
import { useDispatch } from 'react-redux'
import React from 'react'
import { useIntl } from 'react-intl'
import { LOGOUT } from 'redux/actions/types'
import styles from './styles.module.scss'

const UserInfo: React.FC<unknown> = () => {
  const intl = useIntl()
  const dispatch = useDispatch()

  return (
    <Popover
      trigger="click"
      placement="bottom"
      content={
        <Button
          block
          type="link"
          size="small"
          icon={<LogoutOutlined />}
          onClick={() => {
            dispatch({ type: LOGOUT })
          }}
        >
          {intl.formatMessage({ id: 'log-out' })}
        </Button>
      }
    >
      <Button type="link" className={styles.avatar}>
        <Avatar shape="square" size="small" style={{ backgroundColor: '#0666b3' }} alt="user-avatar" />
      </Button>
    </Popover>
  )
}

export default UserInfo
