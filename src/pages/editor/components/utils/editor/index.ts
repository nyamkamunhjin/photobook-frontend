/* eslint-disable lines-between-class-members */
import {
  CollisionObject,
  Container,
  DomType,
  FeatureType,
  FullLayout,
  HistoryProps,
  Image,
  LayoutObject,
  LayoutsInterface,
  ObjectType,
  OElement,
  PObject,
  Size,
} from 'interfaces'
import { v4 as uuidv4 } from 'uuid'
import lodash from 'lodash'
import { ADD_LAYOUT, UPDATE_GROUP_CONTAINER, UPDATE_OBJECT } from 'redux/actions/types'
import { arraysEqual, debounce, getRotationScaler, ParseNumber } from 'utils'
import {
  centerToTL,
  degToRadian,
  diffRect,
  getAngle,
  getLength,
  getNewStyle,
  layoutPositionsToImage,
  layoutPositionsToText,
  tLToCenter,
} from 'utils/transformer-lib'

interface Props {
  setTextObjectIndex?: (index: number) => void
  setObjectIndex: (index: number) => void
  setOverflow: (overflow: string) => void
  setIsTextEditing?: (text: boolean) => void
  setGroupObjects?: (object: any) => void
  setGroupStyles?: (object: any) => void
  setObjectType: (object: ObjectType) => void
  updateGroupContainer?: (props: { containers: Container[] }) => void
  updateObject: (props: { object: PObject }) => void
  loadBackgrounds?: (backgrounds: Object[]) => void
  updateHistory: (historyType: string, props: HistoryProps) => void
  addLayout?: (props: { objects: Object[]; layout: FullLayout }) => void
  addObject?: (props: { object: Object }) => void
  removeObject?: (props: { object: Object; container: Object }) => void
  setObject: (object: any) => void
  scaledContainerRef: any
  slideContainerRef?: any
  groupRef: any
  canvasRef: any
  selectionRef: any
  slideViewRef: any
  slideHeight: number
  slideWidth: number
  overflow: string
  scale: number
  magnetX?: any
  magnetY?: any
  double?: boolean
  _objectType?: ObjectType
  _border?: number
  _treshhold?: number
  _isTextEditing?: boolean
  _groupObjects: any
  _object?: any
  _groupStyles: any
}
export default class Editor {
  _threshhold = 30
  _border = 0
  _rotaterDistance = 30
  _rotateAngle = 0
  _isMouseDown = false
  _isCtrlDown = false
  _isShiftDown = false
  _groupStyles: any
  _objectType?: ObjectType
  _object: any
  objects?: PObject[]
  groupRef: any
  canvasRef: any
  selectionRef: any
  slideViewRef: any
  slideContainerRef?: any
  scaledContainerRef: any
  transformers: any = {
    n: 't',
    s: 'b',
    e: 'r',
    w: 'l',
    ne: 'tr',
    nw: 'tl',
    se: 'br',
    sw: 'bl',
  }
  // Index
  setTextObjectIndex: any
  setGroupStyles: any
  slideHeight: number
  slideWidth: number
  _index?: number
  setObjectIndex: any

  scale: number

  _groupObjects: any
  setGroupObjects: any

  removeObject: any
  addObject: any

  updateGroupContainer: any

  overflow: string
  setOverflow: any

  _isTextEditing = false
  setIsTextEditing: any

  setObjectType: any

  setObject: any
  updateObject: any
  // Functions History
  updateHistory: any
  // Functions Layout
  addLayout?: any
  magnetX: any
  magnetY: any
  double = false

  constructor(props: Props) {
    this.setTextObjectIndex = props.setTextObjectIndex
    this.updateHistory = props.updateHistory
    this.updateObject = props.updateObject
    this.addLayout = props.addLayout
    this.setIsTextEditing = props.setIsTextEditing
    this.scale = props.scale
    this.setGroupObjects = props.setGroupObjects
    this.updateGroupContainer = props.updateGroupContainer
    this.slideViewRef = props.slideViewRef
    this.scaledContainerRef = props.scaledContainerRef
    this._groupStyles = props._groupStyles
    this.overflow = props.overflow
    if (props._objectType) this._objectType = props._objectType
    if (props._isTextEditing !== undefined) {
      this._isTextEditing = props._isTextEditing
    }
    if (props.slideContainerRef) {
      this.slideContainerRef = props.slideContainerRef
    }
    if (props._object) {
      this._object = props._object
    }
    if (props._treshhold) {
      this._threshhold = props._treshhold
    }
    if (props._border) {
      this._border = props._border
    }
    this.setOverflow = props.setOverflow
    this.removeObject = props.removeObject
    this.setObjectType = props.setObjectType
    this.addObject = props.addObject
    this.setObject = props.setObject
    this.setObjectIndex = props.setObjectIndex
    this.canvasRef = props.canvasRef
    this.slideWidth = props.slideWidth
    this.slideHeight = props.slideHeight
    this.selectionRef = props.selectionRef
    this.setGroupStyles = props.setGroupStyles
    this.magnetX = props.magnetX
    this.magnetY = props.magnetY
    if (props.double !== undefined) {
      this.double = props.double
    }
    this.magnetX = document.getElementById('magnetX')
    this.magnetY = document.getElementById('magnetY')
  }

  // #region [LayoutMethods]
  public changeLayout = (
    objects: Container[],
    layout: FullLayout,
    layouts: LayoutsInterface[],
    align: string,
    type: string
  ) => {
    if (type === 'less') {
      if (align === 'left') {
        const leftObjects = objects.filter((o: any) => o.style.left < this.slideWidth / 2)
        const rightObjects = objects.filter((o: any) => !leftObjects.includes(o))

        let { count, index } = layout.left
        if (count === -1) count = 0
        index = 0
        count -= 1
        const [nextLayout] = layouts.filter((l: any) => l.count === count)

        const nextObjects = nextLayout.layouts[index]

        const layoutObjects: any = []

        nextObjects.objects?.forEach((o: any, i: number) => {
          const leftObject: any = leftObjects[i]

          const style = {
            top: (this.slideHeight * o.top) / 100,
            left: ((this.slideWidth / 2) * o.left) / 100,
            width: ((this.slideWidth / 2) * o.width) / 100,
            height: (this.slideHeight * o.height) / 100,
            rotateAngle: 0,
            transform: '',
            zIndex: 100 + i + '',
          }

          if (leftObject) {
            layoutObjects.push({
              ...leftObject,
              style,
            })
          } else {
            layoutObjects.push(layoutPositionsToImage(style))
          }
        })

        this.addLayout({
          objects: [...rightObjects, ...layoutObjects],
          layout: {
            ...layout,
            left: {
              count,
              index,
            },
          },
        })
        this.updateHistory(ADD_LAYOUT, {
          objects,
          layout,
        })
      } else {
        const rightObjects = objects.filter((o: any) => o.style.left >= this.slideWidth / 2)
        const leftObjects = objects.filter((o: any) => !rightObjects.includes(o))

        let { count, index } = layout.right
        if (count === -1) count = 0
        index = 0
        count -= 1
        const [nextLayout] = layouts.filter((l: any) => l.count === count)

        const nextObjects = nextLayout.layouts[index]

        const layoutObjects: any = []

        nextObjects.objects?.forEach((o: any, i: number) => {
          const rightObject: any = rightObjects[i]

          const style = {
            top: (this.slideHeight * o.top) / 100,
            left: this.slideWidth / 2 + ((this.slideWidth / 2) * o.left) / 100,
            width: ((this.slideWidth / 2) * o.width) / 100,
            height: (this.slideHeight * o.height) / 100,
            rotateAngle: 0,
            transform: '',
            zIndex: 100 + i + '',
          }

          if (rightObject) {
            layoutObjects.push({
              ...rightObject,
              style,
            })
          } else {
            layoutObjects.push(layoutPositionsToImage(style))
          }
        })

        this.addLayout({
          objects: [...leftObjects, ...layoutObjects],
          layout: {
            ...layout,
            right: {
              count,
              index,
            },
          },
        })
        this.updateHistory(ADD_LAYOUT, {
          objects,
          layout,
        })
      }
    } else if (type === 'more') {
      if (align === 'left') {
        const leftObjects = objects.filter((o: any) => o.style.left < this.slideWidth / 2)
        const rightObjects = objects.filter((o: any) => !leftObjects.includes(o))

        let { count, index } = layout.left
        if (count === -1) count = 0
        index = 0
        count += 1
        const [nextLayout] = layouts.filter((l: any) => l.count === count)

        const nextObjects = nextLayout.layouts[index]

        const layoutObjects: any = []

        nextObjects.objects?.forEach((o: any, i: number) => {
          const leftObject: any = leftObjects[i]

          const style = {
            top: (this.slideHeight * o.top) / 100,
            left: ((this.slideWidth / 2) * o.left) / 100,
            width: ((this.slideWidth / 2) * o.width) / 100,
            height: (this.slideHeight * o.height) / 100,
            rotateAngle: 0,
            transform: '',
            zIndex: 100 + i + '',
          }

          if (leftObject) {
            layoutObjects.push({
              ...leftObject,
              style,
            })
          } else {
            layoutObjects.push(layoutPositionsToImage(style))
          }
        })

        this.addLayout({
          objects: [...rightObjects, ...layoutObjects],
          layout: {
            ...layout,
            left: {
              count,
              index,
            },
          },
        })
        this.updateHistory(ADD_LAYOUT, {
          objects,
          layout,
        })
      } else {
        const rightObjects = objects.filter((o: any) => o.style.left >= this.slideWidth / 2)
        const leftObjects = objects.filter((o: any) => !rightObjects.includes(o))

        let { count, index } = layout.right
        if (count === -1) count = 0
        index = 0
        count += 1
        const [nextLayout] = layouts.filter((l: any) => l.count === count)

        const nextObjects = nextLayout.layouts[index]

        const layoutObjects: any = []

        nextObjects.objects?.forEach((o: any, i: number) => {
          const rightObject: any = rightObjects[i]

          const style = {
            top: (this.slideHeight * o.top) / 100,
            left: this.slideWidth / 2 + ((this.slideWidth / 2) * o.left) / 100,
            width: ((this.slideWidth / 2) * o.width) / 100,
            height: (this.slideHeight * o.height) / 100,
            rotateAngle: 0,
            transform: '',
            zIndex: 100 + i + '',
          }

          if (rightObject) {
            layoutObjects.push({
              ...rightObject,
              style,
            })
          } else {
            layoutObjects.push(layoutPositionsToImage(style))
          }
        })

        this.addLayout({
          objects: [...leftObjects, ...layoutObjects],
          layout: {
            ...layout,
            right: {
              count,
              index,
            },
          },
        })
        this.updateHistory(ADD_LAYOUT, {
          objects,
          layout,
        })
      }
    } else if (type === 'shuffle') {
      if (align === 'left') {
        const leftObjects = objects.filter((o: any) => o.style.left < this.slideWidth / 2)
        const rightObjects = objects.filter((o: any) => !leftObjects.includes(o))

        const { count } = layout.left
        let { index } = layout.left
        index += 1

        const [nextLayout] = layouts.filter((l: any) => l.count === count)
        if (nextLayout.layouts.length === index) index = 0
        const nextObjects = nextLayout.layouts[index]

        const layoutObjects: any = []
        nextObjects.objects?.forEach((o: any, i: number) => {
          const leftObject: any = leftObjects[i]

          const style = {
            top: (this.slideHeight * o.top) / 100,
            left: ((this.slideWidth / 2) * o.left) / 100,
            width: ((this.slideWidth / 2) * o.width) / 100,
            height: (this.slideHeight * o.height) / 100,
            rotateAngle: 0,
            transform: '',
            zIndex: 100 + i + '',
          }

          if (leftObject) {
            layoutObjects.push({
              ...leftObject,
              style,
            })
          } else {
            layoutObjects.push(layoutPositionsToImage(style))
          }
        })

        this.addLayout({
          objects: [...rightObjects, ...layoutObjects],
          layout: {
            ...layout,
            left: {
              count,
              index,
            },
          },
        })
        this.updateHistory(ADD_LAYOUT, {
          objects,
          layout,
        })
      } else {
        const rightObjects = objects.filter((o: any) => o.style.left >= this.slideWidth / 2)
        const leftObjects = objects.filter((o: any) => !rightObjects.includes(o))

        const { count } = layout.right
        let { index } = layout.right
        index += 1

        const [nextLayout] = layouts.filter((l: any) => l.count === count)
        if (nextLayout.layouts.length === index) index = 0
        const nextObjects = nextLayout.layouts[index]

        const layoutObjects: any = []
        nextObjects.objects?.forEach((o: any, i: number) => {
          const rightObject: any = rightObjects[i]

          const style = {
            top: (this.slideHeight * o.top) / 100,
            left: this.slideWidth / 2 + ((this.slideWidth / 2) * o.left) / 100,
            width: ((this.slideWidth / 2) * o.width) / 100,
            height: (this.slideHeight * o.height) / 100,
            rotateAngle: 0,
            transform: '',
            zIndex: 100 + i + '',
          }

          if (rightObject) {
            layoutObjects.push({
              ...rightObject,
              style,
            })
          } else {
            layoutObjects.push(layoutPositionsToImage(style))
          }
        })

        this.addLayout({
          objects: [...leftObjects, ...layoutObjects],
          layout: {
            ...layout,
            right: {
              count,
              index,
            },
          },
        })
        this.updateHistory(ADD_LAYOUT, {
          objects,
          layout,
        })
      }
    }
  }
  public changeLayoutSingle = (
    objects: Container[],
    layout: FullLayout,
    layouts: LayoutsInterface[],
    align: string,
    type: string
  ) => {
    if (type === 'less') {
      const leftObjects = objects.filter((o: any) => o.style.left < this.slideWidth)
      const rightObjects = objects.filter((o: any) => !leftObjects.includes(o))

      let { count, index } = layout.left
      if (count === -1) count = 0
      index = 0
      count -= 1
      const [nextLayout] = layouts.filter((l: any) => l.count === count)

      const nextObjects = nextLayout.layouts[index]

      const layoutObjects: any = []

      nextObjects.objects?.forEach((o: any, i: number) => {
        const leftObject: any = leftObjects[i]

        const style = {
          top: (this.slideHeight * o.top) / 100,
          left: (this.slideWidth * o.left) / 100,
          width: (this.slideWidth * o.width) / 100,
          height: (this.slideHeight * o.height) / 100,
          rotateAngle: 0,
          transform: '',
          zIndex: 100 + i + '',
        }

        if (leftObject) {
          layoutObjects.push({
            ...leftObject,
            style,
          })
        } else {
          layoutObjects.push(layoutPositionsToImage(style))
        }
      })

      this.addLayout({
        objects: [...rightObjects, ...layoutObjects],
        layout: {
          ...layout,
          left: {
            count,
            index,
          },
        },
      })
      this.updateHistory(ADD_LAYOUT, {
        objects,
        layout,
      })
    } else if (type === 'more') {
      const leftObjects = objects.filter((o: any) => o.style.left < this.slideWidth)
      const rightObjects = objects.filter((o: any) => !leftObjects.includes(o))

      let { count, index } = layout.left
      if (count === -1) count = 0
      index = 0
      count += 1
      const [nextLayout] = layouts.filter((l: any) => l.count === count)

      const nextObjects = nextLayout.layouts[index]

      const layoutObjects: any = []

      nextObjects.objects?.forEach((o: any, i: number) => {
        const leftObject: any = leftObjects[i]

        const style = {
          top: (this.slideHeight * o.top) / 100,
          left: (this.slideWidth * o.left) / 100,
          width: (this.slideWidth * o.width) / 100,
          height: (this.slideHeight * o.height) / 100,
          rotateAngle: 0,
          transform: '',
          zIndex: 100 + i + '',
        }

        if (leftObject) {
          layoutObjects.push({
            ...leftObject,
            style,
          })
        } else {
          layoutObjects.push(layoutPositionsToImage(style))
        }
      })

      this.addLayout({
        objects: [...rightObjects, ...layoutObjects],
        layout: {
          ...layout,
          left: {
            count,
            index,
          },
        },
      })
      this.updateHistory(ADD_LAYOUT, {
        objects,
        layout,
      })
    } else if (type === 'shuffle') {
      if (align === 'left') {
        const leftObjects = objects.filter((o: any) => o.style.left < this.slideWidth / 2)
        const rightObjects = objects.filter((o: any) => !leftObjects.includes(o))

        const { count } = layout.left
        let { index } = layout.left
        index += 1

        const [nextLayout] = layouts.filter((l: any) => l.count === count)
        if (nextLayout.layouts.length === index) index = 0
        const nextObjects = nextLayout.layouts[index]

        const layoutObjects: any = []
        nextObjects.objects?.forEach((o: any, i: number) => {
          const leftObject: any = leftObjects[i]

          const style = {
            top: (this.slideHeight * o.top) / 100,
            left: ((this.slideWidth / 2) * o.left) / 100,
            width: ((this.slideWidth / 2) * o.width) / 100,
            height: (this.slideHeight * o.height) / 100,
            rotateAngle: 0,
            transform: '',
            zIndex: 100 + i + '',
          }

          if (leftObject) {
            layoutObjects.push({
              ...leftObject,
              style,
            })
          } else {
            layoutObjects.push(layoutPositionsToImage(style))
          }
        })

        this.addLayout({
          objects: [...rightObjects, ...layoutObjects],
          layout: {
            ...layout,
            left: {
              count,
              index,
            },
          },
        })
        this.updateHistory(ADD_LAYOUT, {
          objects,
          layout,
        })
      } else {
        const rightObjects = objects.filter((o: any) => o.style.left >= this.slideWidth / 2)
        const leftObjects = objects.filter((o: any) => !rightObjects.includes(o))

        const { count } = layout.right
        let { index } = layout.right
        index += 1

        const [nextLayout] = layouts.filter((l: any) => l.count === count)
        if (nextLayout.layouts.length === index) index = 0
        const nextObjects = nextLayout.layouts[index]

        const layoutObjects: any = []
        nextObjects.objects?.forEach((o: any, i: number) => {
          const rightObject: any = rightObjects[i]

          const style = {
            top: (this.slideHeight * o.top) / 100,
            left: this.slideWidth / 2 + ((this.slideWidth / 2) * o.left) / 100,
            width: ((this.slideWidth / 2) * o.width) / 100,
            height: (this.slideHeight * o.height) / 100,
            rotateAngle: 0,
            transform: '',
            zIndex: 100 + i + '',
          }

          if (rightObject) {
            layoutObjects.push({
              ...rightObject,
              style,
            })
          } else {
            layoutObjects.push(layoutPositionsToImage(style))
          }
        })

        this.addLayout({
          objects: [...leftObjects, ...layoutObjects],
          layout: {
            ...layout,
            right: {
              count,
              index,
            },
          },
        })
        this.updateHistory(ADD_LAYOUT, {
          objects,
          layout,
        })
      }
    }
  }
  public layoutDragOver = (e: any) => {
    if (e.target.classList.contains('layout-drop')) {
      e.target.style.border = '3px solid #333'
    }
  }
  public layoutDragLeave = (e: any) => {
    if (e.target.classList.contains('layout-drop')) {
      e.target.style.border = 'none'
    }
  }
  public layoutDragDrop = (e: any, objects: PObject[], layout: FullLayout) => {
    e.preventDefault()

    const layoutDrop = e.target
    const _width = this.slideWidth - 20
    const _height = this.slideHeight - 20
    if (layoutDrop.classList.contains('layout-drop-left')) {
      const layoutData = JSON.parse(e.dataTransfer.getData('layout'))
      const { count, index } = layoutData
      const layoutObjects: any = []

      const leftObjects: any = objects.filter((o: any) => o.style.left < this.slideWidth / 2)

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

      this.addLayout({
        objects: [...objects.filter((o: any) => o.style.left >= this.slideWidth / 2), ...layoutObjects],
        layout: {
          ...layout,
          left: {
            count,
            index,
          },
        },
      })
      this.updateHistory(ADD_LAYOUT, { objects, layout })
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

      this.addLayout({
        objects: [...objects.filter((o: any) => o.style.left < this.slideWidth / 2), ...layoutObjects],
        layout: {
          ...layout,
          right: {
            count,
            index,
          },
        },
      })
      this.updateHistory(ADD_LAYOUT, { objects })
    } else if (
      layoutDrop.classList.contains('layout-drop-middle') ||
      layoutDrop.classList.contains('layout-drop-full')
    ) {
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

      this.addLayout({
        objects: layoutObjects,
        layout: {
          ...layout,
          right: {
            count,
            index,
          },
        },
      })
      this.updateHistory(ADD_LAYOUT, { objects })
    }
  }
  // #endregion [LayoutMethods]
  // #region [TextMethods]
  public getCurrentText = (textContainer: HTMLElement) => {
    const text = textContainer.childNodes[2] as HTMLElement

    const texts: any = []
    text.childNodes.forEach((t: any) => {
      if (t.textContent) texts.push(t.textContent)
      else texts.push('\n')
    })

    return texts
  }
  public createText = (objects: PObject[]) => {
    this.hideToolbar()
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

    this.addObject({
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
    this.setObjectType('text')
  }
  public updateTextObject = (objects: PObject[], _textObjectIndex: number) => {
    const textContainer: any = this._object.firstChild
    if (!textContainer.classList.contains('text-container')) return
    const texts = this.getCurrentText(textContainer)

    const autogrow = textContainer.childNodes[1] as HTMLElement
    const { height: autogrowHeight } = getComputedStyle(autogrow)
    const { style, props } = objects[_textObjectIndex]

    if (arraysEqual(props.texts || [], texts)) {
      this.setTextObjectIndex(-1)
      return
    }

    this.updateObject({
      object: {
        ...[_textObjectIndex],
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

    this.updateHistory(UPDATE_OBJECT, { object: objects[_textObjectIndex] })

    this.setTextObjectIndex(-1)
  }
  public updateText = (_index: number, objects: PObject[], e?: any) => {
    if (_index === -1) return
    // 8 is backspace
    if (e && e.key && e.keyCode !== 8) {
      if (e.keyCode === 16) {
        this._isShiftDown = true
        return
      }
      if (e.keyCode === 17) {
        this._isCtrlDown = true
        return
      }
      if (e.key.length > 1) return
      if (!/[a-zA-Z0-9]/.test(e.key[0])) return
      if (this._isShiftDown || this._isCtrlDown) return
    }

    const textContainer: any = this._object.firstChild
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

      this._object.style.height = newHeight + 'px'
      autogrow.style.height = newHeight + 'px'

      this.moveResizers({ angle })
    }
  }
  public updateCurrentTextObject = (_index: number, objects: PObject[]) => {
    const textContainer: any = this._object.firstChild
    if (!textContainer.classList.contains('text-container')) return
    const texts = this.getCurrentText(textContainer)

    const autogrow = textContainer.childNodes[1] as HTMLElement
    const { height: autogrowHeight } = getComputedStyle(autogrow)
    const { style, props } = objects[_index]

    this.updateObject({
      object: {
        ...objects[_index],
        style: {
          ...style,
          height: parseFloat(autogrowHeight),
        },
        props: {
          ...props,
          autogrowStyle: {
            height: autogrowHeight,
          },
          texts,
        },
      },
    })

    this.updateHistory(UPDATE_OBJECT, {
      object: objects[_index],
    })
  }
  public rotateTextResizers = (rotateAngle: number) => {
    const resizers: any = document.querySelectorAll('.resize')
    resizers.forEach((r: HTMLElement) => {
      r.style.transform = `rotateZ(${rotateAngle}deg)`
    })
  }
  // #endregion [TextMethods]
  // #region [ObjectMethods]
  public onObjectDoubleClick = (e: any, o: any, index: any) => {
    const child = e.target.firstChild
    if (child && child.classList && child.classList.contains('text-container')) {
      this.setIsTextEditing(true)
      this.setObjectIndex(index)
      child.style.pointerEvents = 'auto'
      child.style.cursor = 'text'
      child.childNodes[2].contentEditable = true
    }
  }
  public onObjectDragOver = (e: any) => {
    e.preventDefault()
  }
  public onDragObjectOver = (e: any) => {
    e.stopPropagation()
    e.preventDefault()
    if (e.target.classList.contains('object') && e.target.childNodes[0].className === 'image-placeholder') {
      e.target.style.border = '3px dashed #00d9e1'
    }
  }
  public onDragObjectLeave = (e: any, _index: number) => {
    if (_index && e.target.classList.contains('object') && e.target.childNodes[0].className === 'image-placeholder') {
      e.target.style.border = 'none'
    }
  }
  public objectHoverOff = (e: any, index: number, _index: number) => {
    if (index !== _index && !this._isMouseDown) {
      this.hideBorder(e.target)
      this.setOverflow('hidden')
    }
  }
  public objectHover = (e: any, index: number, _index: number) => {
    if (index !== _index && !this._isMouseDown) {
      this.showBorder(e.target)
    }
  }
  public updateObjectStyle = (o: any, object?: any) => {
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

      this.updateObject({ object: newObject })
      this.updateHistory(UPDATE_OBJECT, { object: o })
    }
  }
  public onRemoveImageFromObject = (_index: number, objects: PObject[], _objectType?: ObjectType) => {
    if (_objectType !== 'image' || _index === -1) return

    const newObject: PObject = {
      ...objects[_index],
      props: {
        style: { transform: 'scaleX(1)' },
        className: 'image-placeholder',
        imageStyle: { display: 'none', top: 0, left: 0, width: '100%' },
        placeholderStyle: { opacity: '0.5', backgroundColor: '#737373' },
      },
    }

    this.updateObject({ object: newObject })
    this.updateHistory(UPDATE_OBJECT, { object: objects[_index] })
  }
  public onRemoveObject = (containers: Container[], objects: PObject[], _index: number) => {
    if (_index > -1) {
      this.removeObject({
        container: containers[_index],
        object: objects[_index],
      })
      this.deSelectObject()
    }
  }
  public deSelectObject = () => {
    this.setObjectIndex(-1)
    this.hideResizer()
    this.hideToolbar()
    this.hideActiveBorder()
    this.hideGroupSelection()
  }
  public startDrag = (e: any, o: any, index: number, objects?: PObject[]) => {
    if (objects) {
      this.objects = objects
    }
    if (this._isTextEditing && e.target.nodeName === 'P') return
    if (e.target.classList.contains('image-center')) return
    const object = document.getElementById(o.id) as HTMLDivElement
    this.magnetX = document.getElementById('magnetX')
    this.magnetY = document.getElementById('magnetY')
    if (this._object) this.hideImageCircle(this._object)
    const objectType = this.getObjectType(e.target.firstChild?.classList)
    this.setObjectType(objectType)
    let startX = e.clientX / this.scale
    let startY = e.clientY / this.scale
    this.hideBorder(e.target)
    this._object = object
    this.setObjectIndex(index)
    this._index = index
    this.setObject(object)
    this.showImageCircle(e.target, objectType)

    this._isMouseDown = true
    this._rotateAngle = o.style.rotateAngle || 0

    if (objectType === 'text') this.rotateTextResizers(this._rotateAngle)

    this.moveResizers({ object, angle: this._rotateAngle, objectType })
    this._objectType = objectType

    const onMouseMove = (sube: any) => {
      if (!this._isMouseDown) return
      sube.stopImmediatePropagation()
      const clientX = sube.clientX / this.scale
      const clientY = sube.clientY / this.scale
      const deltaX = clientX - startX
      const deltaY = clientY - startY
      this.onDrag(deltaX, deltaY, object, objectType)
      startX = clientX
      startY = clientY
    }

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      if (!this._isMouseDown) return
      this._isMouseDown = false
      const { top, left, width, height } = getComputedStyle(object)

      const t = parseFloat(top)
      const l = parseFloat(left)
      const w = parseFloat(width)
      const h = parseFloat(height)

      this.moveCollisionObject(object, objectType, { t, l, w, h })
      if (index > -1) {
        this.updateObjectStyle(o, object)
      }
      setTimeout(() => {
        this.magnetX.style.display = 'none'
        this.magnetY.style.display = 'none'
      }, 300)
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  }
  public onDrag = (deltaX: number, deltaY: number, object: any, objectType: string) => {
    const { top, left, width, height } = getComputedStyle(object)

    const t = parseFloat(top)
    const l = parseFloat(left)
    const w = parseFloat(width)
    const h = parseFloat(height)

    object.style.top = t + deltaY + 'px'
    object.style.left = l + deltaX + 'px'
    this.moveResizers({ object, objectType })
    this.collisionDetecter(object, objectType, { t, l, w, h })
  }

  public renderLine = (isHorizontal: boolean) => {
    if (isHorizontal) {
      this.magnetX.style.display = 'block'
    } else {
      this.magnetY.style.display = 'block'
    }
  }

  public renderLines = (
    object: HTMLElement,
    objectType: string,
    move: boolean,
    elementX: CollisionObject,
    elementY: CollisionObject
  ) => {
    if (
      !this.objects ||
      !elementX ||
      !elementY ||
      (elementX.size > this._threshhold && elementY.size > this._threshhold)
    ) {
      this.magnetY.style.display = 'none'
      this.magnetX.style.display = 'none'
      return
    }
    if (elementX.size > this._threshhold) {
      this.magnetX.style.display = 'none'
    }
    if (elementY.size > this._threshhold) {
      this.magnetY.style.display = 'none'
    }

    let size = 0
    if (elementX.size <= this._threshhold) {
      switch (elementX.key) {
        case 'tt':
          if (elementX.index !== -1) {
            size = ParseNumber(this.objects[elementX.index].style.top)
          } else {
            size = -this._border
          }
          this.magnetX.style.top = `${size * this.scale}px`
          if (move) {
            object.style.top = `${size}px`
          }
          break
        case 'ty':
          if (elementX.index !== -1) {
            size =
              ParseNumber(this.objects[elementX.index].style.top) +
              ParseNumber(this.objects[elementX.index].style.height) / 2
          } else {
            size = ParseNumber(this.slideHeight) / 2
          }
          this.magnetX.style.top = `${size * this.scale}px`
          if (move) {
            object.style.top = `${size}px`
          }
          break
        case 'bb':
          if (elementX.index !== -1) {
            size =
              ParseNumber(this.objects[elementX.index].style.top) +
              ParseNumber(this.objects[elementX.index].style.height)
          } else {
            size = ParseNumber(this.slideHeight)
          }
          this.magnetX.style.top = `${size * this.scale}px`
          if (this._index !== undefined && move) {
            object.style.top = `${size - ParseNumber(this.objects[this._index].style.height)}px`
          }
          break
        case 'by':
          if (elementX.index !== -1) {
            size =
              ParseNumber(this.objects[elementX.index].style.top) +
              ParseNumber(this.objects[elementX.index].style.height) / 2
          } else {
            size = ParseNumber(this.slideHeight) / 2
          }
          this.magnetX.style.top = `${size * this.scale}px`
          if (this._index !== undefined && move) {
            object.style.top = `${size - ParseNumber(this.objects[this._index].style.height)}px`
          }
          break
        case 'tb':
          if (elementX.index !== -1) {
            size =
              ParseNumber(this.objects[elementX.index].style.top) +
              ParseNumber(this.objects[elementX.index].style.height)
          } else {
            size = ParseNumber(this.slideHeight / 2)
          }
          this.magnetX.style.top = `${size * this.scale}px`
          if (move) {
            object.style.top = `${size}px`
          }
          break
        case 'bt':
          if (elementX.index !== -1) {
            size = ParseNumber(this.objects[elementX.index].style.top)
          } else {
            size = ParseNumber(this.slideHeight / 2)
          }
          this.magnetX.style.top = `${size * this.scale}px`
          if (this._index !== undefined && move) {
            object.style.top = `${size - ParseNumber(this.objects[this._index].style.height)}px`
          }
          break
        case 'yy':
          if (elementX.index !== -1) {
            size =
              ParseNumber(this.objects[elementX.index].style.top) +
              ParseNumber(this.objects[elementX.index].style.height) / 2
          } else {
            size = ParseNumber(this.slideHeight / 2)
          }
          this.magnetX.style.top = `${size * this.scale}px`
          if (this._index !== undefined && move) {
            object.style.top = `${size - ParseNumber(this.objects[this._index].style.height) / 2}px`
          }
          break
        default:
          break
      }
      this.renderLine(true)
    }
    if (elementY.size <= this._threshhold) {
      switch (elementY.key) {
        case 'rr':
          if (elementY.index !== -1) {
            size =
              ParseNumber(this.objects[elementY.index].style.left) +
              ParseNumber(this.objects[elementY.index].style.width)
          } else {
            size = ParseNumber(this.slideWidth) + this._border
          }
          this.magnetY.style.left = `${size * this.scale}px`
          if (this._index !== undefined && move) {
            object.style.left = `${size - ParseNumber(this.objects[this._index].style.width)}px`
          }
          break
        case 'rx':
          if (elementY.index !== -1) {
            size =
              ParseNumber(this.objects[elementY.index].style.left) +
              ParseNumber(this.objects[elementY.index].style.width) / 2
          } else {
            size = ParseNumber(this.slideWidth) / 2 + this._border
          }
          this.magnetY.style.left = `${size * this.scale}px`
          if (this._index !== undefined && move) {
            object.style.left = `${size - ParseNumber(this.objects[this._index].style.width)}px`
          }
          break
        case 'll':
          if (elementY.index !== -1) {
            size = ParseNumber(this.objects[elementY.index].style.left)
          } else {
            size = -this._border
          }
          this.magnetY.style.left = `${size * this.scale}px`
          if (move) {
            object.style.left = `${size}px`
          }
          break
        case 'lx':
          if (elementY.index !== -1) {
            size = ParseNumber(this.objects[elementY.index].style.left) / 2
          } else {
            size = ParseNumber(this.slideWidth / 2)
          }
          this.magnetY.style.left = `${size * this.scale}px`
          if (move) {
            object.style.left = `${size}px`
          }
          break
        case 'rl':
          if (elementY.index !== -1) {
            size = ParseNumber(this.objects[elementY.index].style.left)
          } else {
            size = ParseNumber(this.slideHeight / 2)
          }
          this.magnetY.style.left = `${size * this.scale}px`
          if (this._index !== undefined && move) {
            object.style.left = `${size - ParseNumber(this.objects[this._index].style.width)}px`
          }
          break
        case 'lr':
          if (elementY.index !== -1) {
            size =
              ParseNumber(this.objects[elementY.index].style.left) +
              ParseNumber(this.objects[elementY.index].style.width)
          } else {
            size = ParseNumber(this.slideHeight / 2)
          }
          this.magnetY.style.left = `${size * this.scale}px`
          if (move) {
            object.style.left = `${size}px`
          }
          break
        case 'xx':
          if (elementY.index !== -1) {
            size =
              ParseNumber(this.objects[elementY.index].style.left) +
              ParseNumber(this.objects[elementY.index].style.width) / 2
          } else {
            size = ParseNumber(this.slideHeight / 2)
          }
          this.magnetY.style.left = `${size * this.scale}px`
          if (this._index !== undefined && move) {
            object.style.left = `${size - ParseNumber(this.objects[this._index].style.width) / 2}px`
          }
          break
        default:
          break
      }
      this.renderLine(false)
    }

    this.moveResizers({ object, objectType })
  }
  public moveCollisionObject = (object: any, objectType: string, element: OElement) => {
    if (this.objects && this._index !== undefined) {
      const minSizes = this.objects.reduce<any[]>((asn, obj, i) => {
        if (i === this._index) return asn
        const { width = 0, left = 0, top = 0, height = 0 } = obj.style
        asn.push(
          diffRect(
            element,
            {
              l: ParseNumber(left),
              h: ParseNumber(height),
              w: ParseNumber(width),
              t: ParseNumber(top),
            },
            i
          )
        )
        return asn
      }, [])
      minSizes.push(
        diffRect(
          element,
          {
            l: ParseNumber(this._border),
            h: ParseNumber(this.slideHeight) - this._border,
            w: this.double ? ParseNumber(this.slideWidth / 2 - 30) : ParseNumber(this.slideWidth) - this._border,
            t: this._border,
          },
          -1
        )
      )
      const [x, y] = lodash(minSizes.flat(1))
        .groupBy('vertical')
        .map((group) => lodash.minBy(group, 'size'))
        .value()
      this.renderLines(object, objectType, true, x, y)
    }
  }
  public collisionDetecter = lodash.throttle((object: any, objectType: string, element: OElement) => {
    if (this.objects && this._index !== undefined) {
      const minSizes = this.objects.reduce<any[]>((asn, obj, i) => {
        if (i === this._index) return asn
        const { width = 0, left = 0, top = 0, height = 0 } = obj.style
        asn.push(
          diffRect(
            element,
            {
              l: ParseNumber(left),
              h: ParseNumber(height),
              w: ParseNumber(width),
              t: ParseNumber(top),
            },
            i
          )
        )
        return asn
      }, [])
      minSizes.push(
        diffRect(
          element,
          {
            l: ParseNumber(this._border),
            h: ParseNumber(this.slideHeight) - this._border,
            w: this.double ? ParseNumber(this.slideWidth / 2 - 30) : ParseNumber(this.slideWidth) - this._border,
            t: this._border,
          },
          -1
        )
      )
      const [x, y] = lodash(minSizes.flat(1))
        .groupBy('vertical')
        .map((group) => lodash.minBy(group, 'size'))
        .value()
      console.log('aaaavaaaa', x, y)
      this.renderLines(object, objectType, true, x, y)
    }
  }, 500)
  public getObjectType = (classList: any): ObjectType => {
    let objectType: ObjectType = ''
    if (!classList) return 'text'
    if (classList.contains('image-placeholder')) {
      objectType = 'image'
    } else if (classList.contains('shape')) {
      objectType = 'shape'
    } else if (classList.contains('text-container')) {
      objectType = 'text'
    }

    return objectType
  }
  public createEclipse = (objects: PObject[]) => {
    this.hideToolbar()
    const style = {
      top: 100,
      left: 100,
      width: 300,
      height: 300,
      rotateAngle: 0,
      transform: '',
      zIndex: 100 + objects.length + '',
    }

    this.addObject({
      object: {
        id: uuidv4(),
        className: 'object',
        style,
        props: {
          className: 'shape',
          style: { transform: 'scaleX(1)' },
          shapeClass: 'eclipse',
          shapeStyle: { background: 'cyan' },
        },
      },
    })

    this.setObjectType('shape')
  }
  public createSquare = (objects: PObject[]) => {
    this.hideToolbar()
    const style = {
      top: 100,
      left: 100,
      width: 300,
      height: 300,
      rotateAngle: 0,
      transform: '',
      zIndex: 100 + objects.length + '',
    }

    this.addObject({
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

    this.setObjectType('shape')
  }
  public createImage = (e: any, objects: PObject[]) => {
    this.hideToolbar()
    if (e.dataTransfer) {
      const tempUrl = e.dataTransfer.getData('tempUrl')
      const imageUrl: any = e.dataTransfer.getData('imageUrl')

      const { x, y } = this.canvasRef.current.getBoundingClientRect()
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

      this.addObject({
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

      this.addObject({
        object: layoutPositionsToImage(style),
      })
    }
    this.setObjectType('image')
  }
  public createImages = (e: any, objects: PObject[]) => {
    this.hideToolbar()
    if (e.dataTransfer) {
      JSON.parse(e.dataTransfer.getData('images')).forEach((image: Image) => {
        const { x, y } = this.canvasRef.current.getBoundingClientRect()
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

        this.addObject({
          object: {
            id: uuidv4(),
            className: 'object',
            style,
            props: {
              imageUrl: image.imageUrl,
              tempUrl: image.tempUrl,
              className: 'image-placeholder',
              imageStyle: { display: 'block', top: 0, left: 0, width: '100%' },
              style: { transform: 'scaleX(1)' },
              placeholderStyle: { opacity: 1 },
            },
          },
        })
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

      this.addObject({
        object: layoutPositionsToImage(style),
      })
    }
    this.setObjectType('image')
  }
  public onObjectDrop = (e: any, type: FeatureType, objects: PObject[], _index: number) => {
    this.hideToolbar()
    e.preventDefault()
    if (!'images,cliparts,frames,masks'.includes(type) || this._isTextEditing) return

    if (
      e.target.classList.contains('object') &&
      e.target.childNodes[0].className === 'image-placeholder' &&
      !'cliparts'.includes(type)
    ) {
      if (_index > -1) {
        const { top, left, width, height } = getComputedStyle(this._object)
        const {
          options,
          rect: { w, h },
        } = this.calculateCenter({ top, left, width, height }, this._rotateAngle)

        const activeBorder = document.querySelector('.active-border')
        this.showActiveBorder(activeBorder, options, w, h, this._rotateAngle)
      }
      if (type === 'frames') {
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
            placeholderStyle: { opacity: '1' },
          },
        }

        this.updateObject({ object: newObject })
        this.updateHistory(UPDATE_OBJECT, { object: objects[index] })
      } else if (type === 'masks') {
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
            placeholderStyle: { opacity: '1' },
          },
        }

        this.updateObject({ object: newObject })
        this.updateHistory(UPDATE_OBJECT, { object: objects[index] })
      } else {
        e.target.style.border = 'none'
        const index = objects.findIndex((o: any) => o.id === e.target.id)
        const images = JSON.parse(e.dataTransfer.getData('images')) as Image[]
        const newObject = {
          ...objects[index],
          props: {
            ...objects[index].props,
            imageUrl: images[0].imageUrl,
            tempUrl: images[0].tempUrl,
            imageStyle: { display: 'block', top: 0, left: 0, width: '100%' },
            placeholderStyle: { opacity: '1' },
          },
        }

        this.updateObject({ object: newObject })
        this.updateHistory(UPDATE_OBJECT, { object: objects[index] })
      }
    } else if ('cliparts'.includes(type)) {
      this.createImage(e, objects)
    } else if ('images'.includes(type)) {
      this.createImages(e, objects)
    }
  }
  // #endregion [ObjectMethods]
  // #region [GroupMethods]
  public selectionDragStart = (e: any, containers: Container[]) => {
    let startX = e.clientX / this.scale
    let startY = e.clientY / this.scale

    this._isMouseDown = true

    const onMouseMove = (sube: any) => {
      if (!this._isMouseDown) return
      sube.stopImmediatePropagation()
      const clientX = sube.clientX / this.scale
      const clientY = sube.clientY / this.scale
      const deltaX = clientX - startX
      const deltaY = clientY - startY

      let minLeft = 0
      let minTop = 0

      Object.keys(this._groupObjects).forEach((k: string, i: number) => {
        const { top, left } = getComputedStyle(this._groupObjects[k])
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

      Object.keys(this._groupObjects).forEach((k: string) => {
        const { top, left } = getComputedStyle(this._groupObjects[k])
        const t = parseFloat(top)
        const l = parseFloat(left)
        this._groupObjects[k].style.top = t + deltaY + 'px'
        this._groupObjects[k].style.left = l + deltaX + 'px'
        this.moveResizers({
          object: this._groupObjects[k],
          objectType: 'group',
          styles: {
            ...this._groupStyles,
            top: minTop + deltaY,
            left: minLeft + deltaX,
          },
        })

        this.groupRef.current.style.top = (minTop + deltaY) * this.scale + 'px'
        this.groupRef.current.style.left = (minLeft + deltaX) * this.scale + 'px'
      })

      startX = clientX
      startY = clientY
    }

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      if (!this._isMouseDown) return
      this._isMouseDown = false

      const _objects = Object.keys(this._groupObjects).map((k: string) => {
        const { top, left, width, height } = getComputedStyle(this._groupObjects[k])
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

      this.updateGroupContainer({ containers: _objects })
      this.updateHistory(UPDATE_GROUP_CONTAINER, {
        containers: containers.filter((c: Container) => _objects.find((x) => x.id === c.id)),
      })
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  }
  public hideGroupSelection = () => {
    const groupSelection = document.querySelector('.group-selection') as HTMLElement

    if (groupSelection) {
      groupSelection.style.display = 'none'
      groupSelection.style.top = '0'
      groupSelection.style.left = '0'
      groupSelection.style.width = '0'
      groupSelection.style.height = '0'
    }
  }
  public showGroupSelection = () => {
    const groupSelection = document.querySelector('.group-selection') as HTMLElement
    groupSelection.style.display = 'block'
  }
  // #endregion [GroupMethods]
  // #region [ToolbarMethods]
  public rotate = (angle: number) => {
    const transform = this._object.style.transform.replace(/rotate\(([^)]+)\)/, `rotate(${angle}deg)`)
    // initilly container doesn't have transform property
    this._object.style.transform = transform || 'rotate(0deg)'
    this._rotateAngle = angle
    this.moveResizers()
  }
  public onRotate = (angle: number, startAngle: number) => {
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

    this.rotate(rotateAngle)
    this.rotateTextResizers(rotateAngle)
  }
  public startRotate = (e: any, objects: PObject[], _index: number) => {
    if (e.button !== 0 || !this._object) return
    const clientX = e.clientX / this.scale
    const clientY = e.clientY / this.scale

    const rect = this._object.getBoundingClientRect()
    const { rotateAngle } = objects[_index].style
    this._isMouseDown = true

    const center = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    }
    const startVector = {
      x: clientX - center.x / this.scale,
      y: clientY - center.y / this.scale,
    }

    const onMouseMove = (sube: any) => {
      if (!this._isMouseDown) return
      sube.stopImmediatePropagation()
      const rotateVector = {
        x: sube.clientX - center.x,
        y: sube.clientY - center.y,
      }
      const angle = getAngle(startVector, rotateVector)
      this.onRotate(angle, rotateAngle || 0)
    }
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
      if (!this._isMouseDown) return
      this._isMouseDown = false
      if (_index > -1) {
        this.updateObjectStyle(objects[_index])
      }
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }
  public getRotatedPosition = ({
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

    return { x: x * this.scale, y: y * this.scale }
  }
  public onRotateLeftObject = (_index: number, objects: PObject[]) => {
    if (_index > -1) {
      const rotateAngle = (objects[_index]?.style.rotateAngle || 0) - 90
      this._object.style.transform = `rotate(${rotateAngle}deg)`
      this._rotateAngle = rotateAngle
      this.updateObjectStyle(objects[_index])
      this.moveResizers()
    }
  }
  public onRotateRightObject = (_index: number, objects: PObject[]) => {
    if (_index > -1) {
      const rotateAngle = (objects[_index]?.style.rotateAngle || 0) + 90
      this._object.style.transform = `rotate(${rotateAngle}deg)`
      this._rotateAngle = rotateAngle
      this.updateObjectStyle(objects[_index])
      this.moveResizers()
    }
  }
  public onFlipObject = (_index: number, objects: PObject[]) => {
    if (_index > -1) {
      const { props } = objects[_index]
      let { transform = '' } = props.style

      const scaleX = transform.match(/scaleX\(([^)]+)\)/)
      if (scaleX && scaleX[0] === 'scaleX(1)') {
        transform = transform.replace(/scaleX\(([^)]+)\)/, 'scaleX(-1)')
      } else {
        transform = transform.replace(/scaleX\(([^)]+)\)/, 'scaleX(1)')
      }

      this.updateObject({
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

      this.updateHistory(UPDATE_OBJECT, { object: objects[_index] })
    }
  }
  public onSendForward = (_index: number, objects: PObject[]) => {
    if (_index > -1) {
      const objs: any = document.querySelectorAll('.object')
      if (!objs[_index]?.style) {
        return
      }
      const current = parseInt(objs[_index].style.zIndex, 10)

      if (current - 100 < objs.length - 1) {
        for (let i = 0; i < objs.length; i += 1) {
          if (parseInt(objs[i].style.zIndex, 10) === current + 1) {
            objs[i].style.zIndex = current
            break
          }
        }
        objs[_index].style.zIndex = current + 1

        this.updateObject({
          object: {
            ...objects[_index],
            style: {
              ...objects[_index].style,
              zIndex: current + 1 + '',
            },
          },
        })

        this.updateHistory(UPDATE_OBJECT, { object: objects[_index] })
      }
    }
  }
  public onSendBackward = (_index: number, objects: PObject[]) => {
    const objs: any = document.querySelectorAll('.object')
    if (!objs[_index]?.style) {
      return
    }
    const current = parseInt(objs[_index].style.zIndex, 10)

    if (current > 100) {
      for (let i = 0; i < objs.length; i += 1) {
        if (parseInt(objs[i].style.zIndex, 10) === current - 1) {
          objs[i].style.zIndex = current
          break
        }
      }
      objs[_index].style.zIndex = current - 1

      this.updateObject({
        object: {
          ...objects[_index],
          style: {
            ...objects[_index].style,
            zIndex: current - 1 + '',
          },
        },
      })

      this.updateHistory(UPDATE_OBJECT, { object: objects[_index] })
    }
  }
  public imageFit = debounce(
    (height: number, width: number, newSize: Size, oldSize: Size, type: string, _index: number, objects: PObject[]) => {
      const _obj = objects[_index]
      if (_obj?.props.className === 'image-placeholder') {
        const placeholder = this._object.firstChild as HTMLElement
        const image = placeholder.childNodes[2] as HTMLImageElement
        const _height = image.height - Math.abs(Number(_obj.props.imageStyle.top))

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
    },
    100
  )
  public moveToolbar = (
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
    if (!this.slideViewRef.current) return

    const { x } = this.getRotatedPosition({
      ...options,
      x: l + w / 2,
      y: t + h / 2,
    })

    const { width } = getComputedStyle(toolbar)

    const slideViewRect: any = this.slideViewRef.current.getBoundingClientRect()
    const scaledContainerRect: any = this.scaledContainerRef.current.getBoundingClientRect()

    const leftSpace = scaledContainerRect.x - slideViewRect.x
    const topSpace = scaledContainerRect.y - slideViewRect.y

    toolbar.style.left = x + leftSpace - parseFloat(width) / 2 + 'px'
    const toolbarDistance = this._rotaterDistance + 20 // 20 is rotater width
    if (scaledContainerRect.bottom - maxY - topSpace - toolbarDistance <= 100) {
      toolbar.style.top = t * this.scale + 'px'
    } else {
      toolbar.style.top = maxY + topSpace + toolbarDistance + 'px'
    }
  }
  public hideToolbar = () => {
    const toolbar: any = document.querySelector('.toolbar')
    if (toolbar) {
      toolbar.style.display = 'none'
    }
  }
  // #endregion [ToolbarMethods]
  // #region [ResizeMethods]
  public hideResizer = () => {
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
  public moveResizers = (props?: any) => {
    let { object, angle, objectType, styles } = props || {}

    if (!angle) {
      if (this._object) angle = getRotationScaler(this._object.style.transform)
      else angle = props._rotateAngle || 0
    }
    if (!object) object = this._object
    if (!objectType) objectType = this._objectType
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
    } = this.calculateCenter(styles, angle)

    // ---

    const rotater: DomType = document.querySelector('.rotate') || ({} as DomType)
    if (rotater) rotater.style.display = 'block'

    const toolbar: DomType = document.querySelector('.toolbar') || ({} as DomType)
    if (toolbar) toolbar.style.display = 'flex'

    const activeBorder = document.querySelector('.active-border')
    this.showActiveBorder(activeBorder, options, w, h, angle)

    if (objectType === 'group') {
      this.hideResizer()
      this.hideToolbar()
      return
    }

    const { x, y } = this.getRotatedPosition({
      ...options,
      x: l + w / 2,
      y: t - this._rotaterDistance / this.scale,
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
        const _position = this.getRotatedPosition({ ...options })
        r.style.left = _position.x - midpoint + 'px'
        r.style.top = _position.y - midpoint + 'px'
        r.style.display = objectType === 'text' ? 'none' : 'block'
        if (_position.y > maxY) maxY = _position.y
      } else if (r.classList.contains('tr')) {
        const _position = this.getRotatedPosition({ ...options, x: l + w })
        r.style.left = _position.x - midpoint + 'px'
        r.style.top = _position.y - midpoint + 'px'
        r.style.display = objectType === 'text' ? 'none' : 'block'
        if (_position.y > maxY) maxY = _position.y
      } else if (r.classList.contains('bl')) {
        const _position = this.getRotatedPosition({ ...options, y: t + h })
        r.style.left = _position.x - midpoint + 'px'
        r.style.top = _position.y - midpoint + 'px'
        r.style.display = objectType === 'text' ? 'none' : 'block'
        if (_position.y > maxY) maxY = _position.y
      } else if (r.classList.contains('br')) {
        const _position = this.getRotatedPosition({ ...options, x: l + w, y: t + h })
        r.style.left = _position.x - midpoint + 'px'
        r.style.top = _position.y - midpoint + 'px'
        r.style.display = objectType === 'text' ? 'none' : 'block'
        if (_position.y > maxY) maxY = _position.y
      } else if (r.classList.contains('t')) {
        const _position = this.getRotatedPosition({ ...options, x: l + w / 2 })
        r.style.left = _position.x - midpoint + 'px'
        r.style.top = _position.y - midpoint + 'px'
        r.style.display = objectType === 'text' ? 'none' : 'block'
        if (_position.y > maxY) maxY = _position.y
      } else if (r.classList.contains('b')) {
        const _position = this.getRotatedPosition({
          ...options,
          x: l + w / 2,
          y: t + h,
        })
        r.style.left = _position.x - midpoint + 'px'
        r.style.top = _position.y - midpoint + 'px'
        r.style.display = objectType === 'text' ? 'none' : 'block'
        if (_position.y > maxY) maxY = _position.y
      } else if (r.classList.contains('l')) {
        const _position = this.getRotatedPosition({ ...options, y: t + h / 2 })

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
        const _position = this.getRotatedPosition({
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
      this.moveToolbar(toolbar, options, { t, l, w, h, maxY })
    }, 0)
  }
  public startResize = (e: any, cursor: string, type: string, _index: number, objects: PObject[]) => {
    if (e.button !== 0 || _index === -1 || !this._object) return

    document.body.style.cursor = cursor
    const startX = e.clientX / this.scale
    const startY = e.clientY / this.scale
    const { top: t, left: l, width: w, height: h } = getComputedStyle(this._object)

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

    const rect = { width, height, centerX, centerY, rotateAngle: rotateAngle || 0 }

    this._isMouseDown = true
    const onMouseMove = (sube: any) => {
      if (!this._isMouseDown) return
      sube.stopImmediatePropagation()

      const clientX = sube.clientX / this.scale
      const clientY = sube.clientY / this.scale
      const deltaX = clientX - startX
      const deltaY = clientY - startY
      const alpha = Math.atan2(deltaY, deltaX)
      const deltaL = getLength(deltaX, deltaY)
      const isShiftKey = sube.shiftKey
      this.onResize(deltaL, alpha, rect, type, isShiftKey, _index, objects)
    }

    const onMouseUp = () => {
      document.body.style.cursor = 'auto'
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
      if (!this._isMouseDown) return
      this._isMouseDown = false

      if (_index > -1) {
        this.updateObjectStyle(objects[_index])
      }
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }
  public resizeObject = (
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
    type: string,
    _index: number,
    objects: PObject[]
  ) => {
    const oldSize = {
      width: Number(this._object.style.width.replace('px', '')),
      height: Number(this._object.style.height.replace('px', '')),
    }
    const newSize = {
      width,
      height,
    }
    this.imageFit(height, width, newSize, oldSize, type, _index, objects)
    this._object.style.top = top + 'px'
    this._object.style.left = left + 'px'
    this._object.style.width = width + 'px'
    this._object.style.height = height + 'px'
    this.moveResizers({ angle: rotateAngle, width, height, type })
  }
  public onResize = (
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
    isShiftKey: boolean,
    _index: number,
    objects: PObject[]
  ) => {
    const minWidth = 20 / this.scale
    const minHeight = 20 / this.scale

    const beta = alpha - degToRadian(rect.rotateAngle)
    const deltaW = length * Math.cos(beta)
    const deltaH = length * Math.sin(beta)
    const ratio = isShiftKey ? rect.width / rect.height : undefined
    const {
      position: { centerX, centerY },
      size: { width, height },
    } = getNewStyle(type, { ...rect, rotateAngle: rect.rotateAngle }, deltaW, deltaH, ratio, minWidth, minHeight)

    this.resizeObject(
      centerToTL({
        centerX,
        centerY,
        width,
        height,
        rotateAngle: rect.rotateAngle,
      }),
      type,
      _index,
      objects
    )
  }
  // #endregion [ResizeMethods]
  // #region [Border]
  public showActiveBorder = (border: any, options: any, w: number, h: number, angle?: number) => {
    const { x, y } = this.getRotatedPosition({ ...options })
    if (border) {
      border.style.left = x + 'px'
      border.style.top = y + 'px'
      border.style.width = w * this.scale + 'px'
      border.style.height = h * this.scale + 'px'
      border.style.display = 'block'
      border.style.transform = `rotate(${angle || this._rotateAngle}deg)`
    }
    this.setOverflow('unset')
  }
  public hideActiveBorder = () => {
    const activeBorder: any = document.querySelector('.active-border')
    if (activeBorder) {
      activeBorder.style.display = 'none'
      this.setOverflow('hidden')
      // hideResizer();
      this.hideToolbar()
      if (this._object) this.hideImageCircle(this._object)
    }
  }
  public showBorder = (object: HTMLElement) => {
    if (!object.classList.contains('object')) return
    const child = object.firstChild as HTMLElement
    const border = child.firstChild as HTMLElement
    border.style.borderWidth = 3 / this.scale + 'px'
    border.style.display = 'block'
    this.showGroupSelection()
  }
  public hideBorder = (object: HTMLElement) => {
    if (!object.classList.contains('object')) return
    const child = object.firstChild as HTMLElement
    const border = child.firstChild as HTMLElement
    border.style.display = 'none'
    this.hideGroupSelection()
  }
  public showImageCircle = (object: HTMLElement, objectType: ObjectType) => {
    if (objectType !== 'image' || !object.classList.contains('object')) return
    const child = object.firstChild as HTMLElement
    const circle = child.lastChild as HTMLElement
    circle.style.display = 'flex'

    this.showGroupSelection()
  }
  public hideImageCircle = (object: HTMLElement) => {
    if (this._objectType !== 'image' || !object?.classList.contains('object')) return
    const child = object.firstChild as HTMLElement
    const circle = child.lastChild as HTMLElement
    circle.style.display = 'none'

    this.hideGroupSelection()
  }
  // #endregion [Border]
  // #region [backgroundMethods]
  public onBackgroundDropDragOver = (e: any) => {
    if (e.target.classList.contains('background-drop-left')) {
      e.target.style.border = '3px solid #333'
    } else if (e.target.classList.contains('background-drop-middle')) {
      e.target.style.border = '3px solid #333'
    }
    if (e.target.classList.contains('background-drop-right')) {
      e.target.style.border = '3px solid #333'
    }
  }
  public onBackgroundDropDragLeave = (e: any) => {
    if (e.target.classList.contains('background-drop-left')) {
      e.target.style.border = 'none'
    } else if (e.target.classList.contains('background-drop-middle')) {
      e.target.style.border = 'none'
    }
    if (e.target.classList.contains('background-drop-right')) {
      e.target.style.border = 'none'
    }
  }
  // #endregion [backgroundMethods]
  // #region [Methods]
  public calculateCenter = (styles: { top: any; left: any; width: any; height: any }, angle: any) => {
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
  public onSlideMouseDown = (e: any, _index: number, containers: Container[]) => {
    if (e.target.classList.contains('image-center')) return

    if (e.target.id === 'scaled_container' || e.target.id === 'canvas_container') {
      this.hideImageCircle(this._object)
      if (_index > -1 && this._isTextEditing) {
        this.setTextObjectIndex(_index)
        this._object.classList.remove('selected')
        this._object.firstChild.style.cursor = 'default'
        this._object.firstChild.style.pointerEvents = 'none'
        this._object.firstChild.childNodes[2].contentEditable = false
        this.setIsTextEditing(false)
        window.getSelection()?.removeAllRanges()
      }
      this.deSelectObject()
    }

    if (this._isTextEditing) return

    const rect = this.slideContainerRef.current.getBoundingClientRect()

    const startX = e.clientX - rect.x
    const startY = e.clientY - rect.y

    const selectedObjects: { [k: number]: HTMLElement } = {}

    this._isMouseDown = true

    const onMouseMove = (sube: any) => {
      if (!this._isMouseDown) return
      sube.stopImmediatePropagation()
      this.selectionRef.current.hidden = false
      const clientY = sube.clientY - rect.y
      const clientX = sube.clientX - rect.x

      const x3 = Math.min(startX, clientX)
      const x4 = Math.max(startX, clientX)
      const y3 = Math.min(startY, clientY)
      const y4 = Math.max(startY, clientY)

      this.selectionRef.current.style.left = x3 + 'px'
      this.selectionRef.current.style.top = y3 + 'px'
      this.selectionRef.current.style.width = x4 - x3 + 'px'
      this.selectionRef.current.style.height = y4 - y3 + 'px'

      const s = this.selectionRef.current.getBoundingClientRect()

      containers.forEach((c: Container, i: number) => {
        if (!c.id) return
        const object = document.getElementById(c.id) as HTMLElement
        const o = object.getBoundingClientRect()

        if (
          o.left < s.left + s.width &&
          o.left + o.width > s.left &&
          o.top < s.top + s.height &&
          o.top + o.height > s.top
        ) {
          selectedObjects[i] = object
          this.showBorder(object)
        } else {
          delete selectedObjects[i]
          this.hideBorder(object)
        }
      })
    }

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      if (!this._isMouseDown) return
      if (this.selectionRef.current) {
        this.selectionRef.current.hidden = true
        this.selectionRef.current.style.width = 0
        this.selectionRef.current.style.height = 0
      }
      this._isMouseDown = false

      const selectedStyle = {
        left: 0,
        top: 0,
        width: 0,
        height: 0,
      }

      Object.keys(selectedObjects).forEach((k: string, i: number) => {
        const { left, top, width, height } = selectedObjects[parseInt(k, 10)].style
        // for now just hide, later calculate angles
        this.hideBorder(selectedObjects[parseInt(k, 10)])

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
        const objectType = this.getObjectType(object.firstChild.classList)
        this.moveResizers({ object, objectType })
        this.setObjectType(objectType)
        this.setObjectIndex(key)
        this.setObject(object)
        this._object = object
      } else if (Object.keys(selectedObjects).length > 1) {
        this.showGroupSelection()
        this.setGroupObjects(selectedObjects)
        this.setGroupStyles(selectedStyle)
        this.groupRef.current.style.left = selectedStyle.left * this.scale + 'px'
        this.groupRef.current.style.top = selectedStyle.top * this.scale + 'px'
        this.groupRef.current.style.width = selectedStyle.width * this.scale + 'px'
        this.groupRef.current.style.height = selectedStyle.height * this.scale + 'px'
        this.moveResizers({ styles: selectedStyle, objectType: 'group' })
      }
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  }
  // #endregion [Methods]
}
