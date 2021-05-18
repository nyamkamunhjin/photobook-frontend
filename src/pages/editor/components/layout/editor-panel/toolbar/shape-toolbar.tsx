/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable consistent-return */

import { Tooltip } from 'antd'
import React, { useEffect, useState } from 'react'
import { SketchPicker } from 'react-color'
import { FormattedMessage } from 'react-intl'
import { UPDATE_OBJECT } from 'redux/actions/types'

const ShapeToolbar = (props: any) => {
  const [showPicker, setShowPicker] = useState<boolean>(false)
  const [color, setColor] = useState<string>('')

  const onChangeComplete = (_color: any) => {
    const { hex } = _color
    setColor(hex)
    if (!props.object) return false
    const shape: any = props.object.firstChild
    const anyShape = shape.childNodes[1] // 0 is the border
    if (anyShape) {
      const object = props.objects[props.index]
      const colorPicker: any = document.querySelector('.color-picker')
      colorPicker.style.background = hex

      props.updateObject({
        object: {
          ...object,
          props: {
            ...object.props,
            shapeStyle: {
              ...object.props.shapeStyle,
              background: hex,
            },
          },
        },
      })

      props.updateHistory(UPDATE_OBJECT, { object })
    }
    return true
  }

  const onChange = (_color: any) => {
    const { hex } = _color
    setColor(hex)
  }

  useEffect(() => {
    if (!props.object) return
    const shape: any = props.object.firstChild
    const anyShape = shape.childNodes[1] // 0 is the border
    if (shape) {
      const { backgroundColor } = getComputedStyle(anyShape)
      const colorPicker: any = document.querySelector('.color-picker')
      colorPicker.style.background = backgroundColor
    }

    return setShowPicker(false)
  }, [props])

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
    </>
  )
}

export default ShapeToolbar
