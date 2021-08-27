/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable consistent-return */
import React, { useState, useRef, useEffect } from 'react'
import { connect } from 'react-redux'
import { EditorInterface, ProjectInterface, RootInterface } from 'interfaces'
import { LeftOutlined, RightOutlined } from '@ant-design/icons'
import { debounce } from 'utils'
import { renderBackground, renderObject } from './utils'
import { BackgroundImages, BackgroundSingleImages } from './layout'
import './styles/editor.scss'

interface Props {
  editor: EditorInterface
  project: ProjectInterface
  slideIndex: number
  prevSlide?: () => void
  nextSlide?: () => void
  hasNext?: () => boolean
  hasPrevious?: () => boolean
  isPhotobook?: boolean
  isPublicSize?: boolean
}

const Preview: React.FC<Props> = ({
  project: { objects, backgrounds, bgStyles, slideWidth, slideHeight, loading },
  editor,
  slideIndex,
  prevSlide,
  nextSlide,
  hasNext,
  hasPrevious,
  isPhotobook = true,
  isPublicSize = true,
}) => {
  // refs
  const slideViewRef: any = useRef(null)
  const editorContainerRef: any = useRef(null)
  const slideContainer: any = useRef(null)
  const selectionRef: any = useRef(null)
  const canvasRef = useRef<any>(null)
  const scaledContainerRef = useRef<any>(null)
  // states
  const [scale, setScale] = useState<number>(1)

  const setSlidePosition = () => {
    if (slideContainer.current === null) return
    slideContainer.current.classList.add('center-slide')

    const editorPanelContainer: any = document.querySelector('.EditorPanelContainerPreview')

    editorPanelContainer.style.width = editor.sidebarOpen
      ? 'calc(100vw - 400px)' // 310 + 90
      : 'calc(100vw - 90px)' // 90

    const rect = slideContainer.current.getBoundingClientRect()
    const maxWidth = slideWidth
    const maxHeight = slideHeight
    const srcWidth = rect.width - 240 // 240 is the width of two side menus
    const srcHeight = rect.height

    const ratio = Math.min(srcWidth / maxWidth, srcHeight / maxHeight)
    setScale(ratio)

    const scaledWidth = maxWidth * ratio
    const scaledHeight = maxHeight * ratio

    canvasRef.current.style.transform = 'scale(' + ratio + ')'
    canvasRef.current.style.transformOrigin = '0 0'
    scaledContainerRef.current.style.width = scaledWidth + 'px'
    scaledContainerRef.current.style.height = scaledHeight + 'px'

    const slide = document.querySelector('#slide_preview') as HTMLElement
    slide.style.width = scaledWidth + 'px'
    slide.style.height = scaledHeight + 'px'

    editorContainerRef.current.style.width = scaledWidth + 'px'
    editorContainerRef.current.style.height = scaledHeight + 'px'
  }

  useEffect(() => {
    setSlidePosition()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (loading) return
    const debouncedHandleResize = debounce(function handleResize() {
      setSlidePosition()
    }, 100)
    window.addEventListener('resize', debouncedHandleResize)
    return () => {
      window.removeEventListener('resize', debouncedHandleResize)
    }
  })

  return (
    <div className="EditorPanelContainerPreview">
      <div ref={slideViewRef} className="StepSlideContainer SlideViewContainer">
        <div id="editor_container" ref={editorContainerRef}>
          <div id="selection" hidden ref={selectionRef} />
          <div id="slide_container" ref={slideContainer}>
            <div id="slide_preview">
              <div id="scaled_container" ref={scaledContainerRef}>
                {!loading &&
                  (isPhotobook ? (
                    <BackgroundImages scale={scale} editor={editor} slideIndex={slideIndex} backgrounds={backgrounds} />
                  ) : (
                    <BackgroundSingleImages
                      scale={scale}
                      editor={editor}
                      slideIndex={slideIndex}
                      backgrounds={backgrounds}
                    />
                  ))}
                <div ref={canvasRef} id="canvas_container">
                  {!loading && (
                    <>
                      <div id="background">
                        {renderBackground({
                          backgrounds,
                          bgStyles,
                        })}
                      </div>
                      <div id="container">
                        {objects.map((o: any) => {
                          return (
                            <div
                              id={o.id}
                              key={o.id}
                              style={
                                isPublicSize
                                  ? o.style
                                  : {
                                      ...(o.style as React.CSSProperties),
                                      width: slideWidth + 'px',
                                      height: slideHeight + 'px',
                                    }
                              }
                              className={o.className}
                            >
                              {renderObject({
                                edit: false,
                                object: o,
                                scale,
                                zoom: 1,
                              })}
                            </div>
                          )
                        })}
                      </div>
                    </>
                  )}
                </div>
                <div className="page-border" />
              </div>
            </div>
          </div>
        </div>
      </div>
      {hasPrevious && (
        <div className={`control prev cursor-pointer ${!hasPrevious() && 'inactive'}`} onClick={prevSlide}>
          <LeftOutlined />
        </div>
      )}
      {hasNext && (
        <div className={`control next cursor-pointer ${!hasNext() && 'inactive'}`} onClick={nextSlide}>
          <RightOutlined />
        </div>
      )}
    </div>
  )
}

const mapStateToProps = (state: RootInterface) => ({
  project: state.project,
  editor: state.editor,
})

export default connect(mapStateToProps)(Preview)
