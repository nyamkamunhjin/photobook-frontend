/* eslint-disable no-nested-ternary */
import { useRequest } from 'ahooks'
import React, { useEffect, useRef, useState } from 'react'
import { getTradePhoto, listTradePhoto, listTradePhotoCategory } from 'api'
import { TradePhoto, TradePhotoCategory } from 'interfaces'
import { CustomButton, Loading } from 'components'
import { Modal, Input, Select, Collapse } from 'antd'
import { FormattedMessage } from 'react-intl'
import './style.scss'
import 'react-medium-image-zoom/dist/styles.css'
import PhotoTradeItem from 'page-components/photo-trade-item'
import { FilterOutlined } from '@ant-design/icons'

const PhotoTrade: React.FC = () => {
  const [id, setId] = useState<number>()
  const [sort, setSort] = useState<'most_sold' | 'most_recent'>('most_recent')
  const [searchName, setSearchName] = useState<string>('')
  const [searchWord, setSearchWord] = useState<string>('')
  const [searchTag, setSearchTag] = useState<string>('')
  const [searchCategory, setSearchCategory] = useState<string>()

  const containerRef = useRef<HTMLDivElement>(null)

  const tradePhotoCategories = useRequest(listTradePhotoCategory)
  const tradePhotos = useRequest(
    (data: any, query: any) =>
      listTradePhoto(
        {
          current: 0,
          pageSize: 30,
        },
        query,
        data?.list?.length || 0
      ),
    {
      debounceInterval: 1000,
      loadMore: true,
      ref: containerRef,

      isNoMore: (data) => {
        // console.log(data)
        return data?.offset >= data?.total
      },
    }
  )

  const tradePhoto = useRequest(() => getTradePhoto(id?.toString() || ''), {
    refreshDeps: [id],
  })

  useEffect(() => {
    const query: any = { status: 'approved' }
    if (searchName?.length > 0) query.user = searchName
    if (searchWord?.length > 0) query.description = searchWord
    if (searchTag?.length > 0) query.tag = searchTag
    if (searchCategory && searchCategory?.length > 0) query.categories = searchCategory
    if (sort?.length > 0) query.sort = sort
    tradePhotos.reset()
    tradePhotos.run([], query)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort, searchName, searchWord, searchTag, searchCategory])

  return (
    <div className="p-4 flex flex-col gap-4">
      <Collapse ghost>
        <Collapse.Panel
          showArrow={false}
          header={
            <div className="w-full flex">
              <CustomButton className="btn-primary ml-auto text-sm" icon={<FilterOutlined />}>
                <FormattedMessage id="filter" />
              </CustomButton>
            </div>
          }
          key="1"
        >
          <div
            className="flex flex-col md:flex-row justify-center items-center gap-4 rounded bg-gray-50 p-4"
            style={{ minWidth: '15rem' }}
          >
            <div className="flex flex-col gap-2 w-full max-w-xs md:self-end h-full">
              <span className="text-base font-medium">
                <FormattedMessage id="sort" />{' '}
              </span>
              <Select size="large" className="w-full mt-auto" value={sort} onChange={(value) => setSort(value)}>
                <Select.Option value="most_recent">
                  <FormattedMessage id="most_recent" />
                </Select.Option>
                <Select.Option value="most_sold">
                  <FormattedMessage id="most_sold" />
                </Select.Option>
              </Select>
            </div>
            <div className="flex flex-col gap-2 w-full max-w-xs md:self-end h-full">
              <span className="text-base font-medium">
                <FormattedMessage id="category" />
              </span>
              <Select
                size="large"
                className="w-full"
                value={
                  tradePhotoCategories.data?.find((each: TradePhotoCategory) => each.id.toString() === searchCategory)
                    ?.name
                }
                onChange={(value) => setSearchCategory(value?.toString())}
                allowClear
                // onClear={() => setSort('')}
              >
                {tradePhotoCategories.data?.map((each: TradePhotoCategory) => (
                  <Select.Option key={each.id} value={each.id}>
                    {each.name}
                  </Select.Option>
                ))}
              </Select>
            </div>
            <div className="flex flex-col gap-2 w-full max-w-xs md:self-end h-full">
              <span className="text-base font-medium">
                <FormattedMessage id="search_by_user" />
              </span>
              <Input size="large" value={searchName} onChange={(e) => setSearchName(e.target.value)} />
            </div>
            <div className="flex flex-col gap-2 w-full max-w-xs md:self-end h-full">
              <span className="text-base font-medium">
                <FormattedMessage id="search_by_word" />
              </span>
              <Input size="large" value={searchWord} onChange={(e) => setSearchWord(e.target.value)} />
            </div>
            <div className="flex flex-col gap-2 w-full max-w-xs md:self-end h-full">
              <span className="text-base font-medium">
                <FormattedMessage id="tag" />
              </span>
              <Input size="large" value={searchTag} onChange={(e) => setSearchTag(e.target.value)} />
            </div>
          </div>
        </Collapse.Panel>
      </Collapse>

      <div className="flex flex-col gap-4 items-center overflow-y-auto h-screen hide-scroll w-full" ref={containerRef}>
        <div className="flex flex-wrap gap-3">
          {!tradePhotos.loading &&
            tradePhotos.data?.list?.map((each: TradePhoto) => (
              <button
                className="flex-grow flex-shrink focus:outline-none overflow-hidden rounded shadow"
                key={each.id}
                onClick={() => {
                  // tradePhoto.reset()
                  setId(each.id)
                }}
                type="button"
              >
                <img
                  className="w-full h-52 object-cover"
                  src={`${process.env.REACT_APP_PUBLIC_IMAGE}${each.imageUrl}`}
                  alt={each.photoName}
                />
              </button>
            ))}
          {(tradePhotos.loadingMore || tradePhotos.loading) && <Loading fill={false} />}
          {tradePhotos.data?.list?.length === 0 && !tradePhotos.loading && !tradePhotos.loadingMore && (
            <p className="text-gray-400 text-base">
              <FormattedMessage id="no_photos_found" />
            </p>
          )}
        </div>
        {tradePhoto.data && (
          <Modal
            // title={tradePhoto.data.photoName}
            className="w-full max-w-6xl"
            bodyStyle={{ padding: 0 }}
            closable={false}
            centered
            visible={typeof tradePhoto.data.id === 'number' && tradePhoto.data.id === id}
            onCancel={() => setId(undefined)}
            footer={false}
          >
            <PhotoTradeItem tradePhoto={tradePhoto} />
          </Modal>
        )}
      </div>
    </div>
  )
}

export default PhotoTrade
