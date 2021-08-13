/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useState } from 'react'
import { PlusSquareOutlined, MinusSquareOutlined } from '@ant-design/icons'
import { BsFileMinus, BsFiles, BsFileEarmarkPlus } from 'react-icons/bs'
import { FormattedMessage } from 'react-intl'
import { Spin } from 'antd'
import { Actions } from 'ahooks/lib/useBoolean'
import { BackgroundImage, Container, PObject, Project, Slide, SlideObject, StyleType } from 'interfaces'
import { useBoolean, useDebounceEffect } from 'ahooks'
import { reorder } from 'utils/dnd'
import { ListManager } from 'components'
import { useWindow } from 'hooks'
import Slider from './slide'

interface Toggle {
  state: boolean
  action: Actions
}
interface Props {
  hideTools?: boolean
  slideIndex: number
  currentProject: Project
  slideWidth: number
  fitScale: number
  deSelectObject: () => void
  setScale: (scale: number) => void
  prevSlide?: () => void
  nextSlide?: () => void
  hasNext?: () => boolean
  hasPrevious?: () => boolean
  collapse: Toggle
  preview: Toggle
  single: Toggle
  addNewSlide?: (slideIndex: number, projectId: number) => void
  duplicateSlide?: (projectId: number, slideIndex: number) => void
  reOrderSlide?: (projectId: number, slides: Slide[], dest: number) => void
  deleteSlide?: (projectId: number, slideIndex: number) => void
  bgStyles: StyleType[]
  objects: SlideObject[]
  slideHeight: number
  scale: number
  loading: boolean
  saveObjects: () => void
  updateHistory: (historyType: string, props: any) => void
  updateObject: (props: { object: PObject }) => void
  changeSlideIndex?: (index: number) => void
  containers: Container[]
  backgrounds: BackgroundImage[]
  mustHaveImageCenter?: boolean
}

const FooterListTools: React.FC<Props> = ({
  slideIndex,
  currentProject,
  slideWidth,
  fitScale,
  deSelectObject,
  setScale,
  nextSlide,
  prevSlide,
  hasPrevious,
  hasNext,
  addNewSlide,
  deleteSlide,
  duplicateSlide,
  reOrderSlide,
  bgStyles,
  slideHeight,
  objects,
  containers,
  collapse,
  single,
  preview,
  loading,
  changeSlideIndex,
  saveObjects,
  updateHistory,
  updateObject,
  hideTools = false,
  scale,
  mustHaveImageCenter = false,
}) => {
  const [refreshing, setRefreshing] = useBoolean(false)
  const [_width, _setWidth] = useState(4)
  const [width] = useWindow()

  const changeDimension = (_scale: number) => {
    const scaled_container = document.querySelector('#scaled_container') as HTMLElement

    const slide_container = document.querySelector('#slide_container') as HTMLElement

    let _slide = document.querySelector('#slide') as HTMLElement

    if (!_slide) {
      _slide = document.querySelector('#slide_preview') as HTMLElement
    }
    if (!_scale) return

    const scaledWidth = slideWidth * _scale
    const scaledHeight = slideHeight * _scale

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
    const _w = slideWidth * (190 / slideHeight)
    _setWidth(Math.floor((width - 200) / _w))
  }
  useDebounceEffect(
    () => {
      if (!single) {
        setRefreshing.toggle()
        changeDimension(scale)
      }
    },
    [width, single],
    {
      wait: 1000,
    }
  )

  const zoomIn = () => {
    const canvas_container = document.querySelector('#canvas_container') as HTMLElement
    if (scale < 2) {
      deSelectObject()
      changeDimension(scale + 0.1)
      setScale(scale + 0.1)
      canvas_container.style.transform = `scale(${scale + 0.1})`
    }
  }

  const zoomOut = () => {
    const canvas_container = document.querySelector('#canvas_container') as HTMLElement

    if (scale > 0.2) {
      deSelectObject()
      changeDimension(scale - 0.1)
      setScale(scale - 0.1)
      canvas_container.style.transform = `scale(${scale - 0.1})`
    }
  }

  const onDragEnd = (source: number, dest: number) => {
    if (reOrderSlide) {
      reOrderSlide(currentProject.id, reorder(currentProject.slides, source, dest), dest)
    }
  }

  return (
    <>
      <div hidden={single.state} className="SlideListAll">
        {loading ? (
          <div className="flex justify-center items-center w-full">
            <Spin />
          </div>
        ) : (
          <ListManager
            direction="horizontal"
            maxItems={_width}
            refreshing={refreshing}
            onDragEnd={onDragEnd}
            items={currentProject.slides}
            render={(slide: Slide, index: number) => (
              <Slider
                height={180}
                index={index}
                slide={slide}
                key={slide.slideId}
                bgStyles={bgStyles}
                slideWidth={slideWidth}
                slideHeight={slideHeight}
                objects={objects}
                containers={containers}
                slideIndex={slideIndex}
                changeSlideIndex={changeSlideIndex}
                scale={scale}
                updateObject={updateObject}
                updateHistory={updateHistory}
                saveObjects={saveObjects}
                mustHaveImageCenter={mustHaveImageCenter}
              />
            )}
          />
        )}
      </div>
      <div
        className="SlideListTools"
        style={!collapse.state && single.state && !preview.state ? { height: 160 } : { height: 30 }}
      >
        <div className="SlideListNav">
          <div className="left-side-tools">
            <div
              className={`left ${single && 'rounded-full border-r-2 selected'}`}
              onClick={() => single.action.setTrue()}
            >
              <span>
                <FormattedMessage id="slide.single" />
              </span>
            </div>
            <div
              className={`right ${!single && 'rounded-full border-l-2 selected'}`}
              onClick={() => {
                single.action.setFalse()
                preview.action.setFalse()
              }}
            >
              <span>
                <FormattedMessage id="slide.all" />
              </span>
            </div>
          </div>
          <div className="center-side-tools">
            {hasPrevious && (
              <div className={`switch-slide ${!hasPrevious() && 'inactive'}`}>
                <span onClick={prevSlide}>
                  <FormattedMessage id="slide.prev" />
                </span>
              </div>
            )}

            <div className="slide-page-number">
              <span>
                <FormattedMessage id="slide" /> {slideIndex + 1}
              </span>
            </div>
            {hasNext && (
              <div className={`switch-slide ${!hasNext() && 'inactive'}`}>
                <span onClick={nextSlide}>
                  <FormattedMessage id="slide.next" />
                </span>
              </div>
            )}
          </div>
          <div className="right-side-tools">
            <div className="ZoomPanel">
              <div onClick={() => zoomIn()} className="zoom-button">
                <PlusSquareOutlined />
              </div>
              <div className="percentage-level">
                <span>{Math.ceil((scale * 100) / fitScale).toString()}%</span>
              </div>
              <div onClick={() => zoomOut()} className="zoom-button">
                <MinusSquareOutlined />
              </div>
            </div>
            <div
              hidden={!single || preview.state}
              onClick={() => collapse.action.toggle()}
              className="hide-slideList-Button"
            >
              {collapse.state ? (
                <FormattedMessage id="slide.show_buttons" />
              ) : (
                <FormattedMessage id="slide.hide_buttons" />
              )}
            </div>
          </div>
        </div>
        {!collapse.state && single.state && !preview.state && (
          <div className="SlideListPanel">
            <div className="SlideList-wrapper">
              <div className="SlideList">
                {loading ? (
                  <div className="flex justify-center items-center w-full">
                    <Spin />
                  </div>
                ) : (
                  <ListManager
                    direction="horizontal"
                    onDragEnd={onDragEnd}
                    items={currentProject.slides}
                    render={(slide: Slide, index: number) => (
                      <Slider
                        index={index}
                        slide={slide}
                        height={80}
                        key={slide.slideId}
                        bgStyles={bgStyles}
                        slideWidth={slideWidth}
                        slideHeight={slideHeight}
                        objects={objects}
                        containers={containers}
                        slideIndex={slideIndex}
                        changeSlideIndex={changeSlideIndex}
                        scale={scale}
                        updateObject={updateObject}
                        updateHistory={updateHistory}
                        saveObjects={saveObjects}
                        mustHaveImageCenter={mustHaveImageCenter}
                      />
                    )}
                  />
                )}
              </div>
            </div>
            {!hideTools && (
              <div className="SlideActions">
                <div
                  className="cursor-pointer flex items-center"
                  onClick={() => {
                    if (currentProject.id && addNewSlide) {
                      addNewSlide(currentProject?.id, slideIndex)
                    }
                  }}
                >
                  <BsFileEarmarkPlus />
                  <FormattedMessage id="slide.add_page" />
                </div>
                <div
                  onClick={() => {
                    const { id } = currentProject
                    if (id && duplicateSlide) {
                      duplicateSlide(id, slideIndex)
                    }
                  }}
                  className="cursor-pointer flex items-center"
                >
                  <BsFiles />
                  <FormattedMessage id="slide.duplicate" />
                </div>
                <div
                  className="cursor-pointer flex items-center"
                  onClick={() => {
                    const { id } = currentProject
                    if (id && deleteSlide) {
                      deleteSlide(id, slideIndex)
                    }
                  }}
                >
                  <BsFileMinus />
                  <FormattedMessage id="slide.remove" />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}

export default FooterListTools
