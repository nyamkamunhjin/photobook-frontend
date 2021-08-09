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

export const generateNewImage = (image: string) => ({
  slideId: uuidv4(),
  object: {
    id: uuidv4(),
    className: 'object',
    props: {
      imageStyle: {},
      imageUrl: image,
    },
  },
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
  // xr: 0,
  bb: 0,
  by: 0,
  ll: 0,
  lx: 0,
  // xl: 0,
  tb: 0,
  bt: 0,
  rl: 0,
  lr: 0,
  xx: 0,
  yy: 0,
}

export const diffRect = (
  a: OElement,
  b: OElement,
  index: number,
  border: number,
  isRightSide = false,
  isResize = false
) => {
  const result = Object.keys(ALIGNMENT_PROPS).map((key) => {
    switch (key) {
      case 'tt':
        return {
          size: Math.abs(a.t - b.t),
          key,
          index,
          vertical: false,
          position: index !== -1 ? b.t : -border,
          magnet: index !== -1 ? b.t : -border,
        }
      case 'ty':
        return {
          size: Math.abs(a.t - b.t - b.h / 2),
          key,
          index,
          vertical: false,
          position: index !== -1 ? b.t + b.h / 2 : b.h / 2,
          magnet: index !== -1 ? b.t + b.h / 2 : b.h / 2,
        }
      case 'bb':
        return {
          size: Math.abs(b.t + b.h - a.t - a.h),
          key,
          index,
          vertical: false,
          position: index !== -1 ? b.t + b.h : b.h,
          magnet: index !== -1 ? b.t + b.h : b.h,
        }
      case 'by':
        return {
          size: Math.abs(b.t + b.h / 2 - a.t - a.h),
          key,
          index,
          vertical: false,
          position: index !== -1 ? b.t + b.h / 2 : b.h / 2,
          magnet: index !== -1 ? b.t + b.h / 2 : b.h / 2,
        }
      case 'tb':
        return {
          size: Math.abs(a.t - b.t - b.h),
          key,
          index,
          vertical: false,
          position: index !== -1 ? b.t + b.h : b.h / 2,
          magnet: index !== -1 ? b.t + b.h : b.h / 2,
        }
      case 'bt':
        return {
          size: Math.abs(b.t - a.t - a.h),
          key,
          index,
          vertical: false,
          position: index !== -1 ? b.t : b.h / 2,
          magnet: index !== -1 ? b.t : b.h / 2,
        }
      case 'rr':
        return {
          size: Math.abs(b.l + b.w - a.l - a.w),
          key,
          index,
          vertical: true,
          // position: index !== -1 ? b.l + b.w - a.w : b.w - a.w + border,
          position: (() => {
            if (index !== -1) return b.l + b.w - a.w
            if (!isRightSide) return b.w - a.w + border
            return b.w + b.l - a.w
          })(),
          // magnet: index !== -1 ? b.l + b.w : b.w + border,
          magnet: (() => {
            if (index !== -1) return b.l + b.w
            if (!isRightSide) return b.w + border
            return b.w + b.l
          })(),
        }
      case 'rx':
        return {
          size: Math.abs(b.l + b.w / 2 - a.l - a.w),
          key,
          index,
          vertical: true,
          position: (() => {
            if (index !== -1) return b.l + b.w / 2 - a.w
            if (!isRightSide) return b.w / 2 - a.w
            return b.l + b.w / 2 - a.w
          })(),
          magnet: (() => {
            if (index !== -1) return b.l + b.w / 2
            if (!isRightSide) return b.w / 2 + border
            return b.w / 2 + b.l
          })(),
        }
      // case 'xr':
      //   return {
      //     size: Math.abs(b.l + b.w - a.l - a.w / 2),
      //     key,
      //     index,
      //     vertical: true,
      //     position: (() => {
      //       if (index === -1) return b.w - a.w + border
      //       if (!isResize) return b.l + b.w
      //       if (resizeSide?.includes('e')) {
      //         return a.l + (b.l + b.w - a.l) * 2
      //       } else if (resizeSide?.includes('w')) {
      //         return b.l + b.w - (a.l + a.w - b.l - b.w)
      //       }
      //       return ''
      //     })(),
      //     magnet: (() => {
      //       if (index === -1) return b.w - a.w + border
      //       if (!isResize) return b.l + b.w
      //       if (resizeSide?.includes('e')) {
      //         return a.l + (b.l + b.w - a.l) * 2
      //       } else if (resizeSide?.includes('w')) {
      //         return b.l + b.w - (a.l + a.w - b.l - b.w)
      //       }
      //       return ''
      //     })(),
      //   }
      case 'll':
        return {
          size: Math.abs(a.l - b.l),
          key,
          index,
          vertical: true,
          position: (() => {
            if (index !== -1) return b.l
            if (!isRightSide) return border
            return b.l
          })(),
          magnet: (() => {
            if (index !== -1) return b.l
            if (!isRightSide) return border
            return b.l
          })(),
        }
      case 'lx':
        return {
          size: Math.abs(a.l - b.l - b.w / 2),
          key,
          index,
          vertical: true,
          position: (() => {
            if (index !== -1) return b.l + b.w / 2
            if (!isRightSide) return b.w / 2
            return b.w / 2 + b.l
          })(),
          magnet: (() => {
            if (index !== -1) return b.l + b.w / 2
            if (!isRightSide) return b.w / 2
            return b.w / 2 + b.l
          })(),
        }
      case 'rl':
        return {
          size: (() => {
            if (index === -1 && isRightSide) {
              return 10000
            }
            return Math.abs(b.l - a.l - a.w)
          })(),
          key,
          index,
          vertical: true,
          position: index !== -1 ? b.l : b.w / 2,
          magnet: index !== -1 ? b.l : b.w / 2,
        }
      case 'lr':
        return {
          size: (() => {
            if (index === -1 && !isRightSide) {
              return 1000
            }
            return Math.abs(a.l - b.l - b.w)
          })(),
          key,
          index,
          vertical: true,
          position: index !== -1 ? b.l + b.w : b.w / 2,
          magnet: index !== -1 ? b.l + b.w : b.w / 2,
        }
      case 'xx':
        return {
          size: Math.abs((a.l + a.w - b.l - b.w + (a.l - b.l)) / 2),
          key,
          index,
          vertical: true,
          position: (() => {
            if (index !== -1) return b.l + b.w / 2
            if (!isRightSide) return b.w / 2
            return b.w / 2 + b.l
          })(),
          magnet: (() => {
            if (index !== -1) return b.l + b.w / 2
            if (!isRightSide) return b.w / 2
            return b.w / 2 + b.l
          })(),
        }
      case 'yy':
        return {
          size: Math.abs((a.t - b.t + (a.t + a.h - b.t - b.h)) / 2),
          key,
          index,
          position: index !== -1 ? b.t + b.h / 2 : b.h / 2,
          magnet: index !== -1 ? b.t + b.h / 2 : b.h / 2,
          vertical: false,
        }
      default:
        return 0
    }
  })
  if (isResize) {
    return Object.values(lodash(result).groupBy('vertical').value()).map((group) =>
      lodash.minBy(
        group.filter((item: any) => {
          return item?.size > 0.1 && item?.key !== 'xx' && item?.key !== 'yy'
        }),
        'size'
      )
    )
  }
  return lodash(result)
    .groupBy('vertical')
    .map((group) => lodash.minBy(group, 'size'))
    .value()
}

export const getRotatedPosition = ({
  x,
  y,
  cx,
  cy,
  theta,
  scale,
}: {
  x: number
  y: number
  cx: number
  cy: number
  theta: number
  scale: number
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

export const calculateCenter = (styles: { top: any; left: any; width: any; height: any }, angle: any) => {
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
