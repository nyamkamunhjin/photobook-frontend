/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable consistent-return */
import React, { useState } from 'react'
import { Slider } from 'antd'
import { Cropper, PObject, ToolsType } from 'interfaces'
import { IconButton } from 'components'
import { FormattedMessage } from 'react-intl'
import { VscMirror, VscMove, VscRefresh } from 'react-icons/vsc'
import { RiEraserFill } from 'react-icons/ri'
import { IoIosTabletPortrait, IoIosTabletLandscape, IoMdTrash } from 'react-icons/io'
import { AiOutlineRotateLeft } from 'react-icons/ai'
import { GiFairyWand } from 'react-icons/gi'
import { GrRotateLeft, GrRotateRight } from 'react-icons/gr'
import { CgEditFlipH, CgEditFlipV } from 'react-icons/cg'
import { ImContrast, ImBrightnessContrast, ImDroplet } from 'react-icons/im'
import { filters } from 'configs'
import { ParseNumber } from 'utils'

interface Props {
  slideId: string
  updateObject: (props: { object: PObject }, slideId?: string) => void
  object: PObject
  select: {
    state: ToolsType
    action: (t: ToolsType) => void
  }
}

const changeFilter = (filter: string) => {
  alert(filter)
  return true
}

const changeColor = (type: string, value: number) => {
  return true
}

const Tools: React.FC<Props> = ({ select, object, slideId, updateObject }) => {
  const imageStyle = object?.props.imageStyle
  const cropStyle = object?.props.cropStyle
  const filterImage = 'https://static.canva.com/web/images/8fb86fd892c98e7f5a66b92b94bf0fa1.jpg'
  const onOrientation = (position: string) => {
    let width = ParseNumber(cropStyle?.width)
    let height = ParseNumber(cropStyle?.height)
    if (position === 'vertical') {
      if (width > height) {
        width = height
        height = ParseNumber(cropStyle?.width)
      }
    } else if (width < height) {
      width = height
      height = ParseNumber(cropStyle?.width)
    }
    updateObject(
      {
        object: {
          ...object,
          props: {
            ...object.props,
            cropStyle: {
              ...(object.props?.cropStyle as Cropper),
              width,
              height,
            },
          },
        },
      },
      slideId
    )
  }
  // states
  return (
    <>
      <div className="option_container">
        <div
          hidden={select.state !== 'transform'}
          className={`${select.state === 'transform' ? 'button selected' : 'button'}`}
        >
          <FormattedMessage id="controller.transform.message" />
        </div>
        <div hidden={select.state !== 'orientation'} className="flex">
          <div
            onClick={() => onOrientation('horizontal')}
            className={`${
              ParseNumber(cropStyle?.width) > ParseNumber(cropStyle?.height) ? 'button selected' : 'button'
            }`}
          >
            <IconButton icon={<IoIosTabletLandscape size={25} />}>
              <FormattedMessage id="controller.orientation.horizontal" />
            </IconButton>
          </div>
          <div
            onClick={() => onOrientation('vertical')}
            className={`${
              ParseNumber(cropStyle?.height) > ParseNumber(cropStyle?.width) ? 'button selected' : 'button'
            }`}
          >
            <IconButton icon={<IoIosTabletPortrait size={25} />}>
              <FormattedMessage id="controller.orientation.vertical" />
            </IconButton>
          </div>
        </div>
        <div
          hidden={select.state !== 'rotate'}
          className={`${select.state === 'rotate' ? 'button selected' : 'button'}`}
        >
          <IconButton icon={<GrRotateLeft size={25} />}>
            <FormattedMessage id="controller.rotate.left" />
          </IconButton>
          <IconButton icon={<GrRotateRight size={25} />}>
            <FormattedMessage id="controller.rotate.right" />
          </IconButton>
        </div>
        <div hidden={select.state !== 'flip'} className={`${select.state === 'flip' ? 'button selected' : 'button'}`}>
          <IconButton icon={<CgEditFlipH size={25} />}>
            <FormattedMessage id="controller.flip.horizontally" />
          </IconButton>
          <IconButton icon={<CgEditFlipV size={25} />}>
            <FormattedMessage id="controller.flip.vertically" />
          </IconButton>
        </div>
        <div
          hidden={select.state !== 'filters'}
          className={`${select.state === 'filters' ? 'button selected' : 'button'}`}
          onClick={() => select.action('filters')}
        >
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
        </div>
        <div
          hidden={select.state !== 'brightness'}
          className={`${select.state === 'brightness' ? 'button selected' : 'button'}`}
        >
          <div className="w-1/3">
            <Slider onChange={(value: number) => changeColor('brightness', value)} min={-100} max={100} />
          </div>
        </div>
        <div
          hidden={select.state !== 'constrast'}
          className={`${select.state === 'constrast' ? 'button selected' : 'button'}`}
        >
          <div className="w-1/3">
            <Slider onChange={(value: number) => changeColor('constrast', value)} min={-100} max={100} />
          </div>
        </div>
        <div
          hidden={select.state !== 'saturation'}
          className={`${select.state === 'saturation' ? 'button selected' : 'button'}`}
        >
          <div className="w-1/3">
            <Slider onChange={(value: number) => changeColor('saturation', value)} min={-100} max={100} />
          </div>
        </div>
      </div>
      <div className="controller_container">
        <div
          className={`${select.state === 'transform' ? 'button selected' : 'button'}`}
          onClick={() => select.action('transform')}
        >
          <IconButton icon={<VscMove size={20} color="#4a4a4a" />}>
            <FormattedMessage id="controller.transform" />
          </IconButton>
        </div>
        <div
          className={`${select.state === 'orientation' ? 'button selected' : 'button'}`}
          onClick={() => select.action('orientation')}
        >
          <IconButton icon={<AiOutlineRotateLeft size={20} />}>
            <FormattedMessage id="controller.orientation" />
          </IconButton>
        </div>
        <div
          className={`${select.state === 'rotate' ? 'button selected' : 'button'}`}
          onClick={() => select.action('rotate')}
        >
          <IconButton icon={<VscRefresh size={20} />}>
            <FormattedMessage id="controller.rotate" />
          </IconButton>
        </div>
        <div
          className={`${select.state === 'flip' ? 'button selected' : 'button'}`}
          onClick={() => select.action('flip')}
        >
          <IconButton icon={<VscMirror size={20} />}>
            <FormattedMessage id="controller.flip" />
          </IconButton>
        </div>
        <div
          className={`${select.state === 'filters' ? 'button selected' : 'button'}`}
          onClick={() => select.action('filters')}
        >
          <IconButton icon={<GiFairyWand size={20} />}>
            <FormattedMessage id="controller.filters" />
          </IconButton>
        </div>
        <div
          className={`${select.state === 'brightness' ? 'button selected' : 'button'}`}
          onClick={() => select.action('brightness')}
        >
          <IconButton icon={<ImBrightnessContrast size={20} />}>
            <FormattedMessage id="controller.brightness" />
          </IconButton>
        </div>
        <div
          className={`${select.state === 'constrast' ? 'button selected' : 'button'}`}
          onClick={() => select.action('constrast')}
        >
          <IconButton icon={<ImContrast size={20} />}>
            <FormattedMessage id="controller.constrast" />
          </IconButton>
        </div>
        <div
          className={`${select.state === 'saturation' ? 'button selected' : 'button'}`}
          onClick={() => select.action('saturation')}
        >
          <IconButton icon={<ImDroplet size={20} />}>
            <FormattedMessage id="controller.saturation" />
          </IconButton>
        </div>
        <div
          className={`${select.state === 'size' ? 'button selected' : 'button'}`}
          style={{ flex: 2 }}
          onClick={() => select.action('size')}
        >
          <IconButton icon={<div style={{ fontSize: 13 }}>4R (4 x 6)</div>}>
            <FormattedMessage id="controller.size" />
          </IconButton>
        </div>
        <div
          className={`${select.state === 'paper' ? 'button selected' : 'button'}`}
          onClick={() => select.action('paper')}
          style={{ flex: 2 }}
        >
          <IconButton icon={<div style={{ fontSize: 13, textTransform: 'none' }}>FUJIFILM Crystal(Gloss)</div>}>
            <FormattedMessage id="controller.paper" />
          </IconButton>
        </div>
        <div
          className={`${select.state === 'image_brightness' ? 'button selected' : 'button'}`}
          onClick={() => select.action('image_brightness')}
          style={{ flex: 2 }}
        >
          <IconButton
            icon={
              <div style={{ fontSize: 13, textTransform: 'none' }}>
                <FormattedMessage id="yes" />
              </div>
            }
          >
            <FormattedMessage id="controller.image_brightnessing" />
          </IconButton>
        </div>
        <div
          className={`${select.state === 'amount' ? 'button selected' : 'button'}`}
          onClick={() => select.action('amount')}
        >
          <IconButton icon={<div style={{ fontSize: 13 }}>1</div>}>
            <FormattedMessage id="controller.amount" />
          </IconButton>
        </div>
        <div
          className={`${select.state === 'reset' ? 'button selected' : 'button'}`}
          onClick={() => select.action('reset')}
        >
          <IconButton icon={<RiEraserFill size={20} />}>
            <FormattedMessage id="controller.reset" />
          </IconButton>
        </div>
        <div
          className={`${select.state === 'remove' ? 'button selected' : 'button'}`}
          onClick={() => select.action('remove')}
        >
          <IconButton icon={<IoMdTrash size={20} />}>
            <FormattedMessage id="controller.remove" />
          </IconButton>
        </div>
      </div>
    </>
  )
}

export default Tools
