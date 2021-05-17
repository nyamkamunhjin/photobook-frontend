/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useEffect, useState } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { AiFillMinusSquare } from 'react-icons/ai'
import { FcFrame } from 'react-icons/fc'
import { GiFairyWand } from 'react-icons/gi'
import { VscZoomIn, VscZoomOut, VscScreenFull } from 'react-icons/vsc'
import { BsSubtract } from 'react-icons/bs'
import { InputNumber, Slider, Tooltip } from 'antd'
import { FilterMap, PObject } from 'interfaces'
import { ColorResult, SketchPicker } from 'react-color'
import { UPDATE_OBJECT } from 'redux/actions/types'
import { FormattedMessage } from 'react-intl'

const filters: FilterMap = {
  none: {
    label: 'filter-none',
    style: {
      filter: ' ',
      WebkitFilter: 'none',
    },
  },
  blur: {
    label: 'filter-blur',
    style: {
      filter: 'blur(10px) ',
      WebkitFilter: 'blur(10px)',
    },
  },
  lomo: {
    label: 'filter-lomo',
    style: {
      filter: 'hue-rotate(40deg) contrast(1.2) ',
      WebkitFilter: 'hue-rotate(40deg) contrast(1.2)',
    },
  },
  sepia: {
    label: 'filter-sepia',
    style: {
      filter: 'sepia(60%) ',
    },
  },
  invert: {
    label: 'filter-invert',
    style: {
      filter: 'drop-shadow(16px 16px 20px red) invert(75%) ',
    },
  },
  gray: {
    label: 'filter-b&w',
    style: {
      WebkitFilter: 'grayscale(100%)',
      filter: 'grayscale(100%) ',
    },
  },
}

interface Props {
  index: number
  object: HTMLDivElement
  objects: PObject[]
  removeImageFromObject?: () => void
  updateHistory: (type: string, object: unknown) => void
  updateObject: (value: { object: PObject }) => void
}

const ImageToolbar = ({ index, object, objects, removeImageFromObject, updateHistory, updateObject }: Props) => {
  const [hasImage, setHasImage] = useState<boolean>(false)
  const [showPicker, setShowPicker] = useState<boolean>(false)
  const [showFilters, setShowFilters] = useState<boolean>(false)
  const [showFrame, setShowFrame] = useState<boolean>(false)
  const filterImage = 'https://static.canva.com/web/images/8fb86fd892c98e7f5a66b92b94bf0fa1.jpg'
  useHotkeys('shift+=', () => zoomIn(), [objects, index, object])
  useHotkeys('shift+-', () => zoomOut(), [objects, index, object])
  useHotkeys('shift+0', () => zoomFit(), [objects, index, object])

  const scale = (_object: PObject, width: string, left = '0px', top = '0px') => {
    updateObject({
      object: {
        ..._object,
        props: {
          ..._object.props,
          imageStyle: {
            ..._object.props.imageStyle,
            width,
            left,
            top,
          },
        },
      },
    })
    updateHistory(UPDATE_OBJECT, { object })
  }
  const zoomIn = () => {
    if (!object) return false
    const _object = objects[index]
    const { imageStyle } = _object.props
    scale(_object, `${parseFloat(`${imageStyle.width}`) + 10}%`, `${imageStyle.left || 0}`, `${imageStyle.top || 0}`)
    return true
  }

  const zoomFit = () => {
    if (!object) return false
    const _object = objects[index]
    scale(_object, '100%')
    return true
  }

  const zoomOut = () => {
    if (!object) return false
    const _object = objects[index]
    const { imageStyle } = _object.props
    const width = parseFloat(imageStyle.width + '')
    const left = parseFloat(imageStyle.left + '')
    const top = parseFloat(imageStyle.top + '')
    const viewWidth = parseFloat(_object.style?.width + '')
    const viewHeight = parseFloat(_object.style?.height + '')
    const placeholder = object.firstChild as HTMLElement
    const { height } = placeholder.childNodes[2] as HTMLImageElement

    const imageWidth = (viewWidth / 100) * Math.abs(width - 10) - Math.abs(left)
    const imageHeight = height * 0.9 - Math.abs(top)
    if (width > 100) {
      const _left = imageWidth < viewWidth ? left - imageWidth + viewWidth : left
      const _top = imageHeight < viewHeight ? top - imageHeight + viewHeight : top
      scale(_object, `${parseFloat(`${imageStyle.width}`) - 10}%`, `${_left}px`, `${_top}px`)
    }
    return true
  }

  const changeFilter = (filter: string) => {
    if (!object) return false
    const _object = objects[index]
    updateObject({
      object: {
        ..._object,
        props: {
          ..._object.props,
          imageStyle: {
            ..._object.props.imageStyle,
            ...filters[filter].style,
            filterName: filter,
          },
        },
      },
    })

    updateHistory(UPDATE_OBJECT, { object })
    return true
  }

  const changeColor = (type: string, value: number) => {
    if (!object) return false
    const _object = objects[index]

    // (brightness|contrast|saturation)+\(\d*\.*\d*\)
    updateObject({
      object: {
        ..._object,
        props: {
          ..._object.props,
          imageStyle: {
            ..._object.props.imageStyle,
            [type]: value,
          },
        },
      },
    })

    updateHistory(UPDATE_OBJECT, { object })
    return true
  }

  const changeFrameOpacity = (value: number) => {
    updateObject({
      object: {
        ..._object,
        props: {
          ..._object.props,
          frameImage: '',
          frameStyle: {
            ..._object.props.frameStyle,
            borderImage: 'none',
            opacity: `${value}%`,
          },
        },
      },
    })
  }

  const changeFrameWidth = (value: number) => {
    updateObject({
      object: {
        ..._object,
        props: {
          ..._object.props,
          frameStyle: {
            ..._object.props.frameStyle,
            borderWidth: value,
          },
        },
      },
    })
  }
  const changeFrameImageWidth = (value: number) => {
    updateObject({
      object: {
        ..._object,
        props: {
          ..._object.props,
          frameStyle: {
            ..._object.props.frameStyle,
            borderImageSlice: `${value}`,
          },
        },
      },
    })
  }

  const changeFrameColor = (color: ColorResult) => {
    if (!object) return false
    const _object = objects[index]
    updateObject({
      object: {
        ..._object,
        props: {
          ..._object.props,
          frameImage: '',
          frameStyle: {
            ..._object.props.frameStyle,
            borderImage: 'none',
            rgb: color.rgb,
          },
        },
      },
    })

    const colorPicker: any = document.querySelector('.color-picker')
    colorPicker.style.background = color.hex

    updateHistory(UPDATE_OBJECT, { object })
    // setShowPicker(false);
    return true
  }
  const changeOpacity = (value: number) => {
    if (!object) return false
    const _object = objects[index]
    updateObject({
      object: {
        ..._object,
        props: {
          ..._object.props,
          imageStyle: {
            ..._object.props.imageStyle,
            opacity: `${value}%`,
          },
        },
      },
    })

    updateHistory(UPDATE_OBJECT, { object })
    return true
  }

  useEffect(() => {
    if (!object) return
    const placeholder = object.firstChild as HTMLElement
    const image = placeholder.childNodes[2] as HTMLImageElement
    if (image) {
      const { display } = getComputedStyle(image)
      setHasImage(display === 'block')
    }
  }, [object])

  const _object = objects[index]
  const imageStyle = _object?.props.imageStyle
  const frameStyle = _object?.props?.frameStyle
  const hasFrameImage = !!_object?.props?.frameImage?.length
  const { brightness = 100, contrast = 100, saturation = 100, opacity = '100%' } = imageStyle || {}

  return (
    <>
      <Tooltip placement="top" title={<FormattedMessage id="toolbox.deleteImage" />}>
        <span className={`toolbar-icon ${!hasImage && 'inactive'}`} onClick={removeImageFromObject}>
          <AiFillMinusSquare />
        </span>
      </Tooltip>
      <Tooltip placement="top" title={<FormattedMessage id="toolbox.effect" />}>
        <span
          onClick={() => {
            setShowFilters(!showFilters)
            setShowFrame(false)
          }}
          className={`toolbar-icon ${!hasImage && 'inactive'}`}
        >
          <GiFairyWand />
        </span>
      </Tooltip>
      <div style={{ display: showFilters ? 'flex' : 'none' }}>
        <span className="image-filter">
          <div style={{ flexDirection: 'column' }}>
            <span className="row">
              <b>
                <FormattedMessage id="brightness" />:
              </b>
              <span className="col">
                {' '}
                <Slider
                  onChange={(value: number) => changeColor('brightness', value)}
                  value={brightness}
                  min={0}
                  max={200}
                />
              </span>
            </span>
            <span className="row">
              <b>
                <FormattedMessage id="contrast" />:
              </b>
              <span className="col">
                {' '}
                <Slider
                  onChange={(value: number) => changeColor('contrast', value)}
                  value={contrast}
                  min={0}
                  max={200}
                />
              </span>
            </span>
            <span className="row">
              <b>
                <FormattedMessage id="saturation" />:
              </b>
              <span className="col">
                {' '}
                <Slider
                  onChange={(value: number) => changeColor('saturation', value)}
                  value={saturation}
                  min={0}
                  max={200}
                />
              </span>
            </span>
          </div>
          <div className="filters">
            {Object.keys(filters).map((k: string) => (
              <span
                style={imageStyle?.filterName === k ? { backgroundColor: '#d3d3d3' } : {}}
                key={k}
                onClick={() => changeFilter(k)}
              >
                <img
                  alt={k}
                  style={{ ...filters[k].style }}
                  className={`filter-icon ${filters[k]}`}
                  src={filterImage}
                />
                <span className="filter-name">{k}</span>
              </span>
            ))}
          </div>
        </span>
      </div>
      <Tooltip placement="top" title={<FormattedMessage id="toolbox.zoomIn" />}>
        <span onClick={zoomIn} className={`toolbar-icon ${!hasImage && 'inactive'}`}>
          <VscZoomIn />
        </span>
      </Tooltip>
      <Tooltip placement="top" title={<FormattedMessage id="toolbox.zoomOut" />}>
        <span onClick={zoomOut} className={`toolbar-icon ${!hasImage && 'inactive'}`}>
          <VscZoomOut />
        </span>
      </Tooltip>
      <Tooltip placement="top" title={<FormattedMessage id="toolbox.zoomFit" />}>
        <span onClick={zoomFit} className={`toolbar-icon ${!hasImage && 'inactive'}`}>
          <VscScreenFull />
        </span>
      </Tooltip>
      <Tooltip placement="top" title={<FormattedMessage id="toolbox.trans" />}>
        <span className="toolbar-icon">
          <BsSubtract style={{ fontSize: 18, marginRight: 4 }} />
          <InputNumber
            formatter={(value) => `${value}%`}
            parser={(value) => Number(value?.replaceAll('%', ''))}
            step={1}
            min={1}
            value={Number(opacity?.replace('%', ''))}
            onChange={changeOpacity}
            width={30}
            max={100}
            size="small"
          />
        </span>
      </Tooltip>
      <Tooltip placement="top" title={<FormattedMessage id="toolbox.frame" />}>
        <span
          onClick={() => {
            setShowFrame(!showFrame)
            setShowFilters(false)
          }}
          className={`toolbar-icon ${!hasImage && 'inactive'}`}
        >
          <FcFrame />
        </span>
      </Tooltip>
      <div style={{ display: showFrame ? 'flex' : 'none' }}>
        <span className="image-filter">
          <span className="row">
            <span className="toolbar-icon">
              <BsSubtract style={{ fontSize: 18, marginRight: 4 }} />
              <InputNumber
                formatter={(value) => `${value}%`}
                parser={(value) => Number(value?.replaceAll('%', ''))}
                step={1}
                min={1}
                value={Number((frameStyle?.opacity || '100%')?.replace('%', ''))}
                onChange={changeFrameOpacity}
                width={30}
                max={100}
                size="small"
              />
            </span>
            <span className="toolbar-icon">
              <span style={{ marginRight: 5, marginLeft: 5 }}>Frame</span>
              <InputNumber
                step={1}
                min={0}
                value={Number(frameStyle?.borderWidth) || 0}
                onChange={changeFrameWidth}
                width={10}
                max={200}
                size="small"
              />
            </span>
            <div
              onClick={(e: React.MouseEvent<HTMLElement>) => {
                const button = e.target as HTMLInputElement
                if (button.classList.contains('toolbar-action')) {
                  setShowPicker(!showPicker)
                }
              }}
              className="toolbar-action color-picker"
            >
              {showPicker && (
                <SketchPicker
                  className="sketch-picker"
                  color={frameStyle?.borderColor || '#000'}
                  // onChange={changeFrameColor}
                  onChangeComplete={changeFrameColor}
                />
              )}
            </div>
          </span>
        </span>
      </div>
      {hasFrameImage && (
        <Tooltip placement="top" title={<FormattedMessage id="toolbox.frameChange" />}>
          <div>
            <span className="frame-filter">
              <Slider
                onChange={(value: number) => changeFrameImageWidth(value)}
                min={50}
                defaultValue={200}
                max={400}
              />
            </span>
          </div>
        </Tooltip>
      )}
    </>
  )
}

export default ImageToolbar
