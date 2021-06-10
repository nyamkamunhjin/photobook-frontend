/* eslint-disable @typescript-eslint/ban-types */
import React, { useEffect, useRef, useState } from 'react'
import { Tooltip } from 'antd'
import { InfoCircleOutlined, PlusSquareOutlined } from '@ant-design/icons'
import { BsArrowsMove } from 'react-icons/bs'
import { PObject, SlideObject } from 'interfaces'
import { imageOnError } from 'utils'

interface Props extends React.HTMLProps<HTMLImageElement> {
  object: SlideObject
  updateObject?: (props: { object: PObject }) => void
  style: any
  className: string
  edit?: boolean
  tempUrl?: string
  imageUrl?: string
  imageStyle?: any
  updateUrl?: (url: string) => void
  resolution: { width: number; height: number }
  placeholderStyle?: Object
}

const Image: React.FC<Props> = ({
  object,
  updateObject,
  style,
  className,
  tempUrl,
  edit = true,
  imageUrl,
  imageStyle,
  updateUrl,
  resolution: { width, height },
  placeholderStyle,
}) => {
  const imageRef = useRef<any>(null)
  const [willBlur, setWillBlur] = useState<boolean>(false)
  const [overflow, setOverflow] = useState<string>('hidden')

  const imageReposition = (e: any) => {
    document.body.style.cursor = 'grab'
    const circle = e.target
    circle.style.display = 'none'
    setOverflow('unset')

    const _object = document.getElementById(object.id) as HTMLElement
    const placeholder = _object.firstChild as HTMLElement
    const image = placeholder.childNodes[2] as HTMLElement

    const { width: pWidth, height: pHeight } = getComputedStyle(placeholder)

    let startX = e.clientX
    let startY = e.clientY

    const onMouseMove = (sube: any) => {
      const { clientX, clientY } = sube
      const deltaX = clientX - startX
      const deltaY = clientY - startY

      const { top, left, width: _width, height: _height } = getComputedStyle(image)

      let t = parseFloat(top)
      let l = parseFloat(left)

      const heightDiff = parseFloat(pHeight) - parseFloat(_height)
      const widthDiff = parseFloat(pWidth) - parseFloat(_width)

      t += deltaY
      l += deltaX

      if (Math.abs(t) < 10) t = 0
      if (Math.abs(l) < 10) l = 0

      if (t <= 0 && Math.abs(t) <= Math.abs(heightDiff)) {
        image.style.top = t + 'px'
      }

      if (l <= 0 && Math.abs(l) <= Math.abs(widthDiff)) {
        image.style.left = l + 'px'
      }

      startX = clientX
      startY = clientY
    }

    const onMouseUp = () => {
      if (!updateObject) return
      document.body.style.cursor = 'default'
      circle.style.display = 'flex'
      setOverflow('hidden')

      const { top, left } = object.props.imageStyle
      const newTop = parseFloat(image.style.top)
      const newLeft = parseFloat(image.style.left)
      if (parseFloat(top + '') !== newTop || parseFloat(left + '') !== newLeft) {
        updateObject({
          object: {
            ...object,
            props: {
              ...object.props,
              imageStyle: {
                ...object.props.imageStyle,
                top: newTop,
                left: newLeft,
              },
            },
          },
        })
      }

      window.removeEventListener('mouseup', onMouseUp)
      window.removeEventListener('mousemove', onMouseMove)
    }

    window.addEventListener('mouseup', onMouseUp)
    window.addEventListener('mousemove', onMouseMove)
  }

  const checkRatio = () => {
    const originalWidth = imageRef.current.naturalWidth
    const originalHeight = imageRef.current.naturalHeight

    const widthRatio = width / originalWidth
    const heightRatio = height / originalHeight

    if (widthRatio >= 0.2 && widthRatio <= 2 && heightRatio >= 0.2 && heightRatio <= 2) {
      return false
    }

    return true
  }

  useEffect(() => {
    setWillBlur(checkRatio())
  }, [width, height]) // eslint-disable-line react-hooks/exhaustive-deps

  const { brightness = 100, contrast = 100, saturation = 100, filter = '' } = object.props.imageStyle
  const { rgb, opacity = '100%' } = object?.props?.frameStyle || {}

  const borderColor = rgb ? `rgba(${rgb.r},${rgb.g},${rgb.b},${opacity})` : '#000'
  const _filter = `${filter}brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`

  return (
    <div
      className={className}
      style={{
        ...style,
        ...(object?.props?.frameStyle || {}),
        overflow,
        borderStyle: 'solid',
        borderColor,
      }}
    >
      <div className="border" />
      <div className="background" style={placeholderStyle} hidden={!edit} />
      <img
        ref={imageRef}
        alt="object"
        className="image"
        data-imageurl={imageUrl}
        style={{
          ...imageStyle,
          filter: _filter,
          // WebkitMaskSize: `${width - _borderWidth * 2}px ${height - _borderWidth * 2}px`,
          WebkitMaskSize: 'contain',
          WebkitMaskRepeat: 'no-repeat',
          ...(object?.props?.maskStyle || {}),
        }}
        src={`${process.env.REACT_APP_PUBLIC_IMAGE}${imageUrl}`}
        onError={(e) => imageOnError(e, imageUrl, updateUrl)}
      />
      <PlusSquareOutlined
        className="plus"
        style={{ display: imageStyle.display === 'none' && edit ? 'block' : 'none' }}
      />
      {imageUrl && willBlur && (
        <Tooltip title="It will be blurred">
          <div className="status">
            <InfoCircleOutlined />
          </div>
        </Tooltip>
      )}
      {/* <div style={{borderColor, borderWidth, opacity}} className="frame"></div> */}
      <div
        style={{
          visibility: imageStyle.display === 'none' ? 'hidden' : 'visible',
        }}
        onMouseDown={(e) => imageReposition(e)}
        className="image-center"
      >
        <BsArrowsMove className="drag-icon" />
      </div>
    </div>
  )
}

export default Image
