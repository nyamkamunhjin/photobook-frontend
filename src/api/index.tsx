import { Storage } from 'aws-amplify'
import { PaginatedParams } from 'ahooks/lib/useAntdTable'
import { buildQuery } from 'utils'
import { ImageCategory, Image, LayoutInterface, Category, User } from 'interfaces'

// #region [Import]
import { message } from 'antd'
import axios, { AxiosRequestConfig, Method } from 'axios'
// #endregion

// #region [Response]
export interface BaseResponse {
  status: number
  message: string
  totalCount?: any
  offset?: any
  limit?: any
  data?: any
}
// #endregion

// #region [BaseRequest]
interface BaseRequestProps {
  url: string
  method: Method
  params?: Object
  data?: Object
}

const catchError = (err: any, isMe: boolean) => {
  // const isLogin = window.location.pathname.startsWith('/auth/signin')
  if (isMe) {
    localStorage.removeItem('token')
    localStorage.removeItem('refresh')
    message.warn({ content: 'Танд хандах эрх байхгүй байна. Дахин нэвтэрнэ үү' })
    // if (!isLogin) window.location.replace('/auth/signin')
  } else if (err.response) {
    if (err.response.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('refresh')
      // message.warn({ content: 'Танд хандах эрх байхгүй байна. Дахин нэвтэрнэ үү' })
      // if (!isLogin) window.location.replace('/auth/signin')
    } else if (err.response.status === 403) {
      message.warn({ content: 'Танд хандах эрх байхгүй байна.' })
    } else if (err.response.status === 404) {
      message.warn({ content: 'Олдсонгүй.' })
    } else {
      message.error({ content: err.response.data.message })
    }
  } else if (err.message === 'Network Error') {
    message.info({ content: 'Алдаа гарлаа. Дараа дахин оролдоно уу' })
  } else {
    message.error({ content: err.message })
  }
}

export const BaseRequest = async ({ ...props }: BaseRequestProps) => {
  const isMe = props.url === 'user/me'
  const token = localStorage.getItem('token')
  const locale = localStorage.getItem('locale') || 'mn'
  axios.defaults.headers.common.Accept = 'application/json'
  axios.defaults.headers.common['Accept-Language'] = locale || 'mn'
  axios.defaults.headers.common['Content-Type'] = 'application/json'
  axios.defaults.headers.common['Access-Control-Allow-Headers'] = '*'
  // if (token) axios.defaults.headers.common.Authorization = `Bearer ${token}`
  const config: AxiosRequestConfig = {
    baseURL: process.env.REACT_APP_BACK_URL,
    headers: {
      Authorization: `Bearer ${token}`,
    },
    ...props,
  }
  try {
    const responseInstance = await axios(config)
    const response = responseInstance.data as BaseResponse
    if (!response.status) {
      // catchError(new Error(response.message), isMe)
      return null
    }
    return response || false
  } catch (err) {
    catchError(err, isMe)
    return null
  }
}
// #endregion

// #region [ImageCategory]
export const listImageCategory = async (type?: string, params?: PaginatedParams[0], data?: Record<string, unknown>) => {
  let query = params && data ? buildQuery(params, data) : ''
  if (query.length > 0) {
    query += '&'
  }
  query += `type=${type}`

  const response = await BaseRequest({
    url: `image-category?${query}`,
    method: 'GET',
  })

  if (params) return { list: response?.data, total: response?.totalCount, offset: response?.offset }
  return response?.data
}

export const getImageCategory = async (id: number) => {
  const response = await BaseRequest({
    url: `image-category/${id}`,
    method: 'GET',
  })
  return response?.data
}

// #endregion [ImageCategory]

// #region [Image]

export const listImage = async (type?: string, params?: PaginatedParams[0], data?: Record<string, unknown>) => {
  let query = params && data ? buildQuery(params, data) : ''
  if (type) {
    if (query.length > 0) {
      query += '&'
    }
    query += `type=${type}`
  }
  const response = await BaseRequest({
    url: `image?${query}`,
    method: 'GET',
  })
  const images = await Promise.all(
    response?.data.map(async (image: Image) => ({
      ...image,
      tempUrl: await Storage.get(image.imageUrl, { expires: 60 * 60 * 24 * 7 }),
    }))
  )
  if (params) return { list: images, total: response?.totalCount, offset: response?.offset }
  return images
}

export const deleteImage = async (data: object) => {
  const response = await BaseRequest({
    url: `image`,
    method: 'DELETE',
    data,
  })

  return response
}

export const updateImage = async (id: string, data: Object) => {
  const response = await BaseRequest({
    url: `image/${id}`,
    method: 'PUT',
    data,
  })
  return response
}

export const getImage = async (id: string) => {
  const response = await BaseRequest({
    url: `image/${id}`,
    method: 'GET',
  })
  return response?.data
}

export const createImage = async (data: Object) => {
  const response = await BaseRequest({
    url: 'image',
    method: 'POST',
    data,
  })
  return response?.data
}

// #endregion [Image]

// #region [Template]

export const listTemplate = async (params?: PaginatedParams[0], data?: Record<string, unknown>, offset?: number) => {
  let query = params && data ? buildQuery(params, data) : ''
  if (offset && params && params.current !== 1) {
    query += `&offset=${JSON.stringify(offset)}`
  }

  const response = await BaseRequest({
    url: `template?${query}`,
    method: 'GET',
  })

  const templates = response?.data
  templates.forEach(async (template: any) => {
    template.tempUrl = await Storage.get(template.imageUrl, { expires: 60 * 60 * 24 * 7 }).catch(
      () => template.imageUrl
    )
    console.log(template.tempUrl)
  })

  if (params) return { list: templates, total: response?.totalCount, offset: response?.offset }
  return templates
}

export const getTemplate = async (id: number | string) => {
  const response = await BaseRequest({
    url: `template/${id}`,
    method: 'GET',
  })

  const template = response?.data
  template.tempUrl = await Storage.get(template.imageUrl, { expires: 60 * 60 * 24 * 7 }).catch(() => template.imageUrl)

  return response?.data
}

// #endregion [Template]

// #region [TemplateCategory]
export const listTemplateCategory = async (
  params?: PaginatedParams[0],
  data?: Record<string, unknown>,
  offset?: Category
) => {
  let query = params && data ? buildQuery(params, data) : ''
  if (offset && params && params.current !== 1) {
    query += `&offset=${JSON.stringify(offset)}`
  }

  const response = await BaseRequest({
    url: `category?${query}`,
    method: 'GET',
  })

  if (params) return { list: response?.data, total: response?.totalCount, offset: response?.offset }
  return response?.data
}

export const getTemplateCategory = async (id: number) => {
  const response = await BaseRequest({
    url: `category/${id}`,
    method: 'GET',
  })
  return response?.data
}

// #endregion [TemplateCategory]

// #region [Layout]

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

  const response = await BaseRequest({
    url: `layout?${query}`,
    method: 'GET',
  })

  if (params) return { list: response?.data, total: response?.totalCount, offset: response?.offset }
  return response
}

export const getLayout = async (id: string): Promise<LayoutInterface | null> => {
  if (id.length === 0) return null
  const response = await BaseRequest({
    url: `layout/${id}`,
    method: 'GET',
  })
  return response?.data
}

// #endregion [Layout]

// #region [LayoutCategory]
export const listLayoutCategory = async (
  params?: PaginatedParams[0],
  data?: Record<string, unknown>,
  offset?: ImageCategory
) => {
  let query = params && data ? buildQuery(params, data) : ''
  if (offset && params && params.current !== 1) {
    query += `&offset=${JSON.stringify(offset)}`
  }

  const response = await BaseRequest({
    url: `layout-category?${query}`,
    method: 'GET',
  })

  if (params) return { list: response?.data, total: response?.totalCount, offset: response?.offset }
  return response?.data
}

export const getLayoutCategory = async (id: number) => {
  const response = await BaseRequest({
    url: `layout-category/${id}`,
    method: 'GET',
  })
  return response?.data
}

// #endregion [LayoutCategory]

// #region [LayoutProject]
export const listProject = async (params?: PaginatedParams[0], data?: Record<string, unknown>, offset?: number) => {
  let query = params && data ? buildQuery(params, data) : ''
  if (offset && params && params.current !== 1) {
    query += `&offset=${JSON.stringify(offset)}`
  }

  const response = await BaseRequest({
    url: `project?${query}`,
    method: 'GET',
  })

  if (params) return { list: response?.data, total: response?.totalCount, offset: response?.offset }
  return response?.data
}

export const deleteProject = async (data: object) => {
  const response = await BaseRequest({
    url: `project`,
    method: 'DELETE',
    data,
  })
  return response
}

export const updateProject = async (id: number, data: Object) => {
  const response = await BaseRequest({
    url: `project/${id}`,
    method: 'PUT',
    data,
  })
  return response
}

export const updateProjectSlides = async (id: number, data: Object) => {
  const response = await BaseRequest({
    url: `project/${id}/slides`,
    method: 'PUT',
    data,
  })
  return response
}

export const getProject = async (id: string) => {
  const response = await BaseRequest({
    url: `project/${id}`,
    method: 'GET',
  })
  return response?.data
}

export const getProjectByUuid = async (id: string) => {
  const response = await BaseRequest({
    url: `project/uuid/${id}`,
    method: 'GET',
  })
  return response?.data
}

export const createProject = async (data: Object) => {
  const response = await BaseRequest({
    url: 'project',
    method: 'POST',
    data,
  })
  return response
}

// #endregion [LayoutProject]

// #region [BindingType]
export const listBindingType = async (params?: PaginatedParams[0], data?: Record<string, unknown>, offset?: number) => {
  let query = params && data ? buildQuery(params, data) : ''
  if (offset && params && params.current !== 1) {
    query += `&offset=${JSON.stringify(offset)}`
  }

  const response = await BaseRequest({
    url: `binding-type?${query}`,
    method: 'GET',
  })

  const bindingTypes = response?.data
  bindingTypes.forEach(async (bindingType: any) => {
    bindingType.tempUrl = await Storage.get(bindingType.imageUrl, { expires: 60 * 60 * 24 * 7 }).catch(
      () => bindingType.imageUrl
    )
    bindingType.tempFeatureUrl = await Storage.get(bindingType.featureImageUrl, { expires: 60 * 60 * 24 * 7 }).catch(
      () => bindingType.featureImageUrl
    )
  })

  if (params) return { list: bindingTypes, total: response?.totalCount, offset: response?.offset }
  return bindingTypes
}

export const getBindingType = async (id: number) => {
  const response = await BaseRequest({
    url: `binding-type/${id}`,
    method: 'GET',
  })
  const bindingType = response?.data
  bindingType.tempUrl = await Storage.get(bindingType.imageUrl, { expires: 60 * 60 * 24 * 7 })
  bindingType.tempFeatureUrl = await Storage.get(bindingType.featureImageUrl, { expires: 60 * 60 * 24 * 7 })
  return bindingType
}

// #endregion [BindingType]

// #region [listPaperSize]
export const listPaperSize = async (params?: PaginatedParams[0], data?: Record<string, unknown>, offset?: number) => {
  let query = params && data ? buildQuery(params, data) : ''
  if (offset && params && params.current !== 1) {
    query += `&offset=${JSON.stringify(offset)}`
  }

  const response = await BaseRequest({
    url: `paper-size?${query}`,
    method: 'GET',
  })

  if (params) return { list: response?.data, total: response?.totalCount, offset: response?.offset }
  return response?.data
}

export const getPaperSize = async (id: number) => {
  const response = await BaseRequest({
    url: `paper-size/${id}`,
    method: 'GET',
  })
  return response?.data
}

export const createPaperSize = async (data: Object) => {
  const response = await BaseRequest({
    url: 'paper-size',
    method: 'POST',
    data,
  })
  return response
}

// #endregion [PaperSize]

// #region [CoverMaterial]
export const listCoverMaterial = async (
  params?: PaginatedParams[0],
  data?: Record<string, unknown>,
  offset?: number
) => {
  let query = params && data ? buildQuery(params, data) : ''
  if (offset && params && params.current !== 1) {
    query += `&offset=${JSON.stringify(offset)}`
  }

  const response = await BaseRequest({
    url: `cover-material?${query}`,
    method: 'GET',
  })

  const coverMaterials = response?.data
  coverMaterials.forEach(async (coverMaterial: any) => {
    coverMaterial.tempUrl = await Storage.get(coverMaterial.imageUrl, { expires: 60 * 60 * 24 * 7 }).catch(
      () => coverMaterial.imageUrl
    )
  })

  if (params) return { list: coverMaterials, total: response?.totalCount, offset: response?.offset }
  return coverMaterials
}

export const getCoverMaterial = async (id: number) => {
  const response = await BaseRequest({
    url: `cover-material/${id}`,
    method: 'GET',
  })
  const coverMaterials = response?.data
  coverMaterials.tempUrl = await Storage.get(coverMaterials.imageUrl, { expires: 60 * 60 * 24 * 7 })
  return coverMaterials
}

export const createCoverMaterial = async (data: Object) => {
  const response = await BaseRequest({
    url: 'cover-material',
    method: 'POST',
    data,
  })
  return response
}

// #endregion [CoverMaterial]

// #region [CoverType]
export const listCoverType = async (params?: PaginatedParams[0], data?: Record<string, unknown>, offset?: number) => {
  let query = params && data ? buildQuery(params, data) : ''
  if (offset && params && params.current !== 1) {
    query += `&offset=${JSON.stringify(offset)}`
  }

  const response = await BaseRequest({
    url: `cover-type?${query}`,
    method: 'GET',
  })

  const coverTypes = response?.data
  coverTypes.forEach(async (coverType: any) => {
    coverType.tempUrl = await Storage.get(coverType.imageUrl, { expires: 60 * 60 * 24 * 7 }).catch(
      () => coverType.imageUrl
    )
    coverType.tempFeatureUrl = await Storage.get(coverType.featureImageUrl, { expires: 60 * 60 * 24 * 7 })
  })

  if (params) return { list: coverTypes, total: response?.totalCount, offset: response?.offset }
  return coverTypes
}

export const getCoverType = async (id: string) => {
  const response = await BaseRequest({
    url: `cover-type/${id}`,
    method: 'GET',
  })

  const coverType = response?.data
  coverType.tempUrl = await Storage.get(coverType.imageUrl, { expires: 60 * 60 * 24 * 7 }).catch(
    () => coverType.imageUrl
  )
  coverType.tempFeatureUrl = await Storage.get(coverType.featureImageUrl, { expires: 60 * 60 * 24 * 7 })

  return response?.data
}

// #endregion [CoverType]

// #region [PaperMaterial]
export const listPaperMaterial = async (
  params?: PaginatedParams[0],
  data?: Record<string, unknown>,
  offset?: number
) => {
  let query = params && data ? buildQuery(params, data) : ''
  if (offset && params && params.current !== 1) {
    query += `&offset=${JSON.stringify(offset)}`
  }

  const response = await BaseRequest({
    url: `paper-material?${query}`,
    method: 'GET',
  })

  const paperMaterials = response?.data
  paperMaterials.forEach(async (paperMaterial: any) => {
    paperMaterial.tempUrl = await Storage.get(paperMaterial.imageUrl, { expires: 60 * 60 * 24 * 7 }).catch(
      () => paperMaterial.imageUrl
    )
    paperMaterial.tempFeatureUrl = await Storage.get(paperMaterial.featureImageUrl, { expires: 60 * 60 * 24 * 7 })
  })

  if (params) return { list: paperMaterials, total: response?.totalCount, offset: response?.offset }
  return paperMaterials
}

export const getPaperMaterial = async (id: number) => {
  const response = await BaseRequest({
    url: `paper-material/${id}`,
    method: 'GET',
  })
  const material = response?.data
  material.tempUrl = await Storage.get(material.imageUrl, { expires: 60 * 60 * 24 * 7 })
  return material
}

// #endregion [PaperMaterial]

// #region [FrameMaterial]
export const listFrameMaterial = async (
  params?: PaginatedParams[0],
  data?: Record<string, unknown>,
  offset?: number
) => {
  let query = params && data ? buildQuery(params, data) : ''
  if (offset && params && params.current !== 1) {
    query += `&offset=${JSON.stringify(offset)}`
  }

  const response = await BaseRequest({
    url: `frame-material?${query}`,
    method: 'GET',
  })

  const frameMaterials = response?.data

  frameMaterials.forEach(async (material: any) => {
    material.tempUrl = await Storage.get(material.imageUrl, { expires: 60 * 60 * 24 * 7 }).catch(
      () => material.imageUrl
    )
  })

  if (params) return { list: frameMaterials, total: response?.totalCount, offset: response?.offset }
  return frameMaterials
}

export const getFrameMaterial = async (id: number) => {
  const response = await BaseRequest({
    url: `frame-material/${id}`,
    method: 'GET',
  })
  const material = response?.data
  material.tempUrl = await Storage.get(material.imageUrl, { expires: 60 * 60 * 24 * 7 })
  return material
}

// #endregion [FrameMaterial]

// #region [TemplateType]
export const listTemplateType = async (
  params?: PaginatedParams[0],
  data?: Record<string, unknown>,
  offset?: number
) => {
  let query = params && data ? buildQuery(params, data) : ''
  if (offset && params && params.current !== 1) {
    query += `&offset=${JSON.stringify(offset)}`
  }

  const response = await BaseRequest({
    url: `template-type?${query}`,
    method: 'GET',
  })

  if (params) return { list: response?.data, total: response?.totalCount, offset: response?.offset }
  return response?.data
}
// #endregion [TemplateType]

// #region [CoverMaterialColors]
export const listCoverMaterialColors = async (
  params?: PaginatedParams[0],
  data?: Record<string, unknown>,
  offset?: number
) => {
  let query = params && data ? buildQuery(params, data) : ''
  if (offset && params && params.current !== 1) {
    query += `&offset=${JSON.stringify(offset)}`
  }

  const response = await BaseRequest({
    url: `cover-material-color?${query}`,
    method: 'GET',
  })

  const coverMaterialColors = response?.data
  coverMaterialColors.forEach(async (coverMaterialColor: any) => {
    coverMaterialColor.tempUrl = await Storage.get(coverMaterialColor.imageUrl, { expires: 60 * 60 * 24 * 7 }).catch(
      () => coverMaterialColor.imageUrl
    )
    coverMaterialColor.tempFeatureUrl = await Storage.get(coverMaterialColor.featureImageUrl, {
      expires: 60 * 60 * 24 * 7,
    })
  })

  if (params) return { list: coverMaterialColors, total: response?.totalCount, offset: response?.offset }
  return coverMaterialColors
}

export const getCoverMaterialColor = async (id: number) => {
  const response = await BaseRequest({
    url: `cover-material-color/${id}`,
    method: 'GET',
  })
  const coverMaterialColor = response?.data
  coverMaterialColor.tempUrl = await Storage.get(coverMaterialColor.imageUrl, { expires: 60 * 60 * 24 * 7 })
  return coverMaterialColor
}
// #endregion [CoverMaterialColors]

// #region [Authentication]
export const signIn = async (email: string, password: string) => {
  const response = await BaseRequest({
    url: `auth/signin`,
    method: 'POST',
    data: { email, password },
  })
  return response
}

export const signUp = async (email: string, password: string) => {
  const response = await BaseRequest({
    url: `auth/signup`,
    method: 'POST',
    data: { email, password },
  })
  return response
}

export const getCurrentUser = async () => {
  const response = await BaseRequest({
    url: `auth/user`,
    method: 'GET',
  })
  return response
}

export const updateCurrentUser = async (data: Partial<User>) => {
  const response = await BaseRequest({
    url: `user`,
    method: 'PUT',
    data,
  })
  return response
}
// #endregion [Authentication]
