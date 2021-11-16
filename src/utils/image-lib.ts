import { PObject, Slide } from 'interfaces'

export const getSlides = (sort = 'a-z', slides: Slide[]) => {
  switch (sort) {
    case 'a-z':
      return slides.sort((a, b) => a.slideId.localeCompare(b.slideId))
    case 'z-a': {
      return slides.sort((b, a) => a.slideId.localeCompare(b.slideId))
    }
    // case 'earlier': {
    //   return slides.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    // }
    // case 'recently': {
    //   return slides.sort((b, a) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    // }
    default:
      return slides
  }
}

export const getSlidesa = (sort = 'a-z', slides: Slide[]) => {
  switch (sort) {
    case 'a-z':
      return slides.sort((a, b) => a.slideId.localeCompare(b.slideId))
    case 'z-a': {
      return slides.sort((b, a) => a.slideId.localeCompare(b.slideId))
    }
    // case 'earlier': {
    //   return slides.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    // }
    // case 'recently': {
    //   return slides.sort((b, a) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    // }
    default:
      return slides
  }
}

export const checkPrintQuality = (o: PObject, ratio: { minImageSquare: number; minPlaceholderSquare: number }) => {
  const placeholder = document.getElementById(o.id)
  if (!placeholder) return false
  const image: any = document.querySelector('img')
  if (!image) return false

  const imageSquare =
    parseFloat(o.props.imageNaturalSize?.width + '') * parseFloat(o.props.imageNaturalSize?.width + '')
  const placeholderSquare = parseFloat(o.style.width + '') * parseFloat(o.style.height + '')

  return imageSquare / placeholderSquare >= ratio.minImageSquare / ratio.minPlaceholderSquare
}
