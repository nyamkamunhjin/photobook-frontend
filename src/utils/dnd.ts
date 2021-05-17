import { v4 as uuidv4 } from 'uuid'

export const reorder = (list: any[], startIndex: number, endIndex: number): any[] => {
  const result = Array.from(list)
  const [removed] = result.splice(startIndex, 1)
  result.splice(endIndex, 0, removed)

  return result
}

export const remove = (list: any[], unique: string): any[] => {
  const result = Array.from(list)
  return result.filter((item) => item.unique_id !== unique)
}

export const copy = (source: any[], destination: any[], droppableSource: any, droppableDestination: any) => {
  console.log('==> dest', destination)
  console.log('--source', source)
  const sourceClone = Array.from(source)
  const destClone = Array.from(destination)
  const item = sourceClone[droppableSource.index]

  destClone.splice(droppableDestination.index, 0, {
    unique_id: uuidv4(),
    process_id: item.id,
    process: item,
    ...item,
  })
  return destClone
}

export const move = (source: any[], destination: any[], droppableSource: any, droppableDestination: any) => {
  const sourceClone = Array.from(source)
  const destClone = Array.from(destination)
  const [removed] = sourceClone.splice(droppableSource.index, 1)

  destClone.splice(droppableDestination.index, 0, removed)

  const result = {}
  // result[droppableSource.droppableId] = sourceClone;
  // result[droppableDestination.droppableId] = destClone;

  return result
}
