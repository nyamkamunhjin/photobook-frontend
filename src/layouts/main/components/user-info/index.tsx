import { Avatar, Button, Popover } from 'antd'
import { useDispatch } from 'react-redux'
import React, { useState } from 'react'
import { FormattedMessage } from 'react-intl'
import { LOGOUT } from 'redux/actions/types'
import { useHistory } from 'react-router'
import styles from './styles.module.scss'
import { CustomButton } from '../../../../components'

interface Props {
  avatarUrl: string | null
}

const UserInfo: React.FC<Props> = ({ avatarUrl }) => {
  const [visible, setVisible] = useState(false)
  const history = useHistory()
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
              history.push('/profile?tab=my_projects')
            }}
          >
            <FormattedMessage id="my_projects" />
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
            className="btn-primary"
            type="button"
            onClick={() => {
              setVisible(false)
              history.push('/profile?tab=photo_trade')
            }}
          >
            <FormattedMessage id="photo_trade" />
          </button>

          <button
            className="btn-cancel"
            type="button"
            onClick={() => {
              setVisible(false)
              dispatch({ type: LOGOUT })
              history.push('/')
            }}
          >
            <FormattedMessage id="log-out" />
          </button>
        </div>
      }
    >
      <CustomButton className="focus:outline-none" onClick={() => setVisible((prev) => !prev)}>
        <Avatar size="small" src={avatarUrl} style={{ backgroundColor: '#0666b3' }} alt="user-avatar" />
      </CustomButton>
    </Popover>
  )
}

export default UserInfo
