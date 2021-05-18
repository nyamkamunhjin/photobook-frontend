import React, { FC, useRef } from 'react'
import Glider, { GliderProps, GliderMethods } from 'react-glider'

const Carousels: FC<GliderProps> = ({ children, ...props }) => {
  const gliderRef = useRef<GliderMethods>(null)
  return (
    <Glider ref={gliderRef} {...props}>
      {children}
    </Glider>
  )
}
export default Carousels
