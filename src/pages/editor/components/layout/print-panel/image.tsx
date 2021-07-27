/* eslint-disable @typescript-eslint/ban-types */
import React, { useEffect, useRef, useState, useCallback } from 'react'
import { Tooltip } from 'antd'
import { InfoCircleOutlined } from '@ant-design/icons'
import { Cropper, PObject, SlideObject } from 'interfaces'
import { imageOnError, ParseNumber } from 'utils'
import { useThrottleFn } from 'ahooks'
import { centerToTL, degToRadian, getLength, getNewStyle, tLToCenter } from 'utils/transformer-lib'

interface Props extends React.HTMLProps<HTMLImageElement> {
  object: SlideObject
  scaleX: number
  scaleY: number
  updateObject?: (props: { object: PObject }, slideId: string | undefined) => void
  slideId: string
  style: any
  className: string
  tempUrl?: string
  imageUrl?: string
  imageStyle?: any
  updateUrl?: (url: string) => void
  resolution: { width: number; height: number }
  placeholderStyle?: Object
  disabled?: boolean
  isEditor?: boolean
  isPaperSizeChanged: boolean
  setIsPaperSizeChanged: any
}

const transformers = {
  n: 'bl',
  s: 'br',
  e: 'tr',
  w: 'tl',
}
const Image: React.FC<Props> = ({
  slideId,
  object,
  scaleX,
  scaleY,
  style,
  className,
  imageUrl,
  imageStyle,
  updateUrl,
  resolution,
  updateObject,
  disabled = false,
  isEditor = false,
  isPaperSizeChanged,
  setIsPaperSizeChanged,
}) => {
  const imageRef = useRef<any>(null)
  const [willBlur, setWillBlur] = useState<boolean>(false)
  const { run } = useThrottleFn(
    ({ t, l, w, h, rotateAngle }: { t: number; l: number; w: number; h: number; rotateAngle: number }) => {
      const resizers: any = document.querySelectorAll('.wrapper_container .resizer')
      resizers.forEach((r: any) => {
        const resize = getPosition(r.className.split(' ')[1], { width: w, top: t, left: l, height: h })
        r.style.left = ParseNumber(resize.left) + 'px'
        r.style.top = ParseNumber(resize.top) + 'px'
      })
    },
    { wait: 50 }
  )
  const [loader, setLoader] = useState(true)
  const countRef = useRef(0)

  const moveCropper = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.preventDefault()
    document.body.style.cursor = 'grab'
    const cropper = e?.target as HTMLElement
    // const originalWidth = imageRef.current.offsetWidth / 2 + imageRef.current.naturalWidth - cropper.offsetWidth
    // const originalHeight = imageRef.current.offsetHeight / 2 + imageRef.current.naturalHeight - cropper.offsetHeight
    let startX = e.clientX
    let startY = e.clientY

    const onMouseMove = (sube: any) => {
      sube.preventDefault()
      const { clientX, clientY } = sube

      const { rotateAngle = 0 } = object.props.imageStyle
      const deltaX = startX - clientX
      const deltaY = startY - clientY
      startX = clientX
      startY = clientY

      let t = cropper.offsetTop - deltaY / scaleX
      let l = cropper.offsetLeft - deltaX / scaleY
      if (t < imageRef.current.offsetTop) {
        t = imageRef.current.offsetTop
      } else if (t > imageRef.current.offsetTop + imageRef.current.offsetHeight - cropper.offsetHeight) {
        t = imageRef.current.offsetTop + imageRef.current.offsetHeight - cropper.offsetHeight
      }
      if (l < imageRef.current.offsetLeft) {
        l = imageRef.current.offsetLeft
      } else if (l > imageRef.current.offsetLeft + imageRef.current.offsetWidth - cropper.offsetWidth) {
        l = imageRef.current.offsetLeft + imageRef.current.offsetWidth - cropper.offsetWidth
      }

      if (
        imageRef.current.getBoundingClientRect().top <= sube.pageY &&
        imageRef.current.getBoundingClientRect().top + imageRef.current.getBoundingClientRect().height >= sube.pageY
      ) {
        cropper.style.top = t + 'px'
      } else if (imageRef.current.getBoundingClientRect().top > sube.pageY) {
        cropper.style.top = imageRef.current.offsetTop + 'px'
      } else {
        cropper.style.top = imageRef.current.offsetTop + imageRef.current.offsetHeight - cropper.offsetHeight + 'px'
      }
      if (
        imageRef.current.getBoundingClientRect().left <= sube.pageX &&
        imageRef.current.getBoundingClientRect().left + imageRef.current.getBoundingClientRect().width >= sube.pageX
      ) {
        cropper.style.left = l + 'px'
      } else if (imageRef.current.getBoundingClientRect().left > sube.pageX) {
        cropper.style.left = imageRef.current.offsetLeft + 'px'
      } else {
        cropper.style.left = imageRef.current.offsetLeft + imageRef.current.offsetWidth - cropper.offsetWidth + 'px'
      }
      run({ t, l, w: cropper.offsetWidth, h: cropper.offsetHeight, rotateAngle })
    }

    const onMouseUp = () => {
      document.body.style.cursor = 'default'

      const { top, left } = object.props.cropStyle as Cropper
      const newTop = parseFloat(cropper.style.top)
      const newLeft = parseFloat(cropper.style.left)
      if (parseFloat(top + '') !== newTop || parseFloat(left + '') !== newLeft) {
        if (updateObject) {
          updateObject(
            {
              object: {
                ...object,
                props: {
                  ...object.props,
                  cropStyle: {
                    ...(object.props?.cropStyle as Cropper),
                    top: newTop,
                    left: newLeft,
                  },
                },
              },
            },
            slideId
          )
        }
      }

      window.removeEventListener('mouseup', onMouseUp)
      window.removeEventListener('mousemove', onMouseMove)
    }

    window.addEventListener('mouseup', onMouseUp)
    window.addEventListener('mousemove', onMouseMove)
  }

  const resizeCropper = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, type: string) => {
    e.preventDefault()
    document.body.style.cursor = 'grab'
    const cropper = document.querySelector('.wrapper_container .cropper') as HTMLElement
    const originalWidth = imageRef.current.offsetWidth / 2 + imageRef.current.naturalWidth - cropper.offsetWidth
    // const originalHeight = imageRef.current.offsetHeight / 2 + imageRef.current.naturalHeight - cropper.offsetHeight
    const startX = e.clientX / scaleX
    const startY = e.clientY / scaleY
    if (!cropper) {
      return
    }
    const { top: t, left: l, width: w, height: h } = getComputedStyle(cropper)

    const { rotateAngle = 0 } = object.props.imageStyle
    const {
      position: { centerX, centerY },
      size: { width, height },
    } = tLToCenter({
      top: parseFloat(t),
      left: parseFloat(l),
      width: parseFloat(w),
      height: parseFloat(h),
    })
    const rect = { width, height, centerX, centerY, rotateAngle }
    let _isMouseDown = true
    const resizeObject = ({
      top,
      left,
      width: _width,
      height: _height,
    }: {
      top: number
      left: number
      width: number
      height: number
    }) => {
      let _t = top
      let _l = left
      const _w = _width
      const _h = _height
      if (_t < imageRef.current.offsetTop) {
        _t = 0
      } else if (_t > imageRef.current.offsetTop + imageRef.current.offsetHeight - cropper.offsetHeight) {
        _t = imageRef.current.offsetTop + imageRef.current.offsetHeight - cropper.offsetHeight
      }

      if (_l < imageRef.current.offsetWidth / 2 - imageRef.current.naturalWidth) {
        _l = imageRef.current.offsetWidth / 2 - imageRef.current.naturalWidth
      } else if (_l > originalWidth) {
        _l = originalWidth
      }

      // if (_t + _h <= originalHeight) {
      cropper.style.top = _t + 'px'
      cropper.style.left = _l + 'px'
      cropper.style.width = _w + 'px'
      cropper.style.height = _h + 'px'
      run({ t: _t, l: _l, w: _w, h: _h, rotateAngle })
      // }
    }
    const onResize = (
      length: number,
      alpha: number,
      _rect: {
        width: number
        height: number
        centerX: number
        centerY: number
        rotateAngle: number
      },
      isShiftKey: boolean
    ) => {
      const minWidth = 20 / scaleX
      const minHeight = 20 / scaleY

      const beta = alpha - degToRadian(_rect.rotateAngle)
      const deltaW = length * Math.cos(beta)
      const deltaH = length * Math.sin(beta)
      const ratio = isShiftKey ? _rect.width / _rect.height : undefined
      const {
        position: { centerX: newCenterX, centerY: newCenterY },
        size: { width: newWidth, height: newHeight },
      } = getNewStyle(type, { ..._rect, rotateAngle: _rect.rotateAngle }, deltaW, deltaH, ratio, minWidth, minHeight)

      resizeObject(
        centerToTL({
          centerX: newCenterX,
          centerY: newCenterY,
          width: newWidth,
          height: newHeight,
          rotateAngle: rect.rotateAngle,
        })
      )
    }
    const onMouseMove = (sube: any) => {
      if (!_isMouseDown) return
      sube.preventDefault()
      const clientX = sube.clientX / scaleX
      const clientY = sube.clientY / scaleY
      const deltaX = clientX - startX
      const deltaY = clientY - startY
      const alpha = Math.atan2(deltaY, deltaX)
      const deltaL = getLength(deltaX, deltaY)
      onResize(deltaL, alpha, rect, true)
    }
    const onMouseUp = () => {
      _isMouseDown = false
      document.body.style.cursor = 'default'

      const { top, left, width: _width, height: _height } = object.props.cropStyle as Cropper
      const newTop = parseFloat(cropper.style.top)
      const newLeft = parseFloat(cropper.style.left)
      const newWidth = parseFloat(cropper.style.width)
      const newHeight = parseFloat(cropper.style.height)
      if (
        ParseNumber(top) !== newTop ||
        ParseNumber(left) !== newLeft ||
        ParseNumber(_height) !== newHeight ||
        ParseNumber(_width) !== newWidth
      ) {
        if (updateObject) {
          updateObject(
            {
              object: {
                ...object,
                props: {
                  ...object.props,
                  cropStyle: {
                    ...(object.props?.cropStyle as Cropper),
                    top: newTop,
                    left: newLeft,
                    height: newHeight,
                    width: newWidth,
                  },
                },
              },
            },
            slideId
          )
        }
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

    const widthRatio = resolution.width / originalWidth
    const heightRatio = resolution.height / originalHeight

    if (widthRatio >= 0.2 && widthRatio <= 2 && heightRatio >= 0.2 && heightRatio <= 2) {
      return false
    }
    return true
  }

  const getPosition = (resizer: string, cropper?: Cropper) => {
    switch (resizer) {
      case 'bl':
        return {
          top: ParseNumber(cropper?.top) + ParseNumber(cropper?.height) - 10,
          left: ParseNumber(cropper?.left) - 10,
        }
      case 'br':
        return {
          top: ParseNumber(cropper?.top) + ParseNumber(cropper?.height) - 10,
          left: ParseNumber(cropper?.left) + ParseNumber(cropper?.width) - 10,
        }
      case 'tr':
        return {
          left: ParseNumber(cropper?.left) + ParseNumber(cropper?.width) - 10,
          top: ParseNumber(cropper?.top) - 10,
        }
      case 'tl':
        return {
          left: ParseNumber(cropper?.left) - 10,
          top: ParseNumber(cropper?.top) - 10,
        }
      default:
        return {}
    }
  }

  useEffect(() => {
    setWillBlur(checkRatio())
  }, [resolution]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const { cropStyle, imageStyle: imgStyle } = object.props
    run({
      t: ParseNumber(cropStyle?.top),
      h: ParseNumber(cropStyle?.height),
      l: ParseNumber(cropStyle?.left),
      w: ParseNumber(cropStyle?.width),
      rotateAngle: imgStyle.rotateAngle || 0,
    })
  }, [object.props.cropStyle])

  const { brightness = 100, contrast = 100, saturation = 100, filter = '' } = object.props.imageStyle
  const cropper = object.props.cropStyle
  const _filter = `${filter}brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`
  const cropperRatio = cropper ? cropper.width / cropper.height : 0

  const adjustCropper = useCallback(() => {
    if (!cropper) return

    const { width: w, height: h } = window.getComputedStyle(imageRef.current, null)
    const width = parseFloat(w)
    const height = parseFloat(h)

    if (width / height >= cropperRatio) {
      cropper.height = height
      cropper.width = cropper.height * cropperRatio
    } else {
      cropper.width = width
      cropper.height = cropper.width / cropperRatio
    }

    if (width / height > 1 && loader) {
      cropper.top = parseFloat(imageRef.current.offsetTop)
      cropper.left = (width - cropper.width) / 2
      setLoader(false)
    } else if (width / height <= 1 && loader) {
      cropper.left = parseFloat(imageRef.current.offsetLeft)
      cropper.top = (height - cropper.height) / 2
      setLoader(false)
    }

    if (cropper.left + cropper.width > imageRef.current.offsetLeft + imageRef.current.offsetWidth) {
      cropper.left = imageRef.current.offsetLeft + imageRef.current.offsetWidth - cropper.width
    }
    if (cropper.top + cropper.height > imageRef.current.offsetTop + imageRef.current.offsetHeight) {
      cropper.top = imageRef.current.offsetTop + imageRef.current.offsetHeight - cropper.height
    }
    console.log('cropper.height', cropper.height, 'h', h)

    setIsPaperSizeChanged(false)
  }, [cropper, cropperRatio, loader, setIsPaperSizeChanged])

  useEffect(() => {
    if (isPaperSizeChanged) adjustCropper()
  }, [isPaperSizeChanged])

  return (
    <div
      className={`${className} flex justify-center items-center`}
      style={{
        ...style,
        overflow: 'hidden',
        borderStyle: 'solid',
      }}
    >
      <img
        ref={imageRef}
        alt="object"
        draggable={false}
        className="image"
        data-imageurl={imageUrl}
        style={{
          ...imageStyle,
          filter: _filter,
          objectFit: 'contain',
        }}
        onLoad={isEditor ? () => setLoader(false) : adjustCropper}
        src={`${process.env.REACT_APP_PUBLIC_IMAGE}${imageUrl}`}
        onError={(e) => imageOnError(e, imageUrl, updateUrl)}
      />
      {imageUrl && willBlur && (
        <Tooltip title="It will be blurred">
          <div className="status">
            <InfoCircleOutlined />
          </div>
        </Tooltip>
      )}
      {!loader && (
        <div
          className="cropper"
          id="cropper"
          onMouseDown={moveCropper}
          style={{
            left: cropper?.left,
            top: cropper?.top,
            width: cropper?.width,
            height: cropper?.height,
            pointerEvents: disabled ? 'none' : 'visible',
          }}
        />
      )}
      {Object.keys(transformers).map((t: string) => {
        return (
          <div
            key={t}
            onMouseDown={(e) => resizeCropper(e, transformers[t])}
            className={`resizer ${transformers[t]}`}
            style={{ pointerEvents: disabled ? 'none' : 'visible', display: disabled ? 'none' : 'block' }}
          />
        )
      })}
    </div>
  )
}

export default Image
