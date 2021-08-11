/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable @typescript-eslint/ban-types */

import React, { useState } from 'react'
import { Select } from 'antd'
import { useDispatch } from 'react-redux'
import { Cropper, PaperMaterial, PaperSize, PObject, Slide } from 'interfaces'
import { FormattedMessage } from 'react-intl'
import { InputNumber } from 'components'
import { saveProject as _saveProject, deleteSlide as _deleteSlide, updateObject } from 'redux/actions/project'
import { ParseNumber } from 'utils'
import Image from './image'

interface Props {
  toggle: any
  onEdit: (index: number) => void
  onDuplicate: (index: number) => void
  onRemove: (index: number) => void
  objects: Slide[]
  selectedObjects: Slide[]
  height: number
  paperSizes?: PaperSize[]
  paperMaterials?: PaperMaterial[]
}

const Images: React.FC<Props> = ({
  height,
  objects,
  toggle,
  paperSizes,
  paperMaterials,
  selectedObjects,
  onEdit,
  onDuplicate,
  onRemove,
}) => {
  const dispatch = useDispatch()
  const [popVisible, setPopVisible] = useState(-1)
  const srcHeight = height + 20
  const maxWidth = 1000
  const maxHeight = 1000
  const srcWidth = srcHeight + height
  const ratio = Math.min(srcWidth / maxWidth, srcHeight / maxHeight)
  const [changeReq, setChangeReq] = useState({ isChanged: false, action: '' })

  const onPaperSize = (id: number, object: Slide) => {
    const size = paperSizes?.find((a) => a.id === id)
    if (!size) {
      return
    }
    const { cropStyle } = (object.object as PObject)?.props
    const max = Math.max(ParseNumber(cropStyle?.width), ParseNumber(cropStyle?.height))
    const max2 = Math.max(size.height, size.width)
    const min2 = Math.min(size.height, size.width)
    dispatch(
      updateObject(
        {
          object: {
            ...object.object,
            props: {
              ...object.object?.props,
              paperSize: size,
              cropStyle: {
                ...(cropStyle as Cropper),
                height: (max * min2) / max2,
              },
            },
          },
        },
        object.slideId
      )
    )
    setChangeReq({ isChanged: true, action: 'paper size' })
  }

  const onPaperMaterial = (id: number, object: Slide) => {
    const material = paperMaterials?.find((a) => a.id === id)
    if (!material) {
      return
    }
    dispatch(
      updateObject(
        {
          object: {
            ...object.object,
            props: {
              ...object.object?.props,
              paperMaterial: material,
            },
          },
        },
        object.slideId
      )
    )
  }
  const onQuantity = (quantity: any, object: Slide) => {
    dispatch(
      updateObject(
        {
          object: {
            ...object.object,
            props: {
              ...object.object?.props,
              quantity,
            },
          },
        },
        object.slideId
      )
    )
  }

  return (
    <>
      {objects.map((object, key) => (
        <div
          key={`images${object.slideId}`}
          onClick={(e) => toggle.run(object, e)}
          onMouseEnter={() => setPopVisible(key)}
          onMouseLeave={() => setPopVisible(-1)}
        >
          <div
            className={
              selectedObjects?.some((each) => each.slideId === object.slideId)
                ? 'image-container active'
                : 'image-container'
            }
            style={{ width: 60 + height, height: 100 + height }}
          >
            <div className="header">{object.slideId}</div>
            <div className="m-auto overflow-hidden" style={{ width: maxWidth * ratio, height: maxHeight * ratio }}>
              <div className="canvas_container" style={{ transform: 'scale(' + ratio + ')', transformOrigin: '0 0' }}>
                <Image
                  slideId={object.slideId}
                  scaleX={srcWidth / maxWidth}
                  scaleY={srcHeight / maxHeight}
                  object={object.object || ({} as PObject)}
                  resolution={{
                    width: Number(object.object?.style?.width),
                    height: Number(object.object?.style.height),
                  }}
                  style={object.object?.style}
                  className={object.object?.className || 'object'}
                  draggable={false}
                  alt={object.object?.id}
                  imageUrl={object.object?.props.imageUrl}
                  imageStyle={object.object?.props.imageStyle}
                  updateObject={(a, e) => dispatch(updateObject(a, e))}
                  placeholderStyle={object.object?.props.placeholderStyle}
                  changeReq={changeReq}
                  setChangeReq={setChangeReq}
                />
              </div>
            </div>
            <div className="m-auto text-center">
              <Select
                style={{ fontSize: 9 }}
                value={object.object?.props.paperSize?.id}
                size="small"
                onChange={(e) => onPaperSize(e, object)}
                bordered={false}
                className="w-1/2"
              >
                {paperSizes?.map((each) => (
                  <Select.Option key={`${object.slideId}${each.id}size`} value={each.id}>
                    {each.size}
                  </Select.Option>
                ))}
              </Select>
              <Select
                onChange={(e) => onPaperMaterial(e, object)}
                value={object.object?.props.paperMaterial?.id}
                size="small"
                bordered={false}
                className="w-1/2"
              >
                {paperMaterials?.map((each) => (
                  <Select.Option key={`${object.slideId}${each.id}material`} value={each.id}>
                    {each.name}
                  </Select.Option>
                ))}
              </Select>
            </div>
            <div className="flex flex-row mb-2 m-auto">
              <InputNumber
                onChange={(e) => onQuantity(e, object)}
                size="small"
                bordered={false}
                value={object.object?.props.quantity || 1}
              />
            </div>
          </div>
          <div
            className="flex justify-around bg-white p-1 rounded-2xl"
            style={key === popVisible ? { opacity: 1 } : { opacity: 0 }}
          >
            <div className="cursor-pointer" onClick={() => onDuplicate(popVisible)}>
              <FormattedMessage id="duplicate" />
            </div>
            <div className="cursor-pointer" onClick={() => onEdit(popVisible)}>
              <FormattedMessage id="edit" />
            </div>
            <div className="cursor-pointer" onClick={() => onRemove(popVisible)}>
              <FormattedMessage id="remove" />
            </div>
          </div>
        </div>
      ))}
    </>
  )
}

export default Images
