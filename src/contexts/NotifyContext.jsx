import { createContext, useState } from 'react'
export const NotifyContext = createContext()
//
//
const NotifyContextProvider = ({ children }) => {
  const [count, setCount] = useState(0)
  //
  return (
    <NotifyContext.Provider value={{ count, setCount }}>
      {children}
    </NotifyContext.Provider>
  )
}

export default NotifyContextProvider
