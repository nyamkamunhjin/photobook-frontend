/* eslint-disable react/button-has-type */

import { LoadingOutlined } from '@ant-design/icons'
import { ButtonProps } from 'antd/es/button'
import React from 'react'

const Button: React.FC<ButtonProps> = ({ icon, children, loading, ...rest }) => (
  <>
    <div {...rest} className="antd-btn-icon ant-btn-text uppercase text-xs text-center m-2 cursor-pointer">
      <div className="flex justify-center">{icon && loading ? <LoadingOutlined /> : icon}</div>
      <div className="title"> {children && children}</div>
    </div>
  </>
)

export default Button
