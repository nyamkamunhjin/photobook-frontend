import React from 'react'

export type DomType = HTMLElement

export type ObjectType = 'image' | 'object' | 'text' | 'shape' | ''

export type ToolsType =
  | 'transform'
  | 'orientation'
  | 'rotate'
  | 'flip'
  | 'filters'
  | 'brightness'
  | 'contrast'
  | 'saturation'
  | 'size'
  | 'paper'
  | 'image_brightness'
  | 'amount'
  | 'reset'
  | 'remove'

export type PaymentMethods = 'Ecommerce' | 'Bank'

export type VatType = 'organization' | 'personal'

export type Bank = 'socialpay' | 'qpay' | 'bank'

export type Locales = 'mn' | 'en'
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
  transformOrigin?: string
  zIndex?: string
  filter?: string
  scale?: number
}

export interface ProjectCreate {
  paperSizeId?: number
  frameMaterialId?: number
  coverTypeId?: number
  bindingTypeId?: number
  coverMaterialId?: number
  coverColorId?: number
  paperSize?: { width: number; height: number }
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
  position: number
  magnet: number
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
export interface Cropper {
  top: number
  left: number
  width: number
  height: number
}
export interface ObjectProps {
  className: string
  colorPreset?: ColorPreset
  imageStyle: StyleType
  maskStyle?: StyleType
  maskImage?: string
  cropStyle?: Cropper
  paperSize?: PaperSize
  quantity?: number
  paperMaterial?: PaperMaterial
  textStyle?: StyleType
  frameStyle?: StyleType
  frameImage?: string
  autogrowStyle?: { height: string }
  shapeStyle?: StyleType
  shapeClass?: string
  imageUrl?: string
  naturalSize?: { width: number; height: number }
  placeholderStyle: StyleType
  style: StyleType
  tempUrl?: string
  texts?: string[]
  frameMontage?: {
    url: string
    tempUrl: string
  }
  maskOptions?: {
    fullHidden: {
      maskStyle?: StyleType
      maskImage?: string
    }
    halfHidden: {
      maskStyle?: StyleType
      maskImage?: string
    }
  }
}
export interface PObject {
  className: string
  id: string
  props: ObjectProps
  style: StyleType
  ratio?: { t: number; l: number; h: number; w: number; sw: number; sh: number }
}

export type FeatureType =
  | 'frames'
  | 'backgrounds'
  | 'masks'
  | 'cliparts'
  | 'images'
  | 'layouts'
  | 'notices'
  | 'frame_masks'
  | 'frame_materials'

export interface TemplateType {
  id: number
  name: string
  paperMaterials: PaperMaterial[]
  templates: Template[]
  projects: Project[]
  imageQuality?: {
    imageSquare: number
    placeholderSquare: number
  }
  gap?: {
    borderWidth: number
    air: number
    standart: number
    gap: number
  }
}

export interface ImageCategory {
  id: number
  type: FeatureType
  name: string
  parentId: number
  parent?: ImageCategory
  images: Image[]
  frameMasks: FrameMask[]
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
  borderWidth: number
  status: 'Active' | 'Passive'
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
  orientation: 'Square' | 'Portrait' | 'Landscape' | 'Panoramic'
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
  object?: PObject
  createdAt?: Date
  ratio?: { width: number; height: number }
}

export interface ImageSlide {
  slideId: string
  name: string
  object: PObject[]
}

export interface Template {
  id: number
  editable: boolean
  name: string
  canvasType?: CanvasType
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
  slidesSplit?: Slide
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
  productOptions?: string[] | []
  frameType?: 'Single' | 'Multi' | 'Unlock'
}

export type CanvasType = 'Single' | 'Multi' | 'Split'
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

export interface ProjectImage {
  id: number
  projectId: number
  imageId: number
  image: Image
  project: Project
  type: 'Students' | 'Teachers' | 'Others' | 'General'
}
export interface Project {
  id: number
  name?: string
  canvasType?: CanvasType
  imageUrl?: string
  tempUrl?: string
  userId?: number
  paperMaterialId?: number
  paperSizeId?: number
  coverTypeId?: number
  bindingTypeId?: number
  coverMaterialId?: number
  coverColorId?: number
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
  images?: ProjectImage[]
  layouts?: LayoutInterface[]
  coverEditable?: boolean
  changeRequest?: string[]
}

export interface Image {
  id: string
  name: string
  width?: number
  height?: number
  borderWidth?: number
  imageUrl: string
  tempUrl: string
  public: boolean
  type: string
  userId: number
  createdAt: Date
  updatedAt: Date
  imageCategories?: ImageCategory[]
  projects: ProjectImage[]
  naturalSize: { width: number; height: number }
}
export interface FrameMask {
  id: number
  frameUrl: string
  maskUrl: string
  tempFrameUrl: string
  tempMaskUrl: string
  updatedAt: Date
  name: string
  description: string
  imageCategories: ImageCategory[]
  // projects        Project[]
}

export interface BackgroundImage {
  className: string
  style?: StyleType
  bgStyle?: StyleType
  imageurl?: string
  src?: string
  props: {
    imgStyle: {
      scale: number
    }
  }
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
export interface ColorPreset {
  name: string
  style: React.CSSProperties
  filterStyle?: React.CSSProperties
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
  types: ('whole-page' | 'single-page')[]
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
  images: ProjectImage[]
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
export type Order = {
  amount: number
  createdAt: Date
  deliveryDays: number
  giftCardDiscountAmount: number
  giftCardId?: number
  id: number
  orderId: string
  orderItems: OrderItem[]
  paidAmount: number
  paymentAmount: number
  shippingAddressId: number
  shippingFee: number
  status: string
  updatedAt: Date
  userId: number
  vatAmount: number
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
  amount: number
  project: Project
  voucher?: Voucher
  userDiscount?: UserDiscount
  templateDiscount?: TemplateDiscount
  price: number
  discountedPrice: number
  appliedDiscountTypes: DiscountTypes[]
}

type DiscountTypes = 'template_discount' | 'user_discount' | 'gift_card_discount' | 'voucher_discount'

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
  amount: number
  userDiscount?: UserDiscount
  voucher?: Voucher
  price: number
  discountedPrice: number
  appliedDiscountTypes: DiscountTypes[]
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
  template?: Template
}

/**
 * Model GiftCard
 */
export type GiftCard = {
  id: number
  name: string
  imageUrl: string | null
  code: string
  activatedUserId: number | null
  shoppingCartId: number | null
  boughtUserId: number
  remainingAmount: number
  discountAmount: number
  createdAt: Date
  updatedAt: Date
  orderId: number | null
}

export type Payment = {
  id: number
  paymentCode: string
  orgCode?: string
  paymentAmount: number
  paymentVat: number
  shippingFee: number
  totalAmount: number
  paidAmount: number
  paymentTypeId: number
  isSuccess: boolean
  isNotify: boolean
}

export interface PaymentType {
  id: number
  name: string
  nameMn?: string
  enabled: boolean
  method: PaymentMethods
  description?: string
  account?: string
  createAt: Date
  updatedAt: Date
  Payment?: Payment[]
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface BankResponse extends Payment {}

export interface KhanbankResponse {
  errorCode: string
  formUrl: string
  orderId: string
}

export interface TDBResponse {
  url: string
  trans_amount: number
  trans_number: string
}

export interface QPayResponse {
  qPay_QRcode: string
  qPay_QRimage: string
  qPay_url: string
  message: string
  name: string
  payment_id: number
  customer_id: string
}
export interface SocialPayResponse {
  checksum: string
  invoice: string
  transactionId: string
}

export interface PaymentCondition {
  bank: Bank
  visible: boolean
  response: SocialPayResponse | QPayResponse | BankResponse
}
export interface OrganizationCode {
  citypayer: boolean
  found: boolean
  name: string
  lastReceiptDate?: Date
  receiptFound: boolean
  vatpayer: boolean
  vatpayerRegisteredDate?: Date
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
export type TradePhoto = {
  id: number
  userId: number
  photoName: string
  tag: string[]
  price: number
  description: string
  status: TradePhotoApproveType
  imageUrl: string
  sellCount: number
  user: User
  naturalSize: { width: number; height: number }
}

export type TradePhotoApproveType = 'approved' | 'pending' | 'declined'

export type TradePhotoCategory = {
  id: number
  name: string
  parentId: number | null
}
