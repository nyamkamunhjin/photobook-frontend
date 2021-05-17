import { useAntdTable, useBoolean, useRequest } from 'ahooks'
import { Form, message } from 'antd'
import { deleteTemplateCategory, listTemplateCategory } from 'api'
import { CardTable, generateColumn } from 'components'
import { Category } from 'interfaces'
import { TemplateCategoryCreate, TemplateCategoryUpdate } from 'page-components/category/template_category'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'

const key = 'delete_category'

const Categories: React.FC = () => {
  const intl = useIntl()
  const [form] = Form.useForm()
  const [create, setCreate] = useBoolean(false)
  const [update, setUpdate] = useState<number>()
  const [selectedRows, setSelectedRows] = useState<Category[]>([])
  const [lastKey, setLastkey] = useState<Category>()

  const listAction = useAntdTable<Category>((params, data) => listTemplateCategory(params, data, lastKey), {
    defaultPageSize: 20,
    form,
    onSuccess: (success) => {
      console.log(success)
      setLastkey(success.offset)
    },
  })
  const delAction = useRequest(deleteTemplateCategory, {
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
          label={intl.formatMessage({ id: 'template_categories' })}
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
          {generateColumn<Category>([
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
        <TemplateCategoryCreate
          onOk={() => {
            setCreate.setFalse()
            listAction.refresh()
          }}
          onCancel={setCreate.setFalse}
        />
      )}
      {update && (
        <TemplateCategoryUpdate
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
