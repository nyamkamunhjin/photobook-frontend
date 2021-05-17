import { UPDATE_OBJECT } from 'redux/actions/types'

export const boldText = (props: any, isBold: boolean) => {
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

export const italicText = (props: any, isItalic: boolean) => {
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

export const underlineText = (props: any, isUnderline: boolean) => {
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

export const changeFontFamily = (value: any, props: any) => {
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

export const changeFontSize = (value: any, props: any) => {
  if (!props.object) return false
  const textContainer: any = props.object.firstChild
  const text = textContainer.childNodes[2]
  if (text) {
    text.style.fontSize = value
    text.style.lineHeight = value
    const object = props.objects[props.index]
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

export const changeTextAlign = (value: any, props: any) => {
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
