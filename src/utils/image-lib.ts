import { Slide } from 'interfaces'

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
