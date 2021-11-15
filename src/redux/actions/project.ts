import {
  createProject,
  getFrameMaterial,
  getPaperSize,
  getProject,
  getProjectByUuid,
  getTemplate,
  listImageCategoryByProject,
  updateProject as _updateProject,
  updateProjectPrintSlides,
  updateProjectSlides,
} from 'api'
import {
  BackgroundImage,
  Container,
  PaperSize,
  ProjectCreate,
  PObject,
  Project,
  Slide,
  Template,
  PaperMaterial,
  FrameMaterial,
} from 'interfaces'
import { getS3Images } from 'utils/aws-lib'
import { SinglePageEditor } from 'configs'
import { generateDuplicatedSlide, generateNewSlide } from 'utils/transformer-lib'
import {
  UPDATE_PROJECT,
  PROJECTS_ERROR,
  SAVE_PROJECT,
  NEW_SLIDES,
  SLIDES_ERROR,
  NEW_SLIDE,
  DELETE_SLIDE_BY_ID,
  DELETE_SLIDE,
  REDO,
  REDO_ERROR,
  UNDO_ERROR,
  UNDO,
  REMOVE_OBJECT,
  ADD_OBJECT,
  UPDATE_HISTORY,
  LOAD_BACKGROUNDS,
  LOAD_ERROR,
  LOAD_CONTAINERS,
  LOAD_OBJECTS,
  SET_CURRENT_PROJECT,
  SET_SLIDE_DIMENSION,
  UPDATE_CONTAINER,
  UPDATE_GROUP_CONTAINER,
  UPDATE_BACKGROUND,
  SET_BACKGROUNDS,
  UPDATE_OBJECT,
  ADD_LAYOUT,
  REORDER_SLIDE,
  SAVE_PROJECT_ATTR,
  CLEAR_PROJECT,
  GET_IMAGES,
  GET_CATEGORIES,
} from './types'

// #region [Project]
export const getProjects = (id: number, params: ProjectCreate, uuid: string) => async (dispatch: any) => {
  try {
    if (uuid.length === 0) {
      dispatch({ type: CLEAR_PROJECT })
      const template: Template = await getTemplate(id)

      let newProject
      if (params.paperSizeId && params.paperSizeId !== template.paperSizeId && template.paperSize) {
        const paperSize: PaperSize = await getPaperSize(params.paperSizeId)
        const { width: w, height: h } = paperSize
        const { width: _w, height: _h } = template.paperSize

        newProject = await createProject({
          ...params,
          name: 'New Project',
          templateId: id,
          slides:
            template.canvasType === 'Split'
              ? [template.slidesSplit]
              : template.slides.map((slide) => {
                  return {
                    ...slide,
                    objects: slide.objects.map((o) => {
                      if (['photobook', 'montage'].includes(template.templateType?.name + '')) {
                        return {
                          ...o,
                          style: {
                            ...o.style,
                            top: `${(h * parseFloat(o.style.top + '')) / _h}px`,
                            left: `${(((w - 30) / 2) * parseFloat(o.style.left + '')) / ((_w - 30) / 2)}px`,
                            height: `${(h * parseFloat(o.style.height + '')) / _h}px`,
                            width: `${(((w - 30) / 2) * parseFloat(o.style.width + '')) / ((_w - 30) / 2)}px`,
                          },
                        }
                      } else {
                        return {
                          ...o,
                          style: {
                            ...o.style,
                            width: (parseFloat(o.style.width + '') * w) / _w + 'px',
                            height: (parseFloat(o.style.height + '') * h) / _h + 'px',
                            top: (parseFloat(o.style.top + '') * h) / _h + 'px',
                            left: (parseFloat(o.style.left + '') * w) / _w + 'px',
                          },
                        }
                      }
                    }),
                  }
                }),
        })
      } else {
        newProject = await createProject({
          ...params,
          name: 'New Project',
          templateId: id,
          slides: template.canvasType === 'Split' ? [template.slidesSplit] : template.slides,
        })
      }

      const project: Project = await getProject(newProject?.data.id)
      const imageCategories = await listImageCategoryByProject(id)

      if (project.frameMaterial && process.env.REACT_APP_PUBLIC_IMAGE) {
        project.frameMaterial.tempUrl = process.env.REACT_APP_PUBLIC_IMAGE + project.frameMaterial.imageUrl
      }

      dispatch(setCurrentProject(project))
      dispatch({
        type: GET_CATEGORIES,
        payload: imageCategories,
      })
      dispatch({
        type: GET_IMAGES,
        payload: project.images,
      })
      return project.uuid
    } else {
      dispatch({ type: CLEAR_PROJECT })
      const project: Project = await getProjectByUuid(uuid)
      const imageCategories = await listImageCategoryByProject(project.templateId)
      const images = await getS3Images(project.images || [])
      dispatch(setCurrentProject(project))
      dispatch({
        type: GET_CATEGORIES,
        payload: imageCategories,
      })

      dispatch({
        type: GET_IMAGES,
        payload: images,
      })
      return uuid
    }
  } catch (err) {
    dispatch({
      type: PROJECTS_ERROR,
      payload: { msg: err },
    })
  }
  return undefined
}

// #region [getPrintProject]
export const getPrintProject = (id: number, params: ProjectCreate, uuid: string) => async (dispatch: any) => {
  try {
    if (uuid.length === 0) {
      dispatch({ type: CLEAR_PROJECT })
      const newProject = await createProject({
        ...params,
        name: 'New Print',
        templateId: 1,
        slides: [],
      })
      const project: Project = await getProject(newProject?.data.id)
      dispatch(setCurrentProject(project))
      return project.uuid
    } else {
      dispatch({ type: CLEAR_PROJECT })
      const project: Project = await getProjectByUuid(uuid)
      const imageCategories = await listImageCategoryByProject(project.templateId)
      const images = await getS3Images(project.images || [])
      dispatch(setCurrentProject(project))
      dispatch({
        type: GET_CATEGORIES,
        payload: imageCategories,
      })

      dispatch({
        type: GET_IMAGES,
        payload: images,
      })
      return uuid
    }
  } catch (err) {
    dispatch({
      type: PROJECTS_ERROR,
      payload: { msg: err },
    })
  }
  return undefined
}

// update project
export const updateProject = (projectId: number, props: any) => async (dispatch: any) => {
  try {
    if (props.paperSizeId) {
      await _updateProject(projectId, props)
      const paperSize: PaperSize = await getPaperSize(props.paperSizeId)
      dispatch(setSlideStyle(`${paperSize.width}x${paperSize.height}`))
      dispatch({
        type: UPDATE_PROJECT,
        payload: { ...props, paperSize },
      })
    } else if (!props.frameMaterialId) {
      await _updateProject(projectId, props)
      dispatch({
        type: UPDATE_PROJECT,
        payload: props,
      })
    } else if (props.frameMaterialId) {
      await _updateProject(projectId, { frameMaterialId: parseFloat(props.frameMaterialId + '') })
      const frameMaterial: FrameMaterial = await getFrameMaterial(props.frameMaterialId)
      dispatch({
        type: UPDATE_PROJECT,
        payload: { ...props, frameMaterial },
      })
    }
  } catch (err) {
    dispatch({
      type: PROJECTS_ERROR,
      payload: { msg: err },
    })
  }
}

// set current project
export const setCurrentProject = (project: Project) => async (dispatch: any) => {
  try {
    console.log(
      'aaaaalog',
      project.templateType?.name,
      SinglePageEditor.includes(project.templateType?.name || 'photobook')
    )
    dispatch(
      setSlideStyle(
        `${project.paperSize?.width}x${project.paperSize?.height}`,
        SinglePageEditor.includes(project.templateType?.name || 'photobook')
      )
    )
    dispatch({
      type: SET_CURRENT_PROJECT,
      payload: project,
    })
  } catch (err) {
    dispatch({
      type: PROJECTS_ERROR,
      payload: { msg: err },
    })
  }
}

// Save project
export const saveProject = (projectId: number, updatedSlide: Slide, slideIndex: number) => async (dispatch: any) => {
  try {
    await updateProjectSlides(projectId, {
      update: [updatedSlide, slideIndex],
    })

    dispatch({
      type: SAVE_PROJECT,
      payload: updatedSlide,
    })
  } catch (err) {
    dispatch({
      type: PROJECTS_ERROR,
      payload: { msg: err },
    })
  }
}

export const saveProjectAttribute = (projectId: number, data: Object) => async (dispatch: any) => {
  try {
    await _updateProject(projectId, data)
    dispatch({
      type: SAVE_PROJECT_ATTR,
      payload: data,
    })
  } catch (err) {
    dispatch({
      type: PROJECTS_ERROR,
      payload: { msg: err },
    })
  }
}
// #endregion [Project]

// #region [Slide]
// set bgStyle
export const setSlideStyle =
  (paperSize = '14x11', isSingle = false) =>
  async (dispatch: any) => {
    console.log('aaaaalog', isSingle)
    try {
      const [width, height] = paperSize.split('x') // 14x11
      let slideWidth = parseFloat(width) * 100 * 2 + 30 // 30 is the book spine
      if (isSingle) {
        slideWidth = parseFloat(width) * 100
      }

      const slideHeight = parseFloat(height) * 100 // 11 * 100 = 1100
      console.log('aaaaalog', slideWidth, slideHeight)

      const bgStyles = {
        'background-full': {
          left: 0 + 'px',
          width: slideWidth + 'px',
          height: slideHeight + 'px',
        },
        'background-left': {
          left: 0,
          width: slideWidth / 2 + 'px',
          height: slideHeight + 'px',
        },
        'background-right': {
          left: slideWidth / 2 + 'px',
          width: slideWidth / 2 + 'px',
          height: slideHeight + 'px',
        },
      }

      dispatch({
        type: SET_SLIDE_DIMENSION,
        payload: { bgStyles, slideWidth, slideHeight },
      })
    } catch (err) {
      console.error('LOAD Slide style', err)
      dispatch({
        type: LOAD_ERROR,
        payload: { msg: err },
      })
    }
  }

// loadObjects
export const loadObjects = (objects: PObject[]) => async (dispatch: any) => {
  try {
    dispatch({
      type: LOAD_OBJECTS,
      payload: objects,
    })
  } catch (err) {
    console.error('LOAD object', err)
    dispatch({
      type: LOAD_ERROR,
      payload: { msg: err },
    })
  }
}

// loadContainers
export const loadContainers = (containers: Container[]) => async (dispatch: any) => {
  try {
    dispatch({
      type: LOAD_CONTAINERS,
      payload: containers,
    })
  } catch (err) {
    console.error('LOAD Container', err)
    dispatch({
      type: LOAD_ERROR,
      payload: { msg: err },
    })
  }
}

// loadBackgrounds
export const loadBackgrounds = (backgrounds: Object[]) => async (dispatch: any) => {
  try {
    dispatch({
      type: LOAD_BACKGROUNDS,
      payload: backgrounds,
    })
  } catch (err) {
    console.error('LOAD Background', err)
    dispatch({
      type: LOAD_ERROR,
      payload: { msg: err },
    })
  }
}
// Add new slide
export const addNewPrintSlide = (projectId: number, imageUrls: string[]) => async (dispatch: any) => {
  try {
    const result = await updateProjectPrintSlides(projectId, {
      push: imageUrls,
    })
    console.log('aaaaaaaaaaaa', result?.data.actions)
    dispatch({
      type: NEW_SLIDES,
      payload: { slides: result?.data.actions || [] },
    })
  } catch (err) {
    dispatch({
      type: SLIDES_ERROR,
      payload: { msg: err },
    })
  }
}
// Duplicate slide
export const duplicatePrintSlide = (projectId: number, slideIndex: string, slide: Slide) => async (dispatch: any) => {
  try {
    const newSlide = generateDuplicatedSlide(slide)
    await updateProjectPrintSlides(projectId, {
      duplicate: newSlide,
    })
    dispatch({
      type: NEW_SLIDE,
      payload: { slide: newSlide, slideIndex: undefined },
    })
  } catch (err) {
    dispatch({
      type: SLIDES_ERROR,
      payload: { msg: err },
    })
  }
}
// delete printslidea
export const deletePrintSlide = (projectId: number, slideId: string) => async (dispatch: any) => {
  try {
    await updateProjectPrintSlides(projectId, {
      pop: slideId,
    })
    dispatch({
      type: DELETE_SLIDE_BY_ID,
      payload: slideId,
    })
  } catch (err) {
    dispatch({
      type: SLIDES_ERROR,
      payload: { msg: err },
    })
  }
}

// Add new slide
export const addNewSlide = (projectId: number, slideIndex: number) => async (dispatch: any) => {
  try {
    const newSlide = generateNewSlide()
    await updateProjectSlides(projectId, {
      insert: [newSlide, slideIndex + 1],
    })

    dispatch({
      type: NEW_SLIDE,
      payload: { slide: newSlide, slideIndex: slideIndex + 1 },
    })
  } catch (err) {
    dispatch({
      type: SLIDES_ERROR,
      payload: { msg: err },
    })
  }
}
// Duplicate slide
export const duplicateSlide = (projectId: number, slideIndex: number, slide: Slide) => async (dispatch: any) => {
  try {
    const newSlide = generateDuplicatedSlide(slide)
    await updateProjectSlides(projectId, {
      insert: [newSlide, slideIndex + 1],
    })
    dispatch({
      type: NEW_SLIDE,
      payload: { slide: newSlide, slideIndex: slideIndex + 1 },
    })
  } catch (err) {
    dispatch({
      type: SLIDES_ERROR,
      payload: { msg: err },
    })
  }
}

// reorder slide
export const reOrderSlide = (projectId: number, slides: Slide[]) => async (dispatch: any) => {
  try {
    await _updateProject(projectId, {
      slides,
    })
    dispatch({
      type: REORDER_SLIDE,
      payload: {
        slides,
      },
    })
  } catch (err) {
    dispatch({
      type: SLIDES_ERROR,
      payload: { msg: err },
    })
  }
}

// delete slide
export const deleteSlide = (projectId: number, slideIndex: number) => async (dispatch: any) => {
  try {
    await updateProjectSlides(projectId, {
      pop: slideIndex,
    })
    dispatch({
      type: DELETE_SLIDE,
      payload: slideIndex,
    })
  } catch (err) {
    dispatch({
      type: SLIDES_ERROR,
      payload: { msg: err },
    })
  }
}

// slide

// updateHistory
export const updateHistory = (historyType: string, props: any) => async (dispatch: any) => {
  try {
    dispatch({
      type: UPDATE_HISTORY,
      payload: { historyType, props },
    })
  } catch (err) {
    dispatch({
      type: SLIDES_ERROR,
      payload: { msg: err },
    })
  }
}

// updateBackground
export const updateBackground = (props: { background: BackgroundImage }) => async (dispatch: any) => {
  try {
    dispatch({
      type: UPDATE_BACKGROUND,
      payload: props,
    })
  } catch (err) {
    console.error(err)
    dispatch({
      type: SLIDES_ERROR,
      payload: { msg: err },
    })
  }
}

// setBackgrounds
export const setBackgrounds = (props: { backgrounds: BackgroundImage[] }) => async (dispatch: any) => {
  try {
    dispatch({
      type: SET_BACKGROUNDS,
      payload: props,
    })
  } catch (err) {
    console.error(err)
    dispatch({
      type: SLIDES_ERROR,
      payload: { msg: err },
    })
  }
}

// updateContainer
export const updateContainer = (props: { container: Object }) => async (dispatch: any) => {
  try {
    dispatch({
      type: UPDATE_CONTAINER,
      payload: props,
    })
  } catch (err) {
    console.error(err)
    dispatch({
      type: SLIDES_ERROR,
      payload: { msg: err },
    })
  }
}

// updateGroupContainer
export const updateGroupContainer = (props: { containers: Container[] }) => async (dispatch: any) => {
  try {
    dispatch({
      type: UPDATE_GROUP_CONTAINER,
      payload: props,
    })
  } catch (err) {
    console.error(err)
    dispatch({
      type: SLIDES_ERROR,
      payload: { msg: err },
    })
  }
}

// updateObject
export const updateObject = (props: { object: Object }, slideId?: string) => async (dispatch: any) => {
  try {
    dispatch({
      type: UPDATE_OBJECT,
      payload: { ...props, slideId },
    })
  } catch (err) {
    console.error(err)
    dispatch({
      type: SLIDES_ERROR,
      payload: { msg: err },
    })
  }
}

// addLayout
export const addLayout = (props: { objects: Object[] }) => async (dispatch: any) => {
  try {
    dispatch({
      type: ADD_LAYOUT,
      payload: props,
    })
  } catch (err) {
    dispatch({
      type: SLIDES_ERROR,
      payload: { msg: err },
    })
  }
}

// addObject
export const addObject = (props: { object: Object }) => async (dispatch: any) => {
  try {
    dispatch({
      type: ADD_OBJECT,
      payload: props,
    })

    dispatch(updateHistory(ADD_OBJECT, props))
  } catch (err) {
    console.error(err)
    dispatch({
      type: SLIDES_ERROR,
      payload: { msg: err },
    })
  }
}

// removeObject
export const removeObject = (props: { object: Object; container: Object }) => async (dispatch: any) => {
  try {
    dispatch({
      type: REMOVE_OBJECT,
      payload: props,
    })

    dispatch(updateHistory(REMOVE_OBJECT, props))
  } catch (err) {
    console.error(err)
    dispatch({
      type: SLIDES_ERROR,
      payload: { msg: err },
    })
  }
}

// undo
export const undo = () => async (dispatch: any) => {
  try {
    dispatch({
      type: UNDO,
    })
  } catch (err) {
    console.error(err)
    dispatch({
      type: UNDO_ERROR,
      payload: { msg: err },
    })
  }
}

// redo
export const redo = () => async (dispatch: any) => {
  try {
    dispatch({
      type: REDO,
    })
  } catch (err) {
    console.error(err)
    dispatch({
      type: REDO_ERROR,
      payload: { msg: err },
    })
  }
}
