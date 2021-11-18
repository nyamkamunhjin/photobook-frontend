/* eslint-disable no-restricted-syntax */
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
  ProjectInterface,
  Size,
} from 'interfaces'
import { v4 as uuidv4 } from 'uuid'
import lodash from 'lodash'
import { ADD_LAYOUT, UPDATE_GROUP_CONTAINER, UPDATE_OBJECT, UPDATE_OBJECTS } from 'redux/actions/types'
import { arraysEqual, debounce, getRotationScaler, montagePortraitGap, ParseNumber } from 'utils'
import {
  calculateCenter,
  centerToTL,
  degToRadian,
  diffRect,
  getAngle,
  getLength,
  getNewStyle,
  getRotatedPosition,
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
  backgroundEdit?: boolean
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
  zoom?: number
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
  _zoom = 1
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
  backgroundEdit?: boolean
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
    this._groupObjects = props._groupObjects
    this.updateGroupContainer = props.updateGroupContainer
    this.slideViewRef = props.slideViewRef
    this.scaledContainerRef = props.scaledContainerRef
    this._groupStyles = props._groupStyles
    this.overflow = props.overflow
    if (props.backgroundEdit !== undefined) {
      this.backgroundEdit = props.backgroundEdit
    }
    if (props._objectType) {
      this._objectType = props._objectType
    }
    if (props.zoom !== undefined) {
      this._zoom = props.zoom
    }
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
    if (props.double !== undefined) {
      this.double = props.double
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
    this.groupRef = props.groupRef
    this.setGroupStyles = props.setGroupStyles
    this.magnetX = props.magnetX
    this.magnetY = props.magnetY
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
      const { count, index, types } = layoutData
      if (!types.includes('single-page')) return
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
      const { count, index, types } = layoutData
      if (!types.includes('single-page')) return
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
      const { count, index, types } = layoutData
      if (!types.includes('whole-page')) return
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
    const uneditablePage = document.querySelector('.unavailable-to-edit-page')
    let x2 = 0
    if (uneditablePage && uneditablePage.className.includes('left-page')) {
      const { width } = uneditablePage.getBoundingClientRect()
      x2 = width / this.scale
    }
    const style = {
      top: 100,
      left: 100 + x2,
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
    // Deselect GroupObject
    this._groupObjects = null
    this.setGroupObjects(null)
    this.objects = objects
    this.deSelectObject()
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
  public onObjectDoubleClick = (e: any, o: any, index: any, objects: PObject[]) => {
    console.log('onObjectDoubleClick', index)
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
  public listAllEventListeners = () => {
    const allElements = Array.prototype.slice.call(document.querySelectorAll('*'))
    allElements.push(document)
    allElements.push(window)

    const types = []

    for (const ev in window) {
      if (/^on/.test(ev)) types[types.length] = ev
    }

    const elements = []
    for (let i = 0; i < allElements.length; i += 1) {
      const currentElement = allElements[i]
      for (let j = 0; j < types.length; j += 1) {
        if (typeof currentElement[types[j]] === 'function') {
          elements.push({
            node: currentElement,
            type: types[j],
            func: currentElement[types[j]].toString(),
          })
        }
      }
    }

    return elements.sort((a, b) => {
      return a.type.localeCompare(b.type)
    })
  }
  public listDocumentEventListeners = () => {
    const types = []

    for (const ev in window) {
      if (/^on/.test(ev)) types[types.length] = ev
    }

    const elements = []
    for (let j = 0; j < types.length; j += 1) {
      if (typeof document[types[j]] === 'function') {
        elements.push({
          node: document,
          type: types[j],
          func: document[types[j]].toString(),
        })
      }
    }

    return elements.sort((a, b) => {
      return a.type.localeCompare(b.type)
    })
  }
  public onSwapImages = (
    _index: number,
    objects: PObject[],
    _objectType: ObjectType,
    setIsSwapping: (value: boolean) => void
  ) => {
    if (_objectType !== 'image' || _index === -1) return
    setIsSwapping(true)

    const onMouseDown = (e: any) => {
      document.removeEventListener('mousedown', onMouseDown)
      setIsSwapping(false)

      const object2 = objects.find((o) => o.id === e.target.id)
      if (!object2 || !object2.props.className.includes('image-placeholder') || objects[_index].id === object2.id)
        return

      let newObject1: PObject
      if (object2.props.imageUrl) {
        newObject1 = {
          ...objects[_index],
          props: {
            ...objects[_index].props,
            imageStyle: { ...objects[_index].props.imageStyle, display: 'block' },
            imageUrl: object2.props.imageUrl,
            tempUrl: object2.props.tempUrl,
          },
        }
      } else {
        newObject1 = {
          ...objects[_index],
          props: {
            style: { transform: 'scaleX(1)' },
            className: 'image-placeholder',
            imageStyle: { display: 'none', top: 0, left: 0, width: '100%' },
            placeholderStyle: { opacity: '0.5', backgroundColor: '#737373' },
          },
        }
      }

      let newObject2: PObject
      if (objects[_index].props.imageUrl) {
        newObject2 = {
          ...object2,
          props: {
            ...object2.props,
            imageStyle: { ...object2.props.imageStyle, display: 'block' },
            imageUrl: objects[_index].props.imageUrl,
            tempUrl: objects[_index].props.tempUrl,
          },
        }
      } else {
        newObject2 = {
          ...object2,
          props: {
            style: { transform: 'scaleX(1)' },
            className: 'image-placeholder',
            imageStyle: { display: 'none', top: 0, left: 0, width: '100%' },
            placeholderStyle: { opacity: '0.5', backgroundColor: '#737373' },
          },
        }
      }
      this.updateObject({ object: newObject1 })
      this.updateObject({ object: newObject2 })
      this.updateHistory(UPDATE_OBJECTS, { objects: [objects[_index], object2] })
      if (newObject1.props.imageUrl)
        this.imageFitNoDebounce(objects, newObject1, parseFloat(newObject1.props.frameStyle?.borderWidth || '0'))
      if (newObject2.props.imageUrl)
        this.imageFitNoDebounce(objects, newObject2, parseFloat(newObject2.props.frameStyle?.borderWidth || '0'))
    }

    document.addEventListener('mousedown', onMouseDown)
  }
  public onRemoveFrameFromObject = (_index: number, objects: PObject[], _objectType?: ObjectType) => {
    if (_objectType !== 'image' || _index === -1) return

    if ('frameImage' in objects[_index].props) delete objects[_index].props.frameImage
    if ('frameStyle' in objects[_index].props) delete objects[_index].props.frameStyle

    this.updateObject({ object: objects[_index] })
    this.updateHistory(UPDATE_OBJECT, { object: objects[_index] })
  }
  public onRemoveMaskFromObject = (_index: number, objects: PObject[], _objectType?: ObjectType) => {
    if (_objectType !== 'image' || _index === -1) return

    if ('maskImage' in objects[_index].props) delete objects[_index].props.maskImage
    if ('maskStyle' in objects[_index].props) delete objects[_index].props.maskStyle

    this.updateObject({ object: objects[_index] })
    this.updateHistory(UPDATE_OBJECT, { object: objects[_index] })
  }
  public onRemoveFrameMaskFromObject = (_index: number, objects: PObject[], _objectType?: ObjectType) => {
    if (_objectType !== 'image' || _index === -1) return

    if ('frameMontage' in objects[_index].props) delete objects[_index].props.frameMontage
    if ('maskImage' in objects[_index].props) delete objects[_index].props.maskImage
    if ('maskStyle' in objects[_index].props) delete objects[_index].props.maskStyle

    this.updateObject({ object: objects[_index] })
    this.updateHistory(UPDATE_OBJECT, { object: objects[_index] })
  }
  public onRemoveObject = (containers: Container[], objects: PObject[], _index: number) => {
    console.log('onRemoveObject', _index)
    if (this._groupObjects) {
      const groupObjects = Object.values(this._groupObjects)
      groupObjects.forEach((obj: any) => {
        _index = objects.findIndex((o: PObject) => o.id === obj.id)
        this.removeObject({
          container: containers[_index],
          object: objects[_index],
        })
        objects.splice(_index, 1)
      })
      this._groupObjects = null
      this.setGroupObjects(null)

      this.objects = objects
    } else if (_index > -1) {
      /* montage image, text group */
      if (objects[_index].id.startsWith('image-montage-') || objects[_index].id.startsWith('text-montage-')) {
        const eachObjectsId = objects[_index].id.startsWith('image-montage-')
          ? [objects[_index].id, objects[_index].id.replace('image-montage-', 'text-montage-')]
          : [objects[_index].id, objects[_index].id.replace('text-montage-', 'image-montage-')]
        if (eachObjectsId.length) {
          eachObjectsId.forEach((id: string) => {
            _index = objects.findIndex((o: PObject) => o.id === id)
            this.removeObject({
              container: containers[_index],
              object: objects[_index],
            })
            objects.splice(_index, 1)
          })
        }
      } else {
        this.removeObject({
          container: containers[_index],
          object: objects[_index],
        })
      }
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

  public onSelect = (e: any, o: any, index: number, objects?: PObject[]) => {
    if (objects) {
      this.objects = objects
    }
    if (this._isTextEditing && e.target.nodeName === 'P') return
    if (e.target.classList.contains('image-center')) return
    const object = document.getElementById(o.id) as HTMLDivElement

    if (this._object) this.hideImageCircle(this._object)
    const objectType = this.getObjectType(e.target.firstChild?.classList)
    this.setObjectType(objectType)

    this.hideBorder(e.target)
    this._object = object
    this.setObjectIndex(index)
    this._index = index
    this.setObject(object)

    this._isMouseDown = true

    const toolbar: any = document.querySelector('.toolbar')
    if (toolbar) {
      if (toolbar.style.display === 'none' || !toolbar.style.display) {
        toolbar.style.display = 'flex'
      } else if (toolbar.style.display === 'flex') {
        toolbar.style.display = 'none'
      }

      toolbar.style.position = 'absolute'
      toolbar.style.top = `0px`
      toolbar.style.left = `calc(50% - 190px)`
    }
  }
  public startDrag = (e: any, o: any, index: number, objects?: PObject[], gap = 0, isSwapping = false) => {
    if (isSwapping) return
    if (objects) {
      this.objects = objects
    }
    if (this._isTextEditing && e.target.nodeName === 'P') return
    if (e.target.classList.contains('image-center')) return

    // Ehleed group object bwal deselect hiine
    this._groupObjects = null
    this.setGroupObjects(null)
    this.objects = objects
    this.deSelectObject()

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

    // Text edit or delete
    // if (o.props.className === 'text-container') {
    //   const text = e.target.querySelector('.text')
    //   if (text && text.contentEditable) {
    //     const { top, left, width, height } = text.getBoundingClientRect()
    //     if (e.clientX < left || e.clientX > left + width || e.clientY < top || e.clientY > top + height) {
    //       this.setIsTextEditing(false)
    //       text.style.pointerEvents = 'none'
    //       text.style.cursor = 'pointer'
    //       text.contentEditable = false
    //     }
    //   }
    // }

    const onMouseMove = (sube: any) => {
      if (!this._isMouseDown) return
      sube.stopImmediatePropagation()
      const clientX = sube.clientX / this.scale
      const clientY = sube.clientY / this.scale
      const deltaX = clientX - startX
      const deltaY = clientY - startY
      this.onDrag(deltaX, deltaY, object, objectType, gap)

      /* montage image, text group */
      if (object.id.startsWith('image-montage-')) {
        const eachObject = document.getElementById(object.id.replace('image-montage-', 'text-montage-'))
        if (eachObject) {
          const objectRect = getComputedStyle(object)

          const pxParser = (text: string) => {
            return parseFloat(text.replace('px', ''))
          }

          eachObject.style.top = montagePortraitGap + pxParser(objectRect.top) + pxParser(objectRect.height) + 'px'
          eachObject.style.left =
            pxParser(objectRect.left) + pxParser(objectRect.width) / 2 - pxParser(eachObject.style.width) / 2 + 'px'
        }
      }

      if (object.id.startsWith('text-montage-')) {
        const eachObject = document.getElementById(object.id.replace('text-montage-', 'image-montage-'))
        if (eachObject) {
          const objectRect = getComputedStyle(object)

          const pxParser = (text: string) => {
            return parseFloat(text.replace('px', ''))
          }

          eachObject.style.top =
            pxParser(objectRect.top) - montagePortraitGap - pxParser(eachObject.style.height) + 'px'
          eachObject.style.left =
            pxParser(objectRect.left) + pxParser(objectRect.width) / 2 - pxParser(eachObject.style.width) / 2 + 'px'
        }
      }

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

      this.moveCollisionObject(object, objectType, { t, l, w, h }, gap, false)
      this.checkActiveWrapper(object)

      if (index > -1) {
        this.updateObjectStyle(o, object)

        /* save montage text or image */

        if (object.id.startsWith('image-montage-')) {
          /* find montage text and update */
          const id = object.id.replace('image-montage-', 'text-montage-')
          const element = document.getElementById(id)

          if (element) {
            this.updateObjectStyle(
              objects?.find((each) => each.id === id),
              element
            )
          }
        }
        if (object.id.startsWith('text-montage-')) {
          /* find montage text and update */
          const id = object.id.replace('text-montage-', 'image-montage-')
          const element = document.getElementById(id)

          if (element) {
            this.updateObjectStyle(
              objects?.find((each) => each.id === id),
              element
            )
          }
        }
      }
      setTimeout(() => {
        this.magnetX.style.display = 'none'
        this.magnetY.style.display = 'none'
      }, 300)
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  }
  public onDrag = (deltaX: number, deltaY: number, object: any, objectType: string, gap: number) => {
    const { top, left, width, height } = getComputedStyle(object)

    const t = parseFloat(top)
    const l = parseFloat(left)
    const w = parseFloat(width)
    const h = parseFloat(height)

    object.style.top = t + deltaY + 'px'
    object.style.left = l + deltaX + 'px'
    this.moveResizers({ object, objectType })
    this.collisionDetecter(object, objectType, { t, l, w, h }, gap, false)
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
    elementY: CollisionObject,
    gap: number,
    isResize = false
    // resizeSide?: string
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
    // console.log('isResize', isResize, 'elementX', elementX, 'elementY', elementY)
    let size = 0
    if (elementX.size <= this._threshhold) {
      switch (elementX.key) {
        case 'tt':
          size = elementX.position
          this.magnetX.style.top = `${elementX.magnet * this.scale}px`
          if (isResize) {
            object.style.height = `${Math.abs(
              ParseNumber(object.style.height) + ParseNumber(object.style.top) - size
            )}px`
          }
          if (move) {
            object.style.top = `${size}px`
          }
          break
        case 'ty':
          size = elementX.position
          this.magnetX.style.top = `${elementX.magnet * this.scale}px`
          if (isResize) {
            object.style.height = `${Math.abs(
              ParseNumber(object.style.height) + ParseNumber(object.style.top) - size
            )}px`
          }
          if (move) {
            object.style.top = `${size}px`
          }
          break
        case 'bb':
          size = elementX.position
          this.magnetX.style.top = `${elementX.magnet * this.scale}px`
          if (isResize) {
            object.style.height = `${Math.abs(size - ParseNumber(object.style.top))}px`
          } else if (this._index !== undefined && move) {
            object.style.top = `${size - ParseNumber(object.style.height)}px`
          }
          break
        case 'by':
          size = elementX.position
          this.magnetX.style.top = `${elementX.magnet * this.scale}px`
          if (isResize) {
            object.style.height = `${Math.abs(size - ParseNumber(object.style.top))}px`
          } else if (this._index !== undefined && move) {
            object.style.top = `${size - ParseNumber(object.style.height)}px`
          }
          break
        case 'tb':
          size = elementX.position
          this.magnetX.style.top = `${elementX.magnet * this.scale}px`
          if (isResize) {
            object.style.height = `${Math.abs(
              ParseNumber(object.style.top) + ParseNumber(object.style.height) - size - gap
            )}px`
          }
          if (move) {
            object.style.top = `${size + gap}px`
          }
          break
        case 'bt':
          size = elementX.position
          this.magnetX.style.top = `${elementX.magnet * this.scale}px`
          if (isResize) {
            object.style.height = `${Math.abs(size - ParseNumber(object.style.top)) - gap}px`
          } else if (this._index !== undefined && move) {
            object.style.top = `${size - ParseNumber(object.style.height) - gap}px`
          }
          break
        case 'yy':
          size = elementX.position
          this.magnetX.style.top = `${elementX.magnet * this.scale}px`
          if (this._index !== undefined && move) {
            object.style.top = `${size - ParseNumber(object.style.height) / 2}px`
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
          size = elementY.position
          this.magnetY.style.left = `${elementY.magnet * this.scale}px`
          if (isResize) {
            object.style.width = `${Math.abs(
              size + ParseNumber(object.style.width) - ParseNumber(object.style.left)
            )}px`
          } else if (this._index !== undefined && move) {
            object.style.left = `${size}px`
          }
          break
        case 'rx':
          size = elementY.position
          this.magnetY.style.left = `${elementY.magnet * this.scale}px`
          if (isResize) {
            object.style.width = `${Math.abs(
              size + ParseNumber(object.style.width) - ParseNumber(object.style.left)
            )}px`
          } else if (this._index !== undefined && move) {
            object.style.left = `${size}px`
          }
          break
        case 'll':
          size = elementY.position
          this.magnetY.style.left = `${elementY.magnet * this.scale}px`
          if (isResize) {
            object.style.width = `${Math.abs(
              ParseNumber(object.style.left) + ParseNumber(object.style.width) - size
            )}px`
          }
          if (move) {
            object.style.left = `${size}px`
          }
          break
        case 'lx':
          size = elementY.position
          this.magnetY.style.left = `${elementY.magnet * this.scale}px`
          if (isResize) {
            object.style.width = `${Math.abs(
              ParseNumber(object.style.width) + ParseNumber(object.style.left) - size
            )}px`
          }
          if (move) {
            object.style.left = `${size}px`
          }
          break
        case 'rl':
          // Double uyd do nothing buyu size auto ih uguh
          if (elementY.index === -1) break
          size = elementY.position
          this.magnetY.style.left = `${elementY.magnet * this.scale}px`
          if (isResize) {
            object.style.width = `${Math.abs(size - ParseNumber(object.style.left)) - gap}px`
          } else if (this._index !== undefined && move) {
            object.style.left = `${size - ParseNumber(object.style.width) - gap}px`
          }
          break
        case 'lr':
          if (elementY.index === -1) break
          size = elementY.position
          this.magnetY.style.left = `${elementY.magnet * this.scale}px`
          if (isResize) {
            object.style.width = `${Math.abs(
              ParseNumber(object.style.width) + ParseNumber(object.style.left) - size - gap
            )}px`
          }
          if (move) {
            object.style.left = `${size + gap}px`
          }
          break
        case 'xx':
          size = elementY.position
          this.magnetY.style.left = `${elementY.magnet * this.scale}px`
          if (this._index !== undefined && move) {
            object.style.left = `${size - ParseNumber(object.style.width) / 2}px`
          }
          break
        default:
          break
      }
      this.renderLine(false)
    }
    this.moveResizers({ object, objectType })
  }
  public addCornerCollision = (element: OElement, minSizes: any[], isResize = false, isRatioFitter = false) => {
    if (this.double) {
      if (isRatioFitter) {
        minSizes.unshift(
          diffRect(
            element,
            {
              l: ParseNumber(this._border),
              h: ParseNumber(this.slideHeight) - this._border,
              w: ParseNumber((this.slideWidth - 30) / 2),
              t: this._border,
            },
            -1,
            this._border,
            false,
            isResize
          ),
          diffRect(
            element,
            {
              l: ParseNumber(this._border + (this.slideWidth + 30) / 2),
              h: ParseNumber(this.slideHeight) - this._border,
              w: ParseNumber((this.slideWidth - 30) / 2),
              t: this._border,
            },
            -1,
            this._border,
            true,
            isResize
          )
        )
      } else {
        minSizes.push(
          diffRect(
            element,
            {
              l: ParseNumber(this._border),
              h: ParseNumber(this.slideHeight) - this._border,
              w: ParseNumber((this.slideWidth - 30) / 2),
              t: this._border,
            },
            -1,
            this._border,
            false,
            isResize
          ),
          diffRect(
            element,
            {
              l: ParseNumber(this._border + (this.slideWidth + 30) / 2),
              h: ParseNumber(this.slideHeight) - this._border,
              w: ParseNumber((this.slideWidth - 30) / 2),
              t: this._border,
            },
            -1,
            this._border,
            true,
            isResize
          )
        )
      }
    } else {
      minSizes.push(
        diffRect(
          element,
          {
            l: ParseNumber(this._border),
            h: ParseNumber(this.slideHeight) - this._border,
            w: ParseNumber(this.slideWidth) - this._border,
            t: this._border,
          },
          -1,
          this._border,
          false,
          isResize
        )
      )
    }
    return minSizes
  }
  public addActiveWrapper = (element: OElement, minSizes: any[], isResize = false, isRatioFitter = false) => {
    const activeWrapper = document.querySelector('.active-wrapper')
    if (!activeWrapper) return minSizes
    const { width, height } = getComputedStyle(activeWrapper)
    minSizes.unshift(
      diffRect(
        element,
        {
          l: (ParseNumber(this.slideWidth) - parseFloat(width) / this.scale) / 2,
          h: ParseNumber(parseFloat(height) / this.scale),
          w: ParseNumber(parseFloat(width) / this.scale),
          t: (ParseNumber(this.slideHeight) - parseFloat(height) / this.scale) / 2,
        },
        -1,
        0,
        false,
        isResize
      )
    )

    return minSizes
  }
  public checkActiveWrapper = (element: HTMLElement, isResize = false) => {
    const activeWrapper = document.querySelector('.active-wrapper')
    if (!activeWrapper) return
    const { width, height } = getComputedStyle(activeWrapper)
    const { top: t, left: l } = getComputedStyle(element)

    if (
      parseFloat(t) > 0 &&
      parseFloat(t) <= Math.abs((ParseNumber(this.slideHeight) - parseFloat(height) / this.scale) / 2 + 30)
    ) {
      if (isResize) {
        element.style.height = parseFloat(element.style.height) + parseFloat(t) + 'px'
      }
      element.style.top = '0px'
    }
    if (
      parseFloat(l) > 0 &&
      parseFloat(l) <= Math.abs((ParseNumber(this.slideWidth) - parseFloat(width) / this.scale) / 2 + 30)
    ) {
      if (isResize) {
        element.style.width = parseFloat(element.style.width) + parseFloat(l) + 'px'
      }
      element.style.left = '0px'
    }
  }
  public moveCollisionObject = (
    object: any,
    objectType: string,
    element: OElement,
    gap: number,
    isResize = false,
    objects?: PObject[],
    index?: number
  ) => {
    let isRatioFitter = false
    if (objects) {
      this.objects = objects
      this._index = index
      isRatioFitter = true
    }
    if (this.objects && this._index !== undefined) {
      let minSizes = this.objects.reduce<any[]>((asn, obj, i) => {
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
            i,
            this._border,
            false,
            isResize
          )
        )
        return asn
      }, [])
      minSizes = this.addCornerCollision(element, minSizes, isResize, isRatioFitter)
      minSizes = this.addActiveWrapper(element, minSizes, isResize, isRatioFitter)
      // console.log('minSizes', minSizes)
      const [x, y] = lodash(minSizes.flat(1))
        .groupBy('vertical')
        .map((group) => lodash.minBy(group, 'size'))
        .value()
      // console.log('X', x, 'Y', y)
      this.renderLines(object, objectType, true, x, y, gap, isResize)
    }
  }
  public collisionDetecter = lodash.throttle(
    (object: any, objectType: string, element: OElement, gap: number, isResize = false) => {
      if (this.objects && this._index !== undefined) {
        let minSizes = this.objects.reduce<any[]>((asn, obj, i) => {
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
              i,
              this._border,
              false,
              isResize
            )
          )
          return asn
        }, [])
        minSizes = this.addCornerCollision(element, minSizes, isResize)
        // console.log('minSizes', minSizes)
        const [x, y] = lodash(minSizes.flat(1))
          .groupBy('vertical')
          .map((group) => lodash.minBy(group, 'size'))
          .value()
        // console.log('X', x, 'Y', y)
        this.renderLines(object, objectType, false, x, y, gap, isResize)
      }
    },
    500
  )
  public getObjectType = (classList: any, isArray = false): ObjectType => {
    if (isArray) {
      let objectType: ObjectType = ''
      if (!classList.length) return 'text'
      if (classList.includes('image-placeholder')) {
        objectType = 'image'
      } else if (classList.includes('shape')) {
        objectType = 'shape'
      } else if (classList.includes('text-container')) {
        objectType = 'text'
      }

      return objectType
    }
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
    const uneditablePage = document.querySelector('.unavailable-to-edit-page')
    let x2 = 0
    if (uneditablePage && uneditablePage.className.includes('left-page')) {
      const { width } = uneditablePage.getBoundingClientRect()
      x2 = width / this.scale
    }
    const style = {
      top: 100,
      left: 100 + x2,
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
    // Deselect GroupObject
    this._groupObjects = null
    this.setGroupObjects(null)
    this.objects = objects
    this.deSelectObject()
  }
  public createMontagePortrait = (e: any, objects: PObject[]) => {
    this.hideToolbar()
    const uneditablePage = document.querySelector('.unavailable-to-edit-page')
    let x2 = 0
    if (uneditablePage && uneditablePage.className.includes('left-page')) {
      const { width } = uneditablePage.getBoundingClientRect()
      x2 = width / this.scale
    }
    /* generate uuid for image and text */
    const uuid = uuidv4()
    const zIndex = 100 + objects.length + ''
    /* create portrait image as a custom image  */
    const imageStyle = {
      top: 100,
      left: 100 + x2,
      width: 500,
      height: 300,
      rotateAngle: 0,
      transform: '',
      zIndex,
    }

    this.addObject({
      object: {
        id: `image-montage-${uuid}`,
        className: 'object',
        style: imageStyle,
        props: {
          style: { transform: 'scaleX(1)' },
          className: 'image-placeholder',
          imageStyle: { display: 'none', top: 0, left: 0, width: '100%' },
          placeholderStyle: { opacity: '0.5', backgroundColor: '#737373' },
        },
      },
    })
    this.setObjectType('image-placeholder')

    /* create text field */

    const style = {
      top: imageStyle.top + montagePortraitGap + imageStyle.height,
      left: imageStyle.left + imageStyle.width / 2 - 500 / 2 + x2,
      width: 500,
      height: 80,
      rotateAngle: 0,
      transform: '',
      zIndex,
    }

    const textStyle = {
      color: '#333',
      textAlign: 'center',
      fontSize: '72px',
    }

    const autogrowStyle = {
      height: 'auto',
    }

    this.addObject({
      object: {
        id: `text-montage-${uuid}`,
        className: 'object',
        style,
        props: {
          textStyle,
          autogrowStyle,
          className: 'text-container',
          style: { transform: 'scaleX(1)' },
          texts: ['Name'],
          placeholderStyle: { opacity: 1 },
        },
      },
    })

    this.setObjectType('text')

    this.setObjectType('montage-portrait') // ene yag yu hiigeed bnaa
    // Deselect GroupObject
    this._groupObjects = null
    this.setGroupObjects(null)
    this.objects = objects
    this.deSelectObject()
  }

  public createSquare = (objects: PObject[]) => {
    this.hideToolbar()
    const uneditablePage = document.querySelector('.unavailable-to-edit-page')
    let x2 = 0
    if (uneditablePage && uneditablePage.className.includes('left-page')) {
      const { width } = uneditablePage.getBoundingClientRect()
      x2 = width / this.scale
    }
    const style = {
      top: 100,
      left: 100 + x2,
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
    // Deselect GroupObject
    this._groupObjects = null
    this.setGroupObjects(null)
    this.objects = objects
    this.deSelectObject()
  }
  public createImage = (e: any, objects: PObject[]) => {
    this.hideToolbar()
    const uneditablePage = document.querySelector('.unavailable-to-edit-page')
    let x2 = 0
    if (uneditablePage && uneditablePage.className.includes('left-page')) {
      const { width } = uneditablePage.getBoundingClientRect()
      x2 = width / this.scale
    }
    if (e.dataTransfer) {
      const tempUrl = e.dataTransfer.getData('tempUrl')
      const imageUrl: string = e.dataTransfer.getData('imageUrl')
      const naturalSize: { width: number; height: number } = e.dataTransfer.getData('naturalSize')
      const naturalWidth: number = e.dataTransfer.getData('naturalWidth')
      const naturalHeight: number = e.dataTransfer.getData('naturalHeight')

      let width = naturalWidth
      let height = naturalHeight

      if (width > this.slideWidth) {
        width = this.slideWidth
      } else if (width < 200) {
        width = 200
      }
      height = (width * naturalHeight) / naturalWidth

      if (height > this.slideHeight) {
        height = this.slideHeight
      } else if (height < 200) {
        height = 200
      }
      width = (height * naturalWidth) / naturalHeight

      const { x, y } = this.canvasRef.current.getBoundingClientRect()
      const x1 = e.clientX - x + x2
      const y1 = e.clientY - y

      const style = {
        top: y1,
        left: x1,
        width,
        height,
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
            naturalSize,
            tempUrl,
            className: 'image-placeholder clipart',
            imageStyle: { display: 'block', top: 0, left: 0, width: '100%' },
            style: { transform: 'scaleX(1)' },
            placeholderStyle: { opacity: 1 },
          },
        },
      })
    } else {
      const style = {
        top: 100,
        left: 100 + x2,
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
    // Deselect GroupObject
    this._groupObjects = null
    this.setGroupObjects(null)
    this.objects = objects
    this.deSelectObject()
  }
  public createImages = (e: any, objects: PObject[], border = 0) => {
    this.hideToolbar()
    const uneditablePage = document.querySelector('.unavailable-to-edit-page')
    let x2 = 0
    if (uneditablePage && uneditablePage.className.includes('left-page')) {
      const { width } = uneditablePage.getBoundingClientRect()
      x2 = width / this.scale
    }
    if (e.dataTransfer) {
      JSON.parse(e.dataTransfer.getData('images')).forEach((image: Image) => {
        const { x, y } = this.canvasRef.current.getBoundingClientRect()
        const x1 = e.clientX - x + x2
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
        const _id = uuidv4()
        this.addObject({
          object: {
            id: _id,
            className: 'object',
            style,
            props: {
              imageUrl: image.imageUrl,
              tempUrl: image.tempUrl,
              naturalSize: image.naturalSize,
              className: 'image-placeholder',
              imageStyle: { display: 'block', top: 0, left: 0, width: '100%' },
              style: { transform: 'scaleX(1)' },
              placeholderStyle: { opacity: 1 },
            },
          },
        })

        // ImageFit
        this.loadObjects(
          [
            {
              id: _id,
              className: 'object',
              style,
              props: {
                imageUrl: image.imageUrl,
                tempUrl: image.tempUrl,
                naturalSize: image.naturalSize,
                className: 'image-placeholder',
                imageStyle: { display: 'block', top: 0, left: 0, width: '100%' },
                style: { transform: 'scaleX(1)' },
                placeholderStyle: { opacity: '1' },
              },
            },
          ],
          border
        )
      })
    } else {
      const style = {
        top: 100,
        left: 100 + x2,
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
  public loadObjects = (objects: PObject[], border = 0) => {
    const imgObjects = objects.filter(
      (o) => o.props.className === 'image-placeholder' && o.props.tempUrl && o.props.tempUrl.length > 0
    )
    let count = 0
    const observer = new MutationObserver((mutations_list) => {
      mutations_list.forEach((mutation) => {
        mutation.addedNodes.forEach((added_node) => {
          if (imgObjects.some((o: PObject) => (added_node as any).id === o.id)) {
            count += 1
            if (count === imgObjects.length) {
              // console.log('#child has been added', imgObjects)
              imgObjects.forEach((o: PObject) => {
                const frameBorder = parseFloat(o.props?.frameStyle?.borderWidth || '0')
                this.imageFitNoDebounce(objects, o, border || frameBorder)
              })
              observer.disconnect()
            }
          }
        })
      })
    })
    const parentNode = document.querySelector('#container')
    if (!parentNode) return
    observer.observe(parentNode, { subtree: false, childList: true })
  }
  public observeImage = (object: HTMLElement, border = 0) => {
    const observer = new MutationObserver((mutations_list) => {
      mutations_list.forEach((mutation) => {
        console.log('observer', mutations_list)
        mutation.addedNodes.forEach((added_node) => {
          console.log('added_node', added_node)
          if ((added_node as any).tagName === 'img') {
            const _obj = this.objects?.find((o: PObject) => o.id === object.id)
            if (_obj) {
              this.imageFitNoDebounce(this.objects as PObject[], _obj, border)
            }
            observer.disconnect()
          }
        })
      })
    })
    const parentNode = object.querySelector('.image-placeholder')
    if (!parentNode) return
    observer.observe(parentNode, { subtree: false, childList: true })
  }
  public onObjectDrop = (
    e: any,
    type: FeatureType,
    objects: PObject[],
    _index: number,
    border = 0,
    hasDefaultImg = false,
    editorType?: string,
    currentProjectId?: number,
    updateProject?: any,
    setFrameLoading?: (param: boolean) => void
  ) => {
    this.hideToolbar()
    e.preventDefault()
    if (!'images,cliparts,frames,masks,frame_materials'.includes(type) || this._isTextEditing) return

    const uneditablePage = document.querySelector('.unavailable-to-edit-page')
    if (uneditablePage) {
      const { top, left, width, height } = uneditablePage.getBoundingClientRect()
      if (e.clientX >= left && e.clientX <= left + width && e.clientY >= top && e.clientY <= top + height) return
    }

    if (editorType === 'canvas-split') {
      e.target.style.border = 'none'
      const index = 0
      const images = JSON.parse(e.dataTransfer.getData('images')) as Image[]
      const newObject = {
        ...objects[index],
        props: {
          ...objects[index].props,
          imageUrl: images[0].imageUrl,
          naturalSize: images[0].naturalSize,
          tempUrl: images[0].tempUrl,
          imageStyle: { display: 'block', top: 0, left: 0, width: '100%' },
          placeholderStyle: { opacity: '1' },
        },
      }
      this.updateObject({ object: newObject })
      this.updateHistory(UPDATE_OBJECT, { object: objects[index] })
      // ImageFit
      const _object = document.getElementById(objects[index].id)
      if (!_object) return
      if (hasDefaultImg) {
        const img = _object.querySelector('img')
        if (!img) return
        const onLoad = () => {
          this.imageFitNoDebounce(objects, objects[index], border)
          img.removeEventListener('load', onLoad)
        }
        img.addEventListener('load', onLoad)
      } else {
        this.imageFitNoDebounce(objects, objects[index], border)
      }
    } else if (type === 'frame_materials') {
      if (!currentProjectId || !updateProject) return
      if (setFrameLoading) setFrameLoading(true)
      updateProject(currentProjectId, { frameMaterialId: e.dataTransfer.getData('id') })
    } else if (
      e.target.classList.contains('object') &&
      e.target.childNodes[0].className === 'image-placeholder' &&
      !'cliparts'.includes(type)
    ) {
      if (_index > -1) {
        const { top, left, width, height } = getComputedStyle(this._object)
        const {
          options,
          rect: { w, h },
        } = calculateCenter({ top, left, width, height }, this._rotateAngle)

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
              borderWidth: `${e.dataTransfer.getData('borderWidth')}px`,
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
            naturalSize: images[0].naturalSize,
            imageUrl: images[0].imageUrl,
            tempUrl: images[0].tempUrl,
            imageStyle: { display: 'block', top: 0, left: 0, width: '100%' },
            placeholderStyle: { opacity: '1' },
          },
        }

        this.updateObject({ object: newObject })
        this.updateHistory(UPDATE_OBJECT, { object: objects[index] })
        // ImageFit
        const _object = document.getElementById(objects[index].id)
        if (!_object) return
        if (hasDefaultImg) {
          const img = _object.querySelector('img')
          if (!img) return
          const onLoad = () => {
            this.imageFitNoDebounce(objects, objects[index], border)
            img.removeEventListener('load', onLoad)
          }
          img.addEventListener('load', onLoad)
        } else {
          this.imageFitNoDebounce(objects, objects[index], border)
        }
      }
    } else if (
      'cliparts'.includes(type) &&
      !['frame-multi', 'canvas-multi', 'photobook', 'montage'].includes(editorType + '')
    ) {
      this.createImage(e, objects)
    } else if (
      'images'.includes(type) &&
      !['frame-multi', 'canvas-multi', 'photobook', 'montage'].includes(editorType + '')
    ) {
      this.createImages(e, objects, border)
    }
    // Deselect GroupObject
    this._groupObjects = null
    this.setGroupObjects(null)
    this.objects = objects
    this.deSelectObject()
  }

  public setFirstObject = (
    image: Image,
    type: FeatureType,
    objects: PObject[],
    slideWidth: number,
    slideHeight: number,
    border = 0,
    objectId?: string
  ) => {
    const style = {
      top: 0,
      left: 0,
      width: slideWidth,
      height: slideHeight,
      rotateAngle: 0,
      transform: '',
      zIndex: 100 + objects.length + '',
    }
    let _id = uuidv4()
    if (objectId) {
      _id = objectId
      this.updateObject({
        object: {
          id: objectId,
          className: 'object',
          style,
          props: {
            ...objects[0].props,
            imageUrl: image.imageUrl,
            tempUrl: image.tempUrl || process.env.REACT_APP_PUBLIC_IMAGE + image.imageUrl,
            className: 'image-placeholder',
            imageStyle: { display: 'block', top: 0, left: 0, width: '100%' },
            style: { transform: 'scaleX(1)' },
            placeholderStyle: { opacity: 1 },
          },
        },
      })
      const _object = document.getElementById(_id)
      if (!_object) return
      const img = _object.querySelector('img')
      if (!img) return
      const onLoad = () => {
        this.imageFitNoDebounce(objects, objects[0], border)
        img.removeEventListener('load', onLoad)
      }
      img.addEventListener('load', onLoad)
    } else {
      this.addObject({
        object: {
          id: _id,
          className: 'object',
          style,
          props: {
            imageUrl: image.imageUrl,
            tempUrl: image.tempUrl || process.env.REACT_APP_PUBLIC_IMAGE + image.imageUrl,
            className: 'image-placeholder',
            imageStyle: { display: 'block', top: 0, left: 0, width: '100%' },
            style: { transform: 'scaleX(1)' },
            placeholderStyle: { opacity: 1 },
          },
        },
      })

      this.setObjectType('image')

      // ImageFit
      this.imageFitNoDebounce(
        [
          {
            id: _id,
            className: 'object',
            style,
            props: {
              imageUrl: image.imageUrl,
              tempUrl: image.tempUrl || process.env.REACT_APP_PUBLIC_IMAGE + image.imageUrl,
              className: 'image-placeholder',
              imageStyle: { display: 'block', top: 0, left: 0, width: '100%' },
              style: { transform: 'scaleX(1)' },
              placeholderStyle: { opacity: '1' },
            },
          },
        ],
        {
          id: _id,
          className: 'object',
          style,
          props: {
            imageUrl: image.imageUrl,
            tempUrl: image.tempUrl || process.env.REACT_APP_PUBLIC_IMAGE + image.imageUrl,
            className: 'image-placeholder',
            imageStyle: { display: 'block', top: 0, left: 0, width: '100%' },
            style: { transform: 'scaleX(1)' },
            placeholderStyle: { opacity: '1' },
          },
        },
        border
      )
    }
    this.objects = objects
  }

  public createImagesMontage = (e: any, objects: PObject[]) => {
    this.hideToolbar()
    if (e.dataTransfer) {
      const emptyObjects = objects.filter((each) => each.id.startsWith('image-montage-') && !each.props.imageUrl)
      JSON.parse(e.dataTransfer.getData('images')).forEach((image: Image, index: number) => {
        if (index < emptyObjects.length) {
          this.updateObject({
            object: {
              ...emptyObjects[index],
              props: {
                ...emptyObjects[index].props,
                naturalSize: image.naturalSize,
                imageUrl: image.imageUrl,
                tempUrl: image.tempUrl,
                imageStyle: { display: 'block', top: 0, left: 0, width: '100%' },
                placeholderStyle: { opacity: '1' },
              },
            },
          })

          /* montage zuragnii text update hiih */

          /* text iin olno */
          const textObjectID = objects[index].id.replace('image-montage-', 'text-montage-')
          const textObject = objects.find((each) => each.id === textObjectID)
          // console.log('updating text', image.name)
          /* zuragnaas neriine olno */
          if (textObject && image) {
            /* text update hiine */
            this.updateObject({
              object: {
                ...textObject,
                props: {
                  ...textObject.props,
                  texts: [image.name],
                },
              },
            })
          }
        } else {
          this.createImages(e, objects)
        }
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

  public onObjectDropMontage = (e: any, type: FeatureType, objects: PObject[], _index: number) => {
    this.hideToolbar()
    e.preventDefault()
    if (!'images,cliparts,frames,masks,frame_masks'.includes(type) || this._isTextEditing) return

    if (this._groupObjects && Object.values(this._groupObjects).length > 0) {
      const _objects = Object.values(this._groupObjects)
      const images = JSON.parse(e.dataTransfer.getData('images')) as Image[]
      let imageIndex = 0
      _objects.forEach((_o: any) => {
        if (images.length <= imageIndex) return
        const placeholder = _o.querySelector('.image-placeholder')
        if (!placeholder) return
        const index = objects.findIndex((o: any) => o.id === _o.id)
        const newObject = {
          ...objects[index],
          props: {
            ...objects[index].props,
            naturalSize: images[imageIndex].naturalSize,
            imageUrl: images[imageIndex].imageUrl,
            tempUrl: images[imageIndex].tempUrl,
            imageStyle: { display: 'block', top: 0, left: 0, width: '100%' },
            placeholderStyle: { opacity: '1' },
          },
        }

        /* montage zuragnii text update hiih */
        if (objects[index].id.startsWith('image-montage-')) {
          /* text iin olno */
          const textObjectID = objects[index].id.replace('image-montage-', 'text-montage-')
          const textObject = objects.find((each) => each.id === textObjectID)

          /* zuragnaas neriine olno */
          if (textObject && images.length > 0) {
            /* text update hiine */
            this.updateObject({
              object: {
                ...textObject,
                props: {
                  ...textObject.props,
                  texts: [images[imageIndex].name],
                },
              },
            })
          }
        }

        this.updateObject({ object: newObject })
        this.updateHistory(UPDATE_OBJECT, { object: objects[index] })

        // ImageFit
        this.imageFitNoDebounce(objects, objects[index])

        imageIndex += 1
      })
    } else if (
      e.target.classList.contains('object') &&
      e.target.childNodes[0].className === 'image-placeholder' &&
      !'cliparts'.includes(type)
    ) {
      if (_index > -1) {
        const { top, left, width, height } = getComputedStyle(this._object)
        const {
          options,
          rect: { w, h },
        } = calculateCenter({ top, left, width, height }, this._rotateAngle)

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
      } else if (type === 'frame_masks') {
        e.target.style.border = 'none'
        const index = objects.findIndex((o: any) => o.id === e.target.id)
        console.log('onObjectdrop FRAME_MASK')
        // Urgeljlel bii
        const newObject = {
          ...objects[index],
          props: {
            ...objects[index].props,
            maskImage: e.dataTransfer.getData('maskUrl'),
            maskStyle: {
              maskImage: `url(${e.dataTransfer.getData('tempMaskUrl').replace('https', 'http')})`,
              WebkitMaskImage: `url(${e.dataTransfer.getData('tempMaskUrl').replace('https', 'http')})`,
            },
            frameMontage: {
              url: e.dataTransfer.getData('frameUrl'),
              tempUrl: e.dataTransfer.getData('tempFrameUrl'),
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
            naturalSize: images[0].naturalSize,
            imageUrl: images[0].imageUrl,
            tempUrl: images[0].tempUrl,
            imageStyle: { display: 'block', top: 0, left: 0, width: '100%' },
            placeholderStyle: { opacity: '1' },
          },
        }

        /* montage zuragnii text update hiih */
        if (objects[index].id.startsWith('image-montage-')) {
          /* text iin olno */
          const textObjectID = objects[index].id.replace('image-montage-', 'text-montage-')
          const textObject = objects.find((each) => each.id === textObjectID)

          /* zuragnaas neriine olno */
          if (textObject && images.length > 0) {
            /* text update hiine */
            this.updateObject({
              object: {
                ...textObject,
                props: {
                  ...textObject.props,
                  texts: [images[0].name],
                },
              },
            })
          }
        }

        this.updateObject({ object: newObject })
        this.updateHistory(UPDATE_OBJECT, { object: objects[index] })

        // ImageFit
        this.imageFitNoDebounce(objects, objects[index])
      }
    } else if ('cliparts'.includes(type)) {
      this.createImage(e, objects)
    } else if ('images'.includes(type)) {
      this.createImagesMontage(e, objects)
    }
  }
  // #endregion [ObjectMethods]
  // #region [GroupMethods]
  public selectionDragStart = (e: any, containers: Container[], gap = 0) => {
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

      if (this._groupObjects === null) return
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
        const { top, left, width, height } = getComputedStyle(this._groupObjects[k])
        const t = parseFloat(top)
        const l = parseFloat(left)
        const w = parseFloat(width)
        const h = parseFloat(height)

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

        // this.collisionDetecter(
        //   this._groupObjects[k],
        //   this.getObjectType(this._groupObjects[k].firstChild.classList),
        //   { t, l, w, h },
        //   gap,
        //   false
        // )
      })

      this.groupRef.current.style.top = (minTop + deltaY) * this.scale + 'px'
      this.groupRef.current.style.left = (minLeft + deltaX) * this.scale + 'px'
      this.groupRef.current.nextSibling.style.top = (minTop + deltaY) * this.scale + 'px'
      this.groupRef.current.nextSibling.style.left = (minLeft + deltaX) * this.scale + 'px'

      startX = clientX
      startY = clientY
    }

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      if (!this._isMouseDown) return
      this._isMouseDown = false

      if (this._groupObjects !== null) {
        const _objects = Object.keys(this._groupObjects).map((k: string) => {
          const { top, left, width, height } = getComputedStyle(this._groupObjects[k])
          const newObject = {
            ...this._groupObjects[parseFloat(k)],
            style: {
              ...this._groupObjects[parseFloat(k)].style,
              top: parseFloat(top),
              left: parseFloat(left),
              width: parseFloat(width),
              height: parseFloat(height),
              // rotateAngle: _rotateAngle,
              // transform: `rotateZ(${_rotateAngle}deg)`,
            },
          }
          return newObject
        })

        this.updateGroupContainer({ containers: _objects })
        this.updateHistory(UPDATE_GROUP_CONTAINER, {
          containers: containers.filter((c: Container) => _objects.find((x) => x.id === c.id)),
        })
      }

      // Redrag is available
      const selector = document.querySelector('.active-border')
      const { top, left, width, height } = selector
        ? getComputedStyle(selector)
        : { top: '0px', left: '0px', width: '0px', height: '0px' }
      const selectedStyle = {
        top: parseFloat(top) / this.scale,
        left: parseFloat(left) / this.scale,
        width: parseFloat(width) / this.scale,
        height: parseFloat(height) / this.scale,
      }
      this.showGroupSelection()
      this.groupRef.current.style.left = selectedStyle.left * this.scale + 'px'
      this.groupRef.current.style.top = selectedStyle.top * this.scale + 'px'
      this.groupRef.current.style.width = selectedStyle.width * this.scale + 'px'
      this.groupRef.current.style.height = selectedStyle.height * this.scale + 'px'
      this.moveResizers({ styles: selectedStyle, objectType: 'group' })

      const toolbar: any = document.querySelector('.toolbar')
      if (toolbar) {
        if (toolbar.style.display === 'none' || !toolbar.style.display) {
          toolbar.style.display = 'flex'
        } else if (toolbar.style.display === 'flex') {
          toolbar.style.display = 'none'
        }

        toolbar.style.position = 'absolute'
        toolbar.style.top = `0px`
        toolbar.style.left = `calc(50% - 190px)`
      }
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
    const rotateAngle = objects[_index]?.style?.rotateAngle

    if (rotateAngle === null || rotateAngle === undefined) return

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
  public getImagePosition = (o: PObject) => {
    if (o.props.className !== 'image-placeholder') return o
    const obj = document.getElementById(o.id)
    const [img] = obj?.getElementsByTagName('img') as any
    if (!img) return o
    const { width, height, top, left } = img.style
    if (width !== 'auto' && height !== 'auto') {
      o.props.imageStyle.width = width
      o.props.imageStyle.height = height
    } else if (width !== 'auto') o.props.imageStyle.width = width
    else if (height !== 'auto') o.props.imageStyle.height = height
    o.props.imageStyle.top = top
    o.props.imageStyle.left = left
    return o
  }
  public imageFitNoDebounce = (objects: PObject[], _obj: PObject, border = 0) => {
    console.log('imageFitNoDebounce, border', border)
    const object = document.getElementById(_obj.id)
    if (!object) return
    const { width: w, height: h } = getComputedStyle(object)
    const width = parseFloat(w)
    const height = parseFloat(h)
    if (object || _obj?.props.className === 'image-placeholder') {
      const placeholder = object.querySelector('.image-placeholder') as HTMLElement
      const image = placeholder.querySelector('img') as HTMLImageElement
      const _height = object ? image.height : image.height - Math.abs(Number(_obj.props.imageStyle.top))
      const regex = image.style.width.match('[0-9]+.[0-9]+%')
      const _width = regex ? ParseNumber(regex[0]) : 0
      if (
        (image.naturalWidth > image.naturalHeight && height > width) ||
        image.naturalWidth / image.naturalHeight > width / height
      ) {
        const deltaWidth = ((_width / this._zoom || 100) * height) / _height
        image.style.width = `calc(${deltaWidth}% + ${border * 2}px)`
        image.style.height = 'auto'
        image.style.top = `${-border}px`
        image.style.left = `${-((width * deltaWidth) / 200 - width / 2) - border}px`
        // console.log('imageFitNoDebounce 1')
      } else {
        image.style.width = `calc(100% + ${border * 2}px)`
        image.style.height = 'auto'
        image.style.left = `${-border}px`
        image.style.top = image.height ? `${-(image.height / this._zoom / 2 - height / 2) - border}px` : `${-border}px`
        // console.log('imageFitNoDebounce 2')
      }
      // console.log(
      //   image.naturalWidth / image.naturalHeight > width / height,
      //   'image.naturalWidth',
      //   image.naturalWidth,
      //   'image.naturalHeight',
      //   image.naturalHeight,
      //   'image.width',
      //   image.width,
      //   'width',
      //   width,
      //   'image.height',
      //   image.height,
      //   'height',
      //   height,
      //   'image.offsetHeight',
      //   image.offsetHeight,
      //   'image.offsetWidth',
      //   image.offsetWidth,
      //   'height',
      //   height,
      //   'width',
      //   width,
      //   image,
      //   objects[_index]
      // )
      if (image.height && image.height < height) {
        image.style.height = `calc(100% + ${border * 2}px)`
        image.style.width = 'auto'
        image.style.top = `${-border}px`
        image.style.left = image.width ? `${-(image.width / this._zoom / 2 - width / 2) - border}px` : `${-border}px`
        // console.log('imageFitNoDebounce 3')
      }
      if (image.width && image.width < width) {
        image.style.width = `calc(100% + ${border * 2}px)`
        image.style.height = 'auto'
        image.style.left = `${-border}px`
        image.style.top = image.height ? `${-(image.height / this._zoom / 2 - height / 2) - border}px` : `${-border}px`
        // console.log('imageFitNoDebounce 4')
      }
      if (!image.height) {
        setTimeout(() => this.imageFitNoDebounce(objects, _obj, border), 10)
      }
    }
  }
  public imageFit = debounce(
    (
      height: number,
      width: number,
      newSize: Size,
      oldSize: Size,
      type: string,
      _index: number,
      objects: PObject[],
      border = 0
    ) => {
      const _obj = objects[_index]
      if (_obj?.props.className === 'image-placeholder') {
        const placeholder = this._object.firstChild as HTMLElement
        const image = placeholder.querySelector('img') as HTMLImageElement
        const _height = image.height - Math.abs(Number(_obj.props.imageStyle.top))
        const regex = image.style.width.match('[0-9]+.[0-9]+%')
        const _width = regex ? ParseNumber(regex[0]) : 0

        if (
          (image.naturalWidth > image.naturalHeight && height > width) ||
          image.naturalWidth / image.naturalHeight > width / height
        ) {
          const deltaWidth = ((_width / this._zoom || 100) * height) / _height
          image.style.width = `calc(${deltaWidth}% + ${border * 2}px)`
          image.style.height = 'auto'
          image.style.top = `${-border}px`
          image.style.left = `${-((width * deltaWidth) / 200 - width / 2) - border}px`
        } else {
          image.style.width = `calc(100% + ${border * 2}px)`
          image.style.height = 'auto'
          image.style.left = `${-border}px`
          image.style.top = `${-(image.height / this._zoom / 2 - height / 2) - border}px`
        }
        if (image.height && image.height < height) {
          image.style.height = `calc(100% + ${border * 2}px)`
          image.style.width = 'auto'
          image.style.top = `${-border}px`
          image.style.left = image.width ? `${-(image.width / this._zoom / 2 - width / 2) - border}px` : `${-border}px`
        }
        if (image.width && image.width < width) {
          image.style.width = `calc(100% + ${border * 2}px)`
          image.style.height = 'auto'
          image.style.left = `${-border}px`
          image.style.top = image.height
            ? `${-(image.height / this._zoom / 2 - height / 2) - border}px`
            : `${-border}px`
        }
      }
    },
    500
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

    const { x } = getRotatedPosition({
      ...options,
      x: l + w / 2,
      y: t + h / 2,
      scale: this.scale,
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
      const temp = document.getElementById(object.id)
      if (!temp) return
      const { top, left, width, height } = getComputedStyle(temp)
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
    this.showActiveBorder(activeBorder, options, w, h, angle)

    if (objectType === 'group') {
      this.hideResizer()
      this.hideToolbar()
      return
    }

    const { x, y } = getRotatedPosition({
      ...options,
      x: l + w / 2,
      y: t - this._rotaterDistance / this.scale,
      scale: this.scale,
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
        const _position = getRotatedPosition({ ...options, scale: this.scale })
        r.style.left = _position.x - midpoint + 'px'
        r.style.top = _position.y - midpoint + 'px'
        r.style.display = objectType === 'text' ? 'none' : 'block'
        if (_position.y > maxY) maxY = _position.y
      } else if (r.classList.contains('tr')) {
        const _position = getRotatedPosition({ ...options, x: l + w, scale: this.scale })
        r.style.left = _position.x - midpoint + 'px'
        r.style.top = _position.y - midpoint + 'px'
        r.style.display = objectType === 'text' ? 'none' : 'block'
        if (_position.y > maxY) maxY = _position.y
      } else if (r.classList.contains('bl')) {
        const _position = getRotatedPosition({ ...options, y: t + h, scale: this.scale })
        r.style.left = _position.x - midpoint + 'px'
        r.style.top = _position.y - midpoint + 'px'
        r.style.display = objectType === 'text' ? 'none' : 'block'
        if (_position.y > maxY) maxY = _position.y
      } else if (r.classList.contains('br')) {
        const _position = getRotatedPosition({ ...options, x: l + w, y: t + h, scale: this.scale })
        r.style.left = _position.x - midpoint + 'px'
        r.style.top = _position.y - midpoint + 'px'
        r.style.display = objectType === 'text' ? 'none' : 'block'
        if (_position.y > maxY) maxY = _position.y
      } else if (r.classList.contains('t')) {
        const _position = getRotatedPosition({ ...options, x: l + w / 2, scale: this.scale })
        r.style.left = _position.x - midpoint + 'px'
        r.style.top = _position.y - midpoint + 'px'
        r.style.display = objectType === 'text' ? 'none' : 'block'
        if (_position.y > maxY) maxY = _position.y
      } else if (r.classList.contains('b')) {
        const _position = getRotatedPosition({
          ...options,
          x: l + w / 2,
          y: t + h,
          scale: this.scale,
        })
        r.style.left = _position.x - midpoint + 'px'
        r.style.top = _position.y - midpoint + 'px'
        r.style.display = objectType === 'text' ? 'none' : 'block'
        if (_position.y > maxY) maxY = _position.y
      } else if (r.classList.contains('l')) {
        const _position = getRotatedPosition({ ...options, y: t + h / 2, scale: this.scale })

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
          scale: this.scale,
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
  // eslint-disable-next-line prettier/prettier
  public startResize = (
    e: any,
    cursor: string,
    type: string,
    _index: number,
    objects: PObject[],
    gap = 0,
    border = 0
  ) => {
    if (e.button !== 0 || _index === -1 || !this._object) return
    // For collisionBorder start
    const o = objects[_index]
    const object = document.getElementById(o.id) as HTMLDivElement
    this.magnetX = document.getElementById('magnetX')
    this.magnetY = document.getElementById('magnetY')
    if (this._object) this.hideImageCircle(this._object)
    const objectType = this.getObjectType(object.firstElementChild?.classList)
    this.setObjectType(objectType)
    this.hideBorder(e.target)
    this._object = object
    this.setObjectIndex(_index)
    this.setObject(object)
    this.showImageCircle(e.target, objectType)
    // For collisionBorder end
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
      this.onResize(deltaL, alpha, rect, type, isShiftKey, _index, objects, border)
      const { top: _top, left: _left, width: _width, height: _height } = getComputedStyle(object)
      const _t = parseFloat(_top)
      const _l = parseFloat(_left)
      const _w = parseFloat(_width)
      const _h = parseFloat(_height)
      // eslint-disable-next-line prettier/prettier
      this.collisionDetecter(object, objectType, { t: _t, l: _l, w: _w, h: _h }, gap, true)

      /* montage image, text group */
      if (object.id.startsWith('image-montage-')) {
        const eachObject = document.getElementById(object.id.replace('image-montage-', 'text-montage-'))
        if (eachObject) {
          const objectRect = getComputedStyle(object)

          const pxParser = (text: string) => {
            return parseFloat(text.replace('px', ''))
          }

          eachObject.style.top = montagePortraitGap + pxParser(objectRect.top) + pxParser(objectRect.height) + 'px'
          eachObject.style.left =
            pxParser(objectRect.left) + pxParser(objectRect.width) / 2 - pxParser(eachObject.style.width) / 2 + 'px'
        }
      }

      if (object.id.startsWith('text-montage-')) {
        const eachObject = document.getElementById(object.id.replace('text-montage-', 'image-montage-'))
        if (eachObject) {
          const objectRect = getComputedStyle(object)

          const pxParser = (text: string) => {
            return parseFloat(text.replace('px', ''))
          }

          eachObject.style.top =
            pxParser(objectRect.top) - montagePortraitGap - pxParser(eachObject.style.height) + 'px'
          eachObject.style.left =
            pxParser(objectRect.left) + pxParser(objectRect.width) / 2 - pxParser(eachObject.style.width) / 2 + 'px'
        }
      }
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

      // Magnet
      const { top: _top, left: _left, width: _width, height: _height } = getComputedStyle(object)
      const _t = parseFloat(_top)
      const _l = parseFloat(_left)
      const _w = parseFloat(_width)
      const _h = parseFloat(_height)
      // eslint-disable-next-line prettier/prettier
      this.moveCollisionObject(object, objectType, { t: _t, l: _l, w: _w, h: _h }, gap, true)
      this.checkActiveWrapper(object, true)
      this.moveResizers({ object, objectType })

      if (_index > -1) {
        this.updateObjectStyle(o, object)
      }
      setTimeout(() => {
        this.magnetX.style.display = 'none'
        this.magnetY.style.display = 'none'
      }, 300)
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
    objects: PObject[],
    border = 0
  ) => {
    const oldSize = {
      width: Number(this._object.style.width.replace('px', '')),
      height: Number(this._object.style.height.replace('px', '')),
    }
    const newSize = {
      width,
      height,
    }
    if (!objects[_index].props.className.includes('clipart')) {
      this.imageFit(height, width, newSize, oldSize, type, _index, objects, border)
    }
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
    objects: PObject[],
    border = 0
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
      objects,
      border
    )
  }
  // #endregion [ResizeMethods]
  // #region [Border]
  public showActiveBorder = (border: any, options: any, w: number, h: number, angle?: number) => {
    const { x, y } = getRotatedPosition({ ...options, scale: this.scale })
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
    // const child = object.firstChild as HTMLElement
    const circle = object.querySelector('.image-center') as HTMLElement
    circle.style.display = 'flex'
    this.showGroupSelection()
  }
  public hideImageCircle = (object: HTMLElement) => {
    if (this._objectType !== 'image' || !object?.classList.contains('object')) return
    // const child = object.firstChild as HTMLElement
    const circle = object.querySelector('.image-center') as HTMLElement
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
  public onSlideMouseDown = (e: any, _index: number, objects: PObject[]) => {
    if (e.target.classList.contains('image-center')) return

    if (
      e.target.id === 'scaled_container' ||
      e.target.id === 'canvas_container' ||
      (e.target.closest('#scaled_container') && !e.target.classList.contains('object'))
    ) {
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

      const selectorLeft = Math.min(e.pageX, sube.pageX)
      const selectorRight = Math.max(e.pageX, sube.pageX)
      const selectorTop = Math.min(e.pageY, sube.pageY)
      const selectorBottom = Math.max(e.pageY, sube.pageY)
      const selectorWidth = selectorRight - selectorLeft
      const selectorHeight = selectorBottom - selectorTop
      const selector = {
        top: selectorTop,
        left: selectorLeft,
        width: selectorWidth,
        height: selectorHeight,
      }

      this.selectionRef.current.style.left = x3 + 'px'
      this.selectionRef.current.style.top = y3 + 'px'
      this.selectionRef.current.style.width = x4 - x3 + 'px'
      this.selectionRef.current.style.height = y4 - y3 + 'px'

      const s = this.selectionRef.current.getBoundingClientRect()

      objects.forEach((obj: PObject, i: number) => {
        if (!obj.id) return
        const object = document.getElementById(obj.id) as HTMLElement
        const o = object.getBoundingClientRect()

        if (
          o.left < selector.left + selector.width &&
          o.left + o.width > selector.left &&
          o.top < selector.top + selector.height &&
          o.top + o.height > selector.top
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
        // Object.keys(selectedObjects).forEach(( key: string) => {
        //   const object: any = selectedObjects[key]
        //   const objectType = this.getObjectType(object.firstChild.classList)
        //   this.moveResizers({ object, objectType })
        // })
        this._groupObjects = selectedObjects
        this.showGroupSelection()
        this.setGroupObjects(selectedObjects)
        this.setGroupStyles(selectedStyle)

        this.groupRef.current.style.left = selectedStyle.left * this.scale + 'px'
        this.groupRef.current.style.top = selectedStyle.top * this.scale + 'px'
        this.groupRef.current.style.width = selectedStyle.width * this.scale + 'px'
        this.groupRef.current.style.height = selectedStyle.height * this.scale + 'px'
        this.moveResizers({ styles: selectedStyle, objectType: 'group' })
      }

      if (Object.keys(selectedObjects).length === 0 && this._groupObjects !== null) {
        this._groupObjects = null
        this.setGroupObjects(null)
      } else if (Object.keys(selectedObjects).length > 0) {
        const toolbar: any = document.querySelector('.toolbar')
        if (toolbar) {
          if (toolbar.style.display === 'none' || !toolbar.style.display) {
            toolbar.style.display = 'flex'
          } else if (toolbar.style.display === 'flex') {
            toolbar.style.display = 'none'
          }

          toolbar.style.position = 'absolute'
          toolbar.style.top = `0px`
          toolbar.style.left = `calc(50% - 190px)`
        }
      }
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  }
  // #endregion [Methods]
}
