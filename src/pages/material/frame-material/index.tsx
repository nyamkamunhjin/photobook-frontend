import { useAntdTable, useBoolean, useRequest } from 'ahooks'
import { Form, message } from 'antd'
import { deleteFrameMaterial, listFrameMaterial } from 'api'
import { CardTable, generateColumn } from 'components'
import { FrameMaterial } from 'interfaces'
import { FrameMaterialUpdate, FrameMaterialCreate } from 'page-components/material/frame-material'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'

const key = 'delete_frame_material'

const FrameMaterials: React.FC = () => {
  const intl = useIntl()
  const [form] = Form.useForm()
  const [create, setCreate] = useBoolean(false)
  const [update, setUpdate] = useState<number>()
  const [selectedRows, setSelectedRows] = useState<FrameMaterial[]>([])
  const [lastKey, setLastkey] = useState<number>(0)

  const listAction = useAntdTable<FrameMaterial>((params, data) => listFrameMaterial(params, data, lastKey), {
    defaultPageSize: 20,
    form,
    onSuccess: (success) => {
      setLastkey(success.offset)
    },
  })
  const delAction = useRequest(deleteFrameMaterial, {
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
          label={intl.formatMessage({ id: 'frame_material' })}
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
          {generateColumn<FrameMaterial>([
            {
              width: 100,
              key: 'name',
              name: 'name',
            },
            {
              width: 100,
              key: 'quantity',
              name: 'quantity',
            },
            {
              width: 100,
              key: 'description',
              name: 'description',
            },
            {
              width: 100,
              key: 'price',
              name: 'price',
            },
          ])}
        </CardTable>
      </Form>
      {create && (
        <FrameMaterialCreate
          onOk={() => {
            setCreate.setFalse()
            listAction.refresh()
          }}
          onCancel={setCreate.setFalse}
        />
      )}
      {update && (
        <FrameMaterialUpdate
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

export default FrameMaterials
