/* eslint-disable react/button-has-type */

import { EditFilled } from '@ant-design/icons'
import { Input, InputProps } from 'antd'
import React from 'react'
import { FormattedMessage } from 'react-intl'

interface Props extends InputProps {
  onSave: () => void
  onCancel: () => void
  isActive: boolean
}

const IconInput: React.FC<Props> = ({ className = '', isActive = false, onSave, onCancel, ...rest }) => (
  <>
    <div className="border-b flex items-center">
      <Input className={`${className} border-none`} {...rest} />{' '}
      {isActive ? (
        <>
          <div onClick={onSave} className="mr-2 text-xs text-blue-400 cursor-pointer">
            <FormattedMessage id="save" />
          </div>
          <div onClick={onCancel} className="text-xs cursor-pointer">
            <FormattedMessage id="cancel" />
          </div>
        </>
      ) : (
        <EditFilled />
      )}
    </div>
  </>
)

export default IconInput
