/* eslint @typescript-eslint/no-explicit-any: off */
import { Button, Grid, Modal, Spin } from 'antd'
import { ModalProps } from 'antd/lib/modal'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import Facebook from './facebook'
import Google from './google'
import Photos from './photos'
import PhotoTrade from './photo-trade'

interface Props extends ModalProps {
  type?: 'wide' | 'default' | 'full' | 'fwide'
  name: 'facebook' | 'google' | 'photos' | 'photo_trade'
  loading: boolean
  okDisable?: boolean
  cancelDisable?: boolean
  onUpload: (images: any) => void
  onLink: (images: any) => void
}

const UploadModal: React.FC<Props> = ({
  name,
  loading,
  okText,
  cancelText,
  onCancel,
  onUpload,
  onLink,
  type = 'default',
  okDisable = false,
  cancelDisable = false,
  ...props
}) => {
  const [selectedImages, setSelectedImages] = useState<any[]>()
  const intl = useIntl()
  const screens = Grid.useBreakpoint()

  const calcWidth = () => {
    switch (type) {
      case 'wide':
        if (screens.xl) {
          return '60%'
        }
        if (screens.md) {
          return '80%'
        }
        return '100%'
      case 'fwide':
        if (screens.xl) {
          return '85%'
        }
        if (screens.md) {
          return '90%'
        }
        return '100%'
      case 'full':
        return '100%'
      default:
        return undefined
    }
  }

  return (
    <Modal
      {...props}
      style={{ top: '1rem' }}
      width={calcWidth()}
      closable={false}
      maskClosable={false}
      onCancel={onCancel}
      footer={[
        <Button
          key="submit"
          disabled={okDisable}
          type="primary"
          onClick={(e) => {
            if (name === 'photos' || name === 'photo_trade') {
              onLink(selectedImages?.map((each) => each.id))
            } else {
              onUpload(selectedImages)
            }
            if (onCancel) onCancel(e)
          }}
          loading={loading}
        >
          {okText || intl.formatMessage({ id: 'upload' })}
        </Button>,
        <Button key="close" disabled={cancelDisable} onClick={onCancel}>
          {cancelText || intl.formatMessage({ id: 'close' })}
        </Button>,
      ]}
    >
      {loading ? (
        <Spin spinning>
          <div style={{ height: 150 }} />
        </Spin>
      ) : (
        <>
          {name === 'facebook' && <Facebook name={name} setSelectedImages={setSelectedImages} onCancel={onCancel} />}
          {name === 'google' && <Google name={name} setSelectedImages={setSelectedImages} onCancel={onCancel} />}
          {name === 'photos' && <Photos name={name} setSelectedImages={setSelectedImages} />}
          {name === 'photo_trade' && <PhotoTrade name={name} setSelectedImages={setSelectedImages} />}
        </>
      )}
    </Modal>
  )
}

export default UploadModal
