import { API, Storage } from 'aws-amplify'
import { PaginatedParams } from 'ahooks/lib/useAntdTable'
import { buildQuery } from 'utils'
import { ImageCategory, Image, LayoutInterface } from 'interfaces'

export const listImageCategory = async (
  type?: string,
  params?: PaginatedParams[0],
  data?: Record<string, unknown>,
  offset?: ImageCategory
) => {
  let query = params && data ? buildQuery(params, data) : ''
  if (query.length > 0) {
    query += '&'
  }
  query += `categoryType=${type}`
  if (offset && params && params.current !== 1) {
    query += `&offset=${JSON.stringify(offset)}`
  }

  const response = await API.get('photobook', `/categories?${query}`, null)

  if (params) return { list: response?.data, total: response?.count, offset: response?.offset }
  return response?.data
}

export const deleteImageCategory = async (data: unknown) => {
  const response = await API.del('photobook', `/categories`, {
    body: data,
  })
  return response
}

export const updateImageCategory = async (id: string, data: unknown) => {
  const response = await API.put('photobook', `/categories/${id}`, {
    body: data,
  })
  return response
}

export const getImageCategory = async (id: string) => {
  const response = await API.get('photobook', `/categories/${id}`, null)
  return response?.data
}

export const createImageCategory = async (data: unknown) => {
  const response = await API.post('photobook', '/categories', {
    body: data,
  })
  return response
}

export const listImage = async (
  params: PaginatedParams[0],
  data: Record<string, unknown>,
  type: string,
  offset?: Image
) => {
  let query = params ? buildQuery(params, data) : ''
  if (query.length > 0) {
    query += '&'
  }
  query += `type=${type}`
  if (offset && params.current !== 1) {
    query += `&offset=${JSON.stringify(offset)}`
  }

  const response = await API.get('photobook', `/images?${query}`, null)
  const images = await Promise.all(
    response.data.map(async (image: Image) => ({
      ...image,
      tempUrl: await Storage.get(image.imageUrl, { expires: 60 * 60 * 24 * 7 }),
    }))
  )

  if (params) return { list: images, total: response?.count, offset: response?.offset }
  return response
}

export const deleteImage = async (data: unknown) => {
  const response = await API.del('photobook', `/images`, {
    body: data,
  })
  return response
}

export const updateImage = async (id: string, data: unknown) => {
  const response = await API.put('photobook', `/images/${id}`, {
    body: data,
  })
  return response
}

export const getImage = async (id: string) => {
  const response = await API.get('photobook', `/images/${id}`, null)
  return response?.data
}

export const createImage = async (data: unknown) => {
  const response = await API.post('photobook', '/images', {
    body: data,
  })
  return response
}

export const listTemplate = async (
  params: PaginatedParams[0],
  data: Record<string, unknown>,
  type: string,
  offset?: Image
) => {
  let query = params ? buildQuery(params, data) : ''
  if (query.length > 0) {
    query += '&'
  }
  query += `type=${type}`
  if (offset && params.current !== 1) {
    query += `&offset=${JSON.stringify(offset)}`
  }

  const response = await API.get('photobook', `/templates?${query}`, null)
  const images = await Promise.all(
    response.data.map(async (image: Image) => ({
      ...image,
      tempUrl: await Storage.get(image.imageUrl, { expires: 60 * 60 * 24 * 7 }),
    }))
  )

  if (params) return { list: images, total: response?.count, offset: response?.offset }
  return response
}

export const deleteTemplate = async (data: unknown) => {
  const response = await API.del('photobook', `/templates`, {
    body: data,
  })
  return response
}

export const updateTemplate = async (id: string, data: unknown) => {
  const response = await API.put('photobook', `/templates/${id}`, {
    body: data,
  })
  return response
}

export const getTemplate = async (id: string) => {
  const response = await API.get('photobook', `/templates/${id}`, null)
  return response?.data
}

export const createTemplate = async (data: unknown) => {
  const response = await API.post('photobook', '/templates', {
    body: data,
  })
  return response
}

export const listLayout = async (
  params: PaginatedParams[0],
  data: Record<string, unknown>,
  offset?: LayoutInterface
) => {
  let query = params ? buildQuery(params, data) : ''
  if (query.length > 0) {
    query += '&'
  }
  if (offset && params.current !== 1) {
    query += `&offset=${JSON.stringify(offset)}`
  }

  const response = await API.get('photobook', `/layouts?${query}`, null)

  if (params) return { list: response?.data, total: response?.count, offset: response?.offset }
  return response
}

export const deleteLayout = async (data: unknown) => {
  const response = await API.del('photobook', `/layouts`, {
    body: data,
  })
  return response
}

export const updateLayout = async (id: string, data: unknown) => {
  const response = await API.put('photobook', `/layouts/${id}`, {
    body: data,
  })
  return response
}

export const getLayout = async (id: string): Promise<LayoutInterface | null> => {
  if (id.length === 0) return null
  const response = await API.get('photobook', `/layouts/${id}`, null)
  return response?.data
}

export const createLayout = async (data: unknown) => {
  const response = await API.post('photobook', '/layouts', {
    body: data,
  })
  return response
}
