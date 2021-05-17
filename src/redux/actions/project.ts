import { createProject, listProject, updateProject as _updateProject } from 'api'
import { API } from 'aws-amplify'
import { BackgroundImage, Container, PObject, Project, Slide } from 'interfaces'
import {
  GET_PROJECTS,
  UPDATE_PROJECT,
  PROJECTS_ERROR,
  ADD_PROJECT,
  SAVE_PROJECT,
  SLIDES_ERROR,
  NEW_SLIDE,
  DUPLICATE_SLIDE,
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
} from './types'

// Get projects
export const getProjects = () => async (dispatch: any) => {
  try {
    let projects = await listProject()
    if (projects.length === 0) {
      console.log('user has no project')
      console.log('creating project')
      const newProject = await createProject({ name: 'New Project', templateId: 1 })

      console.log('creating first slide')
      await _updateProject(newProject?.data.id, {
        slide: {
          name: 'slide 1',
          objects: [],
          containers: [],
          backgrounds: [],
        },
      })
      projects = await listProject()
    }

    dispatch({
      type: GET_PROJECTS,
      payload: projects,
    })

    dispatch(setCurrentProject(projects[0]))
  } catch (err) {
    dispatch({
      type: PROJECTS_ERROR,
      payload: { msg: err },
    })
  }
}

// updateProject
export const updateProject = (projectId: number, props: { paperSize: string }) => async (dispatch: any) => {
  try {
    await API.put('photobook', `/projects/${projectId}`, {
      body: {
        paperSize: props.paperSize,
      },
    })

    dispatch(setSlideStyle(props.paperSize))

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

// Set current project
export const setCurrentProject = (project: Project) => async (dispatch: any) => {
  try {
    dispatch({
      type: SET_CURRENT_PROJECT,
      payload: project,
    })
    dispatch(setSlideStyle(project.paperSize?.size))
  } catch (err) {
    dispatch({
      type: PROJECTS_ERROR,
      payload: { msg: err },
    })
  }
}

// Add Project
export const addProject = (project: Project) => async (dispatch: any) => {
  try {
    dispatch({
      type: ADD_PROJECT,
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
export const saveProject = (projectId: number, updatedSlide: Slide) => async (dispatch: any) => {
  console.log('saving project action')
  try {
    await API.put('photobook', `/projects/slide/${projectId}`, {
      body: {
        slide: updatedSlide,
      },
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

// set bgStyle
export const setSlideStyle = (paperSize = '14x11') => async (dispatch: any) => {
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
export const loadContainers = (containers: Object[]) => async (dispatch: any) => {
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
export const addNewSlide = (slideIndex: number, projectId: number) => async (dispatch: any) => {
  try {
    const res = await API.post('photobook', `/projects/slide/${projectId}`, {
      body: {
        slide: {
          name: 'slide',
        },
      },
    })

    dispatch({
      type: NEW_SLIDE,
      payload: { slide: res.slide, slideIndex },
    })
  } catch (err) {
    dispatch({
      type: SLIDES_ERROR,
      payload: { msg: err },
    })
  }
}
// Duplicate slide
export const duplicateSlide = (projectId: number, slideId: string) => async (dispatch: any) => {
  try {
    dispatch({
      type: DUPLICATE_SLIDE,
      payload: slideId,
    })
  } catch (err) {
    dispatch({
      type: SLIDES_ERROR,
      payload: { msg: err },
    })
  }
}

// reorder slide
export const reOrderSlide = (slides: Slide[]) => async (dispatch: any) => {
  try {
    dispatch({
      type: REORDER_SLIDE,
      payload: slides,
    })
  } catch (err) {
    dispatch({
      type: SLIDES_ERROR,
      payload: { msg: err },
    })
  }
}

// delete slide
export const deleteSlide = (projectId: number, slideId: string) => async (dispatch: any) => {
  try {
    await API.del('photobook', `/projects/slide/${projectId}`, {
      body: {
        slideId,
      },
    })

    dispatch({
      type: DELETE_SLIDE,
      payload: slideId,
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
    console.log('err')
    console.log(err)
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
    console.log('err')
    console.log(err)
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
    console.log('err')
    console.log(err)
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
    console.log('err')
    console.log(err)
    dispatch({
      type: SLIDES_ERROR,
      payload: { msg: err },
    })
  }
}

// updateObject
export const updateObject = (props: { object: Object }) => async (dispatch: any) => {
  console.log(props)
  try {
    dispatch({
      type: UPDATE_OBJECT,
      payload: props,
    })
  } catch (err) {
    console.log('err')
    console.log(err)
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
    console.log('err')
    console.log(err)
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
    console.log('err')
    console.log(err)
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
    console.log('err')
    console.log(err)
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
    console.log('err')
    console.log(err)
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
    console.log('err')
    console.log(err)
    dispatch({
      type: REDO_ERROR,
      payload: { msg: err },
    })
  }
}
