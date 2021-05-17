import { useAntdTable, useBoolean, useRequest } from 'ahooks'
import { Form, message } from 'antd'
import { deleteBindingType, listBindingType, listCoverType } from 'api'
import { CardTable, generateColumn } from 'components'
import { BindingType, CoverType } from 'interfaces'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { useHistory } from 'react-router'

const key = 'delete_cover_type'

const BindingTypes: React.FC = () => {
  const intl = useIntl()
  const [form] = Form.useForm()
  const [selectedRows, setSelectedRows] = useState<CoverType[]>([])
  const [lastKey, setLastkey] = useState<number>(0)
  const router = useHistory()

  const listAction = useAntdTable<CoverType>((params, data) => listCoverType(params, data, lastKey), {
    defaultPageSize: 20,
    form,
    onSuccess: (success) => {
      setLastkey(success.offset)
    },
  })
  const delAction = useRequest(deleteBindingType, {
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
          label={intl.formatMessage({ id: 'cover_type' })}
          createProps={{
            onClick: () => {
              router.push('/photobook/cover')
            },
          }}
          updateProps={{
            disabled: selectedRows.length !== 1,
            onClick: () => {
              if (selectedRows.length === 1) {
                router.push(`/photobook/cover?id=${selectedRows[0].id}`)
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
          {generateColumn<CoverType>([
            {
              width: 100,
              key: 'name',
              name: 'name',
            },
            {
              width: 100,
              key: 'price',
              name: 'price',
            },
            {
              width: 100,
              key: 'description',
              name: 'description',
            },
          ])}
        </CardTable>
      </Form>
    </>
  )
}

export default BindingTypes
