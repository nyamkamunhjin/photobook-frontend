import { createImage, listImage } from 'api'
import { Storage } from 'aws-amplify'
import { GET_IMAGES, ADD_IMAGE, IMAGE_ERROR } from './types'

// Get images
export const getImages = () => async (dispatch: any) => {
  try {
    const images = await listImage()
    dispatch({
      type: GET_IMAGES,
      payload: images,
    })
  } catch (err) {
    dispatch({
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
      let image = await createImage({ imageUrl, type })

      image = {
        ...image,
        tempUrl: await Storage.get(image.imageUrl),
      }

      dispatch({
        type: ADD_IMAGE,
        payload: image,
      })
    } catch (err) {
      dispatch({
        type: IMAGE_ERROR,
        payload: { msg: err },
      })
    }
  }
