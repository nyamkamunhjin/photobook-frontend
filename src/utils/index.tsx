/* eslint-disable @typescript-eslint/no-this-alias */

import { PaginatedParams } from 'ahooks/lib/useAntdTable'
import { Storage } from 'aws-amplify'
import dayjs from 'dayjs'

export const isEmptyDate: (date?: string) => boolean = (date) => {
  if (!date) return true
  return date.startsWith('0001-01-01')
}

export const renderDate: (date?: Date, time?: boolean) => string = (date, time = true) => {
  if (!date) return '-'
  return isEmptyDate(date?.toString()) ? '-' : dayjs(date).format(time ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD')
}

export const moneyFormat: (money?: number) => string = (money) => {
  if (!money) return '0'
  return new Intl.NumberFormat().format(money)
}

export const buildQuery = ({ pageSize, filters, sorter }: PaginatedParams[0], data: Object): string => {
  let query = `limit=${pageSize}`
  Object.entries(data).forEach(([key, value]) => {
    if (value && value.length > 0) {
      query += `&${key}=${value}`
    }
  })
  if (sorter && sorter.order) {
    const order = sorter.order.includes('desc') ? 'desc' : 'asc'
    query += `&sorterFiled=${sorter.field}&sorterOrder=${order}`
  }
  if (filters) {
    Object.keys(filters).forEach((key: string) => {
      if (filters[key] && `${filters[key]}`.length > 0) query += `&${key}=${filters[key]}`
    })
  }
  return query
}

export const arraysEqual = (a: string[], b: string[]) => {
  if (a === b) return true
  if (a == null || b == null) return false
  if (a.length !== b.length) return false

  // If you don't care about the order of the elements inside
  // the array, you should sort both arrays here.
  // Please note that calling sort on an array will modify that array.
  // you might want to clone your array first.

  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) return false
  }
  return true
}

export const getRotationScaler = (transform: any) => {
  if (!transform) return 0
  // exec and /pattern/ are same
  const regExp = /\(([^)]+)\)/
  const matches: any = regExp.exec(transform)
  return parseFloat(matches[1])
}

export const imageOnError = async (e: any, imageurl: any, callback: any) => {
  if (imageurl) {
    Storage.get(imageurl).then((url) => {
      e.target.src = url
      callback(url)
    })
  }
}

export const calculateDimensions = (paperSize: string) => {
  const [width, height] = paperSize.split('x') // 14x11
  const slideWidth = parseFloat(width) * 100 * 2 + 30 // 30 is the book spine
  const slideHeight = parseFloat(height) * 100 // 11 * 100 = 1100

  const bgStyles = {
    'background-full': {
      left: 0 + 'px',
      width: slideWidth + 'px',
      height: slideHeight + 'px',
    },
    'background-left': {
      left: 0,
      width: slideWidth / 2 + 'px',
      height: slideHeight + 'px',
    },
    'background-right': {
      left: slideWidth / 2 + 'px',
      width: slideWidth / 2 + 'px',
      height: slideHeight + 'px',
    },
  }

  return { bgStyles, slideWidth, slideHeight }
}

export const debounce = (func: any, ms: any) => {
  let timeout: any

  return (...args: any) => {
    const context = this
    clearTimeout(timeout)
    timeout = setTimeout(() => func.apply(context, args), ms)
  }
}

export const Insert = (arr: any[], index: number, item: any) => {
  return arr.splice(index, 0, item)
}
