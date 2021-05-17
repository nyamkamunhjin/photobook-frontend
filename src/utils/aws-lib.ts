import { Storage } from 'aws-amplify'

export async function s3Upload(file: any) {
  const filename = `${Date.now()}-${file.name}`

  // if we were uploading publicly we can use the Storage.put() method
  const stored: any = await Storage.put(filename, file, {
    contentType: file.type,
  })

  return stored.key
}

export async function s3Delete(filename: string) {
  const isDeleted = await Storage.remove(filename)

  return isDeleted
}
