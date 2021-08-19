/* eslint-disable @typescript-eslint/ban-types */
import React, { useEffect, useRef, useState } from 'react'
import { Tooltip } from 'antd'
import { InfoCircleOutlined, PlusSquareOutlined } from '@ant-design/icons'
import { BsArrowsMove } from 'react-icons/bs'
import { ColorPreset, PObject, SlideObject } from 'interfaces'
import { UPDATE_OBJECT } from 'redux/actions/types'
import { imageOnError } from 'utils'

interface Props {
  scale: number
  zoom: number
  object: SlideObject
  updateObject?: (props: { object: PObject }) => void
  updateHistory?: (historyType: string, props: any) => void
  style: any
  className: string
  edit?: boolean
  tempUrl?: string
  imageUrl?: string
  colorPreset?: ColorPreset
  imageStyle?: any
  updateUrl: (url: string) => void
  resolution: { width: number; height: number }
  placeholderStyle: Object
  border: number
  mustHaveImageCenter: boolean
  isMontage: boolean
  frameMontage?: {
    url: string
    tempUrl: string
  }
}

const Image: React.FC<Props> = ({
  scale,
  object,
  updateObject,
  updateHistory,
  style,
  className,
  tempUrl,
  edit = true,
  imageUrl,
  imageStyle,
  updateUrl,
  resolution: { width, height },
  placeholderStyle,
  border = 0,
  mustHaveImageCenter = false,
  isMontage = false,
  frameMontage,
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
    const image = placeholder.querySelector('img') as HTMLElement

    const { width: pWidth, height: pHeight } = getComputedStyle(placeholder)

    let startX = e.clientX / scale
    let startY = e.clientY / scale

    const onMouseMove = (sube: any) => {
      const clientX = sube.clientX / scale
      const clientY = sube.clientY / scale
      const deltaX = clientX - startX
      const deltaY = clientY - startY

      const { top, left, width: _width, height: _height } = getComputedStyle(image)
      const zoom = parseFloat(image.style.transform?.match(/scale\(([^)]+)\)/)?.[1] || '1')
      let t = parseFloat(top)
      let l = parseFloat(left)

      const heightDiff = parseFloat(pHeight) - parseFloat(_height) * zoom
      const widthDiff = parseFloat(pWidth) - parseFloat(_width) * zoom

      t += deltaY
      l += deltaX

      if (Math.abs(t) < 10) t = 0
      if (Math.abs(l) < 10) l = 0

      if ((border && heightDiff >= 0) || (t <= 0 && t > -border)) {
        image.style.top = `-${border}px`
      } else if (heightDiff >= 0) {
        image.style.top = '0px'
      } else if (t <= -border && Math.abs(t) <= Math.abs(heightDiff - border)) {
        image.style.top = t + 'px'
      }

      if ((border && widthDiff >= 0) || (l <= 0 && l > -border)) {
        image.style.left = `-${border}px`
      } else if (widthDiff >= 0) {
        image.style.left = '0px'
      } else if (l <= -border && Math.abs(l) <= Math.abs(widthDiff - border)) {
        image.style.left = l + 'px'
      }

      startX = clientX
      startY = clientY
    }

    const onMouseUp = () => {
      if (!updateObject || !updateHistory) return
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

        updateHistory(UPDATE_OBJECT, { object })
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
  console.log('imageStyle', imageStyle)

  return (
    <div
      className={className}
      style={
        border
          ? {
              ...style,
              ...(object?.props?.frameStyle || {}),
              overflow,
              borderStyle: 'solid',
              borderColor: border ? 'transparent' : borderColor,
              borderWidth: `${border}px`,
              transform: mustHaveImageCenter || isMontage ? '' : style.transform,
            }
          : {
              ...style,
              ...(object?.props?.frameStyle || {}),
              overflow,
              borderStyle: 'solid',
              borderColor: border ? 'transparent' : borderColor,
              transform: mustHaveImageCenter || isMontage ? '' : style.transform,
            }
      }
    >
      <div className="border" />
      <div className="background" style={placeholderStyle} hidden={!edit} />
      {imageRef?.current && (
        <div
          className="absolute z-50 mix-blend-overlay"
          style={{
            height: imageStyle.height,
            width: imageStyle.width,
            top: imageStyle.top,
            left: getComputedStyle(imageRef.current).left,
            ...object?.props?.colorPreset?.style,
          }}
        />
      )}
      {/* (mustHaveImageCenter || isMontage) */}
      {true && (
        <>
          <div
            className={className}
            style={{
              ...style,
              ...(object?.props?.frameStyle || {}),
              overflow,
              // borderStyle: 'solid',
              // borderColor: border ? 'transparent' : borderColor,
              // borderWidth: `${border}px`,
              WebkitMaskSize: !mustHaveImageCenter ? '102% 100%, auto, contain' : 'contain',
              WebkitMaskRepeat: 'no-repeat',
              ...(object?.props?.maskStyle || {}),
            }}
          >
            <img
              ref={imageRef}
              alt="object"
              className="image"
              data-imageurl={imageUrl}
              style={{
                ...imageStyle,
                filter: _filter,
                transformOrigin: 'left top',
              }}
              src={tempUrl}
              onError={(e) => imageOnError(e, imageUrl, updateUrl)}
            />
          </div>
          <div
            style={{
              visibility: imageStyle.display === 'none' ? 'hidden' : 'visible',
            }}
            onMouseDown={(e) => imageReposition(e)}
            className="image-center"
          >
            <BsArrowsMove className="drag-icon" />
          </div>
        </>
      )}
      {frameMontage && (
        <img
          alt="object"
          // className="frame"
          data-imageurl={frameMontage.url}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'fill',
            overflow: 'hidden',
          }}
          src={frameMontage.tempUrl}
        />
      )}
      {/* {!mustHaveImageCenter && !isMontage && (
        <>
          <img
            ref={imageRef}
            alt="object"
            className="image"
            data-imageurl={imageUrl}
            style={{
              ...imageStyle,
              filter: _filter,
              transformOrigin: 'left top',
            }}
            src={tempUrl}
            onError={(e) => imageOnError(e, imageUrl, updateUrl)}
          />
          <div
            style={{ visibility: imageStyle.display === 'none' ? 'hidden' : 'visible' }}
            onMouseDown={(e) => imageReposition(e)}
            className="image-center"
          >
            <BsArrowsMove className="drag-icon" />
          </div>
        </>
      )} */}
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
    </div>
  )
}

export default Image
