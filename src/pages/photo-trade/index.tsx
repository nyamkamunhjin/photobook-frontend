/* eslint-disable no-nested-ternary */
import { useRequest } from 'ahooks'
import React, { useEffect, useRef, useState } from 'react'
import { buyPhoto, getTradePhoto, listTradePhoto } from 'api'
import { TradePhoto } from 'interfaces'
import Zoom from 'react-medium-image-zoom'
import { CustomButton } from 'components'
import { Modal, notification, Input } from 'antd'
import { FormattedMessage, useIntl } from 'react-intl'
import './style.scss'
import 'react-medium-image-zoom/dist/styles.css'
import { currencyFormat } from '../../utils'

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
    }
  )

  const tradePhoto = useRequest(getTradePhoto, {
    manual: true,
  })

  useEffect(() => {
    const query: any = {}
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
      <div className="flex lg:flex-col gap-4 rounded-lg bg-gray-50 p-4" style={{ minWidth: '15rem' }}>
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
          <span className="text-base font-semibold">
            <FormattedMessage id="search_by_user" />
          </span>
          <Input size="large" value={searchName} onChange={(e) => setSearchName(e.target.value)} />
        </div>
        <div className="flex flex-col gap-2 w-full max-w-xs">
          <span className="text-base font-semibold">
            <FormattedMessage id="search_by_word" />
          </span>
          <Input size="large" value={searchWord} onChange={(e) => setSearchWord(e.target.value)} />
        </div>
      </div>
      <div className="flex flex-col gap-4 items-center overflow-y-auto h-screen hide-scroll w-full" ref={containerRef}>
        <div className="flex flex-wrap gap-2">
          {!tradePhotos.loading &&
            tradePhotos.data?.list.map((each: TradePhoto) => (
              <button
                className="flex-grow flex-shrink focus:outline-none bg-green-200 overflow-hidden"
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
        {!tradePhotos.noMore && (
          <CustomButton className="btn-primary" onClick={tradePhotos.loadMore} disabled={tradePhotos.noMore}>
            {tradePhotos.loadingMore
              ? intl.formatMessage({ id: 'loading!' })
              : tradePhotos.noMore
              ? ''
              : intl.formatMessage({ id: 'click_to_load_more' })}
          </CustomButton>
        )}
        {tradePhoto.data && (
          <Modal
            // title={tradePhoto.data.photoName}
            className="w-full max-w-6xl"
            centered
            visible={!!id}
            onCancel={() => setId(undefined)}
            footer={<div />}
          >
            <div className="flex flex-col items-start p-2 gap-2 min-h-screen pt-10">
              <Zoom wrapStyle={{ width: '100%' }}>
                <img
                  className="w-full"
                  src={`${process.env.REACT_APP_PUBLIC_IMAGE}${tradePhoto.data?.imageUrl}`}
                  alt={tradePhoto.data?.photoName}
                />
              </Zoom>
              <div className="w-full flex flex-col gap-4 p-2 items-start">
                <span className="text-4xl mt-0 pt-0">{tradePhoto.data?.photoName}</span>
                <p className="text-base">{tradePhoto.data?.description}</p>
                <span className="text-base font-semibold">
                  <FormattedMessage id="photo_by" />:{' '}
                  <span className="font-normal">
                    {tradePhoto.data?.user.firstName} {tradePhoto.data?.user.lastName}
                  </span>
                </span>
                <span className="text-2xl font-semibold text-gray-600">
                  {currencyFormat(tradePhoto.data?.price)}
                  <span className="text-xs font-bold">₮</span>
                </span>
                <CustomButton
                  className="btn-primary"
                  onClick={() =>
                    buyPhoto(tradePhoto.data?.id).then((res) => {
                      if (res) notification.success({ message: intl.formatMessage({ id: 'success!' }) })
                    })
                  }
                >
                  <FormattedMessage id="buy" />
                </CustomButton>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </div>
  )
}

export default PhotoTrade
