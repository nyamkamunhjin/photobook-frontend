export const saveObjects = (
  currentProject: any,
  objects: any,
  styles: any,
  saveProject: any,
  selectedSlideIndex: any,
  setIsSaving: any
) => {
  const objectContainers: any = []
  const objs: any = []

  objects.forEach((ref: any, index: any) => {
    if (ref) {
      const children: any = []
      ref.childNodes[0].childNodes.forEach((c: any) => {
        let imageurl = c.imageurl

        if (!imageurl && c.localName === 'img') {
          // get first propty which is the react object
          for (let prop in c) {
            if (c[prop].memoizedProps) {
              imageurl = c[prop].memoizedProps.imageurl
              break
            }
          }
        }

        const temp = {
          type: c.localName,
          imageurl: imageurl,
          src: c.src,
          className: c.className,
          style: {
            left: c.style.left,
            top: c.style.top,
            width: c.style.width,
            height: c.style.height,
            display: c.style.display,
            opacity: c.style.opacity,
          },
        }
        children.push(temp)
      })

      // elements that have classes such as image-placeholder
      const obj = {
        type: ref.childNodes[0].localName,
        className: ref.childNodes[0].className,
        style: {
          left: ref.childNodes[0].style.left,
          top: ref.childNodes[0].style.top,
          width: ref.childNodes[0].style.width,
          height: ref.childNodes[0].style.height,
          offsetWidth: ref.childNodes[0].style.offsetWidth,
          offsetHeight: ref.childNodes[0].style.height,
          display: ref.childNodes[0].style.display,
          opacity: ref.childNodes[0].style.opacity,
        },
        children,
      }

      // elements that have classes such as object
      const objContainer = {
        type: ref.localName,
        className: ref.className,
        style: {
          left: ref.style.left,
          top: ref.style.top,
          width: ref.style.width,
          height: ref.style.height,
          offsetWidth: ref.style.offsetWidth,
          offsetHeight: ref.style.height,
          zIndex: ref.style['z-index'],
        },
      }
      objectContainers.push(objContainer)
      objs.push(obj)
    }
  })

  let updatedSlide = currentProject.slides[selectedSlideIndex]
  updatedSlide.objects = objs
  updatedSlide.objectContainers = objectContainers

  saveProject(currentProject.projectId, updatedSlide)

  setTimeout(() => {
    setIsSaving(false)
  }, 1000)
}
