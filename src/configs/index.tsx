import { FilterMap } from 'interfaces'

export const filters: FilterMap = {
  none: {
    label: 'filter-none',
    style: {
      filter: ' ',
      WebkitFilter: 'none',
    },
  },
  blur: {
    label: 'filter-blur',
    style: {
      filter: 'blur(10px) ',
      WebkitFilter: 'blur(10px)',
    },
  },
  lomo: {
    label: 'filter-lomo',
    style: {
      filter: 'hue-rotate(40deg) contrast(1.2) ',
      WebkitFilter: 'hue-rotate(40deg) contrast(1.2)',
    },
  },
  sepia: {
    label: 'filter-sepia',
    style: {
      filter: 'sepia(60%) ',
    },
  },
  invert: {
    label: 'filter-invert',
    style: {
      filter: 'drop-shadow(16px 16px 20px red) invert(75%) ',
    },
  },
  gray: {
    label: 'filter-b&w',
    style: {
      WebkitFilter: 'grayscale(100%)',
      filter: 'grayscale(100%) ',
    },
  },
}

export const WideHorizontalLayout = {
  labelCol: { lg: 8, md: 10 },
  wrapperCol: { lg: 16, md: 14 },
}

export const OnlyNameLayout = {
  labelCol: { lg: 3, md: 5 },
  wrapperCol: { lg: 21, md: 19 },
}

export const HorizonalLayout = {
  labelCol: { lg: 6, md: 8 },
  wrapperCol: { lg: 18, md: 16 },
}

export const HalfLayout = {
  labelCol: { lg: 12, md: 14 },
  wrapperCol: { lg: 12, md: 10 },
}

export const VerticalLayout = {
  labelCol: { span: 24 },
  wrapperCol: { span: 24 },
}

export const SinglePageEditor = 'canvas,frame,photoprint'

export const CanvasFormat = ['Single', 'Multi', 'Split']
