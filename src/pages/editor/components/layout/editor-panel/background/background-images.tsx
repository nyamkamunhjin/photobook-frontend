import React, { useEffect, useState } from 'react'
import { BsArrowsMove } from 'react-icons/bs'
import { SET_BACKGROUNDS, UPDATE_BACKGROUND } from 'redux/actions/types'
import { BackgroundImage, EditorInterface, HistoryProps, StyleType } from 'interfaces'
import { ParseNumber } from 'utils'
import Toolbar from './toolbar'

interface Props {
  editor: EditorInterface
  scale: number
  slideIndex?: number
  backgrounds: BackgroundImage[]
  setBackgrounds?: (props: { backgrounds: BackgroundImage[] }) => void
  updateBackground?: (props: { background: BackgroundImage }) => void
  updateHistory?: (historyType: string, props: HistoryProps) => void
  deSelectObject?: () => void
  onBackgroundDropDragOver?: (e: any) => void
  onBackgroundDropDragLeave?: (e: any) => void
}

const BackgroundImages: React.FC<Props> = ({
  editor,
  scale,
  slideIndex,
  backgrounds,
  setBackgrounds,
  updateBackground,
  updateHistory,
  deSelectObject,
  onBackgroundDropDragOver,
  onBackgroundDropDragLeave,
}) => {
  const [selectedBG, setSelectedBG] = useState('')
  useEffect(() => {
    const container: HTMLDivElement | null = document.querySelector('#container')
    if (editor.backgroundEdit) {
      hideCenterCircles()
      showCenterCircles()
      if (deSelectObject) {
        deSelectObject()
      }
      if (container && container.style) {
        container.style.visibility = 'hidden'
      }
    } else {
      hideCenterCircles()
      if (container && container.style) {
        container.style.visibility = 'visible'
      }
    }
  }, [editor]) // eslint-disable-line react-hooks/exhaustive-deps

  const onBackgroundDropDragDrop = (e: any) => {
    e.preventDefault()
    if (!updateHistory || !setBackgrounds) {
      return
    }
    const backgroundFull: any = document.querySelector('.background-full')

    updateHistory(SET_BACKGROUNDS, { backgrounds })

    if (e.target.classList.contains('background-drop-left')) {
      if (backgroundFull?.style.display === 'block') {
        setBackgrounds({
          backgrounds: [
            {
              className: 'background-right',
              style: { top: 0, left: 0, rotateAngle: 0, transform: '' },
              src: backgroundFull?.firstChild?.src,
              imageurl: backgroundFull?.firstChild.getAttribute('data-imageurl'),
              bgStyle: { rotateAngle: 0, transform: '', transformOrigin: 'center center' },
            },
            {
              className: 'background-left',
              style: { top: 0, left: 0, rotateAngle: 0, transform: '' },
              bgStyle: { rotateAngle: 0, transform: '', transformOrigin: 'center center' },
              src: e.dataTransfer.getData('tempUrl'),
              imageurl: e.dataTransfer.getData('imageUrl'),
            },
            {
              className: 'background-full',
              style: { rotateAngle: 0, transform: '' },
              bgStyle: { rotateAngle: 0, transform: '', transformOrigin: 'center center' },
            },
          ],
        })
      } else {
        setBackgrounds({
          backgrounds: [
            {
              className: 'background-left',
              style: { top: 0, left: 0, rotateAngle: 0, transform: '' },
              src: e.dataTransfer.getData('tempUrl'),
              imageurl: e.dataTransfer.getData('imageUrl'),
              bgStyle: { rotateAngle: 0, transform: '', transformOrigin: 'center center' },
            },
          ],
        })
      }
    } else if (e.target.classList.contains('background-drop-middle')) {
      setBackgrounds({
        backgrounds: [
          {
            className: 'background-full',
            style: { top: 0, left: 0, rotateAngle: 0, transform: '' },
            bgStyle: { rotateAngle: 0, transform: '', transformOrigin: 'center center' },
            src: e.dataTransfer.getData('tempUrl'),
            imageurl: e.dataTransfer.getData('imageUrl'),
          },
          {
            className: 'background-left',
            style: { rotateAngle: 0, transform: '' },
            bgStyle: { rotateAngle: 0, transform: '', transformOrigin: 'center center' },
          },
          {
            className: 'background-right',
            style: { rotateAngle: 0, transform: '' },
            bgStyle: { rotateAngle: 0, transform: '', transformOrigin: 'center center' },
          },
        ],
      })
    } else if (e.target.classList.contains('background-drop-right')) {
      if (backgroundFull.style.display === 'block') {
        setBackgrounds({
          backgrounds: [
            {
              style: { rotateAngle: 0, transform: '' },
              bgStyle: { rotateAngle: 0, transform: '', transformOrigin: 'center center' },
              className: 'background-left',
              src: backgroundFull.firstChild.src,
              imageurl: backgroundFull.firstChild.getAttribute('data-imageurl'),
            },
            {
              className: 'background-right',
              style: { top: 0, left: 0, rotateAngle: 0, transform: '' },
              bgStyle: { rotateAngle: 0, transform: '', transformOrigin: 'center center' },
              src: e.dataTransfer.getData('tempUrl'),
              imageurl: e.dataTransfer.getData('imageUrl'),
            },
            {
              bgStyle: { rotateAngle: 0, transform: '', transformOrigin: 'center center' },
              className: 'background-full',
            },
          ],
        })
      } else {
        setBackgrounds({
          backgrounds: [
            {
              className: 'background-right',
              style: { top: 0, left: 0, rotateAngle: 0, transform: '' },
              bgStyle: { rotateAngle: 0, transform: '', transformOrigin: 'center center' },
              src: e.dataTransfer.getData('tempUrl'),
              imageurl: e.dataTransfer.getData('imageUrl'),
            },
          ],
        })
      }
    }

    showCenterCircles()
  }

  const showCenterCircles = () => {
    const backgroundFull: any = document.querySelector('.background-full')
    if (backgroundFull.style.display === 'block') {
      const centerCircle: any = document.querySelector('.center-circle-middle')
      centerCircle.style.display = 'flex'
      return
    }

    const backgroundLeft: any = document.querySelector('.background-left')
    if (backgroundLeft.style.display === 'block') {
      const leftCircle: any = document.querySelector('.center-circle-left')
      leftCircle.style.display = 'flex'
    }

    const backgroundRight: any = document.querySelector('.background-right')
    if (backgroundRight.style.display === 'block') {
      const rightCircle: any = document.querySelector('.center-circle-right')
      rightCircle.style.display = 'flex'
    }
  }

  const hideCenterCircles = () => {
    const centerCircles: any = document.querySelectorAll('.center-circle')
    centerCircles.forEach((circle: any) => {
      circle.style.display = 'none'
    })
  }

  const backgroundReposition = (e: any, bgClass: string) => {
    e.stopPropagation()
    e.preventDefault()
    const _background: any = document.querySelector(bgClass)
    const _image = _background.firstChild
    if (!_image) {
      return
    }
    const scaled_container: any = document.querySelector('#scaled_container')
    const slide_container: any = document.querySelector('#slide')
    scaled_container.style.cursor = 'grab'

    const circle = e.target
    circle.style.display = 'none'

    _background.style.overflow = 'unset'
    if (slide_container) {
      slide_container.style.overflow = 'unset'
    }
    const { width: bgWidth, height: bgHeight } = getComputedStyle(_background)

    let startX = e.clientX / scale
    let startY = e.clientY / scale

    const onMouseMove = (sube: any) => {
      const clientX = sube.clientX / scale
      const clientY = sube.clientY / scale
      const deltaX = clientX - startX
      const deltaY = clientY - startY

      const { top, left, width, height } = getComputedStyle(_image)

      let t = parseFloat(top)
      let l = parseFloat(left)

      const heightDiff = parseFloat(bgHeight) - parseFloat(height)
      const widthDiff = parseFloat(bgWidth) - parseFloat(width)

      t += deltaY
      l += deltaX

      // if (Math.abs(t) < 10) t = 10
      // if (Math.abs(l) < 10) l = 10

      if (t <= 0 && Math.abs(t) <= Math.abs(heightDiff)) {
        _image.style.top = t + 'px'
      }

      if (l <= 0 && Math.abs(l) <= Math.abs(widthDiff)) {
        _image.style.left = l + 'px'
      }

      startX = clientX
      startY = clientY
    }

    const onMouseUp = () => {
      if (!updateHistory || !updateBackground) return
      scaled_container.style.cursor = 'default'
      circle.style.display = 'flex'
      _background.style.overflow = 'hidden'
      if (slide_container) {
        slide_container.style.overflow = 'hidden'
      }
      window.removeEventListener('mouseup', onMouseUp)
      window.removeEventListener('mousemove', onMouseMove)

      const className = bgClass.substr(1) // remove . from className

      const [background] = backgrounds.filter((b: BackgroundImage) => b.className === className)

      updateHistory(UPDATE_BACKGROUND, { background })

      updateBackground({
        background: {
          className,
          style: {
            ...background.style,
            top: _image.style.top,
            left: _image.style.left,
          },
        },
      })
    }

    window.addEventListener('mouseup', onMouseUp)
    window.addEventListener('mousemove', onMouseMove)
  }

  const onRotate = (angle: string) => {
    if (!updateHistory || !updateBackground || !selectedBG.length) return
    const [background] = backgrounds.filter((b: BackgroundImage) => b.className === selectedBG)
    const bgElement: any = document.querySelector(`.${selectedBG}`)
    const { width, height } = getComputedStyle(bgElement)
    let { rotateAngle = 0, transform = 'rotate(0deg) translateX(0px) translateY(0px)' } =
      background.bgStyle as StyleType
    if (!transform.match(/rotate\(([^)]+)\)/)) {
      transform += ' rotate(0deg)  translateX(0px) translateY(0px)'
    }
    const w = ParseNumber(height)
    const h = ParseNumber(width)
    let translateX = Math.abs(ParseNumber(width) - ParseNumber(height)) / 2
    let translateY = Math.abs(ParseNumber(width) - ParseNumber(height)) / 2
    if (angle === 'left') {
      rotateAngle = (rotateAngle || 360) - 90
    } else {
      rotateAngle = (rotateAngle >= 360 ? 0 : rotateAngle) + 90
    }
    if (rotateAngle % 180 === 0) {
      translateX = 0
      translateY = 0
    }
    if (rotateAngle === 90) {
      translateY = -translateY
      translateX = -translateX
    }
    if (background.bgStyle) {
      updateBackground({
        background: {
          ...background,
          bgStyle: {
            ...background.bgStyle,
            transform: transform
              .replace(/rotate\(([^)]+)\)/, `rotate(${rotateAngle}deg)`)
              .replace(/translateX\(([^)]+)\)/, `translateX(${translateX}px)`)
              .replace(/translateY\(([^)]+)\)/, `translateY(${translateY}px)`),
            height: h,
            width: w,
            rotateAngle,
          },
        },
      })
    }
  }
  const onFlip = () => {
    if (!updateHistory || !updateBackground || !selectedBG.length) return
    const [background] = backgrounds.filter((b: BackgroundImage) => b.className === selectedBG)
    let { transform = 'rotate(0deg) translateX(0px) translateY(0px)' } = background.style as StyleType
    if (!transform.match(/scaleX\(([^)]+)\)/) || transform.match(/scaleX\(([^)]+)\)/)?.length === 0) {
      transform += ' scaleX(1)'
    }
    console.log(transform)
    const scaleX = transform.match(/scaleX\(([^)]+)\)/)
    if (scaleX && scaleX[0] === 'scaleX(1)') {
      transform = transform.replace(/scaleX\(([^)]+)\)/, 'scaleX(-1)')
    } else {
      transform = transform.replace(/scaleX\(([^)]+)\)/, 'scaleX(1)')
    }
    if (background.bgStyle) {
      updateHistory(UPDATE_BACKGROUND, { background })
      updateBackground({
        background: {
          ...background,
          style: {
            ...background.style,
            transform,
          },
        },
      })
    }
  }
  const onRemove = () => {
    if (!updateHistory || !updateBackground || !selectedBG.length) return
    const [background] = backgrounds.filter((b: BackgroundImage) => b.className === selectedBG)
    updateHistory(UPDATE_BACKGROUND, { background })
    updateBackground({
      background: {
        ...background,
        src: '',
      },
    })
  }
  const updateObject = (_backgrounds: BackgroundImage[]) => {
    if (!updateHistory || !setBackgrounds) return
    const [background] = backgrounds.filter((b: BackgroundImage) => b.className === selectedBG)
    updateHistory(UPDATE_BACKGROUND, { background })
    setBackgrounds({ backgrounds: _backgrounds })
  }
  return (
    <>
      <div
        className="background-drop background-drop-left"
        onDragOver={onBackgroundDropDragOver}
        onDragLeave={onBackgroundDropDragLeave}
        onDrop={onBackgroundDropDragDrop}
      />
      <div
        className="background-drop background-drop-middle"
        onDragOver={onBackgroundDropDragOver}
        onDragLeave={onBackgroundDropDragLeave}
        onDrop={onBackgroundDropDragDrop}
      />
      <div
        className="background-drop background-drop-right"
        onDragOver={onBackgroundDropDragOver}
        onDragLeave={onBackgroundDropDragLeave}
        onDrop={onBackgroundDropDragDrop}
      />
      <div className="circle-container left" onClick={() => setSelectedBG('background-left')}>
        <div
          onMouseDown={(e) => backgroundReposition(e, '.background-left')}
          className="center-circle center-circle-left"
        >
          <BsArrowsMove className="drag-icon" />
        </div>
      </div>
      <div className="circle-container middle" onClick={() => setSelectedBG('background-full')}>
        <div
          onMouseDown={(e) => backgroundReposition(e, '.background-full')}
          className="center-circle center-circle-middle"
        >
          <BsArrowsMove className="drag-icon" />
        </div>
      </div>
      <div className="circle-container right" onClick={() => setSelectedBG('background-right')}>
        <div
          onMouseDown={(e) => backgroundReposition(e, '.background-right')}
          className="center-circle center-circle-right"
        >
          <BsArrowsMove className="drag-icon" />
        </div>
      </div>
      <div className={slideIndex === 0 ? 'book-spine-cover' : 'book-spine'} />
      {editor.backgroundEdit && (
        <Toolbar
          background={selectedBG}
          backgrounds={backgrounds}
          setBackgrounds={updateObject}
          rotateLeftObject={() => onRotate('left')}
          rotateRightObject={() => onRotate('right')}
          flipObject={() => onFlip()}
          removeObject={() => onRemove()}
        />
      )}
    </>
  )
}

export default BackgroundImages
