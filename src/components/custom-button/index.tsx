/* eslint-disable react/button-has-type */
import React, { FC } from 'react'
import Loading from '../loading'

interface Props extends React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
  loading?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
}

const CustomButton: FC<Props> = ({ loading, type = 'button', icon, iconPosition = 'left', ...props }) => {
  return (
    <button {...props} type={type}>
      {loading ? (
        <Loading className="text-base text-white" fill={false} />
      ) : (
        <div className={`flex ${iconPosition === 'left' ? '' : 'flex-row-reverse'} gap-1 items-center justify-center`}>
          {icon}
          {props.children}
        </div>
      )}
    </button>
  )
}

export default CustomButton
