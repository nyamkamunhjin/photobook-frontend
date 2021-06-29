/* eslint-disable no-nested-ternary */
import { useRequest } from 'ahooks'
import React, { useEffect, useRef, useState } from 'react'
import { buyPhoto, getTradePhoto, listTradePhoto } from 'api'
import Masonry from 'react-masonry-css'
import { TradePhoto } from 'interfaces'
import Zoom from 'react-medium-image-zoom'
import { CustomButton, Loading } from 'components'
import { Modal, notification } from 'antd'
import { FormattedMessage, useIntl } from 'react-intl'
import './style.scss'
import 'react-medium-image-zoom/dist/styles.css'
import { currencyFormat } from '../../utils'

const breakpointColumnsObj = {
  default: 4,
  1100: 3,
  700: 2,
  500: 1,
}

const PhotoTrade: React.FC = () => {
  const intl = useIntl()
  const [id, setId] = useState<number>()
  const containerRef = useRef<HTMLDivElement>(null)
  const tradePhotos = useRequest(
    (data: any) =>
      listTradePhoto(
        {
          current: (data?.list?.length + 1 || 0) / 20,
          pageSize: 20,
        },
        {}
      ),
    {
      // debounceInterval: 500,
      loadMore: true,
      ref: containerRef,
    }
  )

  const tradePhoto = useRequest(getTradePhoto, {
    manual: true,
  })

  useEffect(() => {
    if (id) {
      tradePhoto.run(id.toString())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  return (
    <div className="p-4 flex flex-col gap-4 items-center" ref={containerRef}>
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="my-masonry-grid"
        columnClassName="my-masonry-grid_column"
      >
        {!tradePhotos.loading ? (
          tradePhotos.data?.list.map((each: TradePhoto) => (
            <CustomButton
              key={each.id}
              className="w-full focus:outline-none bg-gray-50"
              onClick={() => {
                setId(each.id)
              }}
            >
              <img
                className="w-full bg-cover"
                src={`${process.env.REACT_APP_PUBLIC_IMAGE}${each.imageUrl}`}
                alt={each.photoName}
              />
            </CustomButton>
          ))
        ) : (
          <Loading />
        )}
      </Masonry>
      {!tradePhotos.noMore && (
        <CustomButton
          className="btn-primary"
          onClick={tradePhotos.loadMore}
          disabled={tradePhotos.data?.list.length === 0}
        >
          {tradePhotos.loadingMore
            ? intl.formatMessage({ id: 'loading!' })
            : tradePhotos.data?.list.length === 0
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
          <div className="flex flex-col items-start p-2 gap-2 min-h-screen">
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
  )
}

export default PhotoTrade
