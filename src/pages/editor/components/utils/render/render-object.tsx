/* eslint-disable @typescript-eslint/ban-types */
import React from 'react'
import { PObject, SlideObject, StyleType } from 'interfaces'
import { Image, Text, Shape } from '../../layout'

interface Props {
  object: SlideObject
  edit?: boolean
  updateObject?: (props: { object: PObject }) => void
  updateHistory?: (historyType: string, props: any) => void
  saveObjects?: () => void
  scale: number
}

const renderObject: React.FC<Props> = ({ object, updateObject, updateHistory, saveObjects, scale, edit }) => {
  const { props } = object

  const updateUrl = (url: string) => {
    if (!updateObject || !saveObjects) return
    updateObject({
      object: {
        ...object,
        props: {
          ...props,
          tempUrl: url,
        },
      },
    })

    setTimeout(() => {
      saveObjects()
    }, 0)
  }

  if (props.className === 'image-placeholder') {
    const { tempUrl, imageUrl, imageStyle, style, className, placeholderStyle } = props
    return (
      <Image
        scale={scale}
        object={object}
        edit={edit}
        updateObject={updateObject}
        updateHistory={updateHistory}
        resolution={{ width: Number(object.style.width), height: Number(object.style.height) }}
        style={style}
        className={className}
        tempUrl={tempUrl}
        imageUrl={imageUrl}
        updateUrl={updateUrl}
        imageStyle={imageStyle}
        placeholderStyle={placeholderStyle}
      />
    )
  } else if (props.className === 'text-container') {
    const { style, className, textStyle, autogrowStyle, texts } = props
    return (
      <Text
        textStyle={textStyle}
        autogrowStyle={autogrowStyle}
        texts={texts || []}
        style={style}
        className={className}
      />
    )
  } else if (props.className === 'shape') {
    const { style, className, shapeClass, shapeStyle } = props
    return (
      <Shape
        style={style}
        className={className}
        shapeClass={shapeClass || ''}
        shapeStyle={shapeStyle || ({} as StyleType)}
      />
    )
  }
  return <></>
}

export default renderObject
