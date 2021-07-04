/* eslint-disable no-nested-ternary */
import { useRequest } from 'ahooks'
import React, { useEffect, useRef, useState } from 'react'
import { getTradePhoto, listTradePhoto } from 'api'
import { TradePhoto } from 'interfaces'
import { Loading } from 'components'
import { Modal, Input } from 'antd'
import { FormattedMessage, useIntl } from 'react-intl'
import './style.scss'
import 'react-medium-image-zoom/dist/styles.css'
import PhotoTradeItem from 'page-components/photo-trade-item'

const PhotoTrade: React.FC = () => {
  const intl = useIntl()
  const [id, setId] = useState<number>()
  const [sort, setSort] = useState<'A-Z' | 'most_popular' | 'most_recent'>('A-Z')
  const [searchName, setSearchName] = useState<string>('')
  const [searchWord, setSearchWord] = useState<string>('')

  const containerRef = useRef<HTMLDivElement>(null)
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

  const tradePhoto = useRequest(getTradePhoto, {
    manual: true,
  })

  useEffect(() => {
    const query: any = { status: 'approved' }
    if (searchName?.length > 0) query.user = searchName
    if (searchWord?.length > 0) query.description = searchWord
    tradePhotos.reset()
    tradePhotos.run([], query)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort, searchName, searchWord])

  useEffect(() => {
    if (id) {
      tradePhoto.run(id.toString())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  return (
    <div className="p-4 flex flex-col lg:flex-row gap-4">
      <div className="flex lg:flex-col gap-4 rounded bg-gray-50 p-4" style={{ minWidth: '15rem' }}>
        {/* <div className="flex flex-col gap-2 w-full max-w-xs">
          <span className="text-base font-semibold">
            <FormattedMessage id="sort" />
          </span>
          <Select
            className="w-full"
            value={sort}
            onChange={(value) => setSort(value)}
            // allowClear
            // onClear={() => setSort('')}
          >
            <Select.Option value="A-Z">
              <FormattedMessage id="A-Z" />
            </Select.Option>
            <Select.Option value="most_popular">
              <FormattedMessage id="most_popular" />
            </Select.Option>
            <Select.Option value="sort_by_date">
              <FormattedMessage id="sort_by_date" />
            </Select.Option>
          </Select>
        </div> */}
        <div className="flex flex-col gap-2 w-full max-w-xs">
          <span className="text-base font-medium">
            <FormattedMessage id="search_by_user" />
          </span>
          <Input size="large" value={searchName} onChange={(e) => setSearchName(e.target.value)} />
        </div>
        <div className="flex flex-col gap-2 w-full max-w-xs">
          <span className="text-base font-medium">
            <FormattedMessage id="search_by_word" />
          </span>
          <Input size="large" value={searchWord} onChange={(e) => setSearchWord(e.target.value)} />
        </div>
      </div>
      <div className="flex flex-col gap-4 items-center overflow-y-auto h-screen hide-scroll w-full" ref={containerRef}>
        <div className="flex flex-wrap gap-3">
          {!tradePhotos.loading &&
            tradePhotos.data?.list.map((each: TradePhoto) => (
              <button
                className="flex-grow flex-shrink focus:outline-none overflow-hidden rounded shadow"
                key={each.id}
                onClick={() => {
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
        </div>
        {tradePhotos.loadingMore && <Loading fill={false} />}
        {tradePhoto.data && (
          <Modal
            // title={tradePhoto.data.photoName}
            className="w-full max-w-6xl"
            bodyStyle={{ padding: 0 }}
            closable={false}
            centered
            visible={!!id}
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
