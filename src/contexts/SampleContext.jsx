import { createContext, useState } from 'react'
export const SampleContext = createContext()
//
//
const SampleContextProvider = ({ children }) => {
  const [name, setName] = useState('Sophea')
  //
  return (
    <SampleContext.Provider value={{ name }}>{children}</SampleContext.Provider>
  )
}

export default SampleContextProvider
