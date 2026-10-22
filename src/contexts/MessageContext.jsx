import { createContext } from 'react'
//
import { message } from 'antd'

export const MessageContext = createContext()
//
const MessageContextProvider = ({ children }) => {
  const [messageApi, contextHolder] = message.useMessage()
  //
  const showMessage = ({ type, content, key }) => {
    messageApi.open({
      type,
      content,
      key,
    })
  }
  //
  return (
    <MessageContext.Provider value={{ showMessage }}>
      {contextHolder}
      {children}
    </MessageContext.Provider>
  )
}
//
export default MessageContextProvider
