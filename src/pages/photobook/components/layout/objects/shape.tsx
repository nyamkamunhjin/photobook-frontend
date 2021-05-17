import { StyleType } from 'interfaces'
import React, { CSSProperties } from 'react'

interface Props {
  style: any
  className: string
  shapeStyle: StyleType
  shapeClass: string
}

const Shape: React.FC<Props> = ({ style, className, shapeStyle, shapeClass }) => {
  return (
    <div className={className} style={style}>
      <div className="border" />
      <div className={shapeClass} style={shapeStyle as CSSProperties} />
    </div>
  )
}

export default Shape
