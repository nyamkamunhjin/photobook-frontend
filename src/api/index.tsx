import { Storage } from 'aws-amplify'
import { PaginatedParams } from 'ahooks/lib/useAntdTable'
import { buildQuery } from 'utils'
import { ImageCategory, Image, LayoutInterface, Category, User, TradePhoto } from 'interfaces'

// #region [Import]
import { notification } from 'antd'
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
  if (isMe) {
    localStorage.removeItem('refresh')
    notification.warn({ message: 'Танд хандах эрх байхгүй байна. Дахин нэвтэрнэ үү' })
  } else if (err.response) {
    if (err.response.status === 401) {
      localStorage.removeItem('refresh')
    } else if (err.response.status === 403) {
      notification.warn({ message: 'Танд хандах эрх байхгүй байна.' })
    } else if (err.response.status === 404) {
      notification.warn({ message: 'Олдсонгүй.' })
    }
    // else {
    //   notification.error({ message: err.response.data.message })
    // }
  } else if (err.message === 'Network Error') {
    notification.info({ message: 'Алдаа гарлаа. Дараа дахин оролдоно уу' })
  }
  // else {
  //   notification.error({ message: err.message })
  // }
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
    baseURL: process.env.REACT_APP_BACK_URL as string,
    headers: {
      Authorization: `Bearer ${token}`,
    },
    ...props,
  }
  try {
    const responseInstance = await axios(config)
    const response = responseInstance.data as BaseResponse
    // console.log({ response })
    if (!response.status) {
      // catchError(new Error(response.message), isMe)
      throw new Error(response.message)
    }
    return response || false
  } catch (err) {
    catchError(err, isMe)
    throw err
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

export const listImageCategoryByProject = async (templateId: number) => {
  const response = await BaseRequest({
    url: `image-category/project/${templateId}`,
    method: 'GET',
  })
  const categories = await Promise.all(
    response?.data.map(async (category: ImageCategory) => ({
      ...category,
      images: await Promise.all(
        category.images.map(async (image) => ({
          ...image,
          tempUrl: await Storage.get(image.imageUrl, { expires: 60 * 60 * 24 * 7 }),
        }))
      ),
      frameMasks: await Promise.all(
        category.frameMasks.map(async (frameMask) => ({
          ...frameMask,
          tempFrameUrl: await Storage.get(frameMask.frameUrl, { expires: 60 * 60 * 24 * 7 }),
          tempMaskUrl: await Storage.get(frameMask.maskUrl, { expires: 60 * 60 * 24 * 7 }),
        }))
      ),
    }))
  )
  console.log('categories', categories)
  return categories
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
export const listMyImages = async (params?: PaginatedParams[0], data?: Record<string, unknown>) => {
  const query = params && data ? buildQuery(params, data) : ''

  const response = await BaseRequest({
    url: `image/user-images?${query}`,
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

export const listTradeImages = async (params?: PaginatedParams[0], data?: Record<string, unknown>) => {
  const query = params && data ? buildQuery(params, data) : ''

  const response = await BaseRequest({
    url: `image?type=tradePhoto&${query}`,
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
  console.log('images', images)
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

export const createMultiImage = async (data: Object) => {
  const response = await BaseRequest({
    url: 'image/many',
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

  const project = response?.data
  project.forEach(async (template: any) => {
    template.tempUrl = await Storage.get(template.imageUrl, { expires: 60 * 60 * 24 * 7 })
  })

  if (params) return { list: project, total: response?.totalCount, offset: response?.offset }
  return project
}

export const updateProjectImages = async (data: Object, projectId: number) => {
  const response = await BaseRequest({
    url: `project/${projectId}/images`,
    method: 'PUT',
    data,
  })
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

export const updateProjectPrintSlides = async (id: number, data: Object) => {
  const response = await BaseRequest({
    url: `project/${id}/print/slides`,
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

export const signUp = async (data: any) => {
  const response = await BaseRequest({
    url: `auth/signup`,
    method: 'POST',
    data,
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

export const verifyEmail = async () => {
  const response = await BaseRequest({
    url: `auth/verify-email`,
    method: 'GET',
  })
  return response
}

export const forgotPassword = async (email: string) => {
  const response = await BaseRequest({
    url: `auth/forgot-password`,
    method: 'POST',
    data: { email },
  })
  return response
}

export const changePassword = async (token: string, data: any) => {
  const response = await BaseRequest({
    url: `auth/change-password/${token}`,
    method: 'POST',
    data,
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

// #region [ShippingAddress]
export const listShippingAddress = async (
  params?: PaginatedParams[0],
  data?: Record<string, unknown>,
  offset?: number
) => {
  let query = params && data ? buildQuery(params, data) : ''
  if (offset && params && params.current !== 1) {
    query += `&offset=${JSON.stringify(offset)}`
  }

  const response = await BaseRequest({
    url: `shipping-address?${query}`,
    method: 'GET',
  })

  if (params) return { list: response?.data, total: response?.totalCount, offset: response?.offset }
  return response?.data
}

export const createShippingAddress = async (data: object) => {
  const response = await BaseRequest({
    url: `shipping-address`,
    method: 'POST',
    data,
  })
  return response
}

export const deleteShippingAddress = async (id: number) => {
  const response = await BaseRequest({
    url: `shipping-address/${id}`,
    method: 'DELETE',
  })
  return response
}

export const updateShippingAddress = async (id: number, data: Object) => {
  const response = await BaseRequest({
    url: `shipping-address/${id}`,
    method: 'PUT',
    data,
  })
  return response
}

export const getShippingAddress = async (id: number) => {
  const response = await BaseRequest({
    url: `shipping-address/${id}`,
    method: 'GET',
  })
  return response?.data
}
// #endregion [ShippingAddress]

// #region [Facebook]
export const getFacebookAlbums = async () => {
  const token = localStorage.getItem('facebookAccessToken')
  const response = await axios.get(`https://graph.facebook.com/v10.0/me/albums?access_token=${token}`)
  return response.data.data
}

export const getFacebookImages = async (album: string) => {
  if (album.length === 0) return []
  const token = localStorage.getItem('facebookAccessToken')
  const response = await axios.get(
    `https://graph.facebook.com/v10.0/${album}/photos?access_token=${token}&fields=id%2Cimages%2Cname%2Cpicture%2Ccreated_time`
  )
  return response.data?.data
}

export const getFacebookProfile = async () => {
  const token = localStorage.getItem('facebookAccessToken')
  const response = await axios.get(
    `https://graph.facebook.com/v10.0/me?access_token=${token}&fields=id%2Cfirst_name%2Clast_name%2Cpicture`
  )
  return response.data
}
// #endregion [Facebook]

// #region [Google]
export const getGoogleProfile = async () => {
  const response = await BaseRequest({
    url: `google/profile`,
    method: 'GET',
  })
  return response?.data
}

export const getGoogleImages = async (token?: string) => {
  const response = await BaseRequest({
    url: `google/images?nextToken=${token}`,
    method: 'GET',
  })
  return { list: response?.data.mediaItems, nextId: response?.data.nextPageToken }
}
// #endregion [Google]

// #region [LandingPageHero]
export const listLandingPageHero = async () => {
  const response = await BaseRequest({
    url: `landing/hero`,
    method: 'GET',
  })
  return response?.data
}

// #endregion [LandingPageHero]

// #region [LandingPageFeature]
export const listLandingPageFeature = async () => {
  const response = await BaseRequest({
    url: `landing/feature`,
    method: 'GET',
  })
  return response?.data
}

// #endregion [LandingPageFeature]

// #region [LandingPageReview]
export const listLandingPageReview = async () => {
  const response = await BaseRequest({
    url: `landing/review`,
    method: 'GET',
  })
  return response?.data
}

// #endregion [LandingPageReview]

// #region [LandingPageImageCarousel]
export const listLandingPageImageCarousel = async () => {
  const response = await BaseRequest({
    url: `landing/image-carousel`,
    method: 'GET',
  })
  return response?.data
}

// #endregion [LandingPageImageCarousel]

// #region [LandingPageShowCase]
export const listLandingPageShowCase = async () => {
  const response = await BaseRequest({
    url: `landing/show-case`,
    method: 'GET',
  })
  return response?.data
}

// #endregion [LandingPageShowCase]

// #region [ProductAd]
export const listProductAd = async (templateType: string) => {
  const response = await BaseRequest({
    url: `product/image/get`,
    method: 'POST',
    data: {
      templateType,
    },
  })

  return response?.data
}

// #endregion [ProductAd]

// #region [HeaderAd]
export const listHeaderAd = async (templateType: string) => {
  const response = await BaseRequest({
    url: `header/image/get`,
    method: 'POST',
    data: {
      templateType,
    },
  })

  return response?.data
}
// #endregion [HeaderAd]

// #region [ShoppingCart]
export const listShoppingCart = async () => {
  const response = await BaseRequest({
    url: `shopping-cart`,
    method: 'GET',
  })

  response?.data?.cartItems.forEach(async (record: any) => {
    record.project.tempUrl = await Storage.get(record.project.imageUrl, { expires: 60 * 60 * 24 * 7 })
  })

  return response?.data
}

export const deleteCartItem = async (data: object) => {
  const response = await BaseRequest({
    url: `cart-item`,
    method: 'DELETE',
    data,
  })
  return response
}

export const updateCartItem = async (id: number, data: Object) => {
  const response = await BaseRequest({
    url: `cart-item/${id}`,
    method: 'PUT',
    data,
  })
  return response
}

export const getCartItem = async (id: string) => {
  const response = await BaseRequest({
    url: `cart-item/${id}`,
    method: 'GET',
  })
  return response?.data
}

export const createCartItem = async (data: Object) => {
  const response = await BaseRequest({
    url: 'cart-item',
    method: 'POST',
    data,
  })
  return response
}

export const getShoppingCartSummary = async (data: { isShipping: boolean }) => {
  const response = await BaseRequest({
    url: 'shopping-cart/summary',
    method: 'POST',
    data,
  })
  return response?.data
}

// #endregion [ShoppingCart]

// #region [Order]
export const listOrder = async (params?: PaginatedParams[0], data?: Record<string, unknown>, offset?: number) => {
  let query = params && data ? buildQuery(params, data) : ''
  if (offset && params && params.current !== 1) {
    query += `&offset=${JSON.stringify(offset)}`
  }

  const response = await BaseRequest({
    url: `order/user?${query}`,
    method: 'GET',
  })

  if (params) return { list: response?.data, total: response?.totalCount, offset: response?.offset }
  return response?.data
}

export const deleteOrder = async (data: object) => {
  const response = await BaseRequest({
    url: `order`,
    method: 'DELETE',
    data,
  })
  return response
}

export const updateOrder = async (id: number, data: Object) => {
  const response = await BaseRequest({
    url: `order/${id}`,
    method: 'PUT',
    data,
  })
  return response
}

export const getOrder = async (id: string) => {
  const response = await BaseRequest({
    url: `order/${id}`,
    method: 'GET',
  })
  return response?.data
}

export const createOrder = async (data: { isShipping: boolean; address?: number }) => {
  const response = await BaseRequest({
    url: 'order',
    method: 'POST',
    data,
  })
  return response?.data
}
// #endregion [Order]

// #region [Voucher]
export const listVoucher = async (params?: PaginatedParams[0], data?: Record<string, unknown>, offset?: number) => {
  let query = params && data ? buildQuery(params, data) : ''
  if (offset && params && params.current !== 1) {
    query += `&offset=${JSON.stringify(offset)}`
  }

  const response = await BaseRequest({
    url: `voucher/user?${query}`,
    method: 'GET',
  })

  if (params) return { list: response?.data, total: response?.totalCount, offset: response?.offset }
  return response?.data
}

export const getVoucher = async (id: string) => {
  const response = await BaseRequest({
    url: `voucher/${id}`,
    method: 'GET',
  })
  return response?.data
}

export const addVoucherToCartItem = async (id: string) => {
  const response = await BaseRequest({
    url: `voucher/apply/${id}`,
    method: 'PUT',
  })
  return response?.data
}
// #endregion [Voucher]

// #region [GiftCard]
export const listBoughtGiftCard = async (
  params?: PaginatedParams[0],
  data?: Record<string, unknown>,
  offset?: number
) => {
  let query = params && data ? buildQuery(params, data) : ''
  if (offset && params && params.current !== 1) {
    query += `&offset=${JSON.stringify(offset)}`
  }

  const response = await BaseRequest({
    url: `gift-card/user-bought?${query}`,
    method: 'GET',
  })

  response?.data.forEach((each: any) => {
    each.imageUrl = `${process.env.REACT_APP_PUBLIC_IMAGE}${each.imageUrl}`
  })

  if (params) return { list: response?.data, total: response?.totalCount, offset: response?.offset }
  return response?.data
}

export const listActivatedGiftCard = async (
  params?: PaginatedParams[0],
  data?: Record<string, unknown>,
  offset?: number
) => {
  let query = params && data ? buildQuery(params, data) : ''
  if (offset && params && params.current !== 1) {
    query += `&offset=${JSON.stringify(offset)}`
  }

  const response = await BaseRequest({
    url: `gift-card/user-activated?${query}`,
    method: 'GET',
  })

  response?.data?.forEach((each: any) => {
    each.imageUrl = `${process.env.REACT_APP_PUBLIC_IMAGE}${each.imageUrl}`
  })

  if (params) return { list: response?.data, total: response?.totalCount, offset: response?.offset }
  return response?.data
}

export const getGiftCard = async (id: string) => {
  const response = await BaseRequest({
    url: `gift-card/${id}`,
    method: 'GET',
  })
  return response?.data
}

export const buyGiftCard = async (giftCardTypeId: number) => {
  const response = await BaseRequest({
    url: `gift-card`,
    method: 'POST',
    data: {
      giftCardTypeId,
    },
  })
  return response?.data
}

export const activateGiftCard = async (code: string) => {
  const response = await BaseRequest({
    url: `gift-card/${code}`,
    method: 'PUT',
  })
  return response?.data
}

export const addGiftCardToShoppingCart = async (id: number | string, type: 'attach' | 'detach') => {
  const response = await BaseRequest({
    url: `gift-card/attach/${id}`,
    method: 'PUT',
    data: {
      actionType: type,
    },
  })
  return response?.data
}
// #endregion [GiftCard]

// #region [GiftCardType]
export const listGiftCardType = async (
  params?: PaginatedParams[0],
  data?: Record<string, unknown>,
  offset?: number
) => {
  let query = params && data ? buildQuery(params, data) : ''
  if (offset && params && params.current !== 1) {
    query += `&offset=${JSON.stringify(offset)}`
  }

  const response = await BaseRequest({
    url: `gift-card-type?${query}`,
    method: 'GET',
  })

  response?.data?.forEach(async (each: any) => {
    each.tempUrl = await Storage.get(each.imageUrl, { expires: 60 * 60 * 24 * 7 }).catch(() => each.imageUrl)
  })

  if (params) return { list: response?.data, total: response?.totalCount, offset: response?.offset }
  return response?.data
}

export const getGiftCardType = async (id: string) => {
  const response = await BaseRequest({
    url: `gift-card-type/${id}`,
    method: 'GET',
  })
  return response?.data
}

// #endregion [GiftCardType]

// #region Payment

export const listPaymentTypes = async (data: { isShipping: boolean }) => {
  const response = await BaseRequest({
    url: 'payment-types',
    method: 'GET',
    data,
  })
  return response?.data
}

export const paymentCheckOrganization = async (value: string) => {
  const response = await BaseRequest({
    url: `payment/organization/check/${value}`,
    method: 'GET',
  })
  return response?.data
}

export const paymentSocialPay = async (data: Object) => {
  const response = await BaseRequest({
    url: 'payment/socialpay/create',
    method: 'POST',
    data,
  })
  return response?.data
}

export const paymentQPay = async (data: Object) => {
  const response = await BaseRequest({
    url: 'payment/qpay/create',
    method: 'POST',
    data,
  })
  return response?.data
}

export const checkPaymentQPay = async (id: string) => {
  const response = await BaseRequest({
    url: `payment/qpay/check`,
    method: 'GET',
  })
  return response?.data
}

// #endregion [GiftCardType]

// #region [TradePhoto]
export const listTradePhoto = async (params?: PaginatedParams[0], data?: Record<string, unknown>, offset?: number) => {
  let query = params && data ? buildQuery(params, data) : ''
  if (offset && params && params.current !== 1) {
    query += `&offset=${JSON.stringify(offset)}`
  }

  const response = await BaseRequest({
    url: `trade-photo?${query}`,
    method: 'GET',
  })

  response?.data?.forEach(async (each: any) => {
    each.tempUrl = await Storage.get(each.imageUrl, { expires: 60 * 60 * 24 * 7 }).catch(() => each.imageUrl)
  })

  if (params) return { list: response?.data, total: response?.totalCount, offset: response?.offset }
  return response?.data
}

export const listUserSellingPhotos = async (
  params?: PaginatedParams[0],
  data?: Record<string, unknown>,
  offset?: number
) => {
  let query = params && data ? buildQuery(params, data) : ''
  if (offset && params && params.current !== 1) {
    query += `&offset=${JSON.stringify(offset)}`
  }

  const response = await BaseRequest({
    url: `trade-photo/user-selling-photos?${query}`,
    method: 'GET',
  })

  response?.data?.forEach(async (each: any) => {
    each.tempUrl = await Storage.get(each.imageUrl, { expires: 60 * 60 * 24 * 7 }).catch(() => each.imageUrl)
  })

  if (params) return { list: response?.data, total: response?.totalCount, offset: response?.offset }
  return response?.data
}

export const listUserPurchasedPhotos = async (
  params?: PaginatedParams[0],
  data?: Record<string, unknown>,
  offset?: number
) => {
  let query = params && data ? buildQuery(params, data) : ''
  if (offset && params && params.current !== 1) {
    query += `&offset=${JSON.stringify(offset)}`
  }

  const response = await BaseRequest({
    url: `trade-photo/user-bought-photos?${query}`,
    method: 'GET',
  })

  response?.data?.forEach(async (each: any) => {
    each.tempUrl = await Storage.get(each.imageUrl, { expires: 60 * 60 * 24 * 7 }).catch(() => each.imageUrl)
  })

  if (params) return { list: response?.data, total: response?.totalCount, offset: response?.offset }
  return response?.data
}

export const getTradePhoto = async (id: string) => {
  const response = await BaseRequest({
    url: `trade-photo/${id}`,
    method: 'GET',
  })
  return response?.data
}

export const uploadPhoto = async (data: Partial<TradePhoto>) => {
  const response = await BaseRequest({
    url: `trade-photo`,
    method: 'POST',
    data,
  })
  return response?.data
}

export const buyPhoto = async (id: string) => {
  const response = await BaseRequest({
    url: `trade-photo/buy/${id}`,
    method: 'PUT',
  })
  return response?.data
}

export const editPhoto = async (id: string, data: Partial<TradePhoto>) => {
  const response = await BaseRequest({
    url: `trade-photo/${id}`,
    method: 'PUT',
    data,
  })
  return response?.data
}
// #endregion [TradePhoto]

// #region [TradePhotoCategory]
export const listTradePhotoCategory = async (
  params?: PaginatedParams[0],
  data?: Record<string, unknown>,
  offset?: number
) => {
  let query = params && data ? buildQuery(params, data) : ''
  if (offset && params && params.current !== 1) {
    query += `&offset=${JSON.stringify(offset)}`
  }

  const response = await BaseRequest({
    url: `trade-photo-category?${query}`,
    method: 'GET',
  })

  response?.data?.forEach(async (each: any) => {
    each.tempUrl = await Storage.get(each.imageUrl, { expires: 60 * 60 * 24 * 7 }).catch(() => each.imageUrl)
  })

  if (params) return { list: response?.data, total: response?.totalCount, offset: response?.offset }
  return response?.data
}

// #endregion [TradePhotoCategory]

export const paymentBank = async (data: Object) => {
  const response = await BaseRequest({
    url: 'payment/bank/create',
    method: 'POST',
    data,
  })
  return response?.data
}

// #endregion

// #region [PaymentWebhook]
export const webhookQpay = async (id: string | number) => {
  const response = await BaseRequest({
    url: `webhook/qpay/${id}`,
    method: 'GET',
  })
  return response?.data
}

export const webhookSocialPay = async (id: string | number) => {
  const response = await BaseRequest({
    url: `webhook/socialpay/${id}`,
    method: 'GET',
  })
  return response?.data
}

// #endregion
