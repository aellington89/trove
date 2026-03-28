import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './app.css'
import { setupStoreSubscriptions, useMediaTypesStore, useItemsStore } from './stores'

setupStoreSubscriptions()
useMediaTypesStore.getState().fetchMediaTypes()
useItemsStore.getState().fetchItems()
useItemsStore.getState().fetchItemCounts()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
