import { Storage } from 'aws-amplify'
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
