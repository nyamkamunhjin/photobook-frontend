import { v4 as uuid } from 'uuid'
import { DragAndDropWrapper } from './DragAndDropWrapper/DragAndDropWrapper'
import { withMaxItems } from './withMaxItems/withMaxItems'
import { withReactToItemsChange } from './withReactToItemsChange/withReactToItemsChange'

const ComponentWithMaxItems = withMaxItems(DragAndDropWrapper, uuid)
const ComponentWithReactToItemsChange = withReactToItemsChange(ComponentWithMaxItems)

export default ComponentWithReactToItemsChange
