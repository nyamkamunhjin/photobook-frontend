import { createImage, createMultiImage, listImage, updateProjectImages } from 'api'
import { Storage } from 'aws-amplify'
import { ProjectImage } from 'interfaces'
import { GET_IMAGES, ADD_IMAGE, IMAGE_ERROR, ADD_IMAGES, UPLOAD_IMAGES, REMOVE_IMAGES } from './types'

// Get images
export const getImages = () => async (dispatch: any) => {
  try {
    const images = await listImage()
    return dispatch({
      type: GET_IMAGES,
      payload: images,
    })
  } catch (err) {
    return dispatch({
      type: IMAGE_ERROR,
      payload: { msg: err },
    })
  }
}

// Add image
export const addImage =
  (imageUrl: string, type = 'images') =>
  async (dispatch: any) => {
    try {
      let projectImage = await createImage({ imageUrl, type })

      projectImage = {
        ...projectImage,
        image: {
          ...projectImage.image,
          tempUrl: await Storage.get(projectImage.image.imageUrl),
        },
      }

      dispatch({
        type: ADD_IMAGE,
        payload: projectImage,
      })
    } catch (err) {
      dispatch({
        type: IMAGE_ERROR,
        payload: { msg: err },
      })
    }
  }
export const linkImages =
  (keys: string[], id: number, type = 'General') =>
  async (dispatch: any) => {
    try {
      let { actions } = await updateProjectImages({ link: keys.map((key) => ({ imageId: parseFloat(key), type })) }, id)
      actions = await Promise.all(
        actions.map(async (projectImage: ProjectImage) => ({
          ...projectImage,
          image: {
            ...projectImage.image,
            tempUrl: await Storage.get(projectImage.image.imageUrl, { expires: 60 * 60 * 24 * 7 }),
          },
        }))
      )
      console.log('actions', actions)
      dispatch({
        type: ADD_IMAGES,
        payload: actions,
      })
      return actions
    } catch (err) {
      dispatch({
        type: IMAGE_ERROR,
        payload: { msg: err },
      })
      return null
    }
  }

export const unlinkImages = (keys: number[], id: number) => async (dispatch: any) => {
  try {
    await updateProjectImages({ unlink: keys }, id)
    dispatch({
      type: REMOVE_IMAGES,
      payload: keys,
    })
  } catch (err) {
    dispatch({
      type: IMAGE_ERROR,
      payload: { msg: err },
    })
  }
}

export const addImages =
  (keys: string[], id: number, type = 'General') =>
  async (dispatch: any) => {
    try {
      let projectImages = await createMultiImage(
        keys.map((key) => ({
          imageUrl: key,
          name: key.split('-').slice(1, key.split('-').length).join('-').split('.')[0], // sorry medq
          type: 'images',
          projects: [{ projectId: id, type }],
        }))
      )
      projectImages = await Promise.all(
        projectImages.map(async (projectImage: ProjectImage) => ({
          ...projectImage,
          image: {
            ...projectImage.image,
            tempUrl: await Storage.get(projectImage.image.imageUrl, { expires: 60 * 60 * 24 * 7 }),
          },
        }))
      )
      dispatch({
        type: ADD_IMAGES,
        payload: projectImages,
      })
    } catch (err) {
      console.log('err', err)
      dispatch({
        type: IMAGE_ERROR,
        payload: { msg: err },
      })
    }
  }

export const uploadImages = () => async (dispatch: any) => {
  dispatch({
    type: UPLOAD_IMAGES,
  })
}
