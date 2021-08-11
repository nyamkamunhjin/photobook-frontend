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
  changeReq: any
  setChangeReq: any
  cropperCenter?: { top: number; left: number }
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
  changeReq,
  setChangeReq,
  cropperCenter,
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
  const [_cropperRatio, set_CropperRatio] = useState(0)
  const _cropperAngle = useRef(0)

  const moveCropper = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.preventDefault()
    document.body.style.cursor = 'grab'
    const cropper = e?.target as HTMLElement
    // const originalWidth = imageRef.current.offsetWidth / 2 + imageRef.current.naturalWidth - cropper.offsetWidth
    // const originalHeight = imageRef.current.offsetHeight / 2 + imageRef.current.naturalHeight - cropper.offsetHeight
    let startX = e.clientX
    let startY = e.clientY

    let {
      offsetTop: img_offsetTop,
      offsetLeft: img_offsetLeft,
      offsetHeight: img_offsetHeight,
      offsetWidth: img_offsetWidth,
    } = imageRef.current
    const { rotateAngle = 0 } = object.props.imageStyle

    if (rotateAngle % 180 !== 0) {
      const _img_offsetTop = img_offsetTop
      const _img_offsetWidth = img_offsetWidth
      img_offsetTop = img_offsetLeft
      img_offsetLeft = _img_offsetTop
      img_offsetWidth = img_offsetHeight
      img_offsetHeight = _img_offsetWidth
    }

    const onMouseMove = (sube: any) => {
      sube.preventDefault()
      const { clientX, clientY } = sube

      const deltaX = startX - clientX
      const deltaY = startY - clientY
      startX = clientX
      startY = clientY

      let t = cropper.offsetTop - deltaY / scaleX
      let l = cropper.offsetLeft - deltaX / scaleY
      if (t < img_offsetTop) {
        t = img_offsetTop
      } else if (t > img_offsetTop + img_offsetHeight - cropper.offsetHeight) {
        t = img_offsetTop + img_offsetHeight - cropper.offsetHeight
      }
      if (l < img_offsetLeft) {
        l = img_offsetLeft
      } else if (l > img_offsetLeft + img_offsetWidth - cropper.offsetWidth) {
        l = img_offsetLeft + img_offsetWidth - cropper.offsetWidth
      }

      if (
        imageRef.current.getBoundingClientRect().top <= sube.pageY &&
        imageRef.current.getBoundingClientRect().top + imageRef.current.getBoundingClientRect().height >= sube.pageY
      ) {
        cropper.style.top = t + 'px'
      } else if (imageRef.current.getBoundingClientRect().top > sube.pageY) {
        cropper.style.top = img_offsetTop + 'px'
      } else {
        cropper.style.top = img_offsetTop + img_offsetHeight - cropper.offsetHeight + 'px'
      }
      if (
        imageRef.current.getBoundingClientRect().left <= sube.pageX &&
        imageRef.current.getBoundingClientRect().left + imageRef.current.getBoundingClientRect().width >= sube.pageX
      ) {
        cropper.style.left = l + 'px'
      } else if (imageRef.current.getBoundingClientRect().left > sube.pageX) {
        cropper.style.left = img_offsetLeft + 'px'
      } else {
        cropper.style.left = img_offsetLeft + img_offsetWidth - cropper.offsetWidth + 'px'
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

    let {
      offsetTop: img_offsetTop,
      offsetLeft: img_offsetLeft,
      offsetHeight: img_offsetHeight,
      offsetWidth: img_offsetWidth,
    } = imageRef.current
    if (rotateAngle % 180 !== 0) {
      const _img_offsetTop = img_offsetTop
      const _img_offsetWidth = img_offsetWidth
      img_offsetTop = img_offsetLeft
      img_offsetLeft = _img_offsetTop
      img_offsetWidth = img_offsetHeight
      img_offsetHeight = _img_offsetWidth
    }

    const { top: imgTop, left: imgLeft, width: imgWidth, height: imgHeight } = imageRef.current.getBoundingClientRect()

    // console.log('_cropperRatio', _cropperRatio, 'type', type)

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
      let _w = _width
      const _h = _height

      if (_t < img_offsetTop) {
        _t = img_offsetTop
      } else if (_t > img_offsetTop + img_offsetHeight - cropper.offsetHeight) {
        _t = img_offsetTop + img_offsetHeight - cropper.offsetHeight
      }
      if (_l < img_offsetLeft) {
        _l = img_offsetLeft
      } else if (_l > img_offsetLeft + img_offsetWidth - cropper.offsetWidth) {
        _l = img_offsetLeft + img_offsetWidth - cropper.offsetWidth
      }

      // console.log('_w / _h', _w / _h, 'startX', startX, 'startY', startY)

      _w = _h * _cropperRatio

      if (_h > img_offsetHeight || _w > img_offsetWidth) return

      cropper.style.width = _w + 'px'
      cropper.style.height = _h + 'px'

      if (type.includes('t') && type.includes('l')) {
        cropper.style.top = _t + 'px'
        cropper.style.left = _l + 'px'
      } else if (type.includes('l')) {
        cropper.style.left = _l + 'px'
      } else if (type.includes('t')) {
        cropper.style.top = _t + 'px'
      }

      run({ t: _t, l: _l, w: _w, h: _h, rotateAngle })
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

      const {
        top: cropperTop,
        left: cropperLeft,
        width: cropperWidth,
        height: cropperHeight,
      } = cropper.getBoundingClientRect()

      const { clientX, clientY } = sube
      if (startX === clientX && startY === clientY) return

      let _t = cropper.offsetTop
      let _l = cropper.offsetLeft
      let _w = cropper.offsetWidth
      let _h = cropper.offsetHeight

      if (type === 'tl') {
        const deltaX = Math.abs(cropperLeft - sube.pageX)
        const deltaY = Math.abs(cropperTop - sube.pageY)

        if (cropperLeft > sube.pageX || cropperTop > sube.pageY) {
          if (deltaX > deltaY) {
            const delta = deltaX * scaleX
            _w += delta
            _l -= delta
            _h = _w / _cropperRatio
            _t = cropper.offsetTop + cropper.offsetHeight - _h
          } else {
            const delta = deltaY * scaleY
            _h += delta
            _t -= delta
            _w = _h * _cropperRatio
            _l = cropper.offsetLeft + cropper.offsetWidth - _w
          }
        } else if (deltaX > deltaY) {
          const delta = deltaX * scaleX
          _w -= delta
          _l += delta
          _h = _w / _cropperRatio
          _t = cropper.offsetTop + cropper.offsetHeight - _h
        } else {
          const delta = deltaY * scaleY
          _h -= delta
          _t += delta
          _w = _h * _cropperRatio
          _l = cropper.offsetLeft + cropper.offsetWidth - _w
        }

        if (img_offsetTop > _t) {
          _h = _h - img_offsetTop + _t
          _t = img_offsetTop
          _w = _h * _cropperRatio
          _l = cropper.offsetLeft + cropper.offsetWidth - _w
        }
        if (img_offsetLeft > _l) {
          _w = _w - img_offsetLeft + _l
          _l = img_offsetLeft
          _h = _w / _cropperRatio
          _t = cropper.offsetTop + cropper.offsetHeight - _h
        }
        if (
          img_offsetTop + img_offsetHeight - _t >= 40 &&
          img_offsetLeft + img_offsetWidth - _l >= 40 * cropperRatio &&
          _h < 40
        ) {
          _h = 40
          _t = cropper.offsetTop + cropper.offsetHeight - _h
          _w = _h * _cropperRatio
          _l = cropper.offsetLeft + cropper.offsetWidth - _w
        } else if (_h < 40) return
      } else if (type === 'tr') {
        const deltaX = Math.abs(cropperLeft + cropperWidth - sube.pageX)
        const deltaY = Math.abs(cropperTop - sube.pageY)

        if (cropperLeft + cropperWidth < sube.pageX || cropperTop > sube.pageY) {
          if (deltaX > deltaY) {
            const delta = deltaX * scaleX
            _w += delta
            _h = _w / _cropperRatio
            _t = cropper.offsetTop + cropper.offsetHeight - _h
          } else {
            const delta = deltaY * scaleY
            _h += delta
            _t -= delta
            _w = _h * _cropperRatio
          }
        } else if (deltaX > deltaY) {
          const delta = deltaX * scaleX
          _w -= delta
          _h = _w / _cropperRatio
          _t = cropper.offsetTop + cropper.offsetHeight - _h
        } else {
          const delta = deltaY * scaleY
          _h -= delta
          _t += delta
          _w = _h * _cropperRatio
        }

        if (img_offsetTop > _t) {
          _h = _h - img_offsetTop + _t
          _t = img_offsetTop
          _w = _h * _cropperRatio
        }
        if (img_offsetLeft + img_offsetWidth < _l + _w) {
          _w = img_offsetLeft + img_offsetWidth - _l
          _h = _w / _cropperRatio
          _t = cropper.offsetTop + cropper.offsetHeight - _h
        }
        if (
          img_offsetTop + img_offsetHeight - _t >= 40 &&
          img_offsetLeft + img_offsetWidth - _l >= 40 * cropperRatio &&
          _h < 40
        ) {
          _h = 40
          _t = cropper.offsetTop + cropper.offsetHeight - _h
          _w = _h * _cropperRatio
        } else if (_h < 40) return
      } else if (type === 'bl') {
        const deltaX = Math.abs(cropperLeft - sube.pageX)
        const deltaY = Math.abs(cropperTop + cropperHeight - sube.pageY)

        if (cropperLeft > sube.pageX || cropperTop + cropperHeight < sube.pageY) {
          if (deltaX > deltaY) {
            const delta = deltaX * scaleX
            _w += delta
            _l -= delta
            _h = _w / _cropperRatio
          } else {
            const delta = deltaY * scaleY
            _h += delta
            _w = _h * _cropperRatio
            _l = cropper.offsetLeft + cropper.offsetWidth - _w
          }
        } else if (deltaX > deltaY) {
          const delta = deltaX * scaleX
          _w -= delta
          _l += delta
          _h = _w / _cropperRatio
        } else {
          const delta = deltaY * scaleY
          _h -= delta
          _w = _h * _cropperRatio
          _l = cropper.offsetLeft + cropper.offsetWidth - _w
        }

        if (img_offsetTop + img_offsetHeight < _t + _h) {
          _h = img_offsetTop + img_offsetHeight - _t
          _w = _h * _cropperRatio
          _l = cropper.offsetLeft + cropper.offsetWidth - _w
        }
        if (img_offsetLeft > _l) {
          _w = _w - img_offsetLeft + _l
          _l = img_offsetLeft
          _h = _w / _cropperRatio
        }
        if (
          img_offsetTop + img_offsetHeight - _t >= 40 &&
          img_offsetLeft + img_offsetWidth - _l >= 40 * cropperRatio &&
          _h < 40
        ) {
          _h = 40
          _w = _h * _cropperRatio
          _l = cropper.offsetLeft + cropper.offsetWidth - _w
        } else if (_h < 40) return
      } else if (type === 'br') {
        const deltaX = Math.abs(cropperLeft + cropperWidth - sube.pageX)
        const deltaY = Math.abs(cropperTop + cropperHeight - sube.pageY)

        if (cropperLeft + cropperWidth < sube.pageX || cropperTop + cropperHeight < sube.pageY) {
          if (deltaX > deltaY) {
            const delta = deltaX * scaleX
            _w += delta
            _h = _w / _cropperRatio
          } else {
            const delta = deltaY * scaleY
            _h += delta
            _w = _h * _cropperRatio
          }
        } else if (deltaX > deltaY) {
          const delta = deltaX * scaleX
          _w -= delta
          _h = _w / _cropperRatio
        } else {
          const delta = deltaY * scaleY
          _h -= delta
          _w = _h * _cropperRatio
        }

        if (img_offsetTop + img_offsetHeight < _t + _h) {
          _h = img_offsetTop + img_offsetHeight - _t
          _w = _h * _cropperRatio
        }
        if (img_offsetLeft + img_offsetWidth < _l + _w) {
          _w = img_offsetLeft + img_offsetWidth - _l
          _h = _w / _cropperRatio
        }
        if (
          img_offsetTop + img_offsetHeight - _t >= 40 &&
          img_offsetLeft + img_offsetWidth - _l >= 40 * cropperRatio &&
          _h < 40
        ) {
          _h = 40
          _w = _h * _cropperRatio
        } else if (_h < 40) return
      }

      cropper.style.top = _t + 'px'
      cropper.style.left = _l + 'px'
      cropper.style.width = _w + 'px'
      cropper.style.height = _h + 'px'

      run({ t: _t, l: _l, w: _w, h: _h, rotateAngle })
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
  }, [object.props?.cropStyle || object.props])

  const { brightness = 100, contrast = 100, saturation = 100, filter = '' } = object.props.imageStyle
  const cropper = object.props.cropStyle
  const _filter = `${filter}brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`
  const cropperRatio = cropper ? cropper.width / cropper.height : 0

  const adjustCropper = useCallback(() => {
    if (!cropper) return
    // console.log('adjustCropper', 111111112)

    let {
      offsetTop: img_offsetTop,
      offsetLeft: img_offsetLeft,
      offsetHeight: img_offsetHeight,
      offsetWidth: img_offsetWidth,
    } = imageRef.current
    const { rotateAngle = 0 } = object.props.imageStyle
    if (rotateAngle % 180 !== 0) {
      const _img_offsetTop = img_offsetTop
      const _img_offsetWidth = img_offsetWidth
      img_offsetTop = img_offsetLeft
      img_offsetLeft = _img_offsetTop
      img_offsetWidth = img_offsetHeight
      img_offsetHeight = _img_offsetWidth
    }

    const imgRatio = img_offsetWidth / img_offsetHeight
    if (imgRatio >= cropperRatio) {
      cropper.height = img_offsetHeight
      cropper.width = cropper.height * cropperRatio
    } else {
      cropper.width = img_offsetWidth
      cropper.height = cropper.width / cropperRatio
    }

    if (imgRatio > 1 && loader) {
      cropper.top = parseFloat(img_offsetTop)
      cropper.left = (img_offsetWidth - cropper.width) / 2
      setLoader(false)
    } else if (imgRatio <= 1 && loader) {
      cropper.left = parseFloat(img_offsetLeft)
      cropper.top = (img_offsetHeight - cropper.height) / 2
      setLoader(false)
    }

    if (cropper.left + cropper.width > img_offsetLeft + img_offsetWidth) {
      cropper.left = img_offsetLeft + img_offsetWidth - cropper.width
    }
    if (cropper.top + cropper.height > img_offsetTop + img_offsetHeight) {
      cropper.top = img_offsetTop + img_offsetHeight - cropper.height
    }

    set_CropperRatio(cropperRatio)
    setChangeReq({ isChanged: false, action: '' })
  }, [cropper, cropperRatio, loader, setChangeReq, imageRef, object.props.imageStyle])

  const adjustCropperOrientation = useCallback(() => {
    if (!cropper) return
    if (cropper.height === cropper.width) return

    let {
      offsetTop: img_offsetTop,
      offsetLeft: img_offsetLeft,
      offsetHeight: img_offsetHeight,
      offsetWidth: img_offsetWidth,
    } = imageRef.current
    const { rotateAngle = 0 } = object.props.imageStyle
    if (rotateAngle % 180 !== 0) {
      const _img_offsetTop = img_offsetTop
      const _img_offsetWidth = img_offsetWidth
      img_offsetTop = img_offsetLeft
      img_offsetLeft = _img_offsetTop
      img_offsetWidth = img_offsetHeight
      img_offsetHeight = _img_offsetWidth
    }

    if (cropper.height > img_offsetHeight) {
      cropper.height = img_offsetHeight
      cropper.width = cropper.height * cropperRatio
    }
    if (cropper.width > img_offsetWidth) {
      cropper.width = img_offsetWidth
      cropper.height = cropper.width / cropperRatio
    }

    if (cropperCenter) {
      cropper.top = cropperCenter.top - cropper.height / 2
      cropper.left = cropperCenter.left - cropper.width / 2
    }

    if (cropper.top < img_offsetTop) cropper.top = img_offsetTop
    else if (cropper.top + cropper.height > img_offsetTop + img_offsetHeight)
      cropper.top = img_offsetTop + img_offsetHeight - cropper.height
    if (cropper.left < img_offsetLeft) cropper.left = img_offsetLeft
    else if (cropper.left + cropper.width > img_offsetLeft + img_offsetWidth)
      cropper.left = img_offsetLeft + img_offsetWidth - cropper.width

    if (updateObject) {
      updateObject(
        {
          object: {
            ...object,
            props: {
              ...object.props,
              cropStyle: {
                ...cropper,
              },
            },
          },
        },
        slideId
      )
    }

    set_CropperRatio(cropperRatio)
    setChangeReq({ isChanged: false, action: '' })
  }, [cropper, cropperRatio, cropperCenter, setChangeReq, imageRef, object, slideId, updateObject])

  useEffect(() => {
    const { isChanged, action } = changeReq
    if (isChanged && action.includes('orientation')) adjustCropperOrientation()
    else if (isChanged && action.includes('paper size')) adjustCropper()
  }, [changeReq])

  const adjustCropperAngle = useCallback(() => {
    const { rotateAngle } = object.props.imageStyle

    if (!cropper || rotateAngle === undefined) return

    const { width: w, height: h, top: t, left: l } = cropper
    let _t = 0
    let _l = 0

    if (_cropperAngle.current > rotateAngle) {
      _t = imageRef.current.offsetLeft + imageRef.current.offsetWidth - l - w
      _l = t
    } else {
      _t = l
      _l = imageRef.current.offsetLeft + imageRef.current.offsetWidth - t - h
    }

    cropper.top = _t
    cropper.left = _l
    cropper.width = h
    cropper.height = w

    _cropperAngle.current = rotateAngle

    set_CropperRatio((prevState) => 1 / prevState)
    setChangeReq({ isChanged: false, action: '' })
  }, [_cropperAngle, cropper, object.props.imageStyle, setChangeReq])

  useEffect(() => {
    const { isChanged, action } = changeReq
    if (_cropperAngle.current !== object.props.imageStyle.rotateAngle && isChanged && action === 'angle')
      adjustCropperAngle()
  }, [object.props.imageStyle.rotateAngle, changeReq])

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
        onLoad={
          isEditor
            ? () => {
                setLoader(false)
                set_CropperRatio(cropperRatio)
              }
            : adjustCropper
        }
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
