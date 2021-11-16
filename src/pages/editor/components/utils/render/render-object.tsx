/* eslint-disable @typescript-eslint/ban-types */
import React from 'react'
import { PObject, SlideObject, StyleType, TemplateType } from 'interfaces'
import { Image, Text, Shape, ImageSplit } from '../../layout'

interface Props {
  object: SlideObject
  edit?: boolean
  updateObject?: (props: { object: PObject }) => void
  updateHistory?: (historyType: string, props: any) => void
  saveObjects?: () => void
  zoom: number
  scale: number
  border?: number
  mustHaveImageCenter?: boolean
  slideWidth?: number
  slideHeight?: number
  _templateType?: 'canvas-split' | 'canvas-single' | 'canvas-multi' | 'photobook' | 'montage'
  templateType?: TemplateType
}

const renderObject: React.FC<Props> = ({
  object,
  updateObject,
  updateHistory,
  saveObjects,
  scale,
  edit = true,
  zoom = 1,
  border = 0,
  mustHaveImageCenter = false,
  slideWidth,
  slideHeight,
  _templateType,
  templateType,
}) => {
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
  // console.log('templateType', templateType, 'edit', edit)
  if (props?.className === 'image-placeholder' && _templateType === 'canvas-split' && slideWidth && slideHeight) {
    const { tempUrl, imageUrl, imageStyle, style, className, placeholderStyle } = props

    return (
      <ImageSplit
        scale={scale}
        zoom={zoom}
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
        border={border}
        slideWidth={slideWidth}
        slideHeight={slideHeight}
        templateType={templateType}
      />
    )
  } else if (props?.className.includes('image-placeholder')) {
    const { tempUrl, imageUrl, imageStyle, style, className, placeholderStyle, frameMontage } = props

    return (
      <Image
        scale={scale}
        zoom={zoom}
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
        border={border}
        mustHaveImageCenter={mustHaveImageCenter}
        frameMontage={frameMontage}
        slideWidth={slideWidth}
        slideHeight={slideHeight}
        _templateType={_templateType}
        templateType={templateType}
      />
    )
  } else if (props?.className === 'text-container') {
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
  } else if (props?.className === 'shape') {
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
