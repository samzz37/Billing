import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Toaster } from 'react-hot-toast'

// Components
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import BillingForm from './pages/BillingForm'
import BillView from './pages/BillView'
import ClientManagement from './pages/ClientManagement'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import SharedBill from './pages/SharedBill'
import LoadingScreen from './components/LoadingScreen'

// Context
import { BillingProvider } from './context/BillingContext'

function App() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate app initialization
    setTimeout(() => {
      setIsLoading(false)
    }, 2000)
  }, [])

  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <BillingProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
                borderRadius: '12px',
                padding: '16px',
              },
            }}
          />
          
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/bill/:shareId" element={<SharedBill />} />
              <Route path="/*" element={
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Navbar />
                  <main className="container mx-auto px-4 py-8">
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/billing" element={<BillingForm />} />
                      <Route path="/bills" element={<BillView />} />
                      <Route path="/clients" element={<ClientManagement />} />
                      <Route path="/reports" element={<Reports />} />
                      <Route path="/settings" element={<Settings />} />
                    </Routes>
                  </main>
                </motion.div>
              } />
            </Routes>
          </AnimatePresence>
        </div>
      </Router>
    </BillingProvider>
  )
}

export default App