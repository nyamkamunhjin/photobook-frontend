/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable @typescript-eslint/ban-types */

import React, { useState } from 'react'
import { Select, InputNumber } from 'antd'
import { PaperMaterial, PaperSize, PObject, Slide } from 'interfaces'
import { FormattedMessage } from 'react-intl'
import Image from './image'

interface Props {
  toggle: any
  saveObjects: () => void
  onEdit: (index: number) => void
  objects: Slide[]
  selectedObjects: Slide[]
  height: number
  paperSizes?: PaperSize[]
  paperMaterials?: PaperMaterial[]
}

const Images: React.FC<Props> = ({ height, objects, toggle, paperSizes, paperMaterials, selectedObjects, onEdit }) => {
  const [popVisible, setPopVisible] = useState(-1)
  const srcHeight = 57
  const maxWidth = 1000
  const maxHeight = 1000
  const srcWidth = 57 + height
  const ratio = Math.min(srcWidth / maxWidth, srcHeight / maxHeight)
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
                ? 'ImageContainer active'
                : 'ImageContainer'
            }
            style={{ width: 60 + height, height: 100 + height }}
          >
            <div className="header">{object.slideId}</div>
            <div style={{ width: maxWidth * ratio, height: maxHeight * ratio }}>
              <div id="canvas_container" style={{ transform: 'scale(' + ratio + ')', transformOrigin: '0 0' }}>
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
                  placeholderStyle={object.object?.props.placeholderStyle}
                />
              </div>
            </div>
            <div className="flex flex-row justify-center">
              <Select size="small" bordered={false} className="w-1/3 min-w-14">
                {paperSizes?.map((each) => (
                  <Select.Option value={each.id}>{each.size}</Select.Option>
                ))}
              </Select>
              <Select size="small" bordered={false} className="w-1/3 min-w-14">
                {paperMaterials?.map((each) => (
                  <Select.Option value={each.id}>{each.name}</Select.Option>
                ))}
              </Select>
            </div>
            <div className="flex flex-row mb-2">
              <InputNumber size="small" />
            </div>
          </div>
          <div
            className="flex justify-between bg-white p-1 rounded-2xl"
            style={key === popVisible ? { opacity: 1 } : { opacity: 0 }}
          >
            <div className="cursor-pointer">
              <FormattedMessage id="duplicate" />
            </div>
            <div className="cursor-pointer" onClick={() => onEdit(popVisible)}>
              <FormattedMessage id="edit" />
            </div>
            <div className="cursor-pointer">
              <FormattedMessage id="remove" />
            </div>
          </div>
        </div>
      ))}
    </>
  )
}

export default Images
