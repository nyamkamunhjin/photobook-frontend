/* eslint-disable react/react-in-jsx-scope */
// tur commentlchihlee listTemplate shiniig duudhaar aldaa zaaj baina

// import { useAntdTable, useBoolean, useRequest } from 'ahooks'
// import { Form, message } from 'antd'
// import { deleteTemplate, listTemplate } from 'api'
// import { CardTable, generateColumn } from 'components'
// import { Image } from 'interfaces'
// import React, { useState } from 'react'
// import { useIntl } from 'react-intl'

// const key = 'delete_image'

const Templates: React.FC = () => {
  //   const intl = useIntl()
  //   const [form] = Form.useForm()
  //   const [, setCreate] = useBoolean(false)
  //   const [selectedRows, setSelectedRows] = useState<Image[]>([])
  //   const [lastKey, setLastkey] = useState<Image>()

  //   const listAction = useAntdTable<Image>((params, data) => listTemplate(params, data, 'backgrounds', lastKey), {
  //     defaultPageSize: 20,
  //     form,
  //     onSuccess: (success) => {
  //       setLastkey(success.offset)
  //     },
  //   })
  //   const delAction = useRequest(deleteTemplate, {
  //     manual: true,
  //     onSuccess: () => {
  //       message.success({ content: intl.formatMessage({ id: 'success!' }), key })
  //       listAction.refresh()
  //     },
  //     onError: () => {
  //       message.error({ content: intl.formatMessage({ id: 'error!' }), key })
  //     },
  //   })

  //   return (
  //     <>
  //       <Form form={form} size="small" onValuesChange={listAction.search.submit}>
  //         <CardTable
  //           {...listAction.tableProps}
  //           label={intl.formatMessage({ id: 'templates' })}
  //           createProps={{
  //             onClick: () => {
  //               setCreate.setTrue()
  //             },
  //           }}
  //           deleteProps={{
  //             disabled: selectedRows.length < 1,
  //             onClick: () => {
  //               if (selectedRows.length > 0) {
  //                 message.loading({
  //                   content: intl.formatMessage({ id: 'loading!' }),
  //                   key,
  //                 })
  //                 return delAction.run({
  //                   ids: selectedRows,
  //                 })
  //               }
  //               return null
  //             },
  //           }}
  //           refresh={listAction.refresh}
  //           onRowSelected={setSelectedRows}
  //         >
  //           {generateColumn<Image>([
  //             {
  //               width: 100,
  //               key: 'image_id',
  //               name: 'imageId',
  //             },
  //             {
  //               width: 100,
  //               key: 'image_url',
  //               name: 'imageUrl',
  //             },
  //           ])}
  //         </CardTable>
  //       </Form>
  //     </>
  //   )
  return <div>redo</div>
}

export default Templates
