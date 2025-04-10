
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { PushNotifications } from '@capacitor/push-notifications'

// Initialize push notifications on app start
const initializePushNotifications = async () => {
  try {
    // Request permission to use push notifications
    const result = await PushNotifications.requestPermissions()
    
    if (result.receive === 'granted') {
      // Register with FCM or APNs
      await PushNotifications.register()
      
      console.log('Push notification registration successful')
    } else {
      console.log('Push notification permission denied')
    }
  } catch (error) {
    console.error('Error initializing push notifications:', error)
  }
}

// Only initialize on actual devices, not in browser
if (window.matchMedia('(display-mode: standalone)').matches || 
    window.navigator.standalone === true) {
  initializePushNotifications()
}

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Failed to find the root element')

createRoot(rootElement).render(<App />)
