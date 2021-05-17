/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable consistent-return */
import React, { useState, useEffect, useRef, SetStateAction } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { connect } from 'react-redux'
import { v4 as uuidv4 } from 'uuid'
import {
  updateHistory as _updateHistory,
  addLayout as _addLayout,
  addObject as _addObject,
  removeObject as _removeObject,
  loadObjects as _loadObjects,
  loadContainers as _loadContainers,
  loadBackgrounds as _loadBackgrounds,
  updateContainer as _updateContainer,
  updateGroupContainer as _updateGroupContainer,
  updateBackground as _updateBackground,
  updateObject as _updateObject,
  setBackgrounds as _setBackgrounds,
} from 'redux/actions/project'
import { ADD_LAYOUT, UPDATE_GROUP_CONTAINER, UPDATE_OBJECT } from 'redux/actions/types'

import { Container, DomType, HistoryProps, LayoutObject, Size } from 'interfaces'
import Spinner from 'components/spinner'
import {
  getLength,
  degToRadian,
  getNewStyle,
  centerToTL,
  tLToCenter,
  getAngle,
  layoutPositionsToText,
  layoutPositionsToImage,
} from 'utils/transformer-lib'
import { arraysEqual, debounce, getRotationScaler } from 'utils'
import { useLocation } from 'react-router'
import { useQuery } from 'hooks'
import { getCoverType } from 'api'

import { useRequest } from 'ahooks'
import { Header, BackgroundImages, SideButtons, SideBarPanel, Toolbar } from './components/layout'
import { renderBackground, renderObject } from './components/utils'
import './components/styles/editor.scss'

interface Props {
  getProjects: any
  editor: any
  project: any
  loadObjects: any
  loadContainers: any
  updateContainer: any
  updateGroupContainer: any
  updateBackground: any
  updateObject: (props: { object: Object }) => void
  setBackgrounds: any
  loadBackgrounds: any
  updateHistory: (historyType: string, props: HistoryProps) => void
  addLayout: any
  addObject: any
  removeObject: any
}

const BookEditor: React.FC<Props> = ({
  editor,
  loadObjects,
  updateGroupContainer,
  updateBackground,
  updateObject,
  setBackgrounds,
  updateHistory,
  addLayout,
  addObject,
  removeObject,
  project: {
    currentProject,
    objects,
    containers,
    backgrounds,
    bgStyles,
    slideWidth,
    slideHeight,
    layout,
    layouts,
    loading,
  },
}) => {
  // refs
  const id = useQuery(useLocation().search).get('id')
  const slideViewRef: any = useRef(null)
  const editorContainerRef: any = useRef(null)
  const slideContainer: any = useRef(null)
  const selectionRef: any = useRef(null)
  const canvasRef = useRef<any>(null)
  const scaledContainerRef = useRef<any>(null)
  const groupRef = useRef<any>(null)
  const [overflow, setOverflow] = useState<string>('hidden')

  // states
  const [scale, setScale] = useState<number>(1)
  const [fitScale, setFitScale] = useState<number>(1)
  const [_objectType, setObjectType] = useState<string>('')
  const [_isTextEditing, setIsTextEditing] = useState<boolean>(false)
  const [_index, setObjectIndex] = useState<number>(-1)
  const [_textObjectIndex, setTextObjectIndex] = useState<number>(-1)
  const [_object, setObject] = useState<any>(null)
  const [_groupObjects, setGroupObjects] = useState<any>(null)

  const [_groupStyles, setGroupStyles] = useState<{
    left: any
    top: any
    width: any
    height: any
  }>()
  useHotkeys('shift+a', () => onRotateLeftObject(), [_index, objects])
  useHotkeys('shift+d', () => onRotateRightObject(), [_index, objects])
  useHotkeys('shift+q', () => onFlipObject(), [_index, objects])
  useHotkeys('shift+w', () => onSendForward(), [_index, objects])
  useHotkeys('shift+s', () => onSendBackward(), [_index, objects])
  useHotkeys('ctrl+Delete', () => onRemoveObject(), [_index, objects])
  useHotkeys('shift+Delete', () => onRemoveImageFromObject(), [_index, objects])
  useHotkeys('ctrl+shift+s', () => saveObjects(), [objects, backgrounds])

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

  const get = useRequest(() => getCoverType(id || ''), {
    refreshDeps: [id],
    onSuccess: (data) => {
      loadObjects([])
    },
  })

  const layoutDragOver = (e: any) => {
    if (e.target.classList.contains('layout-drop')) {
      e.target.style.border = '3px solid #333'
    }
  }

  const layoutDragLeave = (e: any) => {
    if (e.target.classList.contains('layout-drop')) {
      e.target.style.border = 'none'
    }
  }

  const layoutDragDrop = (e: any) => {
    e.preventDefault()

    const layoutDrop = e.target
    const _width = slideWidth - 20
    const _height = slideHeight - 20
    if (layoutDrop.classList.contains('layout-drop-left')) {
      const layoutData = JSON.parse(e.dataTransfer.getData('layout'))
      const { count, index } = layoutData
      const layoutObjects: any = []

      const leftObjects: any = objects.filter((o: any) => o.style.left < slideWidth / 2)

      layoutData.objects.forEach((o: LayoutObject, i: number) => {
        const leftObject: any = leftObjects[i]

        const style = {
          top: (_height * o.top) / 100,
          left: ((_width / 2) * o.left) / 100,
          width: ((_width / 2) * o.width) / 100,
          height: (_height * o.height) / 100,
          rotateAngle: 0,
          transform: '',
          zIndex: 100 + i + '',
        }
        if (leftObject && o.className === leftObject?.props?.className) {
          layoutObjects.push({
            ...leftObject,
            style,
          })
        } else if (o.className && o.className.includes('text-container')) {
          layoutObjects.push(layoutPositionsToText(style))
        } else {
          layoutObjects.push(layoutPositionsToImage(style))
        }
      })

      addLayout({
        objects: [...objects.filter((o: any) => o.style.left >= slideWidth / 2), ...layoutObjects],
        layout: {
          ...layout,
          left: {
            count,
            index,
          },
        },
      })
      updateHistory(ADD_LAYOUT, { objects, layout })
    } else if (layoutDrop.classList.contains('layout-drop-right')) {
      const layoutData = JSON.parse(e.dataTransfer.getData('layout'))
      const { count, index } = layoutData
      const layoutObjects: any = []
      layoutData.objects.forEach((o: any, i: number) => {
        const style = {
          top: (_height * o.top) / 100,
          left: _width / 2 + ((_width / 2) * o.left) / 100,
          width: ((_width / 2) * o.width) / 100,
          height: (_height * o.height) / 100,
          rotateAngle: 0,
          transform: '',
          zIndex: 100 + i + '',
        }
        if (o.className && o.className.includes('text-container')) {
          layoutObjects.push(layoutPositionsToText(style))
        } else {
          layoutObjects.push(layoutPositionsToImage(style))
        }
      })

      addLayout({
        objects: [...objects.filter((o: any) => o.style.left < slideWidth / 2), ...layoutObjects],
        layout: {
          ...layout,
          right: {
            count,
            index,
          },
        },
      })
      updateHistory(ADD_LAYOUT, { objects })
    } else if (layoutDrop.classList.contains('layout-drop-middle')) {
      const layoutData = JSON.parse(e.dataTransfer.getData('layout'))
      const { count, index } = layoutData
      const layoutObjects: any = []

      layoutData.objects.forEach((o: any, i: number) => {
        const style = {
          top: (_height * o.top) / 100,
          left: (_width * o.left) / 100,
          width: (_width * o.width) / 100,
          height: (_height * o.height) / 100,
          rotateAngle: 0,
          transform: '',
          zIndex: 100 + i + '',
        }
        if (o.className && o.className.includes('text-container')) {
          layoutObjects.push(layoutPositionsToText(style))
        } else {
          layoutObjects.push(layoutPositionsToImage(style))
        }
      })

      addLayout({
        objects: layoutObjects,
        layout: {
          ...layout,
          right: {
            count,
            index,
          },
        },
      })
      updateHistory(ADD_LAYOUT, { objects })
    }
  }

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
        top,
        left,
        width,
        height,
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

  const onRemoveImageFromObject = () => {
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
  const onRemoveObject = () => {
    if (_index > -1) {
      removeObject({
        container: containers[_index],
        object: objects[_index],
      })
      deselectObject()
    }
  }
  const onRotateLeftObject = () => {
    if (_index > -1) {
      const rotateAngle = (objects[_index]?.style.rotateAngle || 0) - 90
      _object.style.transform = `rotate(${rotateAngle}deg)`
      _rotateAngle = rotateAngle
      updateObjectStyle(objects[_index])
      moveResizers()
    }
  }
  const onRotateRightObject = () => {
    if (_index > -1) {
      const rotateAngle = (objects[_index]?.style.rotateAngle || 0) + 90
      console.log(rotateAngle)
      _object.style.transform = `rotate(${rotateAngle}deg)`
      _rotateAngle = rotateAngle
      updateObjectStyle(objects[_index])
      moveResizers()
    }
  }

  const onFlipObject = () => {
    if (_index > -1) {
      const { props } = objects[_index]
      let { transform } = props.style

      const scaleX = transform.match(/scaleX\(([^)]+)\)/)[0]
      if (scaleX === 'scaleX(1)') {
        transform = transform.replace(/scaleX\(([^)]+)\)/, 'scaleX(-1)')
      } else {
        transform = transform.replace(/scaleX\(([^)]+)\)/, 'scaleX(1)')
      }

      updateObject({
        object: {
          ...objects[_index],
          props: {
            ...props,
            style: {
              ...props.style,
              transform,
            },
          },
        },
      })

      updateHistory(UPDATE_OBJECT, { object: objects[_index] })
    }
  }

  const onSendForward = () => {
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

  const onSendBackward = () => {
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

  const onBackgroundDropDragOver = (e: any) => {
    if (e.target.classList.contains('background-drop-left')) {
      e.target.style.border = '3px solid #333'
    } else if (e.target.classList.contains('background-drop-middle')) {
      e.target.style.border = '3px solid #333'
    }
    if (e.target.classList.contains('background-drop-right')) {
      e.target.style.border = '3px solid #333'
    }
  }

  const onBackgroundDropDragLeave = (e: any) => {
    if (e.target.classList.contains('background-drop-left')) {
      e.target.style.border = 'none'
    } else if (e.target.classList.contains('background-drop-middle')) {
      e.target.style.border = 'none'
    }
    if (e.target.classList.contains('background-drop-right')) {
      e.target.style.border = 'none'
    }
  }

  const onObjectDragOver = (e: any) => {
    e.preventDefault()
  }

  const onObjectDrop = (e: any) => {
    hideToolbar()
    e.preventDefault()
    if (!'images,cliparts,frames,masks'.includes(editor.type) || _isTextEditing) return

    if (
      e.target.classList.contains('object') &&
      e.target.childNodes[0].className === 'image-placeholder' &&
      !'cliparts'.includes(editor.type)
    ) {
      if (_index > -1) {
        const { top, left, width, height } = getComputedStyle(_object)
        const {
          options,
          rect: { w, h },
        } = calculateCenter({ top, left, width, height }, _rotateAngle)

        const activeBorder = document.querySelector('.active-border')
        showActiveBorder(activeBorder, options, w, h, _rotateAngle)
      }
      if (editor.type === 'frames') {
        e.target.style.border = 'none'
        const index = objects.findIndex((o: any) => o.id === e.target.id)

        const newObject = {
          ...objects[index],
          props: {
            ...objects[index].props,
            frameImage: e.dataTransfer.getData('imageUrl'),
            frameStyle: {
              borderImageSource: `url(${e.dataTransfer.getData('tempUrl')})`,
              borderImageSlice: 200,
              borderImageRepeat: 'stretch',
              borderColor: 'transparent',
              borderWidth: '50px',
            },
            placeholderStyle: { opacity: 1 },
          },
        }

        updateObject({ object: newObject })
        updateHistory(UPDATE_OBJECT, { object: objects[index] })
      } else if (editor.type === 'masks') {
        e.target.style.border = 'none'
        const index = objects.findIndex((o: any) => o.id === e.target.id)

        const newObject = {
          ...objects[index],
          props: {
            ...objects[index].props,
            maskImage: e.dataTransfer.getData('imageUrl'),
            maskStyle: {
              maskImage: `url(${e.dataTransfer.getData('tempUrl').replace('https', 'http')})`,
              WebkitMaskImage: `url(${e.dataTransfer.getData('tempUrl').replace('https', 'http')})`,
            },
            placeholderStyle: { opacity: 1 },
          },
        }

        updateObject({ object: newObject })
        updateHistory(UPDATE_OBJECT, { object: objects[index] })
      } else {
        e.target.style.border = 'none'
        const index = objects.findIndex((o: any) => o.id === e.target.id)

        const newObject = {
          ...objects[index],
          props: {
            ...objects[index].props,
            imageUrl: e.dataTransfer.getData('imageUrl'),
            tempUrl: e.dataTransfer.getData('tempUrl'),
            imageStyle: { display: 'block', top: 0, left: 0, width: '100%' },
            placeholderStyle: { opacity: 1 },
          },
        }

        updateObject({ object: newObject })
        updateHistory(UPDATE_OBJECT, { object: objects[index] })
      }
    } else if ('images,cliparts'.includes(editor.type)) {
      createImage(e)
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

  const onSlideMouseDown = (e: any) => {
    if (editor.backgroundEdit) return
    if (e.target.classList.contains('image-center')) return

    if (e.target.id === 'layout_scaled_container' || e.target.id === 'canvas_container') {
      hideImageCircle(_object)
      if (_index > -1 && _isTextEditing) {
        setTextObjectIndex(_index)
        _object.classList.remove('selected')
        _object.firstChild.style.cursor = 'default'
        _object.firstChild.style.pointerEvents = 'none'
        _object.firstChild.childNodes[2].contentEditable = false
        setIsTextEditing(false)
        window.getSelection()?.removeAllRanges()
      }
      deselectObject()
    }

    if (_isTextEditing) return

    const rect = slideContainer.current.getBoundingClientRect()

    const startX = e.clientX - rect.x
    const startY = e.clientY - rect.y

    const selectedObjects: { [k: number]: HTMLElement } = {}

    _isMouseDown = true

    const onMouseMove = (sube: any) => {
      if (!_isMouseDown) return
      sube.stopImmediatePropagation()
      selectionRef.current.hidden = false
      const clientY = sube.clientY - rect.y
      const clientX = sube.clientX - rect.x

      const x3 = Math.min(startX, clientX)
      const x4 = Math.max(startX, clientX)
      const y3 = Math.min(startY, clientY)
      const y4 = Math.max(startY, clientY)

      selectionRef.current.style.left = x3 + 'px'
      selectionRef.current.style.top = y3 + 'px'
      selectionRef.current.style.width = x4 - x3 + 'px'
      selectionRef.current.style.height = y4 - y3 + 'px'

      const s = selectionRef.current.getBoundingClientRect()

      containers.forEach((c: Container, i: number) => {
        if (!c.id) return
        const object = document.getElementById(c.id) as HTMLElement
        if (!object) return
        const o = object.getBoundingClientRect()

        if (
          o.left < s.left + s.width &&
          o.left + o.width > s.left &&
          o.top < s.top + s.height &&
          o.top + o.height > s.top
        ) {
          selectedObjects[i] = object
          showBorder(object)
        } else {
          delete selectedObjects[i]
          hideBorder(object)
        }
      })
    }

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      if (!_isMouseDown) return
      if (selectionRef.current) {
        selectionRef.current.hidden = true
        selectionRef.current.style.width = 0
        selectionRef.current.style.height = 0
      }
      _isMouseDown = false

      const selectedStyle = {
        left: 0,
        top: 0,
        width: 0,
        height: 0,
      }

      Object.keys(selectedObjects).forEach((k: string, i: number) => {
        const { left, top, width, height } = selectedObjects[parseInt(k, 10)].style
        // for now just hide, later calculate angles
        hideBorder(selectedObjects[parseInt(k, 10)])

        const l = parseFloat(left)
        const t = parseFloat(top)
        const h = parseFloat(height)
        const w = parseFloat(width)

        if (i === 0) {
          selectedStyle.left = l
          selectedStyle.top = t
          selectedStyle.width = w
          selectedStyle.height = h
        } else {
          if (selectedStyle.width < Math.abs(l - selectedStyle.left) + w) {
            selectedStyle.width = Math.abs(l - selectedStyle.left) + w
          }
          if (selectedStyle.height < Math.abs(t - selectedStyle.top) + h) {
            selectedStyle.height = Math.abs(t - selectedStyle.top) + h
          }
          if (selectedStyle.left > l) {
            selectedStyle.left = l
          }
          if (selectedStyle.top > t) {
            selectedStyle.top = t
          }
        }
      })

      if (Object.keys(selectedObjects).length === 1) {
        const key: number = parseFloat(Object.keys(selectedObjects)[0])
        const object: any = selectedObjects[key]
        const objectType = getObjectType(object.firstChild.classList)
        moveResizers({ object, objectType })
        setObjectType(objectType)
        setObjectIndex(key)
        setObject(object)
      } else if (Object.keys(selectedObjects).length > 1) {
        showGroupSelection()
        setGroupObjects(selectedObjects)
        setGroupStyles(selectedStyle)
        groupRef.current.style.left = selectedStyle.left * scale + 'px'
        groupRef.current.style.top = selectedStyle.top * scale + 'px'
        groupRef.current.style.width = selectedStyle.width * scale + 'px'
        groupRef.current.style.height = selectedStyle.height * scale + 'px'
        moveResizers({ styles: selectedStyle, objectType: 'group' })
      }
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
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

  const createImage = (e: any) => {
    hideToolbar()
    if (e.dataTransfer) {
      const tempUrl = e.dataTransfer.getData('tempUrl')
      const imageUrl: any = e.dataTransfer.getData('imageUrl')

      const { x, y } = canvasRef.current.getBoundingClientRect()
      const x1 = e.clientX - x
      const y1 = e.clientY - y

      const style = {
        top: y1,
        left: x1,
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
            imageUrl,
            tempUrl,
            className: 'image-placeholder',
            imageStyle: { display: 'block', top: 0, left: 0, width: '100%' },
            style: { transform: 'scaleX(1)' },
            placeholderStyle: { opacity: 1 },
          },
        },
      })
    } else {
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
    }
    setObjectType('image')
  }

  const createSquare = () => {
    hideToolbar()
    const style = {
      top: 100,
      left: 100,
      width: 300,
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
          className: 'shape',
          style: { transform: 'scaleX(1)' },
          shapeClass: 'square',
          shapeStyle: { background: 'cyan' },
        },
      },
    })

    setObjectType('shape')
  }

  const saveObjects = () => {
    console.log('omg')
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

  const imageFit = debounce((height: number, width: number, newSize: Size, oldSize: Size, type: string) => {
    const _obj = objects[_index]
    if (_obj?.props.className === 'image-placeholder') {
      const placeholder = _object.firstChild as HTMLElement
      const image = placeholder.childNodes[2] as HTMLImageElement
      const _height = image.height - Math.abs(_obj.props.imageStyle.top)

      if (
        height - _height > 0 &&
        't b bl br tl tr l r'.split(' ').includes(type) &&
        (newSize.height > oldSize.height || newSize.width < oldSize.width || newSize.width > oldSize.width)
      ) {
        const _width = Number(`${image.style.width}`.replace('%', ''))
        if (width >= 100) {
          image.style.width = `${((_width || 100) * height) / _height}%`
          image.style.top = '0'
          image.style.left = '0'
        }
      } else if (width >= 100 && 'r l br bl tr tl'.split(' ').includes(type)) {
        image.style.width = '100%'
      }
    }
  }, 100)

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
    const oldSize = {
      width: Number(_object.style.width.replace('px', '')),
      height: Number(_object.style.height.replace('px', '')),
    }
    const newSize = {
      width,
      height,
    }
    imageFit(height, width, newSize, oldSize, type)
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
      console.log(t, scale)
      toolbar.style.top = t / scale - topSpace - toolbarDistance + 'px'
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

  const setSlidePosition = () => {
    if (slideContainer.current === null) return
    slideContainer.current.classList.add('center-slide')

    const editorPanelContainer: any = document.querySelector('.EditorPanelContainer')

    editorPanelContainer.style.width = editor.sidebarOpen
      ? 'calc(100vw - 400px)' // 310 + 90
      : 'calc(100vw - 90px)' // 90

    const rect = slideContainer.current.getBoundingClientRect()
    const maxWidth = slideWidth
    const maxHeight = slideHeight
    const srcWidth = rect.width - 240 // 240 is the width of two side menus
    const srcHeight = rect.height

    const ratio = Math.min(srcWidth / maxWidth, srcHeight / maxHeight)
    setScale(ratio)
    setFitScale(ratio)

    const scaledWidth = maxWidth * ratio
    const scaledHeight = maxHeight * ratio

    canvasRef.current.style.transform = 'scale(' + ratio + ')'
    canvasRef.current.style.transformOrigin = '0 0'
    scaledContainerRef.current.style.width = scaledWidth + 'px'
    scaledContainerRef.current.style.height = scaledHeight + 'px'

    const slide = document.querySelector('#slide') as HTMLElement
    slide.style.width = scaledWidth + 'px'
    slide.style.height = scaledHeight + 'px'

    editorContainerRef.current.style.width = scaledWidth + 'px'
    editorContainerRef.current.style.height = scaledHeight + 'px'
  }

  useEffect(() => {
    if (loading) return
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

  useEffect(() => {
    if (!loading) {
      setSlidePosition()
    }
  }, [currentProject]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    deselectObject()
    if (!loading) {
      setSlidePosition()
    }
  }, [editor.sidebarOpen]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!loading) {
      setSlidePosition()
    }
  }, [loading]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (editor.dragStart) {
      if (editor.type === 'backgrounds') {
        const backgroundDrops: any = document.querySelectorAll('.background-drop')
        backgroundDrops.forEach((background: any) => {
          background.style.display = 'block'
        })
      } else if (editor.type === 'layouts') {
        const layoutDrops: any = document.querySelectorAll('.layout-drop')
        layoutDrops.forEach((_layout: any) => {
          _layout.style.display = 'block'
        })
      }
    } else if (editor.type === 'backgrounds') {
      const backgroundDrops: any = document.querySelectorAll('.background-drop')
      backgroundDrops.forEach((background: any) => {
        background.style.display = 'none'
      })
    } else if (editor.type === 'layouts') {
      const layoutDrops: any = document.querySelectorAll('.layout-drop')
      layoutDrops.forEach((_layout: any) => {
        _layout.style.display = 'none'
      })
    }
  }, [editor.dragStart, editor.type])

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
        <SideBarPanel layoutGroups={layouts} isCover />
        <div className="EditorPanel">
          <div className="EditorPanelContainer">
            <div ref={slideViewRef} className="StepSlideContainer SlideViewContainer">
              <div id="editor_container" ref={editorContainerRef}>
                <Toolbar
                  object={_object}
                  objectType={_objectType}
                  index={_index}
                  objects={objects}
                  updateObject={updateObject}
                  updateHistory={updateHistory}
                  moveResizers={moveResizers}
                  removeImageFromObject={onRemoveImageFromObject}
                  rotateLeftObject={onRotateLeftObject}
                  rotateRightObject={onRotateRightObject}
                  flipObject={onFlipObject}
                  sendForward={onSendForward}
                  sendBackward={onSendBackward}
                  removeObject={onRemoveObject}
                />
                <div id="selection" hidden ref={selectionRef} />
                <SideButtons
                  createImage={createImage}
                  createText={createText}
                  createSquare={createSquare}
                  settings={false}
                />
                <div
                  id="slide_container"
                  onMouseDown={onSlideMouseDown}
                  onDrop={onObjectDrop}
                  onDragOver={onObjectDragOver}
                  ref={slideContainer}
                >
                  <div id="slide" style={{ overflow }}>
                    <div id="scaled_container" ref={scaledContainerRef}>
                      <div
                        className="layout-drop layout-drop-left"
                        onDragOver={layoutDragOver}
                        onDragLeave={layoutDragLeave}
                        onDrop={layoutDragDrop}
                      />
                      <div
                        className="layout-drop layout-drop-middle"
                        onDragOver={layoutDragOver}
                        onDragLeave={layoutDragLeave}
                        onDrop={layoutDragDrop}
                      />
                      <div
                        className="layout-drop layout-drop-right"
                        onDragOver={layoutDragOver}
                        onDragLeave={layoutDragLeave}
                        onDrop={layoutDragDrop}
                      />
                      {!loading && (
                        <BackgroundImages
                          scale={scale}
                          editor={editor}
                          backgrounds={backgrounds}
                          deselectObject={deselectObject}
                          setBackgrounds={setBackgrounds}
                          updateBackground={updateBackground}
                          updateHistory={updateHistory}
                          onBackgroundDropDragOver={onBackgroundDropDragOver}
                          onBackgroundDropDragLeave={onBackgroundDropDragLeave}
                        />
                      )}
                      <div ref={canvasRef} id="canvas_container">
                        {!loading && (
                          <>
                            <div id="background">
                              {renderBackground({
                                backgrounds,
                                bgStyles,
                                updateBackground,
                              })}
                            </div>
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
                          </>
                        )}
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
    </div>
  )
}

const mapStateToProps = (state: any) => ({
  project: state.project,
  editor: state.editor,
})

export default connect(mapStateToProps, {
  loadObjects: _loadObjects,
  loadContainers: _loadContainers,
  loadBackgrounds: _loadBackgrounds,
  updateContainer: _updateContainer,
  updateGroupContainer: _updateGroupContainer,
  updateBackground: _updateBackground,
  updateObject: _updateObject,
  setBackgrounds: _setBackgrounds,
  updateHistory: _updateHistory,
  addLayout: _addLayout,
  addObject: _addObject,
  removeObject: _removeObject,
})(BookEditor)
