import React from 'react'
import ReactDOM from 'react-dom/client'
//
import App from './App.jsx'
import './index.scss'
import './tailwind.css'
import './AntDesign.scss'
import AuthContextProvider from 'contexts/AuthContext.jsx'
import MessageContextProvider from 'contexts/MessageContext.jsx'
import NotifyContextProvider from 'contexts/NotifyContext.jsx'
import ContentProvider from 'contexts/ContentContext.jsx'
import { FloatButton } from 'antd'

ReactDOM.createRoot(document.getElementById('root')).render(
  // <React.StrictMode>

  <>
    <AuthContextProvider>
      <NotifyContextProvider>
        <MessageContextProvider>
          <ContentProvider>
            <App />
          </ContentProvider>
        </MessageContextProvider>
      </NotifyContextProvider>
    </AuthContextProvider>

    <FloatButton.BackTop />
  </>
  // </React.StrictMode>
)
