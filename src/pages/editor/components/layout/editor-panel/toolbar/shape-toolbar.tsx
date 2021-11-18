/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable consistent-return */

import { useDebounceFn } from 'ahooks'
import { Tooltip } from 'antd'
import { InputNumber } from 'components'
import { PObject } from 'interfaces'
import React, { useEffect, useState } from 'react'
import { SketchPicker } from 'react-color'
import { BiBorderRadius } from 'react-icons/bi'
import { FormattedMessage } from 'react-intl'
import { UPDATE_OBJECT } from 'redux/actions/types'

const ShapeToolbar: React.FC<{
  index: number
  objectType: string
  object: HTMLDivElement
  objects: PObject[]
  updateHistory: (type: string, object: unknown) => void
  updateObject: (value: { object: PObject }) => void
}> = ({ object, objectType, objects, index, updateObject, updateHistory }) => {
  const [showPicker, setShowPicker] = useState<boolean>(false)
  const [color, setColor] = useState<string>('')
  const { borderRadius = objects[index]?.props.shapeClass?.includes('square') ? '0%' : '50%' } =
    (objects[index]?.props.shapeStyle as any) || {}
  console.log('objects[index]?.props.shapeStyle', objects[index]?.props.shapeStyle)

  const onChangeComplete = (_color: any) => {
    const { hex } = _color
    setColor(hex)
    if (!object) return false
    const shape: any = object.firstChild
    const anyShape = shape.childNodes[1] // 0 is the border
    if (anyShape) {
      const _object = objects[index]
      const colorPicker: any = document.querySelector('.color-picker')
      colorPicker.style.background = hex

      updateObject({
        object: {
          ..._object,
          props: {
            ..._object.props,
            shapeStyle: {
              ..._object.props.shapeStyle,
              background: hex,
            },
          },
        } as any,
      })

      updateHistory(UPDATE_OBJECT, { object })
    }
    return true
  }

  const onChange = (_color: any) => {
    const { hex } = _color
    setColor(hex)
  }

  const changeRadius = (radius: number) => {
    if (!object || radius < 0 || radius > 50) return
    const _object = objects[index]
    updateObject({
      object: {
        ..._object,
        props: {
          ..._object.props,
          shapeStyle: {
            ..._object.props.shapeStyle,
            borderRadius: radius + '%',
          },
        } as any,
      },
    })

    updateHistory(UPDATE_OBJECT, { object: objects[index] })
  }
  const debouncedChangeRadius = useDebounceFn(
    (radius: number) => {
      changeRadius(radius)
    },
    {
      wait: 1000,
    }
  )

  useEffect(() => {
    if (!object) return
    const shape: any = object.firstChild
    const anyShape = shape.childNodes[1] // 0 is the border
    if (shape) {
      const { backgroundColor } = getComputedStyle(anyShape)
      const colorPicker: any = document.querySelector('.color-picker')
      colorPicker.style.background = backgroundColor
    }

    return setShowPicker(false)
  }, [object])

  return (
    <>
      <Tooltip placement="top" title={<FormattedMessage id="toolbox.color" />}>
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
              color={color}
              onChangeComplete={onChangeComplete}
              onChange={onChange}
            />
          )}
        </div>
      </Tooltip>
      {objects && (
        <Tooltip placement="top" title={<FormattedMessage id="toolbox.borderRadius" />}>
          <span className="toolbar-icon">
            <BiBorderRadius style={{ fontSize: 18, marginRight: 4 }} />
            <InputNumber
              formatter={(value) => `${value}%`}
              parser={(value) => Number(value?.replaceAll('%', ''))}
              step={1}
              min={0}
              value={Number(borderRadius?.replace('%', ''))}
              onChange={(value) => debouncedChangeRadius.run(parseFloat(value + ''))}
              width={30}
              max={50}
              size="small"
            />
          </span>
        </Tooltip>
      )}
    </>
  )
}

export default ShapeToolbar
