import { ColorPreset, FilterMap } from 'interfaces'

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

export const colorPresets: ColorPreset[] = [
  {
    name: 'None',
    style: { background: `` },
    filterStyle: { filter: `` },
  },

  {
    filterStyle: {
      filter: 'brightness(110%) contrast(110%) saturate(130%)',
    },
    style: {
      background: 'rgba(243, 106, 188, 0.3)',
    },
    name: '1977',
  },
  {
    filterStyle: {
      filter: 'brightness(120%) contrast(90%) saturate(85%) hue-rotate(20deg)',
    },
    style: {
      background: 'linear-gradient(to right, rgba(66, 10, 14, 0.2) 1%, rgba(66, 10, 14, 0) 100%)',
    },
    name: 'Aden',
  },
  {
    filterStyle: {
      filter: 'brightness(110%) contrast(90%) saturate(150%) hue-rotate(-10deg)',
    },
    style: {
      background: '',
    },
    name: 'Amaro',
  },
  {
    filterStyle: {
      filter: 'sepia(50%) contrast(140%)',
    },
    style: {
      background: 'rgba(161, 44, 199, 0.31)',
    },
    name: 'Brannan',
  },
  {
    filterStyle: {
      filter: 'brightness(110%) contrast(90%)',
    },
    style: {
      background:
        '-webkit-radial-gradient(center center, circle closest-corner, rgba(168, 223, 193, 0.4) 1%, rgba(183, 196, 200, 0.2) 100%)',
    },
    name: 'Brooklyn',
  },
  {
    filterStyle: {
      filter: 'contrast(120%) saturate(125%)',
    },
    style: {
      background: 'rgba(127, 187, 227, 0.2)',
    },
    name: 'Clarendon',
  },
  {
    filterStyle: {
      filter: 'sepia(20%) contrast(90%)',
    },
    style: {
      background: '',
    },
    name: 'Earlybird',
  },
  {
    filterStyle: {
      filter: 'brightness(105%) hue-rotate(350deg)',
    },
    style: {
      background: 'linear-gradient(to right, rgba(66, 10, 14, 0.2) 1%, rgba(0, 0, 0, 0) 100%)',
    },
    name: 'Gingham',
  },
  {
    filterStyle: {
      filter: 'brightness(120%) contrast(90%) saturate(110%)',
    },
    style: {
      background: '',
    },
    name: 'Hudson',
  },
  {
    filterStyle: {
      filter: 'sepia(30%) brightness(110%) contrast(110%) grayscale(100%)',
    },
    style: {
      background: 'rgba(0, 0, 0, 0)',
    },
    name: 'Inkwell',
  },
  {
    filterStyle: {
      filter: 'contrast(150%) saturate(110%)',
    },
    style: {
      background: '',
    },
    name: 'Lofi',
  },
  {
    filterStyle: {
      filter: 'sepia(25%) brightness(95%) contrast(95%) saturate(150%)',
    },
    style: {
      background: 'rgba(3, 230, 26, 0.2)',
    },
    name: 'Maven',
  },
  {
    filterStyle: {
      filter: '',
    },
    style: {
      background: 'linear-gradient(rgb(0, 91, 154) 1%, rgba(61, 193, 230, 0) 100%)',
    },
    name: 'Perpetua',
  },
  {
    filterStyle: {
      filter: 'sepia(22%) brightness(110%) contrast(85%) saturate(75%)',
    },
    style: {
      background: 'rgb(173, 205, 239)',
    },
    name: 'Reyes',
  },
  {
    filterStyle: {
      filter: 'brightness(115%) contrast(75%) saturate(85%)',
    },
    style: {
      background: 'rgba(240, 149, 128, 0.2)',
    },
    name: 'Stinson',
  },
  {
    filterStyle: {
      filter: 'brightness(90%) contrast(150%)',
    },
    style: {
      background: '',
    },
    name: 'Toaster',
  },
  {
    filterStyle: {
      filter: 'sepia(30%) brightness(110%) saturate(160%) hue-rotate(350deg)',
    },
    style: {
      background: 'rgb(204, 68, 0)',
    },
    name: 'Walden',
  },
  {
    filterStyle: {
      filter: 'sepia(8%) brightness(108%) contrast(108%)',
    },
    style: {
      background: 'rgb(58, 3, 57)',
    },
    name: 'Valencia',
  },
  {
    filterStyle: {
      filter: 'sepia(30%)',
    },
    style: {
      background: '',
    },
    name: 'Xpro2',
  },
]

/* scrape script cssfilters.co */
/* 
const fq = [document.getElementsByClassName('thumb__figure'), document.querySelectorAll('.thumb__figure>div'), document.getElementsByClassName('thumb__label')]

[...Array(fq[0].length).keys()].map(each => {
  return {
      filterStyle: { filter: fq[0][each].style.filter },
      style: { background: fq[1][each].style.background },
      name: fq[2][each].innerHTML
  }
})
 */

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
