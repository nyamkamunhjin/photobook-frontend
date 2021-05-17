/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useEffect } from 'react'
import { PlusSquareOutlined, MinusSquareOutlined } from '@ant-design/icons'
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd'
import { FormattedMessage } from 'react-intl'
import { Spin } from 'antd'
import { getRotationScaler } from 'utils'
import { Project, Slide, SlideObject } from 'interfaces'
import { reorder } from 'utils/dnd'
import Slider from './slide'

interface Props {
  slideIndex: number
  currentProject: Project
  slideWidth: number
  fitScale: number
  deselectObject: () => void
  setScale: (scale: number) => void
  prevSlide: () => void
  nextSlide: () => void
  addNewSlide: (slideIndex: number, projectId: number) => void
  duplicateSlide: (projectId: number, slideId: string) => void
  reOrderSlide: (slides: Slide[]) => void
  deleteSlide: (projectId: number, slideId: string) => void
  bgStyles: Array<unknown>
  objects: SlideObject[]
  slideHeight: number
  scale: number
  loading: boolean
  saveObjects: () => void
  updateHistory: (historyType: string, props: any) => void
  updateObject: (props: { object: Object }) => void
  changeSlideIndex: (index: number) => void
  containers: []
  backgrounds: []
}

const getListStyle = (isDraggingOver: boolean) => ({
  background: isDraggingOver ? 'lightblue' : 'white',
  display: 'flex',
  padding: 8,
  overflow: 'auto',
})
const SideListTools: React.FC<Props> = ({
  slideIndex,
  currentProject,
  slideWidth,
  fitScale,
  deselectObject,
  setScale,
  nextSlide,
  prevSlide,
  addNewSlide,
  deleteSlide,
  duplicateSlide,
  reOrderSlide,
  bgStyles,
  slideHeight,
  objects,
  containers,
  backgrounds,
  loading,
  changeSlideIndex,
  saveObjects,
  updateHistory,
  updateObject,
  scale,
}) => {
  const hasNext = () => {
    return !(slideIndex === currentProject.slides.length - 1)
  }

  const hasPrevious = () => {
    return !(slideIndex === 0)
  }

  const changeDimension = (_scale: number) => {
    const scaled_container = document.querySelector('#scaled_container') as HTMLElement

    const slide_container = document.querySelector('#slide_container') as HTMLElement

    const _slide = document.querySelector('#slide') as HTMLElement

    const scaledWidth = slideWidth * scale
    const scaledHeight = slideHeight * scale

    scaled_container.style.width = scaledWidth + 'px'
    scaled_container.style.height = scaledHeight + 'px'

    _slide.style.height = scaledHeight + 'px'

    // only center the slide if overflow scroll is not enabled
    if (_scale.toFixed(2) <= fitScale.toFixed(2)) {
      _slide.style.left = 'auto'
      _slide.style.width = scaledWidth + 'px'
      slide_container.classList.add('center-slide')
    } else {
      _slide.style.left = '120px'
      _slide.style.width = scaledWidth + 120 + 'px'
      slide_container.classList.remove('center-slide')
    }
  }

  const zoomIn = () => {
    const canvas_container = document.querySelector('#canvas_container') as HTMLElement
    const _scale = getRotationScaler(canvas_container.style.transform)
    if (_scale < 2) {
      deselectObject()
      changeDimension(_scale + 0.1)
      setScale(_scale + 0.1)
      canvas_container.style.transform = `scale(${_scale + 0.1})`
    }
  }

  const zoomOut = () => {
    const canvas_container = document.querySelector('#canvas_container') as HTMLElement

    const _scale = getRotationScaler(canvas_container.style.transform)
    if (_scale > 0.2) {
      deselectObject()
      changeDimension(_scale - 0.1)
      setScale(_scale - 0.1)
      canvas_container.style.transform = `scale(${_scale - 0.1})`
    }
  }

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return
    }

    const items = reorder(currentProject.slides, result.source.index, result.destination.index)
    reOrderSlide(items)
  }

  return (
    <div className="SlideListTools">
      <div className="SlideListNav">
        <div className="left-side-tools">
          <div className="button rounded-full">
            <span>
              <FormattedMessage id="slide.single" />
            </span>
          </div>
          <div className="button">
            <span>
              <FormattedMessage id="slide.all" />
            </span>
          </div>
        </div>
        <div className="center-side-tools">
          <div className={`switch-slide ${hasPrevious() ? '' : 'inactive'}`}>
            <span onClick={prevSlide}>
              <FormattedMessage id="slide.prev" />
            </span>
          </div>
          <div className="slide-page-number">
            <span>
              <FormattedMessage id="slide" /> {slideIndex + 1}
            </span>
          </div>
          <div className={`switch-slide ${hasNext() ? '' : 'inactive'}`}>
            <span onClick={nextSlide}>
              <FormattedMessage id="slide.next" />
            </span>
          </div>
        </div>
        <div className="right-side-tools">
          <div className="ZoomPanel">
            <div onClick={() => zoomIn()} className="zoom-button">
              <PlusSquareOutlined />
            </div>
            <div className="percentage-level">
              <span>{parseInt(((scale * 100) / fitScale).toString(), 10)}%</span>
            </div>
            <div onClick={() => zoomOut()} className="zoom-button">
              <MinusSquareOutlined />
            </div>
          </div>
          <p className="hide-slideList-Button">
            <FormattedMessage id="slide.hide_buttons" />
          </p>
        </div>
      </div>
      <div className="SlideListPanel">
        <div className="SlideList-wrapper">
          <div className="SlideList">
            {loading ? (
              <div className="flex justify-center items-center w-full">
                <Spin />
              </div>
            ) : (
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="droppable" direction="horizontal">
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      style={getListStyle(snapshot.isDraggingOver)}
                      {...provided.droppableProps}
                    >
                      {currentProject.slides.map((slide: Slide, i: number) => {
                        return (
                          <Draggable key={slide.slideId} draggableId={slide.slideId} index={i}>
                            {(_provided, _snapshot) => (
                              <div
                                ref={_provided.innerRef}
                                {..._provided.draggableProps}
                                {..._provided.dragHandleProps}
                              >
                                <Slider
                                  index={i}
                                  slide={slide}
                                  key={slide.slideId}
                                  bgStyles={bgStyles}
                                  slideWidth={slideWidth}
                                  slideHeight={slideHeight}
                                  objects={objects}
                                  containers={containers}
                                  backgrounds={backgrounds}
                                  slideIndex={slideIndex}
                                  changeSlideIndex={changeSlideIndex}
                                  scale={scale}
                                  updateObject={updateObject}
                                  updateHistory={updateHistory}
                                  saveObjects={saveObjects}
                                />
                              </div>
                            )}
                          </Draggable>
                        )
                      })}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            )}
          </div>
        </div>
        <div className="SlideActions">
          <div
            className="cursor-pointer"
            onClick={() => {
              if (currentProject.id) {
                addNewSlide(slideIndex, currentProject?.id)
              }
            }}
          >
            <FormattedMessage id="slide.add_page" />
          </div>
          <div
            onClick={() => {
              const { id, slides } = currentProject
              const slideId = slides[slideIndex]?.slideId
              if (slideId && id) duplicateSlide(id, slideId)
            }}
            className="cursor-pointer"
          >
            <FormattedMessage id="slide.duplicate" />
          </div>
          <div
            className="cursor-pointer"
            onClick={() => {
              const { id, slides } = currentProject
              const slideId = slides[slideIndex]?.slideId
              if (slideId && id) deleteSlide(id, slideId)
            }}
          >
            <FormattedMessage id="slide.remove" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default SideListTools
