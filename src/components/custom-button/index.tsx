/* eslint-disable react/button-has-type */
import React, { CSSProperties, FC } from 'react'
import Loading from '../loading'

interface Props {
  loading?: boolean
  className?: string
  children: React.ReactNode
  type?: 'button' | 'submit' | 'reset'
  onClick?: () => void
  form?: string
  style?: CSSProperties
}

const CustomButton: FC<Props> = ({ loading, className, children, type = 'button', onClick, form, style }) => {
  return (
    <button type={type} className={className} onClick={onClick} form={form} style={style}>
      {loading ? <Loading className="text-base text-white" fill={false} /> : children}
    </button>
  )
}

export default CustomButton
