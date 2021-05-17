import React from 'react'
import { BackgroundImage } from 'interfaces'
import Background from './background'

interface Props {
  backgrounds: any
  bgStyles: any
  updateBackground?: (props: { background: BackgroundImage }) => void
}

const RenderBackground: React.FC<Props> = ({ backgrounds, bgStyles, updateBackground }) => {
  return backgrounds.map((bg: BackgroundImage) => (
    <Background key={bg.className} bg={bg} bgStyles={bgStyles} updateBackground={updateBackground} />
  ))
}

export default RenderBackground
