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

export const checkPrintQuality = (o: PObject, imageQuality: { imageSquare: number; placeholderSquare: number }) => {
  const placeholder = document.getElementById(o.id)
  if (!placeholder) return false
  const image: any = document.querySelector('img')
  if (!image) return false

  let scale = o.props.style.transform?.includes('scaleX')
    ? parseFloat(o.props.style.transform?.substring(o.props.style.transform.indexOf('scaleX(') + 7))
    : 1
  if (Number.isNaN(scale)) scale = 1

  const imageWidth = parseFloat(o.props.naturalSize?.width + '')
  const imageHeight = parseFloat(o.props.naturalSize?.height + '')
  const naturalRatio = imageWidth / imageHeight
  const imageSquare = (imageWidth * scale * imageWidth * scale) / naturalRatio
  const placeholderSquare = parseFloat(o.style.width + '') * parseFloat(o.style.height + '')

  return imageSquare / placeholderSquare >= imageQuality.imageSquare / imageQuality.placeholderSquare
}

export const getSizeFromFile = (file: File) => {
  return new Promise((res, rej) => {
    const reader = new FileReader()
    reader.onload = async (e: any) => {
      const image = new Image()
      image.src = e.target.result
      await image.decode()
      res({ width: image.width, height: image.height })
    }
    reader.onerror = (e) => rej(e)
    reader.readAsDataURL(file)
  })
}
