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
  mustHaveImageCenter?: boolean
  templateType?: 'canvas-split' | 'canvas-single' | 'canvas-multi' | 'photobook' | 'montage'
  slideNumber: number
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
  mustHaveImageCenter = false,
  templateType,
  slideNumber,
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
        className={slideIndex === index ? 'Slide selected relative' : 'Slide relative'}
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
                  <div
                    id={o.id}
                    key={o.id}
                    style={
                      mustHaveImageCenter
                        ? { ...o.style, width: slideWidth + 'px', height: slideHeight + 'px', top: 0, left: 0 }
                        : o.style
                    }
                    className={o.className}
                  >
                    {renderObject({
                      object: o,
                      updateObject,
                      updateHistory,
                      saveObjects,
                      scale,
                      zoom: 1,
                      mustHaveImageCenter,
                      slideWidth,
                      slideHeight,
                      templateType,
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
                      mustHaveImageCenter,
                      templateType,
                    })}
                  </div>
                )
              })}
            </>
          )}
        </div>
        {[1, slideNumber - 1].includes(index) && templateType && ['photobook', 'montage'].includes(templateType) && (
          <div
            className={
              'unavailable-to-edit-page left-page flex flex-col items-center justify-center absolute top-0 w-1/2 h-full bg-gray-500 z-50' +
              (index === 1 && ' left-0')
            }
            style={
              index !== 1
                ? {
                    left: '50%',
                  }
                : {}
            }
          >
            <p className="p-0 m-0 uppercase text-white" style={{ fontSize: 4 }}>
              This page cannot be edited.
            </p>
            <p className="p-0 m-0 text-gray-200" style={{ fontSize: 3 }}>
              This end paper cannot be edited.
            </p>
          </div>
        )}
      </div>
      <p className="label">
        {templateType && !'montage,photobook'.includes(templateType) ? (
          <>
            <FormattedMessage id="slide" /> {index + 1}
          </>
        ) : (
          <>
            <FormattedMessage id={index === 0 ? 'cover' : 'slide'} /> {index !== 0 && index}
          </>
        )}
      </p>
    </>
  )
}

export default Slides
