export type DomType = HTMLElement

export type ObjectType = 'image' | 'object' | 'text' | 'shape' | ''
export interface StyleType {
  display?: string
  filterName?: string
  brightness?: number
  borderWidth?: string
  contrast?: number
  transform?: string
  saturation?: number
  rgb?: RGB
  rotateAngle?: number
  top?: number | string
  width?: number | string
  height?: number | string
  left?: number | string
  opacity?: string
  backgroundColor?: string
  borderImage?: string
  borderColor?: string
  borderImageSource?: string
  borderImageRepeat?: string
  borderImageSlice?: number
  maskImage?: string
  WebkitMaskImage?: string
  zIndex?: string
  filter?: string
}

export interface ProjectCreate {
  paperSizeId: number,
  coverTypeId?: number,
  bindingTypeId?: number
  coverMaterialId?: number
  coverColorId?: number
}
export interface RGB {
  r?: number
  b?: number
  g?: number
}

export interface Size {
  width: number
  height: number
}
export interface PElement {
  width: number
  height: number
  left?: string
  top?: string
}

export interface OElement {
  w: number
  h: number
  l: number
  t: number
}

export interface CollisionObject {
  size: number
  key: string
  index: number
  vertical: boolean
}

export interface Container {
  id: string
  className: string
  style: any
}

export interface MoveResizerInterface {
  objectType: string
  angle: number
  width: string
  height: string
  top: string
  left: string
  type: string
}
export interface ObjectProps {
  className: string
  imageStyle: StyleType
  maskStyle?: StyleType
  maskImage?: string
  textStyle?: StyleType
  frameStyle?: StyleType
  frameImage?: string
  autogrowStyle?: { height: string }
  shapeStyle?: StyleType
  shapeClass?: string
  imageUrl?: string
  placeholderStyle: StyleType
  style: StyleType
  tempUrl?: string
  texts?: string[]
}
export interface PObject {
  className: string
  id: string
  props: ObjectProps
  style: StyleType
}

export type FeatureType = 'frames' | 'backgrounds' | 'masks' | 'cliparts' | 'images' | 'layouts'
export interface TemplateType {
  id: number
  name: string
  paperMaterials: PaperMaterial[]
  templates: Template[]
  projects: Project[]
}

export interface ImageCategory {
  id: number
  type: FeatureType
  name: string
  parentId: number
  parent?: ImageCategory
  images: Image[]
}

export interface PaginatedResult<T> {
  list: T[]
  offset: number
  total: number
}
export interface BindingType {
  id: number
  name: string
  imageUrl: string
  featureImageUrl: string
  tempUrl?: string
  tempFeatureUrl?: string
  price: number
  quantity: number
  description?: string
}
export interface CoverType {
  id: number
  name: string
  imageUrl: string
  tempUrl?: string
  featureImageUrl: string
  tempFeatureUrl?: string
  description?: string
  editable: boolean
  quantity: number
  price: number
  videoUrl?: string
  objects?: PObject[]
  backgrounds?: BackgroundImage[]
  bindingTypes: BindingType[]
  coverMaterials: CoverMaterial[]
}
export interface FrameMaterial {
  id: number
  name: string
  imageUrl?: string
  tempUrl?: string
  description: string
  quantity: number
  price: number
  templates: Template[]
  projects: Project[]
}

export interface PaperSize {
  id: number
  width: number
  height: number
  size: string
  description?: string
  quantity: number
  projects?: Project[]
  templates?: Template[]
  coverTypes?: CoverType[]
  bindingTypes?: BindingType[]
}

export interface CoverMaterial {
  id: number
  name: string
  imageUrl: string
  tempUrl?: string
  coverMaterialColors: CoverMaterialColor[]
  coverLamination: boolean
  description?: string
  quantity: number
  price: number
  projects?: Project[]
}

export interface CoverMaterialColor {
  id: number
  name: string
  colorCode?: string
  imageUrl?: string
  tempUrl?: string
  coverMaterialId?: number
}

export interface Category {
  id: number
  name: string
  parentId: number
  parent?: Category
  templateType?: TemplateType
  categories?: Category[]
}

export interface LayoutCategory {
  id: number
  name: string
  parentId: number
  parent?: LayoutCategory
}

export interface SlideObject {
  className: string
  id: string
  props: ObjectProps
  style: StyleType
}

export interface Slide {
  slideId: string
  name: string
  containers: Container[]
  backgrounds: BackgroundImage[]
  objects: PObject[]
}

export interface Template {
  id: number
  name: string
  paperMaterialId: number
  paperSizeId: number
  coverTypeId: number
  bindingTypeId: number
  coverMaterialId: number
  frameMaterialId?: number
  templateTypeId: number
  price: number
  discountPrice?: number
  description?: string
  imageUrl?: string
  tempUrl?: string
  featureImageUrl?: string
  tempFeatureUrl?: string
  slides: Slide[]
  paperMaterial?: PaperMaterial
  paperSize?: PaperSize
  coverType?: CoverType
  bindingType?: BindingType
  coverMaterial?: CoverMaterial
  frameMaterial?: FrameMaterial
  templateType?: TemplateType
  projects?: Project[]
  categories?: Category[]
  images?: Image[]
  layouts?: LayoutInterface[]
}

export interface PaperMaterial {
  id: number
  name: string
  paperType: string
  templateTypeId: number
  description?: string
  imageUrl?: string
  tempUrl?: string
  quantity: number
  price: number
  subPaperMaterials: PaperMaterialPrice[]
  templateTypes: TemplateType[]
  paperSizes: PaperSize
  templates: Template[]
  projects: Project[]
}

export interface Project {
  id: number
  name?: string
  imageUrl?: string
  tempUrl?: string
  userId?: number
  paperMaterialId?: number
  paperSizeId?: number
  coverTypeId?: number
  bindingTypeId?: number
  coverMaterialId?: number
  frameMaterialId?: number
  templateId: number
  templateTypeId?: number
  price?: number
  uuid: string
  description?: string
  slides: Slide[]
  paperMaterial?: PaperMaterial
  paperSize?: PaperSize
  bindingType?: BindingType
  coverMaterial?: CoverMaterial
  frameMaterial?: FrameMaterial
  coverType?: CoverType
  template?: Template
  templateType?: TemplateType
  user?: UserInterface
  categories?: Category[]
  images?: Image[]
  layouts?: LayoutInterface[]
}

export interface Image {
  id: string
  name: string
  width?: number
  height?: number
  imageUrl: string
  tempUrl: string
  public: boolean
  type: string
  userId: number
  createdAt: Date
  updatedAt: Date
  imageCategories?: ImageCategory[]
}

export interface BackgroundImage {
  className: string
  style?: Object
  imageurl?: string
  src?: string
}
export interface FilterStyle {
  filter: string
  WebkitFilter?: string
}
export interface Filter {
  label: string
  style: FilterStyle
}
export interface FilterMap {
  [x: string]: Filter
}

export interface EditorInterface {
  imageType: string
  dragStart: boolean
  sidebarOpen: boolean
  backgroundEdit: boolean
  loading: boolean
  type: FeatureType
}
export interface SettingsInterface {
  collapse: boolean
  fullScreen: boolean
  locale: Locales
}
export interface UserInterface {
  isAuthenticated: boolean
  loading: boolean
  user: User | null
  token: string | null
}

export type User = {
  id: number
  email: string | null
  emailConfirmed: boolean
  password?: string | null
  phoneNumber: string | null
  firstName: string | null
  lastName: string | null
  address: string | null
  avatarUrl: string | null
  createdAt: Date
  updatedAt: Date
  googleId: string | null
  facebookId: string | null
  role: string
}

export interface LayoutObject {
  top: number
  left: number
  width: number
  height: number
  className?: string
}
export interface LayoutInterface {
  id?: string
  name?: string
  count: number
  index: number
  objects?: LayoutObject[]
  layoutCategories?: LayoutCategory[]
}

export interface LayoutResponse {
  count: number
  data: LayoutInterface[]
  status: boolean
  message: string
}
export interface LayoutsInterface {
  count: number | string
  layouts: LayoutInterface[]
}
export interface ProjectInterface {
  currentProject: Project
  undoHistory: HistoryInterface[]
  redoHistory: HistoryInterface[]
  bgStyles: StyleType[]
  slideHeight: number
  slideWidth: number
  slideIndex: number
  objects: PObject[]
  containers: Container[]
  backgrounds: BackgroundImage[]
  layout: FullLayout
  layouts: LayoutsInterface[]
  loading: boolean
  fetching: boolean
}
export interface FullLayout {
  left: LayoutInterface
  right: LayoutInterface
}
export interface BGInterface {
  'background-full': PElement
  'background-left': PElement
  'background-right': PElement
}

export interface HistoryProps {
  object?: PObject
  objects?: PObject[]
  layout?: FullLayout
  container?: Container
  containers?: Container[]
  background?: BackgroundImage
  backgrounds?: BackgroundImage[]
}
export interface HistoryInterface {
  historyType: string
  props: HistoryProps
}

export interface ImageInterface {
  images: Image[]
  categories: ImageCategory[]
  loading: boolean
}
export interface RouteInterface {
  path: string
  component: React.FC | React.ComponentClass
  exact: boolean
}

export interface RootInterface {
  auth: UserInterface
  settings: SettingsInterface
  project: ProjectInterface
  editor: EditorInterface
  image: ImageInterface
  history: History
}

export interface StateInterface {
  project: ProjectInterface
  editor: EditorInterface
  image: ImageInterface
  auth: UserInterface
  settings: SettingsInterface
}

export interface PaperMaterialPrice {
  id: number
  name: string
  price: number
}

export type OrderItem = {
  id: number
  projectId: number
  quantity: number
  templateDiscountId: number | null
  userDiscountId: number | null
  voucherId: number | null
  giftCardId: number | null
  orderId: number | null
  project: Project
}

export type CartItem = {
  id: number
  projectId: number
  project: Project
  quantity: number
  shoppingCartId: number
  templateDiscountId: number | null
  userDiscountId: number | null
  voucherId: number | null
  giftCardId: number | null
  templateDiscount?: TemplateDiscount
  userDiscount?: UserDiscount
  voucher?: Voucher
  giftCard?: GiftCard
  price: number
  discountedPrice: number
}

/**
 * Model UserDiscount
 */

export type UserDiscount = {
  id: number
  expireDate: Date
  isUsed: boolean
  userId: number
  templateId: number
  discountPercent: number
  createdAt: Date
}

/**
 * Model TemplateDiscount
 */

export type TemplateDiscount = {
  id: number
  expireDate: Date
  templateId: number
  discountPercent: number
  createdAt: Date
}

/**
 * Model Voucher
 */

export type Voucher = {
  id: number
  templateId: number
  userId: number
  discountPercent: number
  createdAt: Date
  isUsed: boolean
  expireDate: Date
}

/**
 * Model GiftCard
 */

export type GiftCard = {
  id: number
  imageUrl: string | null
  code: string
  activatedUserId: number | null
  boughtUserId: number
  discountAmount: number
  isUsed: boolean
  createdAt: Date
  updatedAt: Date
}

export type Payment = {
  id: number
  type: string | null
  paymentResponse: string | null
  paymentAmount: number
  paidAmount: number
  createdAt: Date
  updatedAt: Date
}

export type ShippingAddress = {
  id: number
  firstName: string
  lastName: string
  companyName: string | null
  address: string
  description: string
  userId: number
}
export interface FacebookAlbum {
  id: string
  created_time: string
  name: string
}
export interface FacebookProfile {
  id: string
  first_name: string
  last_name: string
  picture: {
    data: {
      url: string
    }
  }
}
export interface FacebookImage {
  source: string
  height: number
  width: number
}

export interface FacebookPicture {
  id: string
  images: FacebookImage[]
  picture: string
  created_time: string
}

export interface GoogleProfile {
  id: string
  email: string
  name: string
  given_name: string
  picture: string
}
export interface GoogleResponse {
  mediaItems: GooglePicture[]
  nextPageToken?: string
}
export interface GooglePicture {
  id: string
  productUrl: string
  baseUrl: string
  mimeType: string
  filename: string
}

export interface UploadablePicture {
  filename: string
  url: string
  mimeType: string
  id?: string
}

export type Locales = 'mn' | 'en'
