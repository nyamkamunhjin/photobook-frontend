import { useAntdTable, useBoolean, useRequest } from 'ahooks'
import { Form, message, Select } from 'antd'
import { deleteImageCategory, listImageCategory } from 'api'
import { CardTable, generateColumn } from 'components'
import { ImageCategory } from 'interfaces'
import { BackgroundCategoryUpdate, BackgroundCategoryCreate } from 'page-components/category/background_category'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'

const key = 'delete_category'

const Categories: React.FC = () => {
  const intl = useIntl()
  const [form] = Form.useForm()
  const [create, setCreate] = useBoolean(false)
  const [update, setUpdate] = useState<number>()
  const [selectedRows, setSelectedRows] = useState<ImageCategory[]>([])
  const [lastKey, setLastkey] = useState<number>()

  const listAction = useAntdTable<ImageCategory>(
    (params, data) => listImageCategory('backgrounds', params, data, lastKey),
    {
      defaultPageSize: 20,
      form,
      onSuccess: (success) => {
        console.log(success)
        setLastkey(success.offset)
      },
    }
  )
  const delAction = useRequest(deleteImageCategory, {
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
          label={intl.formatMessage({ id: 'background_categories' })}
          createProps={{
            onClick: () => {
              setCreate.setTrue()
            },
          }}
          updateProps={{
            disabled: selectedRows.length !== 1,
            onClick: () => {
              if (selectedRows.length === 1) {
                setUpdate(selectedRows[0].id)
              }
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
                  ids: selectedRows.map((row) => row.id),
                })
              }
              return null
            },
          }}
          refresh={listAction.refresh}
          onRowSelected={setSelectedRows}
        >
          {generateColumn<ImageCategory>([
            {
              width: 100,
              key: 'name',
              name: 'name',
            },
            {
              width: 100,
              key: 'parent',
              name: 'parent',
              render: (row) => row.parent?.name,
            },
          ])}
        </CardTable>
      </Form>
      {create && (
        <BackgroundCategoryCreate
          onOk={() => {
            setCreate.setFalse()
            listAction.refresh()
          }}
          onCancel={setCreate.setFalse}
        />
      )}
      {update && (
        <BackgroundCategoryUpdate
          id={update}
          onOk={() => {
            setUpdate(undefined)
            listAction.refresh()
          }}
          onCancel={() => {
            setUpdate(undefined)
          }}
        />
      )}
    </>
  )
}

export default Categories
