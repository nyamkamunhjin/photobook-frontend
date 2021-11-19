/* eslint-disable @typescript-eslint/ban-types */
import React, { useEffect, useRef, useState } from 'react'
import { Tooltip } from 'antd'
import { InfoCircleOutlined } from '@ant-design/icons'
import { BsArrowsMove } from 'react-icons/bs'
import { ColorPreset, PObject, SlideObject, TemplateType } from 'interfaces'
import { UPDATE_OBJECT } from 'redux/actions/types'
import { imageOnError } from 'utils'
import { checkPrintQuality } from 'utils/image-lib'

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
  slideWidth: number
  slideHeight: number
  templateType?: TemplateType
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
  slideWidth,
  slideHeight,
  templateType,
}) => {
  const imageRef = useRef<any>(null)
  const [willBlur, setWillBlur] = useState<boolean>(false)
  const [overflow, setOverflow] = useState<string>('hidden')
  // const [mask, setMask] = useState<any>(object?.props?.maskOptions?.fullHidden)

  const imageReposition = (e: any) => {
    console.log('imageReposition')
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

    const frameBorder = parseFloat(object?.props?.frameStyle?.borderWidth || '0')

    // setMask(object?.props?.maskOptions?.halfHidden)
    // ;(placeholder.style as React.CSSProperties).WebkitMaskImage =
    //   object?.props?.maskOptions?.halfHidden.maskStyle?.WebkitMaskImage || ''
    // ;(placeholder.style as React.CSSProperties).maskImage = object?.props?.maskOptions?.halfHidden.maskStyle?.maskImage

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

      // if (Math.abs(t) < 10) t = 0
      // if (Math.abs(l) < 10) l = 0

      if (((border || frameBorder) && heightDiff >= 0) || (t <= 0 && t > -(border || frameBorder))) {
        image.style.top = `-${border || frameBorder}px`
      } else if (heightDiff >= 0) {
        image.style.top = '0px'
      } else if (t <= -border && Math.abs(t) <= Math.abs(heightDiff - (border || frameBorder))) {
        image.style.top = t + 'px'
      }

      if (((border || frameBorder) && widthDiff >= 0) || (l <= 0 && l > -(border || frameBorder))) {
        image.style.left = `-${border || frameBorder}px`
        // console.log('image.style.left 1')
      } else if (widthDiff >= 0) {
        image.style.left = '0px'
        // console.log('image.style.left 2')
      } else if (l <= -(border || frameBorder) && Math.abs(l) <= Math.abs(widthDiff - (border || frameBorder))) {
        image.style.left = l + 'px'
        // console.log('image.style.left 3', 'border', border, 'frameBorder', frameBorder)
      }

      startX = clientX
      startY = clientY
    }

    const onMouseUp = () => {
      if (!updateObject || !updateHistory) return
      document.body.style.cursor = 'default'
      circle.style.display = 'flex'
      setOverflow('hidden')

      // setMask(object?.props?.maskOptions?.fullHidden)
      // ;(placeholder.style as React.CSSProperties).WebkitMaskImage =
      //   object?.props?.maskOptions?.fullHidden.maskStyle?.WebkitMaskImage || ''
      // ;(placeholder.style as React.CSSProperties).maskImage =
      //   object?.props?.maskOptions?.fullHidden.maskStyle?.maskImage

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

  // const checkRatio = () => {
  //   const originalWidth = imageRef.current.naturalWidth
  //   const originalHeight = imageRef.current.naturalHeight

  //   const widthRatio = width / originalWidth
  //   const heightRatio = height / originalHeight

  //   if (widthRatio >= 0.2 && widthRatio <= 2 && heightRatio >= 0.2 && heightRatio <= 2) {
  //     return false
  //   }

  //   return true
  // }

  useEffect(() => {
    if (templateType && templateType.imageQuality) setWillBlur(!checkPrintQuality(object, templateType))
  }, [width, height]) // eslint-disable-line react-hooks/exhaustive-deps

  const { brightness = 100, contrast = 100, saturation = 100, filter = '' } = object.props.imageStyle

  const _filter = `${filter}brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`

  const minSize = slideHeight && slideWidth && slideHeight > slideWidth ? slideWidth : slideHeight
  // console.log('Image-split edit', edit)

  return (
    <div
      className={className}
      style={{
        ...style,
        overflow,
        transform: '',
      }}
    >
      <div className="border" />
      <div className="background" style={placeholderStyle} hidden={!edit} />
      {imageRef?.current && (
        <div
          className="absolute z-50 mix-blend-overlay"
          style={{
            height: imageStyle.height,
            width: imageStyle.width,
            top: 0,
            left: 0,
            ...object?.props?.colorPreset?.style,
          }}
        />
      )}
      <div
        className={className}
        style={{
          ...style,
          overflow,
          WebkitMaskSize: '100% 100%',
          maskSize: 'cover',
          WebkitMaskRepeat: 'no-repeat',
          ...((edit
            ? object?.props?.maskOptions?.halfHidden.maskStyle
            : object?.props?.maskOptions?.fullHidden.maskStyle) || {}),
          transform: '',
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
          width: `${minSize * 0.1}px`,
          height: `${minSize * 0.1}px`,
        }}
        onMouseDown={(e) => imageReposition(e)}
        className="image-center"
      >
        <BsArrowsMove className={`drag-icon ${minSize && 'h-1/2'}`} />
      </div>
      {imageUrl && willBlur && (
        <Tooltip title="It will be blurred">
          <div className="status">
            <InfoCircleOutlined style={edit ? { fontSize: 4 } : {}} />
          </div>
        </Tooltip>
      )}
    </div>
  )
}

export default Image
