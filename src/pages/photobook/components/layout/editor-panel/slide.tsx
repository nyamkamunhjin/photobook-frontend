/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable @typescript-eslint/ban-types */

import React, { useEffect, useRef } from 'react'
import { Container, SlideObject } from 'interfaces'
import { FormattedMessage } from 'react-intl'
import { renderBackground, renderObject } from '../../utils'

interface Props {
  scale: number
  updateObject: (props: { object: Object }) => void
  updateHistory: (historyType: string, props: any) => void
  saveObjects: () => void
  slide: any
  index: number
  slideIndex: number
  bgStyles: any
  slideWidth: any
  slideHeight: any
  objects: SlideObject[]
  containers: Container[]
  backgrounds: any
  changeSlideIndex: (index: number) => void
}

const Slide: React.FC<Props> = ({
  slideWidth,
  slideHeight,
  changeSlideIndex,
  index,
  slideIndex,
  backgrounds,
  bgStyles,
  objects,
  updateObject,
  updateHistory,
  saveObjects,
  scale,
  slide,
}) => {
  const scaledContainerRef = useRef<any>(null)
  const canvasRef = useRef<any>(null)

  useEffect(() => {
    const maxWidth = slideWidth
    const maxHeight = slideHeight
    const srcHeight = 90
    const srcWidth = maxWidth * (srcHeight / maxHeight)
    const ratio = Math.min(srcWidth / maxWidth, srcHeight / maxHeight)
    canvasRef.current.style.transform = 'scale(' + ratio + ')'
    canvasRef.current.style.transformOrigin = '0 0'
    scaledContainerRef.current.style.width = maxWidth * ratio + 'px'
    scaledContainerRef.current.style.height = maxHeight * ratio + 'px'
  }, [slideWidth, slideHeight])

  return (
    <div
      draggable
      onClick={() => changeSlideIndex(index)}
      className={slideIndex === index ? 'Slide selected' : 'Slide'}
      id="scaled_container"
      ref={scaledContainerRef}
    >
      <div className="book-spine" style={{ width: 10, left: 'calc(50% - 5px)' }} />
      <div ref={canvasRef} id="canvas_container">
        {slideIndex === index ? (
          <>
            {renderBackground({
              backgrounds,
              bgStyles,
            })}
            {objects.map((o: any) => {
              return (
                <div id={o.id} key={o.id} style={o.style} className={o.className}>
                  {renderObject({
                    object: o,
                    updateObject,
                    updateHistory,
                    saveObjects,
                    scale,
                  })}
                </div>
              )
            })}
          </>
        ) : (
          <>
            {renderBackground({
              backgrounds,
              bgStyles,
            })}
            {slide.objects.map((o: any) => {
              return (
                <div id={o.id} key={o.id} style={o.style} className={o.className}>
                  {renderObject({
                    object: o,
                    updateObject,
                    updateHistory,
                    saveObjects,
                    scale,
                  })}
                </div>
              )
            })}
          </>
        )}
      </div>
      <p style={{ position: 'absolute', bottom: 0, marginBottom: -25 }}>
        <FormattedMessage id="slide" /> {index + 1}
      </p>
    </div>
  )
}

export default Slide
