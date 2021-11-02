/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useEffect, useState } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { AiFillMinusSquare } from 'react-icons/ai'
import { FcFrame } from 'react-icons/fc'
import { GiFairyWand } from 'react-icons/gi'
import { VscZoomIn, VscZoomOut, VscScreenFull } from 'react-icons/vsc'
import { BsSubtract } from 'react-icons/bs'
import { InputNumber, Slider, Tooltip } from 'antd'
import { ColorPreset, PObject } from 'interfaces'
import { ColorResult, SketchPicker } from 'react-color'
import { UPDATE_OBJECT } from 'redux/actions/types'
import { FormattedMessage } from 'react-intl'
import { colorPresets, filters } from 'configs'
import { MinusCircleFilled, MinusCircleOutlined } from '@ant-design/icons'
import { debounce } from 'lodash'

interface Props {
  index: number
  zoom?: {
    state: number
    action: Function
  }
  object: HTMLDivElement
  objects: PObject[]
  removeImageFromObject?: () => void
  removeFrameFromObject?: () => void
  removeFrameMaskFromObject?: () => void
  removeMaskFromObject?: () => void
  updateHistory: (type: string, object: unknown) => void
  updateObject: (value: { object: PObject }) => void
  imageFit?: (borderWidth: number, o: PObject) => void
  getImagePosition: (o: PObject) => void
  hasFrame?: boolean
}

const ImageToolbar = ({
  index,
  object,
  objects,
  removeImageFromObject,
  removeFrameFromObject,
  removeFrameMaskFromObject,
  removeMaskFromObject,
  updateHistory,
  updateObject,
  zoom: _zoom,
  imageFit,
  getImagePosition,
  hasFrame,
}: Props) => {
  const [hasImage, setHasImage] = useState<boolean>(false)
  const [showPicker, setShowPicker] = useState<boolean>(false)
  const [showFilters, setShowFilters] = useState<boolean>(false)
  const [showFrame, setShowFrame] = useState<boolean>(false)
  const filterImage = 'https://static.canva.com/web/images/8fb86fd892c98e7f5a66b92b94bf0fa1.jpg'
  useHotkeys('shift+=', () => zoomIn(), [objects, index, object])
  useHotkeys('shift+-', () => zoomOut(), [objects, index, object])
  useHotkeys('shift+0', () => zoomFit(), [objects, index, object])
  const debouncedImageFit = debounce((borderWidth) => imageFit && imageFit(borderWidth, objects[index]), 200)

  const onScale = (_object: PObject, zoom: number) => {
    updateObject({
      object: {
        ..._object,
        props: {
          ..._object.props,
          imageStyle: {
            ..._object.props.imageStyle,
            transform: `scale(${zoom})`,
            scale: zoom,
          },
        },
      },
    })

    if (_zoom) {
      _zoom.action(zoom)
    }
    if (zoom === 1) debouncedImageFit(parseFloat(_object.props.frameStyle?.borderWidth || '0'))

    updateHistory(UPDATE_OBJECT, { object: getImagePosition(objects[index]) })
  }
  const zoomIn = () => {
    if (!object) return false
    const _object = objects[index]
    const { imageStyle } = _object.props
    onScale(_object, (imageStyle.scale || 1) + 0.1)
    return true
  }

  const zoomFit = () => {
    if (!object) return false
    const _object = objects[index]
    onScale(_object, 1)
    return true
  }

  const zoomOut = () => {
    if (!object) return false
    const _object = objects[index]
    const {
      imageStyle: { scale = 0 },
    } = _object.props
    if (scale > 1) {
      onScale(_object, scale - 0.1)
    } else {
      onScale(_object, 1)
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

    updateHistory(UPDATE_OBJECT, { object: getImagePosition(objects[index]) })
    return true
  }

  const changeColorPreset = (colorPreset?: ColorPreset) => {
    console.log(colorPreset)
    if (!object || !colorPreset) return false
    const _object = objects[index]
    updateObject({
      object: {
        ..._object,
        props: {
          ..._object.props,
          colorPreset,
          imageStyle: {
            filter: colorPreset.filterStyle?.filter,
          },
        },
      },
    })

    updateHistory(UPDATE_OBJECT, { object: getImagePosition(objects[index]) })
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

    updateHistory(UPDATE_OBJECT, { object: getImagePosition(objects[index]) })
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
    if (!_object) return
    updateObject({
      object: {
        ..._object,
        props: {
          ..._object.props,
          frameStyle: {
            ..._object.props.frameStyle,
            borderImage: 'none',
            borderImageSource: 'none',
            borderWidth: value + '',
          },
        },
      },
    })
    debouncedImageFit(value)
  }
  const changeFrameImageWidth = (value: number) => {
    updateObject({
      object: {
        ..._object,
        props: {
          ..._object.props,
          frameStyle: {
            ..._object.props.frameStyle,
            borderImageSlice: value,
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
            borderImageSource: 'none',
            rgb: color.rgb,
          },
        },
      },
    })

    const colorPicker: any = document.querySelector('.color-picker')
    colorPicker.style.background = color.hex

    updateHistory(UPDATE_OBJECT, { object: getImagePosition(objects[index]) })
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

    updateHistory(UPDATE_OBJECT, { object: getImagePosition(objects[index]) })
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
  const colorPreset = _object?.props.colorPreset
  const frameStyle = _object?.props?.frameStyle
  const hasFrameImage = !!_object?.props?.frameImage?.length
  const { brightness = 100, contrast = 100, saturation = 100, opacity = '100%' } = imageStyle || {}

  return (
    <>
      {removeImageFromObject && (
        <Tooltip placement="top" title={<FormattedMessage id="toolbox.deleteImage" />}>
          <span className={`toolbar-icon ${!hasImage && 'inactive'}`} onClick={removeImageFromObject}>
            <AiFillMinusSquare />
          </span>
        </Tooltip>
      )}
      {removeFrameFromObject && (
        <Tooltip placement="top" title={<FormattedMessage id="toolbox.deleteFrame" />}>
          <span className={`toolbar-icon ${!hasImage && 'inactive'}`} onClick={removeFrameFromObject}>
            <MinusCircleOutlined className="text-base" />
          </span>
        </Tooltip>
      )}
      {removeMaskFromObject && (
        <Tooltip placement="top" title={<FormattedMessage id="toolbox.deleteMask" />}>
          <span className={`toolbar-icon ${!hasImage && 'inactive'}`} onClick={removeMaskFromObject}>
            <MinusCircleFilled className="text-base" />
          </span>
        </Tooltip>
      )}
      {removeFrameMaskFromObject && (
        <Tooltip placement="top" title={<FormattedMessage id="toolbox.deleteFrameMask" />}>
          <span className={`toolbar-icon ${!hasImage && 'inactive'}`} onClick={removeFrameMaskFromObject}>
            <MinusCircleFilled className="text-base" />
          </span>
        </Tooltip>
      )}
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
          <div className="flex flex-col filters my-2">
            <span>
              <b>
                <FormattedMessage id="filters" />
              </b>
            </span>
            <div className="flex">
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
          </div>
          <div className="flex flex-col filters my-2">
            <span>
              <b>
                <FormattedMessage id="color_presets" />
              </b>
            </span>
            <div className="flex gap-2 p-2">
              {colorPresets.map((preset: ColorPreset) => (
                <div
                  className="cursor-pointer"
                  style={colorPreset?.name === preset.name ? { backgroundColor: '#d3d3d3' } : {}}
                  key={preset.name}
                  onClick={() => changeColorPreset(preset)}
                >
                  <div className="w-16 relative flex items-center">
                    <div className="absolute mix-blend-screen w-full h-full" style={preset.style} />
                    <img
                      alt={preset.name}
                      style={preset.style}
                      className={`border-2 border-white border-solid ${preset.name} w-full h-full`}
                      src={filterImage}
                    />
                  </div>
                  <span className="filter-name">{preset.name}</span>
                </div>
              ))}
            </div>
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
      {hasFrame && (
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
      )}
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
