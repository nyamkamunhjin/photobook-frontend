import { Storage } from 'aws-amplify'
import axios from 'axios'
import { Image, UploadablePicture } from 'interfaces'
import Resizer from 'react-image-file-resizer'

export async function s3Upload(file: File) {
  const filename = `${Date.now()}-${file.name}`
  const thumb = await resizeFile(file)

  // if we were uploading publicly we can use the Storage.put() method
  const stored: any = await Storage.put(filename, thumb, {
    contentType: file.type,
  })
  Storage.put(filename, file, {
    progressCallback: (progress: any) => {
      console.log(`Uploaded: ${progress.loaded}/${progress.total}`)
    },
    level: 'private',
    contentType: file.type,
  })

  return stored.key
}

export async function getS3Images(images: Image[]) {
  return Promise.all(
    images.map(async (image: Image) => ({
      ...image,
      tempUrl: await Storage.get(image.imageUrl, { expires: 60 * 60 * 24 * 7 }),
    }))
  )
}

export function blobToFile(blob: Blob, name: string): File {
  const _blob: any = blob
  _blob.lastModifiedDate = new Date()
  _blob.name = name

  return _blob
}

export async function s3SyncImages(images: UploadablePicture[]) {
  const keys = await Promise.all(
    images?.map(async (image) => {
      const filename = `${Date.now()}-${image.filename}`
      const url = image.url.includes('google')
        ? `https://u0n54noja5.execute-api.us-east-1.amazonaws.com/google-download?domain=${image.url}`
        : image.url
      const { data } = await axios.get(url, {
        transformRequest: (_data, headers) => {
          if (!image.url.includes('google')) {
            delete headers.common['Access-Control-Allow-Headers']
          }
          return _data
        },
        responseType: 'blob',
      })
      const file = blobToFile(data, filename)
      const thumb = await resizeFile(file)
      Storage.put(image.filename, file, {
        progressCallback: (progress: any) => {
          console.log(`Uploaded: ${progress.loaded}/${progress.total}`)
        },
        level: 'private',
        contentType: image.mimeType,
      })
      const stored: any = await Storage.put(filename, thumb, {
        contentType: file.type,
      })
      return stored.key
    })
  )
  return keys
}

export async function s3UploadImages(files: File[]) {
  const keys = await Promise.all(
    files?.map(async (file) => {
      const filename = `${Date.now()}-${file.name}`
      const thumb = await resizeFile(file)
      Storage.put(file.name, file, {
        progressCallback: (progress: any) => {
          console.log(`Uploaded: ${progress.loaded}/${progress.total}`)
        },
        level: 'private',
        contentType: file.type,
      })
      const stored: any = await Storage.put(filename, thumb, {
        contentType: file.type,
      })
      return stored.key
    })
  )
  return keys
}

export async function s3Delete(filename: string) {
  const isDeleted = await Storage.remove(filename)
  await Storage.remove(filename, {
    level: 'private',
  })

  return isDeleted
}

export async function s3DeleteMulti(files: any[]) {
  const isAllDeleted = await Promise.all(
    files?.filter(async (image: any) => {
      const isDeleted = await Storage.remove(image)
      await Storage.remove(image, {
        level: 'private',
      })
      return isDeleted
    })
  )

  return isAllDeleted
}

export const resizeFile = (file: File) =>
  new Promise((resolve) => {
    Resizer.imageFileResizer(
      file,
      500,
      500,
      'PNG',
      80,
      0,
      (uri) => {
        resolve(uri)
      },
      'file'
    )
  })
