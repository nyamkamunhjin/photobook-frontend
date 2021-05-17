import React, { FC } from 'react'

interface Props {
  children: React.ReactNode
  className?: string
}

const WidthLimiter: FC<Props> = ({ children, className }) => {
  return <div className={`mx-auto w-full max-w-7xl h-full ${className}`}>{children}</div>
}

export default WidthLimiter
