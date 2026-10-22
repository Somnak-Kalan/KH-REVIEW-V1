// ContentContext.js
import React, { createContext, useState, useContext, useEffect } from 'react'

const ContentContext = createContext()

const ContentProvider = ({ children }) => {
  const [content, setContent] = useState()

  return (
    <ContentContext.Provider value={{ content, setContent }}>
      {children}
    </ContentContext.Provider>
  )
}

export const useContent = () => useContext(ContentContext)

export default ContentProvider
