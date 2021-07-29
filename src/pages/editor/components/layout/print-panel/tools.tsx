/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable consistent-return */
import React from 'react'
import { Slider } from 'antd'
import { Cropper, PaperMaterial, PaperSize, PObject, ToolsType } from 'interfaces'
import { IconButton, InputNumber } from 'components'
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
  paperSizes?: PaperSize[]
  paperMaterials?: PaperMaterial[]
  object: PObject
  select: {
    state: ToolsType
    action: (t: ToolsType) => void
  }
  setIsPaperSizeChanged: any
  setIsAngleChanged: any
}

const Tools: React.FC<Props> = ({
  select,
  object,
  slideId,
  updateObject,
  paperSizes,
  paperMaterials,
  setIsPaperSizeChanged,
  setIsAngleChanged,
}) => {
  const { paperSize, cropStyle, imageStyle, paperMaterial } = object?.props

  const { brightness = 100, contrast = 100, saturation = 100 } = imageStyle || {}
  const filterImage = 'https://static.canva.com/web/images/8fb86fd892c98e7f5a66b92b94bf0fa1.jpg'

  const onRotate = (angle: string) => {
    let { rotateAngle = 0, transform = 'rotate(0deg)' } = object.props.imageStyle
    if (!transform.match(/rotate\(([^)]+)\)/)) {
      transform += ' rotate(0deg)'
    }
    if (angle === 'left') {
      rotateAngle -= 90
    } else {
      rotateAngle += 90
    }
    updateObject(
      {
        object: {
          ...object,
          props: {
            ...object.props,
            imageStyle: {
              ...object.props.imageStyle,
              rotateAngle,
              transform: transform.replace(/rotate\(([^)]+)\)/, `rotate(${rotateAngle}deg)`),
            },
          },
        },
      },
      slideId
    )
    setIsAngleChanged(true)
  }
  const onPaperSize = async (size: PaperSize) => {
    const max = Math.max(ParseNumber(cropStyle?.width), ParseNumber(cropStyle?.height))
    const max2 = Math.max(size.height, size.width)
    const min2 = Math.min(size.height, size.width)
    await updateObject(
      {
        object: {
          ...object,
          props: {
            ...object.props,
            paperSize: size,
            cropStyle: {
              ...(cropStyle as Cropper),
              height: (max * min2) / max2,
            },
          },
        },
      },
      slideId
    )
    setIsPaperSizeChanged(true)
  }
  const onPaperMaterial = (material: PaperMaterial) => {
    updateObject(
      {
        object: {
          ...object,
          props: {
            ...object.props,
            paperMaterial: material,
          },
        },
      },
      slideId
    )
  }
  const onFilter = (filter: string) => {
    updateObject(
      {
        object: {
          ...object,
          props: {
            ...object.props,
            imageStyle: {
              ...object.props.imageStyle,
              ...filters[filter].style,
              filterName: filter,
            },
          },
        },
      },
      slideId
    )
  }
  const onQuantity = (quantity: any) => {
    updateObject(
      {
        object: {
          ...object,
          props: {
            ...object.props,
            quantity,
          },
        },
      },
      slideId
    )
  }
  const onColor = (type: string, value: number) => {
    updateObject(
      {
        object: {
          ...object,
          props: {
            ...object.props,
            imageStyle: {
              ...object.props.imageStyle,
              [type]: value,
            },
          },
        },
      },
      slideId
    )
  }
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
  const onReset = () => {
    updateObject(
      {
        object: {
          ...object,
          props: {
            ...object.props,
            cropStyle: {
              ...(object.props?.cropStyle as Cropper),
            },
          },
        },
      },
      slideId
    )
  }
  const onFlip = (position: string) => {
    let { transform = 'scaleX(1) scaleY(1)' } = object.props.imageStyle
    if (!transform.match(/scaleX\(([^)]+)\)/)) {
      transform += ' scaleX(1)'
    }
    if (!transform.match(/scaleY\(([^)]+)\)/)) {
      transform += ' scaleY(1)'
    }
    const scaleX = transform.match(/scaleX\(([^)]+)\)/) || ['scaleX(1)']
    const scaleY = transform.match(/scaleY\(([^)]+)\)/) || ['scaleY(1)']
    if (position === 'vertically') {
      if (scaleY && scaleY[0] === 'scaleY(1)') {
        transform = transform.replace(/scaleY\(([^)]+)\)/, 'scaleY(-1)')
      } else {
        transform = transform.replace(/scaleY\(([^)]+)\)/, 'scaleY(1)')
      }
    } else if (scaleX && scaleX[0] === 'scaleX(1)') {
      transform = transform.replace(/scaleX\(([^)]+)\)/, 'scaleX(-1)')
    } else {
      transform = transform.replace(/scaleX\(([^)]+)\)/, 'scaleX(1)')
    }
    console.log('wtfend', transform)
    updateObject(
      {
        object: {
          ...object,
          props: {
            ...object.props,
            imageStyle: {
              ...object.props.imageStyle,
              transform,
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
        <div hidden={select.state !== 'rotate'} className="flex">
          <div onClick={() => onRotate('left')} className="button">
            <IconButton icon={<GrRotateLeft size={25} />}>
              <FormattedMessage id="controller.rotate.left" />
            </IconButton>
          </div>
          <div
            onClick={() => onRotate('right')}
            className={`${
              ParseNumber(cropStyle?.width) > ParseNumber(cropStyle?.height) ? 'button selected' : 'button'
            }`}
          >
            <IconButton icon={<GrRotateRight size={25} />}>
              <FormattedMessage id="controller.rotate.right" />
            </IconButton>
          </div>
        </div>
        <div hidden={select.state !== 'flip'} className="flex">
          <div onClick={() => onFlip('horizontally')} className="button">
            <IconButton icon={<CgEditFlipH size={25} />}>
              <FormattedMessage id="controller.flip.horizontally" />
            </IconButton>
          </div>
          <div onClick={() => onFlip('vertically')} className="button">
            <IconButton icon={<CgEditFlipV size={25} />}>
              <FormattedMessage id="controller.flip.vertically" />
            </IconButton>
          </div>
        </div>
        <div hidden={select.state !== 'filters'}>
          <div className="filters">
            {Object.keys(filters).map((k: string) => (
              <div className={imageStyle?.filterName === k ? 'selected' : ''} key={k} onClick={() => onFilter(k)}>
                <img
                  alt={k}
                  draggable={false}
                  style={{ ...filters[k].style }}
                  className={`filter-icon ${filters[k]}`}
                  src={filterImage}
                />
                <span className="filter-name">{k}</span>
              </div>
            ))}
          </div>
        </div>
        <div
          hidden={select.state !== 'brightness'}
          className={`${select.state === 'brightness' ? 'button selected' : 'button'}`}
        >
          <div className="w-1/3">
            <Slider value={brightness} onChange={(value: number) => onColor('brightness', value)} min={0} max={200} />
          </div>
        </div>
        <div
          hidden={select.state !== 'contrast'}
          className={`${select.state === 'contrast' ? 'button selected' : 'button'}`}
        >
          <div className="w-1/3">
            <Slider value={contrast} onChange={(value: number) => onColor('contrast', value)} min={0} max={200} />
          </div>
        </div>
        <div
          hidden={select.state !== 'saturation'}
          className={`${select.state === 'saturation' ? 'button selected' : 'button'}`}
        >
          <div className="w-1/3">
            <Slider value={saturation} onChange={(value: number) => onColor('saturation', value)} min={0} max={200} />
          </div>
        </div>
        <div hidden={select.state !== 'size'}>
          <div className="choice">
            {paperSizes?.map((each: PaperSize) => (
              <div
                className={each?.id === paperSize?.id ? 'selected' : ''}
                key={each.id}
                onClick={() => onPaperSize(each)}
              >
                <span className="filter-name">{each.size}</span>
              </div>
            ))}
          </div>
        </div>
        <div hidden={select.state !== 'paper'}>
          <div className="choice">
            {paperMaterials?.map((each: PaperMaterial) => (
              <div
                className={each?.id === paperMaterial?.id ? 'selected' : ''}
                key={each.id}
                onClick={() => onPaperMaterial(each)}
              >
                <span className="filter-name">{each.name}</span>
              </div>
            ))}
          </div>
        </div>
        <div hidden={select.state !== 'amount'}>
          <InputNumber
            onChange={(e) => onQuantity(e)}
            size="small"
            bordered={false}
            defaultValue={object?.props.quantity || 1}
            value={object?.props.quantity || 1}
          />
        </div>
        <div hidden={select.state !== 'reset'}>
          <div className="choice">
            <FormattedMessage id="controller.reset.message" />
            <div className="ml-5" onClick={onReset}>
              <span className="filter-name">
                <FormattedMessage id="controller.reset" />
              </span>
            </div>
          </div>
        </div>
        <div hidden={select.state !== 'remove'}>
          <div className="choice">
            <FormattedMessage id="controller.remove.message" />
            <div className="ml-5" onClick={onReset}>
              <span className="filter-name">
                <FormattedMessage id="controller.remove" />
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="controller_container flex justify-start">
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
          className={`${select.state === 'contrast' ? 'button selected' : 'button'}`}
          onClick={() => select.action('contrast')}
        >
          <IconButton icon={<ImContrast size={20} />}>
            <FormattedMessage id="controller.contrast" />
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
          <IconButton icon={<div style={{ fontSize: 13 }}>{object.props.paperSize?.size}</div>}>
            <FormattedMessage id="controller.size" />
          </IconButton>
        </div>
        <div
          className={`${select.state === 'paper' ? 'button selected' : 'button'}`}
          onClick={() => select.action('paper')}
          style={{ flex: 2 }}
        >
          <IconButton
            icon={<div style={{ fontSize: 13, textTransform: 'none' }}>{object.props.paperMaterial?.name}</div>}
          >
            <FormattedMessage id="controller.paper" />
          </IconButton>
        </div>
        <div
          className={`${select.state === 'amount' ? 'button selected' : 'button'}`}
          onClick={() => select.action('amount')}
        >
          <IconButton icon={<div style={{ fontSize: 13 }}>{object.props.quantity || 1}</div>}>
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
