import React, { createContext, useState } from 'react'

// Create the context
export const CollapsedContext = createContext()

// Create a provider component
const CollapsedProvider = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false) // Default state

  // Function to toggle the collapsed state
  const toggleCollapsed = () => {
    setCollapsed((prev) => !prev)
  }

  return (
    <CollapsedContext.Provider value={{ collapsed, toggleCollapsed }}>
      {children}
    </CollapsedContext.Provider>
  )
}
export default CollapsedProvider
