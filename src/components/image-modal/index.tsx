/* eslint @typescript-eslint/no-explicit-any: off */
import { Grid, Modal, Spin } from 'antd'
import { ModalProps } from 'antd/lib/modal'
import React from 'react'

interface Props extends ModalProps {
  type?: 'wide' | 'default' | 'full' | 'fwide'
  loading: boolean
  okDisable?: boolean
  cancelDisable?: boolean
}

const ImageModal: React.FC<Props> = ({ children, loading, onCancel, type = 'default', ...props }) => {
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
      closable
      maskClosable={false}
      onCancel={onCancel}
      footer={null}
    >
      {!loading ? (
        children
      ) : (
        <Spin spinning>
          <div style={{ height: 150 }} />
        </Spin>
      )}
    </Modal>
  )
}

export default ImageModal
