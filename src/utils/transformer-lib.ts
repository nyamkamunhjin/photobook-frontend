import { LayoutObject, OElement, Slide } from 'interfaces'
import { ParseNumber } from 'utils'
import lodash from 'lodash'
import { v4 as uuidv4 } from 'uuid'

export const getLength = (x: number, y: number): number => Math.sqrt(x * x + y * y)

export const getAngle = ({ x: x1, y: y1 }: { x: number; y: number }, { x: x2, y: y2 }: { x: number; y: number }) => {
  const dot = x1 * x2 + y1 * y2
  const det = x1 * y2 - y1 * x2
  const angle = (Math.atan2(det, dot) / Math.PI) * 180
  return (angle + 360) % 360
}

export const degToRadian = (deg: number) => (deg * Math.PI) / 180

const cos = (deg: number) => Math.cos(degToRadian(deg))
const sin = (deg: number) => Math.sin(degToRadian(deg))

const setWidthAndDeltaW = (width: number, deltaW: number, minWidth: number) => {
  const expectedWidth = width + deltaW
  if (expectedWidth > minWidth) {
    width = expectedWidth
  } else {
    deltaW = minWidth - width
    width = minWidth
  }
  return { width, deltaW }
}

const setHeightAndDeltaH = (height: number, deltaH: number, minHeight: number) => {
  const expectedHeight = height + deltaH
  if (expectedHeight > minHeight) {
    height = expectedHeight
  } else {
    deltaH = minHeight - height
    height = minHeight
  }
  return { height, deltaH }
}

interface Rect {
  width: number
  height: number
  centerX: number
  centerY: number
  rotateAngle: number
}

export const getNewStyle = (
  type: string,
  rect: Rect,
  deltaW: number,
  deltaH: number,
  ratio: number | undefined,
  minWidth: number,
  minHeight: number
) => {
  let { width, height, centerX, centerY } = rect
  const { rotateAngle } = rect
  const widthFlag = width < 0 ? -1 : 1
  const heightFlag = height < 0 ? -1 : 1
  width = Math.abs(width)
  height = Math.abs(height)
  switch (type) {
    case 'r': {
      const widthAndDeltaW = setWidthAndDeltaW(width, deltaW, minWidth)
      width = widthAndDeltaW.width
      deltaW = widthAndDeltaW.deltaW
      if (ratio) {
        deltaH = deltaW / ratio
        height = width / ratio
        centerX += (deltaW / 2) * cos(rotateAngle) - (deltaH / 2) * sin(rotateAngle)
        centerY += (deltaW / 2) * sin(rotateAngle) + (deltaH / 2) * cos(rotateAngle)
      } else {
        centerX += (deltaW / 2) * cos(rotateAngle)
        centerY += (deltaW / 2) * sin(rotateAngle)
      }
      break
    }
    case 'tr': {
      deltaH = -deltaH
      const widthAndDeltaW = setWidthAndDeltaW(width, deltaW, minWidth)
      width = widthAndDeltaW.width
      deltaW = widthAndDeltaW.deltaW
      const heightAndDeltaH = setHeightAndDeltaH(height, deltaH, minHeight)
      height = heightAndDeltaH.height
      deltaH = heightAndDeltaH.deltaH
      if (ratio) {
        deltaW = deltaH * ratio
        width = height * ratio
      }
      centerX += (deltaW / 2) * cos(rotateAngle) + (deltaH / 2) * sin(rotateAngle)
      centerY += (deltaW / 2) * sin(rotateAngle) - (deltaH / 2) * cos(rotateAngle)
      break
    }
    case 'br': {
      const widthAndDeltaW = setWidthAndDeltaW(width, deltaW, minWidth)
      width = widthAndDeltaW.width
      deltaW = widthAndDeltaW.deltaW
      const heightAndDeltaH = setHeightAndDeltaH(height, deltaH, minHeight)
      height = heightAndDeltaH.height
      deltaH = heightAndDeltaH.deltaH
      if (ratio) {
        deltaW = deltaH * ratio
        width = height * ratio
      }
      centerX += (deltaW / 2) * cos(rotateAngle) - (deltaH / 2) * sin(rotateAngle)
      centerY += (deltaW / 2) * sin(rotateAngle) + (deltaH / 2) * cos(rotateAngle)
      break
    }
    case 'b': {
      const heightAndDeltaH = setHeightAndDeltaH(height, deltaH, minHeight)
      height = heightAndDeltaH.height
      deltaH = heightAndDeltaH.deltaH
      if (ratio) {
        deltaW = deltaH * ratio
        width = height * ratio
        centerX += (deltaW / 2) * cos(rotateAngle) - (deltaH / 2) * sin(rotateAngle)
        centerY += (deltaW / 2) * sin(rotateAngle) + (deltaH / 2) * cos(rotateAngle)
      } else {
        centerX -= (deltaH / 2) * sin(rotateAngle)
        centerY += (deltaH / 2) * cos(rotateAngle)
      }
      break
    }
    case 'bl': {
      deltaW = -deltaW
      const widthAndDeltaW = setWidthAndDeltaW(width, deltaW, minWidth)
      width = widthAndDeltaW.width
      deltaW = widthAndDeltaW.deltaW
      const heightAndDeltaH = setHeightAndDeltaH(height, deltaH, minHeight)
      height = heightAndDeltaH.height
      deltaH = heightAndDeltaH.deltaH
      if (ratio) {
        height = width / ratio
        deltaH = deltaW / ratio
      }
      centerX -= (deltaW / 2) * cos(rotateAngle) + (deltaH / 2) * sin(rotateAngle)
      centerY -= (deltaW / 2) * sin(rotateAngle) - (deltaH / 2) * cos(rotateAngle)
      break
    }
    case 'l': {
      deltaW = -deltaW
      const widthAndDeltaW = setWidthAndDeltaW(width, deltaW, minWidth)
      width = widthAndDeltaW.width
      deltaW = widthAndDeltaW.deltaW
      if (ratio) {
        height = width / ratio
        deltaH = deltaW / ratio
        centerX -= (deltaW / 2) * cos(rotateAngle) + (deltaH / 2) * sin(rotateAngle)
        centerY -= (deltaW / 2) * sin(rotateAngle) - (deltaH / 2) * cos(rotateAngle)
      } else {
        centerX -= (deltaW / 2) * cos(rotateAngle)
        centerY -= (deltaW / 2) * sin(rotateAngle)
      }
      break
    }
    case 'tl': {
      deltaW = -deltaW
      deltaH = -deltaH
      const widthAndDeltaW = setWidthAndDeltaW(width, deltaW, minWidth)
      width = widthAndDeltaW.width
      deltaW = widthAndDeltaW.deltaW
      const heightAndDeltaH = setHeightAndDeltaH(height, deltaH, minHeight)
      height = heightAndDeltaH.height
      deltaH = heightAndDeltaH.deltaH
      if (ratio) {
        width = height * ratio
        deltaW = deltaH * ratio
      }
      centerX -= (deltaW / 2) * cos(rotateAngle) - (deltaH / 2) * sin(rotateAngle)
      centerY -= (deltaW / 2) * sin(rotateAngle) + (deltaH / 2) * cos(rotateAngle)
      break
    }
    case 't': {
      deltaH = -deltaH
      const heightAndDeltaH = setHeightAndDeltaH(height, deltaH, minHeight)
      height = heightAndDeltaH.height
      deltaH = heightAndDeltaH.deltaH
      if (ratio) {
        width = height * ratio
        deltaW = deltaH * ratio
        centerX += (deltaW / 2) * cos(rotateAngle) + (deltaH / 2) * sin(rotateAngle)
        centerY += (deltaW / 2) * sin(rotateAngle) - (deltaH / 2) * cos(rotateAngle)
      } else {
        centerX += (deltaH / 2) * sin(rotateAngle)
        centerY -= (deltaH / 2) * cos(rotateAngle)
      }
      break
    }

    default:
      break
  }

  return {
    position: {
      centerX,
      centerY,
    },
    size: {
      width: width * widthFlag,
      height: height * heightFlag,
    },
  }
}

const cursorStartMap = { n: 0, ne: 1, e: 2, se: 3, s: 4, sw: 5, w: 6, nw: 7 }
const cursorDirectionArray = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw']
const cursorMap: any = {
  0: 0,
  1: 1,
  2: 2,
  3: 2,
  4: 3,
  5: 4,
  6: 4,
  7: 5,
  8: 6,
  9: 6,
  10: 7,
  11: 8,
}

type cursorType = 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw'

export const getCursor = (rotateAngle: number, d: cursorType) => {
  const increment: number = cursorMap[Math.floor(rotateAngle / 30)]
  const index = cursorStartMap[d]
  const newIndex = (index + increment) % 8
  return cursorDirectionArray[newIndex]
}

export const centerToTL = ({
  centerX,
  centerY,
  width,
  height,
  rotateAngle,
}: {
  centerX: number
  centerY: number
  width: number
  height: number
  rotateAngle: number
}) => ({
  top: centerY - height / 2,
  left: centerX - width / 2,
  width,
  height,
  rotateAngle,
})

export const tLToCenter = ({
  top,
  left,
  width,
  height,
}: {
  top: number
  left: number
  width: number
  height: number
}) => ({
  position: {
    centerX: left + width / 2,
    centerY: top + height / 2,
  },
  size: {
    width,
    height,
  },
})

export const positionsToPercent = ({
  top = 0,
  left = 0,
  width = 0,
  height = 0,
  containerHeight = 877 - 20, // height - border width
  containerWidth = 960 - 20, // width - border width
  className = '',
}: {
  top: number | string
  left: number | string
  width: number | string
  height: number | string
  containerHeight?: number
  containerWidth?: number
  className?: string
}) => ({
  top: (ParseNumber(top) / containerHeight) * 100,
  left: (ParseNumber(left) / containerWidth) * 100,
  width: (ParseNumber(width) / containerWidth) * 100,
  height: (ParseNumber(height) / containerHeight) * 100,
  className,
})

export const percentToPosition = (
  { top, left, width, height }: LayoutObject,
  containerHeight = 877 - 20,
  containerWidth = 960 - 20
) => ({
  top: (ParseNumber(top) * containerHeight) / 100,
  left: (ParseNumber(left) * containerWidth) / 100,
  width: (ParseNumber(width) * containerWidth) / 100,
  height: (ParseNumber(height) * containerHeight) / 100,
})

export const layoutPositionsToObjectPercent = (style: LayoutObject) => ({
  id: uuidv4(),
  className: 'object',
  style: percentToPosition(style),
  props: {
    style: { transform: 'scaleX(1)' },
    className: 'image-placeholder',
    imageStyle: { display: 'none', top: 0, left: 0, width: '100%' },
    placeholderStyle: { opacity: '0.5', backgroundColor: '#6c928e' },
  },
})

export const layoutPositionsToTextPercent = (style: LayoutObject) => ({
  id: uuidv4(),
  className: 'object',
  style: percentToPosition(style),
  props: {
    textStyle: { color: '#333' },
    autogrowStyle: { height: '80px' },
    className: 'text-container',
    style: { transform: 'scaleX(1)' },
    texts: ['Enter text here'],
    placeholderStyle: { opacity: '1' },
  },
})

export const layoutPositionsToImage = (style: LayoutObject) => ({
  id: uuidv4(),
  className: 'object',
  style,
  props: {
    style: { transform: 'scaleX(1)' },
    className: 'image-placeholder',
    imageStyle: { display: 'none', top: 0, left: 0, width: '100%' },
    placeholderStyle: { opacity: '0.5', backgroundColor: '#737373' },
  },
})

export const layoutPositionsToText = (style: LayoutObject) => ({
  id: uuidv4(),
  className: 'object',
  style,
  props: {
    textStyle: { color: '#333' },
    autogrowStyle: { height: '80px' },
    className: 'text-container',
    style: { transform: 'scaleX(1)' },
    texts: ['Enter text here'],
    placeholderStyle: { opacity: '1' },
  },
})

export const generateNewSlide = () => ({
  slideId: uuidv4(),
  objects: [],
  containers: [],
  backgrounds: [],
})

export const generateDuplicatedSlide = (slide: Slide) => ({
  ...slide,
  slideId: uuidv4(),
})
const ALIGNMENT_PROPS = {
  tt: 0,
  ty: 0,
  rr: 0,
  rx: 0,
  bb: 0,
  by: 0,
  ll: 0,
  lx: 0,
  tb: 0,
  bt: 0,
  rl: 0,
  lr: 0,
  xx: 0,
  yy: 0,
}

export const diffRect = (a: OElement, b: OElement, index: number) => {
  const result = Object.keys(ALIGNMENT_PROPS).map((key) => {
    switch (key) {
      case 'tt':
        return { size: Math.abs(a.t - b.t), key, index, vertical: false }
      case 'ty':
        return { size: Math.abs(a.t - b.t - b.h / 2), key, index, vertical: false }
      case 'bb':
        return { size: Math.abs(b.t + b.h - a.t - a.h), key, index, vertical: false }
      case 'by':
        return { size: Math.abs(b.t + b.h / 2 - a.t - a.h), key, index, vertical: false }
      case 'rr':
        return { size: Math.abs(b.l + b.w - a.l - a.w), key, index, vertical: true }
      case 'rx':
        return { size: Math.abs(b.l + b.w / 2 - a.l - a.w), key, index, vertical: true }
      case 'll':
        return { size: Math.abs(a.l - b.l), key, index, vertical: true }
      case 'lx':
        return { size: Math.abs(a.l - b.l - b.h / 2), key, index, vertical: true }
      case 'tb':
        return { size: Math.abs(a.t - b.t - b.h), key, index, vertical: false }
      case 'bt':
        return { size: Math.abs(b.t - a.t - a.h), key, index, vertical: false }
      case 'rl':
        return { size: Math.abs(b.l - a.l - a.w), key, index, vertical: true }
      case 'lr':
        return { size: Math.abs(a.l - b.l - b.w), key, index, vertical: true }
      case 'xx':
        return {
          size: Math.abs((a.l + a.w - b.l - b.w + (a.l - b.l)) / 2),
          key,
          index,
          vertical: true,
        }
      case 'yy':
        return {
          size: Math.abs((a.t - b.t + (a.t + a.h - b.t - b.h)) / 2),
          key,
          index,
          vertical: false,
        }
      default:
        return 0
    }
  })
  return lodash(result)
    .groupBy('vertical')
    .map((group) => lodash.minBy(group, 'size'))
    .value()
}

// case ALIGNMENT_PROPS.tt: return calc(rectA.top-rectB.top);
// case ALIGNMENT_PROPS.bb: return calc(rectB.bottom-rectA.bottom);
// case ALIGNMENT_PROPS.rr: return calc(rectB.right-rectA.right);
// case ALIGNMENT_PROPS.ll: return calc(rectA.left-rectB.left);
// case ALIGNMENT_PROPS.tb: return calc(rectA.top-rectB.bottom);
// case ALIGNMENT_PROPS.bt: return calc(rectB.top-rectA.bottom);
// case ALIGNMENT_PROPS.rl: return calc(rectB.left-rectA.right);
// case ALIGNMENT_PROPS.lr: return calc(rectA.left-rectB.right);
// case ALIGNMENT_PROPS.xx: return calc(((rectA.right-rectB.right)+(rectA.left-rectB.left))/2);
// case ALIGNMENT_PROPS.yy: return calc(((rectA.top-rectB.top)+(rectA.bottom-rectB.bottom))/2);
