/* eslint-disable react/button-has-type */

import { LoadingOutlined } from '@ant-design/icons'
import { ButtonProps } from 'antd/es/button'
import React from 'react'

const Button: React.FC<ButtonProps> = ({ icon, children, loading, ...rest }) => (
  <>
    <div {...rest} className="antd-btn-icon ant-btn-text uppercase text-xs">
      <div>{icon && loading ? <LoadingOutlined /> : icon}</div>
      <div> {children && children}</div>
    </div>
  </>
)

export default Button
