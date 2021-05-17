import React, { useEffect } from 'react'
import { BsArrowsMove } from 'react-icons/bs'
import { SET_BACKGROUNDS, UPDATE_BACKGROUND } from 'redux/actions/types'
import { BackgroundImage, EditorInterface, HistoryProps } from 'interfaces'

interface Props {
  editor: EditorInterface
  scale: number
  slideIndex?: number
  backgrounds: BackgroundImage[]
  setBackgrounds: (props: { backgrounds: BackgroundImage[] }) => void
  updateBackground: (props: { background: BackgroundImage }) => void
  updateHistory: (historyType: string, props: HistoryProps) => void
  deselectObject: () => void
  onBackgroundDropDragOver: (e: any) => void
  onBackgroundDropDragLeave: (e: any) => void
}

const BackgroundImages: React.FC<Props> = ({
  editor,
  scale,
  slideIndex,
  backgrounds,
  setBackgrounds,
  updateBackground,
  updateHistory,
  deselectObject,
  onBackgroundDropDragOver,
  onBackgroundDropDragLeave,
}) => {
  useEffect(() => {
    const container: HTMLDivElement | null = document.querySelector('#container')
    if (editor.backgroundEdit) {
      hideCenterCircles()
      showCenterCircles()
      if (deselectObject) {
        deselectObject()
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

    const backgroundFull: any = document.querySelector('.background-full')

    updateHistory(SET_BACKGROUNDS, { backgrounds })

    if (e.target.classList.contains('background-drop-left')) {
      if (backgroundFull?.style.display === 'block') {
        setBackgrounds({
          backgrounds: [
            {
              className: 'background-right',
              style: { top: 0, left: 0 },
              src: backgroundFull?.firstChild?.src,
              imageurl: backgroundFull?.firstChild.getAttribute('data-imageurl'),
            },
            {
              className: 'background-left',
              style: { top: 0, left: 0 },
              src: e.dataTransfer.getData('tempUrl'),
              imageurl: e.dataTransfer.getData('imageUrl'),
            },
            {
              className: 'background-full',
            },
          ],
        })
      } else {
        setBackgrounds({
          backgrounds: [
            {
              className: 'background-left',
              style: { top: 0, left: 0 },
              src: e.dataTransfer.getData('tempUrl'),
              imageurl: e.dataTransfer.getData('imageUrl'),
            },
          ],
        })
      }
    } else if (e.target.classList.contains('background-drop-middle')) {
      setBackgrounds({
        backgrounds: [
          {
            className: 'background-full',
            style: { top: 0, left: 0 },
            src: e.dataTransfer.getData('tempUrl'),
            imageurl: e.dataTransfer.getData('imageUrl'),
          },
          {
            className: 'background-left',
          },
          {
            className: 'background-right',
          },
        ],
      })
    } else if (e.target.classList.contains('background-drop-right')) {
      if (backgroundFull.style.display === 'block') {
        setBackgrounds({
          backgrounds: [
            {
              className: 'background-left',
              src: backgroundFull.firstChild.src,
              imageurl: backgroundFull.firstChild.getAttribute('data-imageurl'),
            },
            {
              className: 'background-right',
              style: { top: 0, left: 0 },
              src: e.dataTransfer.getData('tempUrl'),
              imageurl: e.dataTransfer.getData('imageUrl'),
            },
            {
              className: 'background-full',
            },
          ],
        })
      } else {
        setBackgrounds({
          backgrounds: [
            {
              className: 'background-right',
              style: { top: 0, left: 0 },
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
    const scaled_container: any = document.querySelector('#scaled_container')
    scaled_container.style.cursor = 'grab'

    const circle = e.target
    circle.style.display = 'none'

    const _background: any = document.querySelector(bgClass)
    const _image = _background.firstChild
    _background.style.overflow = 'unset'

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

      if (Math.abs(t) < 10) t = 0
      if (Math.abs(l) < 10) l = 0

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
      scaled_container.style.cursor = 'default'
      circle.style.display = 'flex'
      _background.style.overflow = 'hidden'
      window.removeEventListener('mouseup', onMouseUp)
      window.removeEventListener('mousemove', onMouseMove)

      const className = bgClass.substr(1) // remove . from className

      const [background] = backgrounds.filter((b: BackgroundImage) => b.className === className)

      updateHistory(UPDATE_BACKGROUND, { background })

      updateBackground({
        background: {
          className,
          style: {
            top: _image.style.top,
            left: _image.style.left,
          },
        },
      })
    }

    window.addEventListener('mouseup', onMouseUp)
    window.addEventListener('mousemove', onMouseMove)
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
      <div
        onMouseDown={(e) => backgroundReposition(e, '.background-left')}
        className="center-circle center-circle-left"
      >
        <BsArrowsMove className="drag-icon" />
      </div>
      <div
        onMouseDown={(e) => backgroundReposition(e, '.background-full')}
        className="center-circle center-circle-middle"
      >
        <BsArrowsMove className="drag-icon" />
      </div>
      <div
        onMouseDown={(e) => backgroundReposition(e, '.background-right')}
        className="center-circle center-circle-right"
      >
        <BsArrowsMove className="drag-icon" />
      </div>
      <div className={slideIndex === 0 ? 'book-spine-cover' : 'book-spine'} />
    </>
  )
}

export default BackgroundImages
