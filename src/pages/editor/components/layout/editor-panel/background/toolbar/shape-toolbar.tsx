/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable consistent-return */

import { Tooltip } from 'antd'
import { BackgroundImage } from 'interfaces'
import React, { useEffect, useState } from 'react'
import { SketchPicker } from 'react-color'
import { FormattedMessage } from 'react-intl'
import { UPDATE_OBJECT } from 'redux/actions/types'

interface Props {
  background: string
  backgrounds: BackgroundImage[]
  setBackgrounds: (backgrounds: BackgroundImage[]) => void
}

const ShapeToolbar: React.FC<Props> = ({ setBackgrounds, background, backgrounds }) => {
  const [showPicker, setShowPicker] = useState<boolean>(false)
  const [color, setColor] = useState<string>('')
  console.log('ShapeToolbar', 'background', background, 'backgrounds', backgrounds)

  const onChangeComplete = (_color: any) => {
    const { hex } = _color
    setColor(hex)
    const shape = backgrounds.findIndex((_bg) => _bg.className === background)

    if (shape !== -1) {
      const colorPicker: any = document.querySelector('.color-picker')
      colorPicker.style.background = hex
      backgrounds[shape] = { ...backgrounds[shape], bgStyle: { backgroundColor: hex, display: 'block' }, src: '' }
      const _backgrounds = backgrounds.map((bg, index) => {
        if (background === 'background-full' && index !== shape) {
          return { ...bg, bgStyle: { display: 'none' } }
        }
        return bg
      })
      setBackgrounds(_backgrounds)
    }
    return true
  }

  const onChange = (_color: any) => {
    const { hex } = _color
    setColor(hex)
  }

  useEffect(() => {
    const obj = backgrounds.find((_bg) => _bg.className === background)
    if (obj) {
      setColor(obj.bgStyle?.backgroundColor || '')
      const colorPicker: any = document.querySelector('.color-picker')
      colorPicker.style.background = obj.bgStyle?.backgroundColor || ''
    }
  }, [background, backgrounds])

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
