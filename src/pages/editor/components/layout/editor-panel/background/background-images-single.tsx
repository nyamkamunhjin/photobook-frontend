import React, { useEffect } from 'react'
import { BsArrowsMove } from 'react-icons/bs'
import { SET_BACKGROUNDS, UPDATE_BACKGROUND } from 'redux/actions/types'
import { BackgroundImage, EditorInterface, HistoryProps } from 'interfaces'

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
  backgrounds,
  setBackgrounds,
  updateBackground,
  updateHistory,
  deSelectObject,
  onBackgroundDropDragOver,
  onBackgroundDropDragLeave,
}) => {
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
    updateHistory(SET_BACKGROUNDS, { backgrounds })

    if (e.target.classList.contains('background-drop-full')) {
      setBackgrounds({
        backgrounds: [
          {
            className: 'background-full',
            style: { top: 0, left: 0 },
            src: e.dataTransfer.getData('tempUrl'),
            imageurl: e.dataTransfer.getData('imageUrl'),
            props: {
              imgStyle: {
                scale: 1,
              },
            },
          },
          {
            className: 'background-left',
            props: {
              imgStyle: {
                scale: 1,
              },
            },
          },
          {
            className: 'background-right',
            props: {
              imgStyle: {
                scale: 1,
              },
            },
          },
        ],
      })
    }

    showCenterCircles()
  }

  const showCenterCircles = () => {
    const centerCircle: any = document.querySelector('.center-circle-middle')
    centerCircle.style.display = 'flex'
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
      if (!updateHistory || !updateBackground) return
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
          ...background,
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
        className="background-drop background-drop-full"
        onDragOver={onBackgroundDropDragOver}
        onDragLeave={onBackgroundDropDragLeave}
        onDrop={onBackgroundDropDragDrop}
      />
      <div
        onMouseDown={(e) => backgroundReposition(e, '.background-full')}
        className="center-circle center-circle-middle"
      >
        <BsArrowsMove className="drag-icon" />
      </div>
    </>
  )
}

export default BackgroundImages
