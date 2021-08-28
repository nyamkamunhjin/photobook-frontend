/* eslint-disable consistent-return */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import {
  AlignCenterOutlined,
  AlignLeftOutlined,
  AlignRightOutlined,
  BoldOutlined,
  ItalicOutlined,
  UnderlineOutlined,
} from '@ant-design/icons'
import React, { useEffect, useState } from 'react'
import { Select, Tooltip } from 'antd'
import { SketchPicker } from 'react-color'
import { UPDATE_OBJECT } from 'redux/actions/types'
import { FormattedMessage } from 'react-intl'
import { PObject } from 'interfaces'

const { Option } = Select

const boldText = (props: any, isBold: boolean) => {
  if (!props.object) return false
  const textContainer: any = props.object.firstChild
  const text = textContainer.childNodes[2]

  if (text) {
    const object = props.objects[props.index]
    const fontWeight = isBold ? '400' : '700'

    props.updateObject({
      object: {
        ...object,
        props: {
          ...object.props,
          textStyle: {
            ...object.props.textStyle,
            fontWeight,
          },
        },
      },
    })

    props.updateHistory(UPDATE_OBJECT, { object })
  }
  return true
}

const italicText = (props: any, isItalic: boolean) => {
  if (!props.object) return false
  const textContainer: any = props.object.firstChild
  const text = textContainer.childNodes[2]

  if (text) {
    const object = props.objects[props.index]
    const fontStyle = isItalic ? 'normal' : 'italic'

    props.updateObject({
      object: {
        ...object,
        props: {
          ...object.props,
          textStyle: {
            ...object.props.textStyle,
            fontStyle,
          },
        },
      },
    })

    props.updateHistory(UPDATE_OBJECT, { object })
  }
  return true
}

const underlineText = (props: any, isUnderline: boolean) => {
  if (!props.object) return false
  const textContainer: any = props.object.firstChild
  const text = textContainer.childNodes[2]

  if (text) {
    const object = props.objects[props.index]
    const textDecoration = isUnderline ? 'none' : 'underline'

    props.updateObject({
      object: {
        ...object,
        props: {
          ...object.props,
          textStyle: {
            ...object.props.textStyle,
            textDecoration,
          },
        },
      },
    })

    props.updateHistory(UPDATE_OBJECT, { object })
  }
  return true
}

const changeFontFamily = (value: any, props: any) => {
  if (!props.object) return false
  const textContainer: any = props.object.firstChild
  const text = textContainer.childNodes[2]
  if (text) {
    const object = props.objects[props.index]

    props.updateObject({
      object: {
        ...object,
        props: {
          ...object.props,
          textStyle: {
            ...object.props.textStyle,
            fontFamily: value,
          },
        },
      },
    })

    props.updateHistory(UPDATE_OBJECT, { object })
  }
  return true
}

const changeFontSize = (value: any, props: any) => {
  if (!props.object) return false
  const textContainer: any = props.object.firstChild
  const text = textContainer.childNodes[2]
  if (text) {
    text.style.fontSize = value
    text.style.lineHeight = value
    const object = props.objects.find((item: PObject) => item.id === props.object.id)
    const { left, height } = getComputedStyle(text)
    const kPadding = parseFloat(left)
    const textHeight = parseFloat(height)
    const newHeight = textHeight + kPadding * 2
    props.object.style.height = newHeight + 'px'

    props.updateObject({
      object: {
        ...object,
        style: {
          ...object.style,
          height: newHeight,
        },
        props: {
          ...object.props,
          autogrowStyle: {
            ...object.props.autogrowStyle,
            height: newHeight,
          },
          textStyle: {
            ...object.props.textStyle,
            fontSize: value,
            lineHeight: value,
          },
        },
      },
    })
    props.updateHistory(UPDATE_OBJECT, { object })
    props.moveResizers()
  }
  return true
}

const changeTextAlign = (value: any, props: any) => {
  if (!props.object) return false
  const textContainer: any = props.object.firstChild
  const text = textContainer.childNodes[2]
  if (text) {
    const object = props.objects[props.index]

    props.updateObject({
      object: {
        ...object,
        props: {
          ...object.props,
          textStyle: {
            ...object.props.textStyle,
            textAlign: value,
          },
        },
      },
    })

    props.updateHistory(UPDATE_OBJECT, object)
  }
  return true
}

const TextToolbar = (props: any) => {
  const [isBold, setIsBold] = useState<boolean>(false)
  const [isItalic, setIsItalic] = useState<boolean>(false)
  const [isUnderline, setIsUnderline] = useState<boolean>(false)
  const [_fontFamily, setFontFamily] = useState<string>('Spirax')
  const [_fontSize, setFontSize] = useState<string>('36px')
  const [_textAlign, setTextAlign] = useState<string>('left')

  const [showPicker, setShowPicker] = useState<boolean>(false)
  const [_color, setColor] = useState<string>('')

  const onChangeComplete = (color: any) => {
    const { hex } = color
    setColor(hex)
    if (!props.object) return false
    const textContainer: any = props.object.firstChild
    const text = textContainer.childNodes[2]
    if (text) {
      const object = props.objects[props.index]

      props.updateObject({
        object: {
          ...object,
          props: {
            ...object?.props,
            textStyle: {
              ...object?.props?.textStyle,
              color: hex,
            },
          },
        },
      })

      props.updateHistory(UPDATE_OBJECT, object)

      const colorPicker: any = document.querySelector('.color-picker')
      colorPicker.style.background = hex
    }
    return true
  }

  const onChange = (color: any) => {
    const { hex } = color
    setColor(hex)
  }

  useEffect(() => {
    if (!props.object) return
    const textContainer: any = props.object.firstChild
    const text = textContainer.childNodes[2]
    if (text) {
      const { color, textDecoration, fontStyle, fontWeight, fontSize, fontFamily, textAlign } = getComputedStyle(text)

      const colorPicker: any = document.querySelector('.color-picker')
      colorPicker.style.background = color

      setIsUnderline(textDecoration === 'underline')
      setIsItalic(fontStyle === 'italic')
      setIsBold(fontWeight === '700')
      setFontFamily(fontFamily)
      setFontSize(fontSize)
      setTextAlign(textAlign)

      return () => {
        setShowPicker(false)
      }
    }
  }, [props])

  return (
    <>
      <Tooltip placement="top" title={<FormattedMessage id="toolbox.bold" />}>
        <BoldOutlined
          onClick={() => {
            setIsBold(!isBold)
            boldText(props, isBold)
          }}
          className={`toolbar-icon ${isBold && 'selected'}`}
        />
      </Tooltip>
      <Tooltip placement="top" title={<FormattedMessage id="toolbox.italic" />}>
        <ItalicOutlined
          onClick={() => {
            setIsItalic(!isItalic)
            italicText(props, isItalic)
          }}
          className={`toolbar-icon ${isItalic && 'selected'}`}
        />
      </Tooltip>
      <Tooltip placement="top" title={<FormattedMessage id="toolbox.underlined" />}>
        <UnderlineOutlined
          onClick={() => {
            setIsUnderline(!isUnderline)
            underlineText(props, isUnderline)
          }}
          className={`toolbar-icon ${isUnderline && 'selected'}`}
        />
      </Tooltip>
      <Tooltip placement="top" title={<FormattedMessage id="toolbox.align" />}>
        <Select
          className="toolbar-action"
          value={_textAlign}
          style={{ minWidth: 50 }}
          onChange={(value) => {
            setTextAlign(value)
            changeTextAlign(value, props)
          }}
        >
          <Option value="left">
            <AlignLeftOutlined />
          </Option>
          <Option value="center">
            <AlignCenterOutlined />
          </Option>
          <Option value="right">
            <AlignRightOutlined />
          </Option>
        </Select>
      </Tooltip>
      <Tooltip placement="top" title={<FormattedMessage id="toolbox.font" />}>
        <Select
          className="toolbar-action"
          value={_fontFamily}
          style={{ minWidth: 100 }}
          onChange={(value) => {
            setFontFamily(value)
            changeFontFamily(value, props)
          }}
        >
          <Option value="Mogul Acquest Script">Mogul Acquest Script</Option>
          <Option value="Mogul Adine Kirnberg">Mogul Adine Kirnberg</Option>
          <Option value="Mogul Arial">Mogul Arial</Option>
          <Option value="Mogul Assuan">Mogul Assuan</Option>
          <Option value="Mogul Bankir-Retro">Mogul Bankir-Retro</Option>
          <Option value="Mogul BlackGrotesk">Mogul BlackGrotesk</Option>
          <Option value="Mogul Bodoni">Mogul Bodoni</Option>
          <Option value="Mogul Bruskovaya">Mogul Bruskovaya</Option>
          <Option value="Mogul Compo-Shadow">Mogul Compo-Shadow</Option>
          <Option value="Mogul Cooper">Mogul Cooper</Option>
          <Option value="Mogul CrackMan">Mogul CrackMan</Option>
          <Option value="Mogul Def-Writer">Mogul Def-Writer</Option>
          <Option value="Mogul Delphian">Mogul Delphian</Option>
          <Option value="Mogul Dolores">Mogul Dolores</Option>
          <Option value="Mogul Down">Mogul Down</Option>
          <Option value="Mogul Eraser">Mogul Eraser</Option>
          <Option value="Mogul Futura Condensed">Mogul Futura Condensed</Option>
          <Option value="Mogul Futuris">Mogul Futuris</Option>
          <Option value="Mogul Garamond Narrow">Mogul Garamond Narrow</Option>
          <Option value="Mogul Globus">Mogul Globus</Option>
          <Option value="Mogul Heinrich Script">Mogul Heinrich Script</Option>
          <Option value="Mogul JargonA">Mogul JargonA</Option>
          <Option value="Mogul Kabel Ultra">Mogul Kabel Ultra</Option>
          <Option value="Mogul Kaliakra">Mogul Kaliakra</Option>
          <Option value="Mogul Kilkenny Initial Cap">Mogul Kilkenny Initial Cap</Option>
          <Option value="Mogul Liana">Mogul Liana</Option>
          <Option value="Mogul MonumentoTitulGr">Mogul MonumentoTitulGr</Option>
          <Option value="Mogul Moonlight">Mogul Moonlight</Option>
          <Option value="Mogul Urnaa">Mogul Urnaa</Option>
          <Option value="Mogul Z">Mogul Z</Option>
        </Select>
      </Tooltip>
      <Tooltip placement="top" title={<FormattedMessage id="toolbox.fontSize" />}>
        <Select
          className="toolbar-action"
          value={_fontSize}
          style={{ minWidth: 50 }}
          onChange={(value) => {
            setFontSize(value)
            changeFontSize(value, props)
          }}
        >
          <Option value="12px">12px</Option>
          <Option value="14px">14px</Option>
          <Option value="16px">16px</Option>
          <Option value="18px">18px</Option>
          <Option value="22px">22px</Option>
          <Option value="24px">24px</Option>
          <Option value="28px">28px</Option>
          <Option value="32px">32px</Option>
          <Option value="36px">36px</Option>
          <Option value="48px">48px</Option>
          <Option value="72px">72px</Option>
          <Option value="144px">144px</Option>
        </Select>
      </Tooltip>
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
              color={_color}
              onChangeComplete={onChangeComplete}
              onChange={onChange}
            />
          )}
        </div>
      </Tooltip>
    </>
  )
}

export default TextToolbar
