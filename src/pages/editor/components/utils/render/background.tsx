import React from 'react'
import { BackgroundImage, StyleType } from 'interfaces'
import { imageOnError } from 'utils'

interface Props {
  bg: BackgroundImage
  bgStyles: StyleType[]
  updateBackground?: (props: { background: BackgroundImage }) => void
}

const Background: React.FC<Props> = ({ bg, bgStyles, updateBackground }) => {
  const updateUrl = (url: string) => {
    if (updateBackground) {
      updateBackground({
        background: {
          ...bg,
          src: url,
        },
      })
    }
  }

  return (
    <div
      key={bg.className}
      className={`background ${bg.className}`}
      style={{
        ...bgStyles[bg.className],
        ...bg.bgStyle,
      }}
    >
      {bg.src && bg.src?.length > 0 && (
        <img
          data-imageurl={bg.imageurl}
          src={bg.src}
          style={{ ...(bg.style as any), zIndex: -10 }}
          onError={(e) => imageOnError(e, bg.imageurl, updateUrl)}
          alt={bg.className}
        />
      )}
    </div>
  )
}

export default Background
