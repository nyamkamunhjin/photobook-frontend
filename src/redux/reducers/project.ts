import { ProjectInterface } from 'interfaces'
import {
  ADD_LAYOUT,
  PROJECTS_ERROR,
  SAVE_PROJECT,
  NEW_SLIDE,
  NEW_SLIDES,
  SLIDES_ERROR,
  DELETE_SLIDE,
  UPDATE_HISTORY,
  ADD_OBJECT,
  REMOVE_OBJECT,
  UNDO,
  REDO,
  LOAD_ERROR,
  LOAD_BACKGROUNDS,
  LOAD_CONTAINERS,
  LOAD_OBJECTS,
  REORDER_SLIDE,
  SET_SLIDE_DIMENSION,
  SET_CURRENT_PROJECT,
  DELETE_SLIDE_BY_ID,
  SAVE_PROJECT_ATTR,
  UPDATE_CONTAINER,
  UPDATE_GROUP_CONTAINER,
  UPDATE_BACKGROUND,
  SET_BACKGROUNDS,
  UPDATE_OBJECT,
  UPDATE_PROJECT,
  DUPLICATE_SLIDE,
  CLEAR_PROJECT,
} from '../actions/types'
import projectHandlers from './handlers'

export const defaultProject: ProjectInterface = {
  currentProject: {
    id: 0,
    paperSizeId: 1,
    templateId: 1,
    uuid: '',
    slides: [
      {
        name: 'slide 1',
        containers: [
          {
            id: 'slideInitialId',
            className: 'object',
            style: { top: 100, left: 100 },
          },
        ],
        backgrounds: [],
        objects: [],
        slideId: '',
      },
    ],
  },
  bgStyles: [],
  slideWidth: 0,
  slideHeight: 0,
  slideIndex: 0,
  objects: [],
  containers: [],
  backgrounds: [
    {
      className: 'background-right',
      style: { top: 0, left: 0, rotateAngle: 0, transform: '' },
      bgStyle: { rotateAngle: 0, transform: '', transformOrigin: 'center center' },
    },
    {
      className: 'background-left',
      style: { top: 0, left: 0, rotateAngle: 0, transform: '' },
      bgStyle: { rotateAngle: 0, transform: '', transformOrigin: 'center center' },
    },
    {
      className: 'background-full',
      imageurl: '',
      style: { rotateAngle: 0, transform: '', display: 'block' },
      bgStyle: { rotateAngle: 0, transform: '', transformOrigin: 'center center', display: 'block' },
    },
  ],
  undoHistory: [],
  redoHistory: [],
  layout: {
    left: { count: -1, index: -1, objects: [] },
    right: { count: -1, index: -1, objects: [] },
  },
  layouts: [
    {
      count: 4,
      layouts: [
        {
          index: 0,
          count: 4,
          objects: [
            { top: 0, width: 50, left: 0, height: 50, className: 'image-placeholder' },
            { top: 0, width: 50, left: 50, height: 50, className: 'image-placeholder' },
            { top: 50, width: 50, left: 0, height: 50, className: 'image-placeholder' },
            { top: 50, width: 50, left: 50, height: 50, className: 'image-placeholder' },
          ],
        },
        {
          count: 4,
          index: 1,
          objects: [
            { top: 0, width: 50, left: 0, height: 55, className: 'image-placeholder' },
            { top: 0, width: 50, left: 50, height: 45, className: 'image-placeholder' },
            { top: 55, width: 50, left: 0, height: 45, className: 'image-placeholder' },
            { top: 45, width: 50, left: 50, height: 55, className: 'image-placeholder' },
          ],
        },
      ],
    },
    {
      count: 3,
      layouts: [
        {
          count: 3,
          index: 0,
          objects: [
            { top: 0, width: 100, left: 0, height: 50, className: 'image-placeholder' },
            { top: 50, width: 50, left: 0, height: 50, className: 'image-placeholder' },
            { top: 50, width: 50, left: 50, height: 50, className: 'image-placeholder' },
          ],
        },
        {
          count: 3,
          index: 1,
          objects: [
            { top: 0, width: 50, left: 0, height: 50, className: 'image-placeholder' },
            { top: 50, width: 50, left: 0, height: 50, className: 'image-placeholder' },
            { top: 0, width: 50, left: 50, height: 100, className: 'image-placeholder' },
          ],
        },
      ],
    },
    {
      count: 2,
      layouts: [
        {
          count: 2,
          index: 0,
          objects: [
            { top: 0, width: 100, left: 0, height: 50, className: 'image-placeholder' },
            { top: 50, width: 100, left: 0, height: 50, className: 'image-placeholder' },
          ],
        },
        {
          count: 2,
          index: 1,
          objects: [
            { top: 8, width: 80, left: 10, height: 40, className: 'image-placeholder' },
            { top: 52, width: 80, left: 10, height: 40, className: 'image-placeholder' },
          ],
        },
        {
          count: 2,
          index: 2,
          objects: [
            { top: 0, width: 50, left: 0, height: 100, className: 'image-placeholder' },
            { top: 0, width: 50, left: 50, height: 100, className: 'image-placeholder' },
          ],
        },
      ],
    },
    {
      count: 1,
      layouts: [
        {
          count: 1,
          index: 0,
          objects: [{ top: 0, width: 100, left: 0, height: 100, className: 'image-placeholder' }],
        },
        {
          index: 1,
          count: 1,
          objects: [{ top: 10, width: 80, left: 10, height: 80, className: 'image-placeholder' }],
        },
        {
          index: 2,
          count: 1,
          objects: [{ top: 20, width: 60, left: 20, height: 60, className: 'image-placeholder' }],
        },
      ],
    },
  ],
  loading: true,
  fetching: true,
}

const handlers: any = {}
handlers[UPDATE_PROJECT] = projectHandlers.updateProjectsHandler
handlers[SET_CURRENT_PROJECT] = projectHandlers.setCurrentProjectHandler
handlers[SET_SLIDE_DIMENSION] = projectHandlers.setSlideDimensionHandler
handlers[SAVE_PROJECT] = projectHandlers.saveProjectHandler
handlers[SAVE_PROJECT_ATTR] = projectHandlers.saveProjectAttHandler
handlers[NEW_SLIDE] = projectHandlers.newSlideHandler
handlers[NEW_SLIDES] = projectHandlers.newSlidesHandler
handlers[DUPLICATE_SLIDE] = projectHandlers.newSlideHandler
handlers[REORDER_SLIDE] = projectHandlers.reOrderSlideHandler
handlers[DELETE_SLIDE] = projectHandlers.deleteSlideHandler
handlers[DELETE_SLIDE_BY_ID] = projectHandlers.deleteSlideByIdHandler
handlers[LOAD_OBJECTS] = projectHandlers.loadObjectsHandler
handlers[LOAD_CONTAINERS] = projectHandlers.loadContainersHandler
handlers[LOAD_BACKGROUNDS] = projectHandlers.loadBackgroundsHandler
handlers[LOAD_ERROR] = projectHandlers.loadErrorHandler
handlers[UPDATE_CONTAINER] = projectHandlers.updateContainerHandler
handlers[UPDATE_GROUP_CONTAINER] = projectHandlers.updateGroupContainerHandler
handlers[UPDATE_BACKGROUND] = projectHandlers.updateBackgroundHandler
handlers[UPDATE_OBJECT] = projectHandlers.updateObjectHandler
handlers[SET_BACKGROUNDS] = projectHandlers.setBackgroundsHandler
handlers[UPDATE_HISTORY] = projectHandlers.updateHistoryHandler
handlers[ADD_LAYOUT] = projectHandlers.addLayoutHandler
handlers[ADD_OBJECT] = projectHandlers.addObjectHandler
handlers[REMOVE_OBJECT] = projectHandlers.removeObjectHandler
handlers[UNDO] = projectHandlers.undoHandler
handlers[REDO] = projectHandlers.redoHandler
handlers[SLIDES_ERROR] = projectHandlers.slidesErrorHandler
handlers[PROJECTS_ERROR] = projectHandlers.projectsErrorHandler
handlers[CLEAR_PROJECT] = projectHandlers.clearProject

const project = (state = defaultProject, action: { type: string; payload: any }) => {
  const handler = handlers[action.type]

  if (handler) return handler(state, action)

  return state
}

export default project
