import React, { useState, useEffect, useRef, SetStateAction } from 'react'
import { connect } from 'react-redux'
import { v4 as uuidv4 } from 'uuid'

import { useBoolean, useRequest } from 'ahooks'
import { useIntl } from 'react-intl'
import { useLocation } from 'react-router-dom'
import { Col, Form, Input, message, Row, Select } from 'antd'
import { ImageCategory, Container, DomType, EditorInterface, ProjectInterface, StateInterface } from 'interfaces'
import { UPDATE_GROUP_CONTAINER, UPDATE_OBJECT } from 'redux/actions/types'
import { arraysEqual, debounce, getRotationScaler } from 'utils'
import {
  updateHistory as _updateHistory,
  addObject as _addObject,
  removeObject as _removeObject,
  loadObjects as _loadObjects,
  loadContainers as _loadContainers,
  updateContainer as _updateContainer,
  updateGroupContainer as _updateGroupContainer,
  updateObject as _updateObject,
} from 'redux/actions/project'
import {
  getLength,
  degToRadian,
  getNewStyle,
  centerToTL,
  tLToCenter,
  getAngle,
  positionsToPercent,
  layoutPositionsToObjectPercent,
  layoutPositionsToTextPercent,
} from 'utils/transformer-lib'
import { FormModal, Spinner } from 'components'
import { createLayout, listLayoutCategory, getLayout, updateLayout } from 'api'
import { useQuery } from 'hooks'
import { Header, SideButtons, Toolbar } from './components/layout'
import { renderObject } from './components/utils'
import './components/styles/editor.scss'

interface Props {
  editor: EditorInterface
  project: ProjectInterface
  loadObjects: any
  loadContainers: any
  updateContainer: any
  updateGroupContainer: any
  updateObject: (props: { object: Object }) => void
  updateHistory: (historyType: string, props: any) => void
  addObject: any
  removeObject: any
}

const key = 'create_layout'

const BookEditor: React.FC<Props> = ({
  editor,
  updateGroupContainer,
  updateObject,
  updateHistory,
  loadObjects,
  addObject,
  removeObject,
  project: { objects, containers },
}) => {
  const intl = useIntl()
  const [form] = Form.useForm()
  const id = useQuery(useLocation().search).get('id')

  // refs
  const slideViewRef: any = useRef(null)
  const editorContainerRef: any = useRef(null)
  const slideContainer: any = useRef(null)
  const selectionRef: any = useRef(null)
  const canvasRef = useRef<any>(null)
  const scaledContainerRef = useRef<any>(null)
  const groupRef = useRef<any>(null)
  const [overflow, setOverflow] = useState<string>('hidden')

  // states
  const scale = 1
  const [_objectType, setObjectType] = useState<string>('')
  const [_isTextEditing, setIsTextEditing] = useState<boolean>(false)
  const [_index, setObjectIndex] = useState<number>(-1)
  const [_textObjectIndex, setTextObjectIndex] = useState<number>(-1)
  const [_object, setObject] = useState<any>(null)
  const [_groupObjects] = useState<any>(null)
  const [_groupStyles] = useState<{
    left: any
    top: any
    width: any
    height: any
  }>()

  let _isMouseDown = false
  let _isCtrlDown = false
  let _isShiftDown = false
  let _rotateAngle = 0
  const _rotaterDistance = 30

  const transformers: any = {
    n: 't',
    s: 'b',
    e: 'r',
    w: 'l',
    ne: 'tr',
    nw: 'tl',
    se: 'br',
    sw: 'bl',
  }
  // Promt gargah utga
  const [visible, setVisible] = useBoolean(false)
  // Category List
  const categories = useRequest<ImageCategory[]>(listLayoutCategory)
  // Layout үүсгэх
  const createAction = useRequest(createLayout, {
    manual: true,
    onSuccess: () => {
      message.success({ content: intl.formatMessage({ id: 'success!' }), key })
      setVisible.setFalse()
    },
    onError: () => {
      message.error({ content: intl.formatMessage({ id: 'error!' }), key })
    },
  })

  const get = useRequest(() => getLayout(id || ''), {
    refreshDeps: [id],
    onSuccess: (data) => {
      if (data) {
        loadObjects(
          data.objects.map((object) =>
            object.className && object.className.includes('text-container')
              ? layoutPositionsToTextPercent(object)
              : layoutPositionsToObjectPercent(object)
          )
        )
      } else {
        loadObjects([])
      }
    },
  })
  const updateAction = useRequest(updateLayout, {
    manual: true,
    onSuccess: () => {
      message.success({ content: intl.formatMessage({ id: 'success!' }), key })
      setVisible.setFalse()
    },
    onError: () => {
      message.error({ content: intl.formatMessage({ id: 'error!' }), key })
    },
  })

  const saveTextBeforeUndo = () => {
    if (_index > -1 && _isTextEditing) {
      _object.classList.remove('selected')
      _object.firstChild.style.cursor = 'default'
      _object.firstChild.style.pointerEvents = 'none'
      _object.firstChild.childNodes[2].contentEditable = false
      window.getSelection()?.removeAllRanges()
      updateCurrentTextObject()
      setIsTextEditing(false)
      setTextObjectIndex(_index)
    }
  }

  const getCurrentText = (textContainer: HTMLElement) => {
    const text = textContainer.childNodes[2] as HTMLElement

    const texts: any = []
    text.childNodes.forEach((t: any) => {
      if (t.textContent) texts.push(t.textContent)
      else texts.push('\n')
    })

    return texts
  }

  const updateCurrentTextObject = () => {
    const textContainer: any = _object.firstChild
    if (!textContainer.classList.contains('text-container')) return
    const texts = getCurrentText(textContainer)

    const autogrow = textContainer.childNodes[1] as HTMLElement
    const { height: autogrowHeight } = getComputedStyle(autogrow)
    const { style, props } = objects[_index]

    updateObject({
      object: {
        ...objects[_index],
        style: {
          ...style,
          height: parseFloat(autogrowHeight),
        },
        props: {
          ...props,
          autogrowStyle: {
            ...props.autogrowStyle,
            height: autogrowHeight,
          },
          texts,
        },
      },
    })

    updateHistory(UPDATE_OBJECT, {
      object: objects[_index],
    })
  }

  const updateTextObject = () => {
    const textContainer: any = _object.firstChild
    if (!textContainer.classList.contains('text-container')) return
    const texts = getCurrentText(textContainer)

    const autogrow = textContainer.childNodes[1] as HTMLElement
    const { height: autogrowHeight } = getComputedStyle(autogrow)
    const { style, props } = objects[_textObjectIndex]

    if (arraysEqual(props.texts, texts)) {
      setTextObjectIndex(-1)
      return
    }

    updateObject({
      object: {
        ...objects[_textObjectIndex],
        style: {
          ...style,
          height: parseFloat(autogrowHeight),
        },
        props: {
          ...props,
          autogrowStyle: {
            ...props.autogrowStyle,
            height: autogrowHeight,
          },
          texts,
        },
      },
    })

    updateHistory(UPDATE_OBJECT, { object: objects[_textObjectIndex] })

    setTextObjectIndex(-1)
  }

  const rotateTextResizers = (rotateAngle: number) => {
    const resizers: any = document.querySelectorAll('.resize')
    resizers.forEach((r: HTMLElement) => {
      r.style.transform = `rotateZ(${rotateAngle}deg)`
    })
  }

  const selectionDragStart = (e: any) => {
    let startX = e.clientX / scale
    let startY = e.clientY / scale

    _isMouseDown = true

    const onMouseMove = (sube: any) => {
      if (!_isMouseDown) return
      sube.stopImmediatePropagation()
      const clientX = sube.clientX / scale
      const clientY = sube.clientY / scale
      const deltaX = clientX - startX
      const deltaY = clientY - startY

      let minLeft = 0
      let minTop = 0

      Object.keys(_groupObjects).forEach((k: string, i: number) => {
        const { top, left } = getComputedStyle(_groupObjects[k])
        const t = parseFloat(top)
        const l = parseFloat(left)
        if (i === 0) {
          minLeft = l
          minTop = t
        } else {
          if (t < minTop) minTop = t
          if (l < minLeft) minLeft = l
        }
      })

      Object.keys(_groupObjects).forEach((k: string) => {
        const { top, left } = getComputedStyle(_groupObjects[k])
        const t = parseFloat(top)
        const l = parseFloat(left)
        _groupObjects[k].style.top = t + deltaY + 'px'
        _groupObjects[k].style.left = l + deltaX + 'px'
        moveResizers({
          object: _groupObjects[k],
          objectType: 'group',
          styles: {
            ..._groupStyles,
            top: minTop + deltaY,
            left: minLeft + deltaX,
          },
        })

        groupRef.current.style.top = (minTop + deltaY) * scale + 'px'
        groupRef.current.style.left = (minLeft + deltaX) * scale + 'px'
      })

      startX = clientX
      startY = clientY
    }

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      if (!_isMouseDown) return
      _isMouseDown = false

      const _objects = Object.keys(_groupObjects).map((k: string) => {
        const { top, left, width, height } = getComputedStyle(_groupObjects[k])
        const newContainer = {
          ...containers[parseFloat(k)],
          style: {
            ...containers[parseFloat(k)].style,
            top: parseFloat(top),
            left: parseFloat(left),
            width: parseFloat(width),
            height: parseFloat(height),
            // rotateAngle: _rotateAngle,
            // transform: `rotateZ(${_rotateAngle}deg)`,
          },
        }
        return newContainer
      })

      updateGroupContainer({ containers: _objects })
      updateHistory(UPDATE_GROUP_CONTAINER, {
        containers: containers.filter((c: Container) => _objects.find((x) => x.id === c.id)),
      })
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  }

  const updateObjectStyle = (o: any, object?: any) => {
    if (!object) object = document.getElementById(o.id)

    const { top, left, width, height, zIndex } = getComputedStyle(object)
    const { transform } = object.style
    const rotateAngle = getRotationScaler(transform)

    const newObject = {
      ...o,
      style: {
        ...o.style,
        top: parseFloat(top),
        left: parseFloat(left),
        width: parseFloat(width),
        height: parseFloat(height),
        zIndex,
        rotateAngle,
        transform,
      },
    }

    if (JSON.stringify(newObject) !== JSON.stringify(o)) {
      console.log('before')
      console.log(o)

      console.log('after')
      console.log(newObject)

      updateObject({ object: newObject })
      updateHistory(UPDATE_OBJECT, { object: o })
    }
  }

  const removeImageFromObject = () => {
    if (_objectType !== 'image' || _index === -1) return

    const newObject = {
      ...objects[_index],
      props: {
        style: { transform: 'scaleX(1)' },
        className: 'image-placeholder',
        imageStyle: { display: 'none', top: 0, left: 0, width: '100%' },
        placeholderStyle: { opacity: 0.5, backgroundColor: '#6c928e' },
      },
    }

    updateObject({ object: newObject })
    updateHistory(UPDATE_OBJECT, { object: objects[_index] })
  }
  const rotateLeftObject = () => {
    if (_index > -1) {
      const rotateAngle = objects[_index]?.style.rotateAngle || 0 - 90
      _object.style.transform = `rotate(${rotateAngle}deg)`
      _rotateAngle = rotateAngle
      console.log(objects[_index])
      updateObjectStyle(objects[_index])
      moveResizers()
    }
  }
  const rotateRightObject = () => {
    if (_index > -1) {
      const rotateAngle = objects[_index]?.style.rotateAngle || 0 + 90
      _object.style.transform = `rotate(${rotateAngle}deg)`
      _rotateAngle = rotateAngle
      updateObjectStyle(objects[_index])
      moveResizers()
    }
  }

  const sendForward = () => {
    if (_index > -1) {
      const objs: any = document.querySelectorAll('.object')
      const current = parseInt(objs[_index].style.zIndex, 10)

      if (current - 100 < objs.length - 1) {
        for (let i = 0; i < objs.length; i += 1) {
          if (parseInt(objs[i].style.zIndex, 10) === current + 1) {
            objs[i].style.zIndex = current
            break
          }
        }
        objs[_index].style.zIndex = current + 1

        updateObject({
          object: {
            ...objects[_index],
            style: {
              ...objects[_index].style,
              zIndex: current + 1 + '',
            },
          },
        })

        updateHistory(UPDATE_OBJECT, { object: objects[_index] })
      }
    }
  }

  const sendBackward = () => {
    const objs: any = document.querySelectorAll('.object')
    const current = parseInt(objs[_index].style.zIndex, 10)

    if (current > 100) {
      for (let i = 0; i < objs.length; i += 1) {
        if (parseInt(objs[i].style.zIndex, 10) === current - 1) {
          objs[i].style.zIndex = current
          break
        }
      }
      objs[_index].style.zIndex = current - 1

      updateObject({
        object: {
          ...objects[_index],
          style: {
            ...objects[_index].style,
            zIndex: current - 1 + '',
          },
        },
      })

      updateHistory(UPDATE_OBJECT, { object: objects[_index] })
    }
  }

  const deselectObject = () => {
    setObjectIndex(-1)
    hideResizer()
    hideToolbar()
    hideActiveBorder()
    hideGroupSelection()
  }

  const updateText = (e?: any) => {
    if (_index === -1) return
    // 8 is backspace
    if (e && e.key && e.keyCode !== 8) {
      if (e.keyCode === 16) {
        _isShiftDown = true
        return
      }
      if (e.keyCode === 17) {
        _isCtrlDown = true
        return
      }
      if (e.key.length > 1) return
      if (!/[a-zA-Z0-9]/.test(e.key[0])) return
      if (_isShiftDown || _isCtrlDown) return
    }

    const textContainer: any = _object.firstChild
    if (!textContainer.classList.contains('text-container')) return
    const autogrow = textContainer.childNodes[1] // because 0 index is the border
    const text = textContainer.childNodes[2] as HTMLElement

    const { left, height } = getComputedStyle(text)
    const { height: autogrowHeight } = getComputedStyle(autogrow)
    const kPadding = parseFloat(left)
    const textHeight = parseFloat(height)

    if (textHeight !== parseFloat(autogrowHeight) - kPadding * 2) {
      const newHeight = textHeight + kPadding * 2
      const angle = objects[_index].style.rotateAngle

      _object.style.height = newHeight + 'px'
      autogrow.style.height = newHeight + 'px'

      moveResizers({ angle })
    }
  }

  const onObjectDoubleClick = (e: any, o: any, index: any) => {
    const child = e.target.firstChild
    if (child && child.classList && child.classList.contains('text-container')) {
      setIsTextEditing(true)
      setObjectIndex(index)
      child.style.pointerEvents = 'auto'
      child.style.cursor = 'text'
      child.childNodes[2].contentEditable = true
    }
  }

  const onDragObjectOver = (e: any) => {
    e.stopPropagation()
    e.preventDefault()
    if (e.target.classList.contains('object') && e.target.childNodes[0].className === 'image-placeholder') {
      e.target.style.border = '3px dashed #00d9e1'
    }
  }

  const onDragObjectLeave = (e: any) => {
    if (_index && e.target.classList.contains('object') && e.target.childNodes[0].className === 'image-placeholder') {
      e.target.style.border = 'none'
    }
  }

  const hideResizer = () => {
    const resizers: any = document.querySelectorAll('.resize')
    if (resizers) {
      resizers.forEach((r: any) => {
        r.style.display = 'none'
        return r
      })
    }

    const rotate: any = document.querySelector('.rotate')
    if (rotate) {
      rotate.style.display = 'none'
    }
  }

  const hideGroupSelection = () => {
    const groupSelection = document.querySelector('.group-selection') as HTMLElement

    if (groupSelection) {
      groupSelection.style.display = 'none'
      groupSelection.style.top = '0'
      groupSelection.style.left = '0'
      groupSelection.style.width = '0'
      groupSelection.style.height = '0'
    }
  }

  const showGroupSelection = () => {
    const groupSelection = document.querySelector('.group-selection') as HTMLElement
    groupSelection.style.display = 'block'
  }

  const showBorder = (object: HTMLElement) => {
    if (!object.classList.contains('object')) return
    const child = object.firstChild as HTMLElement
    const border = child.firstChild as HTMLElement
    border.style.borderWidth = 3 / scale + 'px'
    border.style.display = 'block'
    showGroupSelection()
  }

  const hideBorder = (object: HTMLElement) => {
    if (!object.classList.contains('object')) return
    const child = object.firstChild as HTMLElement
    const border = child.firstChild as HTMLElement
    border.style.display = 'none'
    hideGroupSelection()
  }

  const showImageCircle = (object: HTMLElement) => {
    if (_objectType !== 'image' || !object.classList.contains('object')) return
    const child = object.firstChild as HTMLElement
    const circle = child.lastChild as HTMLElement
    circle.style.display = 'flex'

    showGroupSelection()
  }

  const hideImageCircle = (object: HTMLElement) => {
    if (_objectType !== 'image' || !object?.classList.contains('object')) return
    const child = object.firstChild as HTMLElement
    const circle = child.lastChild as HTMLElement
    circle.style.display = 'none'

    hideGroupSelection()
  }

  const objectHoverOff = (e: any, index: number) => {
    if (index !== _index && !_isMouseDown) {
      hideBorder(e.target)
      setOverflow('hidden')
    }
  }

  const objectHover = (e: any, index: number) => {
    if (index !== _index && !_isMouseDown) {
      showBorder(e.target)
    }
  }

  const createText = () => {
    hideToolbar()
    const style = {
      top: 100,
      left: 100,
      width: 300,
      height: 80,
      rotateAngle: 0,
      transform: '',
      zIndex: 100 + objects.length + '',
    }

    const textStyle = {
      color: '#333',
    }

    const autogrowStyle = {
      height: '80px',
    }

    addObject({
      object: {
        id: uuidv4(),
        className: 'object',
        style,
        props: {
          textStyle,
          autogrowStyle,
          className: 'text-container',
          style: { transform: 'scaleX(1)' },
          texts: ['Enter text here'],
          placeholderStyle: { opacity: 1 },
        },
      },
    })
    setObjectType('text')
  }

  const createImage = () => {
    hideToolbar()
    const style = {
      top: 100,
      left: 100,
      width: 500,
      height: 300,
      rotateAngle: 0,
      transform: '',
      zIndex: 100 + objects.length + '',
    }

    addObject({
      object: {
        id: uuidv4(),
        className: 'object',
        style,
        props: {
          style: { transform: 'scaleX(1)' },
          className: 'image-placeholder',
          imageStyle: { display: 'none', top: 0, left: 0, width: '100%' },
          placeholderStyle: { opacity: 0.5, backgroundColor: '#6c928e' },
        },
      },
    })
    setObjectType('image')
  }

  const saveObjects = () => {
    setVisible.setTrue()
  }

  const rotate = (angle: number) => {
    const transform = _object.style.transform.replace(/rotate\(([^)]+)\)/, `rotate(${angle}deg)`)
    // initilly container doesn't have transform property
    _object.style.transform = transform || 'rotate(0deg)'
    _rotateAngle = angle
    moveResizers()
  }

  const onRotate = (angle: number, startAngle: number) => {
    let rotateAngle = Math.round(startAngle + angle)

    if (rotateAngle >= 360) {
      rotateAngle -= 360
    } else if (rotateAngle < 0) {
      rotateAngle += 360
    }
    if (rotateAngle > 356 || rotateAngle < 4) {
      rotateAngle = 0
    } else if (rotateAngle > 86 && rotateAngle < 94) {
      rotateAngle = 90
    } else if (rotateAngle > 176 && rotateAngle < 184) {
      rotateAngle = 180
    } else if (rotateAngle > 266 && rotateAngle < 274) {
      rotateAngle = 270
    }

    rotate(rotateAngle)
    rotateTextResizers(rotateAngle)
  }

  const startRotate = (e: any) => {
    if (e.button !== 0) return
    const clientX = e.clientX / scale
    const clientY = e.clientY / scale

    const rect = _object.getBoundingClientRect()
    const { rotateAngle } = objects[_index].style
    _isMouseDown = true

    const center = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    }
    const startVector = {
      x: clientX - center.x / scale,
      y: clientY - center.y / scale,
    }

    const onMouseMove = (sube: any) => {
      if (!_isMouseDown) return
      sube.stopImmediatePropagation()
      const rotateVector = {
        x: sube.clientX - center.x,
        y: sube.clientY - center.y,
      }
      const angle = getAngle(startVector, rotateVector)
      onRotate(angle, rotateAngle)
    }
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
      if (!_isMouseDown) return
      _isMouseDown = false
      if (_index > -1) {
        updateObjectStyle(objects[_index])
      }
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }

  const resizeObject = (
    {
      top,
      left,
      width,
      height,
      rotateAngle,
    }: {
      top: number
      left: number
      width: number
      height: number
      rotateAngle: number
    },
    type: string
  ) => {
    _object.style.top = top + 'px'
    _object.style.left = left + 'px'
    _object.style.width = width + 'px'
    _object.style.height = height + 'px'
    moveResizers({ angle: rotateAngle, width, height, type })
  }

  const onResize = (
    length: number,
    alpha: number,
    rect: {
      width: number
      height: number
      centerX: number
      centerY: number
      rotateAngle: number
    },
    type: string,
    isShiftKey: boolean
  ) => {
    const minWidth = 20 / scale
    const minHeight = 20 / scale

    const beta = alpha - degToRadian(rect.rotateAngle)
    const deltaW = length * Math.cos(beta)
    const deltaH = length * Math.sin(beta)
    const ratio = isShiftKey ? rect.width / rect.height : undefined
    const {
      position: { centerX, centerY },
      size: { width, height },
    } = getNewStyle(type, { ...rect, rotateAngle: rect.rotateAngle }, deltaW, deltaH, ratio, minWidth, minHeight)

    resizeObject(
      centerToTL({
        centerX,
        centerY,
        width,
        height,
        rotateAngle: rect.rotateAngle,
      }),
      type
    )
  }

  const startResize = (e: any, cursor: string, type: string) => {
    if (e.button !== 0 || _index === -1) return

    document.body.style.cursor = cursor
    const startX = e.clientX / scale
    const startY = e.clientY / scale
    const { top: t, left: l, width: w, height: h } = getComputedStyle(_object)

    const { rotateAngle } = objects[_index].style

    const {
      position: { centerX, centerY },
      size: { width, height },
    } = tLToCenter({
      top: parseFloat(t),
      left: parseFloat(l),
      width: parseFloat(w),
      height: parseFloat(h),
    })

    console.log('rotateAngle: ' + rotateAngle)

    const rect = { width, height, centerX, centerY, rotateAngle }

    _isMouseDown = true

    const onMouseMove = (sube: any) => {
      if (!_isMouseDown) return
      sube.stopImmediatePropagation()

      const clientX = sube.clientX / scale
      const clientY = sube.clientY / scale
      const deltaX = clientX - startX
      const deltaY = clientY - startY
      const alpha = Math.atan2(deltaY, deltaX)
      const deltaL = getLength(deltaX, deltaY)
      const isShiftKey = sube.shiftKey
      onResize(deltaL, alpha, rect, type, isShiftKey)
    }

    const onMouseUp = () => {
      document.body.style.cursor = 'auto'
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
      if (!_isMouseDown) return
      _isMouseDown = false

      if (_index > -1) {
        updateObjectStyle(objects[_index])
      }
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }

  const onDrag = (deltaX: number, deltaY: number, object: any, objectType: string) => {
    const { top, left } = getComputedStyle(object)

    const t = parseFloat(top)
    const l = parseFloat(left)

    object.style.top = t + deltaY + 'px'
    object.style.left = l + deltaX + 'px'
    moveResizers({ object, objectType })
  }

  const getObjectType = (classList: any) => {
    let objectType: SetStateAction<string>
    if (!classList) return 'text'
    if (classList.contains('image-placeholder')) {
      objectType = 'image'
    } else if (classList.contains('shape')) {
      objectType = 'shape'
    } else if (classList.contains('text-container')) {
      objectType = 'text'
    } else {
      objectType = ''
    }

    return objectType
  }

  const startDrag = (e: any, o: any, index: number) => {
    if (_isTextEditing && e.target.nodeName === 'P') return
    if (e.target.classList.contains('image-center')) return

    if (_object) hideImageCircle(_object)

    let startX = e.clientX / scale
    let startY = e.clientY / scale
    hideBorder(e.target)
    showImageCircle(e.target)

    _isMouseDown = true
    _rotateAngle = o.style.rotateAngle || 0

    const objectType = getObjectType(e.target.firstChild?.classList)
    const object = document.getElementById(o.id) as HTMLElement

    if (objectType === 'text') rotateTextResizers(_rotateAngle)

    moveResizers({ object, angle: _rotateAngle, objectType })
    setObjectType(objectType)
    setObjectIndex(index)
    setObject(object)

    const onMouseMove = (sube: any) => {
      if (!_isMouseDown) return
      sube.stopImmediatePropagation()
      const clientX = sube.clientX / scale
      const clientY = sube.clientY / scale
      const deltaX = clientX - startX
      const deltaY = clientY - startY
      onDrag(deltaX, deltaY, object, objectType)
      startX = clientX
      startY = clientY
    }

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      if (!_isMouseDown) return
      _isMouseDown = false

      if (index > -1) {
        updateObjectStyle(o, object)
      }
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  }

  const getRotatedPosition = ({
    x,
    y,
    cx,
    cy,
    theta,
  }: {
    x: number
    y: number
    cx: number
    cy: number
    theta: number
  }) => {
    if (!theta) theta = 0

    // translate point to origin
    const tempX = x - cx
    const tempY = y - cy

    // applying rotation
    const rotatedX = tempX * Math.cos(theta) - tempY * Math.sin(theta)
    const rotatedY = tempX * Math.sin(theta) + tempY * Math.cos(theta)

    // translated back
    x = rotatedX + cx
    y = rotatedY + cy

    return { x: x * scale, y: y * scale }
  }

  const calculateCenter = (styles: { top: any; left: any; width: any; height: any }, angle: any) => {
    const t = parseFloat(styles.top)
    const l = parseFloat(styles.left)
    const w = parseFloat(styles.width)
    const h = parseFloat(styles.height)

    const theta = degToRadian(angle)

    // center of square coordinates
    const cx = l + w / 2
    const cy = t + h / 2

    return {
      options: { x: l, y: t, cx, cy, theta },
      rect: {
        t,
        l,
        w,
        h,
      },
    }
  }

  const hideActiveBorder = () => {
    const activeBorder: any = document.querySelector('.active-border')
    if (activeBorder) {
      activeBorder.style.display = 'none'
      setOverflow('hidden')
      // hideResizer();
      hideToolbar()
      if (_object) hideImageCircle(_object)
    }
  }

  const showActiveBorder = (border: any, options: any, w: number, h: number, angle?: number) => {
    const { x, y } = getRotatedPosition({ ...options })
    if (border) {
      border.style.left = x + 'px'
      border.style.top = y + 'px'
      border.style.width = w * scale + 'px'
      border.style.height = h * scale + 'px'
      border.style.display = 'block'
      border.style.transform = `rotate(${angle || _rotateAngle}deg)`
    }
    setOverflow('unset')
  }

  const hideToolbar = () => {
    const toolbar: any = document.querySelector('.toolbar')
    if (toolbar) {
      toolbar.style.display = 'none'
    }
  }

  const moveToolbar = (
    toolbar: any,
    options: any,
    {
      t,
      l,
      w,
      h,
      maxY,
    }: {
      t: number
      l: number
      w: number
      h: number
      maxY: number
    }
  ) => {
    if (!slideViewRef.current) return

    const { x } = getRotatedPosition({
      ...options,
      x: l + w / 2,
      y: t + h / 2,
    })

    const { width } = getComputedStyle(toolbar)

    const slideViewRect: any = slideViewRef.current.getBoundingClientRect()
    const scaledContainerRect: any = scaledContainerRef.current.getBoundingClientRect()

    const leftSpace = scaledContainerRect.x - slideViewRect.x
    const topSpace = scaledContainerRect.y - slideViewRect.y

    toolbar.style.left = x + leftSpace - parseFloat(width) / 2 + 'px'
    const toolbarDistance = _rotaterDistance + 20 // 20 is rotater width
    if (scaledContainerRect.bottom - maxY - topSpace - toolbarDistance <= 100) {
      toolbar.style.top = t - topSpace - toolbarDistance + 'px'
    } else {
      toolbar.style.top = maxY + topSpace + toolbarDistance + 'px'
    }
  }

  const moveResizers = (props?: any) => {
    let { object, angle, objectType, styles } = props || {}

    if (!angle) {
      if (_object) angle = getRotationScaler(_object.style.transform)
      else angle = _rotateAngle || 0
    }
    if (!object) object = _object
    if (!objectType) objectType = _objectType
    if (!styles) {
      const { top, left, width, height } = getComputedStyle(object)
      styles = {
        top,
        left,
        width,
        height,
      }
    }

    const {
      options,
      rect: { t, l, w, h },
    } = calculateCenter(styles, angle)

    // ---

    const rotater: DomType = document.querySelector('.rotate') || ({} as DomType)
    if (rotater) rotater.style.display = 'block'

    const toolbar: DomType = document.querySelector('.toolbar') || ({} as DomType)
    if (toolbar) toolbar.style.display = 'flex'

    const activeBorder = document.querySelector('.active-border')
    showActiveBorder(activeBorder, options, w, h, angle)

    if (objectType === 'group') {
      hideResizer()
      hideToolbar()
      return
    }

    const { x, y } = getRotatedPosition({
      ...options,
      x: l + w / 2,
      y: t - _rotaterDistance / scale,
    })

    const scaledDimensions = 20

    const midpoint = scaledDimensions / 2

    rotater.style.top = y - midpoint + 'px'
    rotater.style.left = x - midpoint + 'px'
    rotater.style.width = scaledDimensions + 'px'
    rotater.style.height = scaledDimensions + 'px'

    let maxY = 0

    const resizers: any = document.querySelectorAll('.resize')
    resizers.forEach((r: any) => {
      r.style.width = scaledDimensions + 'px'
      r.style.height = scaledDimensions + 'px'

      if (r.classList.contains('tl')) {
        const _position = getRotatedPosition({ ...options })
        r.style.left = _position.x - midpoint + 'px'
        r.style.top = _position.y - midpoint + 'px'
        r.style.display = objectType === 'text' ? 'none' : 'block'
        if (_position.y > maxY) maxY = _position.y
      } else if (r.classList.contains('tr')) {
        const _position = getRotatedPosition({ ...options, x: l + w })
        r.style.left = _position.x - midpoint + 'px'
        r.style.top = _position.y - midpoint + 'px'
        r.style.display = objectType === 'text' ? 'none' : 'block'
        if (_position.y > maxY) maxY = _position.y
      } else if (r.classList.contains('bl')) {
        const _position = getRotatedPosition({ ...options, y: t + h })
        r.style.left = _position.x - midpoint + 'px'
        r.style.top = _position.y - midpoint + 'px'
        r.style.display = objectType === 'text' ? 'none' : 'block'
        if (_position.y > maxY) maxY = _position.y
      } else if (r.classList.contains('br')) {
        const _position = getRotatedPosition({ ...options, x: l + w, y: t + h })
        r.style.left = _position.x - midpoint + 'px'
        r.style.top = _position.y - midpoint + 'px'
        r.style.display = objectType === 'text' ? 'none' : 'block'
        if (_position.y > maxY) maxY = _position.y
      } else if (r.classList.contains('t')) {
        const _position = getRotatedPosition({ ...options, x: l + w / 2 })
        r.style.left = _position.x - midpoint + 'px'
        r.style.top = _position.y - midpoint + 'px'
        r.style.display = objectType === 'text' ? 'none' : 'block'
        if (_position.y > maxY) maxY = _position.y
      } else if (r.classList.contains('b')) {
        const _position = getRotatedPosition({
          ...options,
          x: l + w / 2,
          y: t + h,
        })
        r.style.left = _position.x - midpoint + 'px'
        r.style.top = _position.y - midpoint + 'px'
        r.style.display = objectType === 'text' ? 'none' : 'block'
        if (_position.y > maxY) maxY = _position.y
      } else if (r.classList.contains('l')) {
        const _position = getRotatedPosition({ ...options, y: t + h / 2 })

        if (objectType === 'text') {
          r.style.width = 4 + 'px'
          r.style.left = _position.x - midpoint + 9 + 'px'
          r.style.top = _position.y - midpoint + 'px'
        } else {
          r.style.left = _position.x - midpoint + 'px'
          r.style.top = _position.y - midpoint + 'px'
        }

        r.style.display = 'block'
        if (_position.y > maxY) maxY = _position.y
      } else if (r.classList.contains('r')) {
        const _position = getRotatedPosition({
          ...options,
          x: l + w,
          y: t + h / 2,
        })

        if (objectType === 'text') {
          r.style.width = 4 + 'px'
          r.style.left = _position.x - midpoint + 6 + 'px'
          r.style.top = _position.y - midpoint + 'px'
        } else {
          r.style.left = _position.x - midpoint + 'px'
          r.style.top = _position.y - midpoint + 'px'
        }
        r.style.display = 'block'
        if (_position.y > maxY) maxY = _position.y
      }
    })

    setTimeout(() => {
      moveToolbar(toolbar, options, { t, l, w, h, maxY })
    }, 0)
  }

  useEffect(() => {
    const debouncedHandleResize = debounce(function handleResize() {
      hideResizer()
      hideToolbar()
      hideActiveBorder()
      setSlidePosition()
    }, 100)
    window.addEventListener('resize', debouncedHandleResize)
    return () => {
      window.removeEventListener('resize', debouncedHandleResize)
    }
  })
  const setSlidePosition = () => {
    if (slideContainer.current === null) return
    slideContainer.current.classList.add('center-slide')

    const editorPanelContainer: any = document.querySelector('.EditorPanelContainer')
    if (editorPanelContainer) {
      editorPanelContainer.style.width = '8in'
    }

    scaledContainerRef.current.style.width = '8in'
    scaledContainerRef.current.style.height = '8in'

    const slide = document.querySelector('#slide') as HTMLElement
    slide.style.width = '8in'
    slide.style.height = '8in'

    editorContainerRef.current.style.width = '8in'
    editorContainerRef.current.style.height = '8in'
  }

  useEffect(() => {
    if (editor.dragStart) {
      if (editor.imageType === 'backgrounds') {
        const backgroundDrops: any = document.querySelectorAll('.background-drop')
        backgroundDrops.forEach((background: any) => {
          background.style.display = 'block'
        })
      } else if (editor.imageType === 'layouts') {
        const layoutDrops: any = document.querySelectorAll('.layout-drop')
        layoutDrops.forEach((layout: any) => {
          layout.style.display = 'block'
        })
      }
    } else if (editor.imageType === 'backgrounds') {
      const backgroundDrops: any = document.querySelectorAll('.background-drop')
      backgroundDrops.forEach((background: any) => {
        background.style.display = 'none'
      })
    } else if (editor.imageType === 'layouts') {
      const layoutDrops: any = document.querySelectorAll('.layout-drop')
      layoutDrops.forEach((layout: any) => {
        layout.style.display = 'none'
      })
    }
  }, [editor.dragStart, editor.imageType])

  return get.loading ? (
    <div className="AdvancedEditorWrapper">
      <div className="EditorOnePageView">
        <Spinner />
      </div>
    </div>
  ) : (
    <div className="AdvancedEditorWrapper">
      <Header deselectObject={deselectObject} saveObjects={saveObjects} saveTextBeforeUndo={saveTextBeforeUndo} />
      <div className="EditorOnePageView">
        <div className="EditorPanel">
          <div className="EditorLayoutPanelContainer">
            <div ref={slideViewRef} className="StepSlideContainer SlideViewContainer">
              <div id="editor_container" ref={editorContainerRef}>
                <Toolbar
                  object={_object}
                  isLayout
                  objectType={_objectType}
                  index={_index}
                  objects={objects}
                  updateObject={updateObject}
                  updateHistory={updateHistory}
                  moveResizers={moveResizers}
                  removeImageFromObject={removeImageFromObject}
                  rotateLeftObject={rotateLeftObject}
                  rotateRightObject={rotateRightObject}
                  sendForward={sendForward}
                  sendBackward={sendBackward}
                  removeObject={() => {
                    if (_index > -1) {
                      removeObject({
                        container: containers[_index],
                        object: objects[_index],
                      })
                      deselectObject()
                    }
                  }}
                />
                <div id="selection" hidden ref={selectionRef} />
                <SideButtons createImage={createImage} createText={createText} settings={false} />
                <div id="slide_container" ref={slideContainer}>
                  <div id="slide" style={{ overflow }}>
                    <div id="layout_scaled_container" ref={scaledContainerRef}>
                      <div className="layout-drop layout-drop-left" />
                      <div ref={canvasRef} id="canvas_container">
                        <div id="container">
                          {objects.map((o: any, i: any) => {
                            return (
                              <div
                                id={o.id}
                                key={o.id}
                                style={o.style}
                                className={o.className}
                                onMouseDown={(e) => startDrag(e, o, i)}
                                onMouseEnter={(e) => objectHover(e, o)}
                                onMouseLeave={(e) => objectHoverOff(e, o)}
                                onDragOver={onDragObjectOver}
                                onDragLeave={onDragObjectLeave}
                                onDoubleClick={(e) => onObjectDoubleClick(e, o, i)}
                                onInput={updateText}
                                onPaste={updateText}
                                onBlur={(e) => {
                                  updateText(e)
                                  if (_textObjectIndex > -1) {
                                    updateTextObject()
                                  }
                                }}
                                onKeyDown={updateText}
                                onKeyUp={(e: any) => {
                                  if (e.keyCode === 16) _isShiftDown = false
                                  if (e.keyCode === 17) _isCtrlDown = false
                                }}
                              >
                                {renderObject({
                                  object: o,
                                  updateObject,
                                  updateHistory,
                                  saveObjects,
                                  scale,
                                })}
                              </div>
                            )
                          })}
                        </div>
                      </div>

                      <div className="group-selection" ref={groupRef} onMouseDown={selectionDragStart} />
                      <div className="active-border" />
                      <div className="page-border" />
                      <div className="rotate" onMouseDown={startRotate} />
                      {Object.keys(transformers).map((t: string) => {
                        const cursor = `${t}-resize`
                        const resize = transformers[t]
                        return (
                          <div
                            key={t}
                            style={{ cursor }}
                            onMouseDown={(e) => startResize(e, cursor, resize)}
                            className={`resize ${resize}`}
                          />
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <FormModal
        form={form}
        type="default"
        visible={visible}
        name={`${key}_form`}
        initialValues={{
          layoutCategories: get.data?.layoutCategories?.map((a) => a.id),
          name: get.data?.name,
        }}
        loading={createAction.loading || updateAction.loading}
        title={intl.formatMessage({ id: 'layout' })}
        onCancel={() => {
          setVisible.setFalse()
        }}
        onFinish={(values) => {
          message.loading({
            content: intl.formatMessage({ id: 'loading!' }),
            key,
          })
          const container = document.getElementById('slide')
          const containerWidth = container?.offsetWidth || 960 - 20
          const containerHeight = container?.offsetHeight || 877 - 20
          if (id) {
            updateAction.run(id, {
              ...values,
              objects: objects.map(({ style, props }) =>
                positionsToPercent({ ...style, containerHeight, containerWidth, className: props.className })
              ),
            })
          } else {
            createAction.run({
              ...values,
              objects: objects.map(({ style, props }) =>
                positionsToPercent({ ...style, containerHeight, containerWidth, className: props.className })
              ),
            })
          }
        }}
      >
        <Row>
          <Col xs={24} sm={24} xl={24}>
            <Form.Item name="name" label={intl.formatMessage({ id: 'name' })} rules={[{ required: true }]} hasFeedback>
              <Input placeholder={intl.formatMessage({ id: 'name' })} />
            </Form.Item>
            <Form.Item
              name="layoutCategories"
              label={intl.formatMessage({ id: 'categories' })}
              rules={[{ required: true }]}
              hasFeedback
            >
              <Select mode="multiple" loading={categories.loading}>
                {categories?.data?.map((category) => (
                  <Select.Option key={category.id} value={category.id}>
                    {category.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </FormModal>
    </div>
  )
}

const mapStateToProps = (state: StateInterface) => ({
  editor: state.editor,
  project: state.project,
})

export default connect(mapStateToProps, {
  loadObjects: _loadObjects,
  loadContainers: _loadContainers,
  updateContainer: _updateContainer,
  updateGroupContainer: _updateGroupContainer,
  updateObject: _updateObject,
  updateHistory: _updateHistory,
  addObject: _addObject,
  removeObject: _removeObject,
})(BookEditor)
