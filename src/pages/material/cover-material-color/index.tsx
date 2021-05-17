import { useAntdTable, useBoolean, useRequest } from 'ahooks'
import { Form, message } from 'antd'
import { listCoverMaterialColors, deleteCoverMaterialColor } from 'api'
import { CardTable, generateColumn } from 'components'
import { CoverMaterialColor } from 'interfaces'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import {
  CoverMaterialColorCreate,
  CoverMaterialColorUpdate,
} from '../../../page-components/material/cover-material-color'

const key = 'delete_category'

const CoverMaterialColorFC: React.FC = () => {
  const intl = useIntl()
  const [form] = Form.useForm()
  const [create, setCreate] = useBoolean(false)
  const [update, setUpdate] = useState<number>()
  const [selectedRows, setSelectedRows] = useState<CoverMaterialColor[]>([])
  const [lastKey, setLastkey] = useState<number>(0)

  const listAction = useAntdTable<CoverMaterialColor>(
    (params, data) => listCoverMaterialColors(params, data, lastKey),
    {
      defaultPageSize: 20,
      form,
      onSuccess: (success) => {
        setLastkey(success.offset)
      },
    }
  )
  const delAction = useRequest(deleteCoverMaterialColor, {
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
          label={intl.formatMessage({ id: 'cover_material_color' })}
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
          {generateColumn<CoverMaterialColor>([
            {
              width: 100,
              key: 'name',
              name: 'name',
            },
            {
              width: 100,
              key: 'imageUrl',
              name: 'imageUrl',
            },
          ])}
        </CardTable>
      </Form>
      {create && (
        <CoverMaterialColorCreate
          onOk={() => {
            setCreate.setFalse()
            listAction.refresh()
          }}
          onCancel={setCreate.setFalse}
        />
      )}
      {update && (
        <CoverMaterialColorUpdate
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

export default CoverMaterialColorFC
