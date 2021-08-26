/* eslint-disable react/button-has-type */
import { LoadingOutlined } from '@ant-design/icons'
import React, { FC } from 'react'

interface Props extends React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
  loading?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
}

const CustomButton: FC<Props> = ({ loading, type = 'button', icon, iconPosition = 'left', ...props }) => {
  return (
    <button {...props} className={`${props.className} flex justify-center items-center gap-2`} type={type}>
      {loading && <LoadingOutlined className="text-base font-bold transform transition-all duration-150" />}
      <div
        className={`flex ${
          iconPosition === 'left' ? '' : 'flex-row-reverse'
        } gap-1 items-center justify-center transform transition-all`}
      >
        {icon}
        {props.children}
      </div>
    </button>
  )
}

export default CustomButton
