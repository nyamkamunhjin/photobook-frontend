import { Storage } from 'aws-amplify'
import {
  createProject,
  getPaperSize,
  getProject,
  getProjectByUuid,
  getTemplate,
  listImageCategoryByProject,
  updateProject as _updateProject,
  updateProjectSlides,
} from 'api'
import { BackgroundImage, Container, Image, PaperSize, PObject, Project, Slide, Template } from 'interfaces'
import { getS3Images } from 'utils/aws-lib'
import { generateDuplicatedSlide, generateNewSlide } from 'utils/transformer-lib'
import {
  UPDATE_PROJECT,
  PROJECTS_ERROR,
  SAVE_PROJECT,
  SLIDES_ERROR,
  NEW_SLIDE,
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
export const getProjects = (id: number, paperSizeId: number, uuid: string) => async (dispatch: any) => {
  try {
    if (uuid.length === 0) {
      dispatch({ type: CLEAR_PROJECT })
      const template: Template = await getTemplate(id)
      const newProject = await createProject({
        name: 'New Project',
        templateId: id,
        paperSizeId,
        slides: template.slides,
      })
      const project: Project = await getProject(newProject?.data.id)
      dispatch(setCurrentProject(project))
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
// update project
export const updateProject = (projectId: number, props: { paperSizeId: number }) => async (dispatch: any) => {
  try {
    await _updateProject(projectId, { paperSizeId: props.paperSizeId })
    const paperSize: PaperSize = await getPaperSize(props.paperSizeId)
    dispatch(setSlideStyle(`${paperSize.width}x${paperSize.height}`))

    dispatch({
      type: UPDATE_PROJECT,
      payload: props,
    })
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
    dispatch(setSlideStyle(`${project.paperSize?.width}x${project.paperSize?.height}`))
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
  (paperSize = '14x11') =>
  async (dispatch: any) => {
    try {
      const [width, height] = paperSize.split('x') // 14x11
      const slideWidth = parseFloat(width) * 100 * 2 + 30 // 30 is the book spine
      const slideHeight = parseFloat(height) * 100 // 11 * 100 = 1100

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
export const updateObject = (props: { object: Object }) => async (dispatch: any) => {
  try {
    dispatch({
      type: UPDATE_OBJECT,
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