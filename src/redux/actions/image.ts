import { createImage, listImage } from 'api'
import { API, Storage } from 'aws-amplify'
import { Image } from 'interfaces'
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
    console.log(err)
    dispatch({
      type: IMAGE_ERROR,
      payload: { msg: err },
    })
  }
}

// Add image
export const addImage = (imageUrl: string, type: string) => async (dispatch: any) => {
  try {
    await createImage({ imageUrl })
    let image = await API.post('photobook', '/images', {
      body: {
        imageUrl,
        type,
      },
    })

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
