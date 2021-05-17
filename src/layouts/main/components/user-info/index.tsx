import { LogoutOutlined } from '@ant-design/icons'
import { Avatar, Button, Popover } from 'antd'
import { useRouter } from 'components'
import { useDispatch } from 'react-redux'
import React from 'react'
import { useIntl } from 'react-intl'
import styles from './styles.module.scss'
import { LOGOUT } from '../../../../redux/actions/types'

const UserInfo: React.FC<unknown> = () => {
  const intl = useIntl()
  const dispatch = useDispatch()
  const router = useRouter()

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
