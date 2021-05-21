import { createImage, createMultiImage, listImage } from 'api'
import { Storage } from 'aws-amplify'
import { Image, UploadablePicture } from 'interfaces'
import { GET_IMAGES, ADD_IMAGE, IMAGE_ERROR, ADD_IMAGES, UPLOAD_IMAGES } from './types'

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

export const addImages = (keys: string[]) => async (dispatch: any) => {
  try {
    let images = await createMultiImage(keys.map((key) => ({ imageUrl: key, type: 'images' })))

    images = await Promise.all(
      images.map(async (image: Image) => ({
        ...image,
        tempUrl: await Storage.get(image.imageUrl, { expires: 60 * 60 * 24 * 7 }),
      }))
    )

    dispatch({
      type: ADD_IMAGES,
      payload: images,
    })
  } catch (err) {
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
