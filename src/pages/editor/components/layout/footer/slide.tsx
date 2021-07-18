/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable @typescript-eslint/ban-types */

import React, { useEffect, useRef } from 'react'
import { Container, PObject, Slide, SlideObject, StyleType } from 'interfaces'
import { FormattedMessage } from 'react-intl'
import { renderBackground, renderObject } from '../../utils'

interface Props {
  scale: number
  updateObject: (props: { object: PObject }) => void
  updateHistory: (historyType: string, props: any) => void
  saveObjects: () => void
  slide: Slide
  index: number
  slideIndex: number
  bgStyles: StyleType[]
  slideWidth: number
  slideHeight: number
  objects: SlideObject[]
  containers: Container[]
  height: number
  changeSlideIndex?: (index: number) => void
}

const Slides: React.FC<Props> = ({
  slideWidth,
  slideHeight,
  changeSlideIndex,
  index,
  slideIndex,
  bgStyles,
  objects,
  updateObject,
  updateHistory,
  saveObjects,
  scale,
  slide,
  height,
}) => {
  const scaledContainerRef = useRef<any>(null)
  const canvasRef = useRef<any>(null)
  useEffect(() => {
    const maxWidth = slideWidth
    const maxHeight = slideHeight
    const srcHeight = height
    const srcWidth = maxWidth * (srcHeight / maxHeight)

    const ratio = srcWidth / maxWidth
    canvasRef.current.style.transform = 'scale(' + ratio + ')'
    canvasRef.current.style.transformOrigin = '0 0'
    scaledContainerRef.current.style.width = maxWidth * ratio + 'px'
    scaledContainerRef.current.style.height = maxHeight * ratio + 'px'
  }, [slideWidth, slideHeight, height])
  return (
    <>
      <div
        onClick={() => changeSlideIndex && changeSlideIndex(index)}
        className={slideIndex === index ? 'Slide selected' : 'Slide'}
        ref={scaledContainerRef}
      >
        <div className="book-spine" style={{ width: 10, left: 'calc(50% - 5px)' }} />
        <div ref={canvasRef} id="canvas_container">
          {slideIndex === index ? (
            <>
              {renderBackground({
                backgrounds: slide.backgrounds,
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
                      zoom: 1,
                    })}
                  </div>
                )
              })}
            </>
          ) : (
            <>
              {renderBackground({
                backgrounds: slide.backgrounds,
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
                      zoom: 1,
                    })}
                  </div>
                )
              })}
            </>
          )}
        </div>
      </div>
      <p className="label">
        <FormattedMessage id="slide" /> {index + 1}
      </p>
    </>
  )
}

export default Slides
