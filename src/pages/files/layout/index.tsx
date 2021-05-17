import { useAntdTable, useRequest } from 'ahooks'
import { Form, message } from 'antd'
import { deleteLayout, listLayout } from 'api'
import { CardTable, generateColumn } from 'components'
import { LayoutInterface } from 'interfaces'
import { useHistory } from 'react-router-dom'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'

const key = 'delete_image'

const Files: React.FC = () => {
  const intl = useIntl()
  const [form] = Form.useForm()
  const [selectedRows, setSelectedRows] = useState<LayoutInterface[]>([])
  const [lastKey, setLastkey] = useState<LayoutInterface>()
  const router = useHistory()

  const listAction = useAntdTable<LayoutInterface>((params, data) => listLayout(params, data, lastKey), {
    defaultPageSize: 20,
    form,
    onSuccess: (success) => {
      setLastkey(success.offset)
    },
  })
  const delAction = useRequest(deleteLayout, {
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
          label={intl.formatMessage({ id: 'layout_files' })}
          createProps={{
            onClick: () => {
              router.push('/photobook/layout')
            },
          }}
          updateProps={{
            disabled: selectedRows.length !== 1,
            onClick: () => {
              if (selectedRows.length === 1) {
                router.push(`/photobook/layout?id=${selectedRows[0].id}`)
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
          {generateColumn<LayoutInterface>([
            {
              width: 100,
              key: 'name',
              name: 'name',
            },
            {
              width: 100,
              key: 'category',
              name: 'category',
              render: (row) => row.layoutCategories?.map((a) => a.name).join(', '),
            },
          ])}
        </CardTable>
      </Form>
    </>
  )
}

export default Files
