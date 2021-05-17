import { useAntdTable, useBoolean, useRequest } from 'ahooks'
import { Avatar, Form, message } from 'antd'
import { deleteImage, listImage } from 'api'
import { CardTable, generateColumn } from 'components'
import { Image } from 'interfaces'
import BackgroundCreate from 'page-components/images/background_images'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'

const key = 'delete_image'

const Files: React.FC = () => {
  const intl = useIntl()
  const [form] = Form.useForm()
  const [create, setCreate] = useBoolean(false)
  const [selectedRows, setSelectedRows] = useState<Image[]>([])
  const [lastKey, setLastkey] = useState<Image>()

  const listAction = useAntdTable<Image>((params, data) => listImage('backgrounds', params, data, lastKey), {
    defaultPageSize: 20,
    form,
    onSuccess: (success) => {
      setLastkey(success.offset)
    },
  })
  const delAction = useRequest(deleteImage, {
    manual: true,
    onSuccess: () => {
      message.success({ content: intl.formatMessage({ id: 'success!' }), key })
      listAction.refresh()
    },
    onError: () => {
      message.error({ content: intl.formatMessage({ id: 'error!' }), key })
    },
  })

  return (
    <>
      <Form form={form} size="small" onValuesChange={listAction.search.submit}>
        <CardTable
          {...listAction.tableProps}
          label={intl.formatMessage({ id: 'background_files' })}
          createProps={{
            onClick: () => {
              setCreate.setTrue()
            },
          }}
          deleteProps={{
            disabled: selectedRows.length < 1,
            onClick: () => {
              if (selectedRows.length > 0) {
                message.loading({
                  content: intl.formatMessage({ id: 'loading!' }),
                  key,
                })
                return delAction.run({
                  ids: selectedRows.map(({ id }) => id),
                })
              }
              return null
            },
          }}
          refresh={listAction.refresh}
          onRowSelected={setSelectedRows}
        >
          {generateColumn<Image>([
            {
              width: 100,
              key: 'image',
              name: 'tempUrl',
              render: ({ tempUrl }) => <Avatar shape="square" src={tempUrl} />,
            },
            {
              width: 100,
              key: 'image_id',
              name: 'imageId',
            },
            {
              width: 100,
              key: 'image_url',
              name: 'imageUrl',
            },
          ])}
        </CardTable>
      </Form>
      {create && (
        <BackgroundCreate
          onOk={() => {
            setCreate.setFalse()
            listAction.refresh()
          }}
          onCancel={setCreate.setFalse}
        />
      )}
    </>
  )
}

export default Files
