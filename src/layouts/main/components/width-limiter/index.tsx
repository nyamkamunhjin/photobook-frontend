import React, { FC } from 'react'

interface Props {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

const WidthLimiter: FC<Props> = ({ children, className, style }) => {
  return (
    <div className={`mx-auto w-full max-w-7xl h-full ${className}`} style={style}>
      {children}
    </div>
  )
}

export default WidthLimiter
