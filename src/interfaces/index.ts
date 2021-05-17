export type DomType = HTMLElement

export type ObjectType = 'image'
export interface StyleType extends Omit<CSSStyleDeclaration, 'borderWidth' | 'left' | 'height' | 'top' | 'width'> {
  filterName?: string
  brightness?: number
  borderWidth: number
  contrast?: number
  saturation?: number
  rgb?: RGB
  rotateAngle: number
  top: number | string
  width: number | string
  height: number | string
  left: number | string
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
  frameStyle: StyleType
  frameImage?: string
  autogrowStyle?: StyleType
  shapeStyle?: StyleType
  shapeClass?: string
  imageUrl: string
  placeholderStyle: StyleType
  style: StyleType
  tempUrl: string
  texts: string[]
}
export interface PObject {
  className: string
  id: string
  props: ObjectProps
  style: StyleType
}

export type FeatureType = 'frames' | 'backgrounds' | 'masks' | 'cliparts'
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
  videoUrl?: string
  imageUrl?: string
  tempUrl?: string
  description?: string
  editable: boolean
  quantity: number
  price: number
  bindingTypes: BindingType[]
  coverMaterials: CoverMaterial[]
}
export interface FrameMaterial {
  id: number
  name: string
  imageUrl: string
  tempUrl: string
  description: string
  quantity: number
  price: number
  templates: Template[]
  projects: Project[]
}

export interface PaperSize {
  id: number
  size: string
  imageUrl?: string
  width: number
  height: number
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
  templateTypeId?: number
  templateType?: TemplateType
  parent?: Category
  categories?: Category[] // child categories
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
  imageUrl?: string
  tempUrl?: string
  featureImageUrl?: string
  tempFeatureUrl?: string
  paperMaterialId: number
  paperSizeId: number
  coverTypeId: number
  bindingTypeId: number
  coverMaterialId: number
  frameMaterialId: number
  templateTypeId: number
  price: number
  description: string
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
  templateTypes: TemplateType[]
  paperSizes: PaperSize
  templates: Template[]
  projects: Project[]
}

export interface Project {
  id?: number
  name?: string
  imageUrl?: string
  userId?: number
  paperMaterialId?: number
  paperSizeId?: number
  coverTypeId?: number
  bindingTypeId?: number
  coverMaterialId?: number
  frameMaterialId?: number
  templateId?: number
  templateTypeId?: number
  price?: number
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
  id?: string
  imageUrl: string
  imageType: string
  imageId: string
  tempUrl?: string
  userId: string
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
  type: string
}
export interface SettingsInterface {
  collapse: boolean
  fullScreen: boolean
  locale: Locales
}
export interface UserInterface {
  isAuthenticated: boolean
  loading: boolean
  user: Object | null
  token: string | null
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
  count?: number
  index?: number
  objects: LayoutObject[]
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
  projects: Project[]
  currentProject: Project
  undoHistory: HistoryInterface[]
  redoHistory: HistoryInterface[]
  bgStyles: Object
  slideHeight: number
  slideWidth: number
  slideIndex: number
  objects: PObject[]
  containers: Container[]
  backgrounds: BackgroundImage[]
  layout: {
    left: LayoutInterface
    right: LayoutInterface
  }
  layouts: LayoutsInterface[]
  loading: boolean
  fetching: boolean
}

export interface BGInterface {
  'background-full': PElement
  'background-left': PElement
  'background-right': PElement
}

export interface HistoryProps {
  object?: PObject
  objects?: PObject[]
  layout?: LayoutInterface
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
  images: string[]
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

export type Locales = 'mn' | 'en'
