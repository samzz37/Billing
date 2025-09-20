import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Home, 
  FileText, 
  Users, 
  BarChart3, 
  Settings, 
  Menu, 
  X,
  Calculator,
  Bell
} from 'lucide-react'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [showCalculator, setShowCalculator] = useState(false)
  const location = useLocation()

  const navItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/billing', icon: FileText, label: 'Billing' },
    { path: '/bills', icon: FileText, label: 'Bills' },
    { path: '/clients', icon: Users, label: 'Clients' },
    { path: '/reports', icon: BarChart3, label: 'Reports' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <>
      <motion.nav 
        className="glass-card sticky top-0 z-40 border-b border-white/20"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <motion.div 
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <Link to="/" className="text-2xl font-bold gradient-text">
                Billing Pro
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <motion.div key={item.path} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to={item.path}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                      isActive(item.path)
                        ? 'bg-blue-500 text-white shadow-lg'
                        : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="hidden md:flex items-center space-x-3">
              <motion.button
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                onClick={() => setShowCalculator(!showCalculator)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Calculator className="w-5 h-5 text-gray-600" />
              </motion.button>
              
              <motion.button
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors relative"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </motion.button>
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              className="md:hidden p-2 rounded-lg bg-gray-100 hover:bg-gray-200"
              onClick={() => setIsOpen(!isOpen)}
              whileTap={{ scale: 0.9 }}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </motion.button>
          </div>

          {/* Mobile Navigation */}
          <motion.div
            className={`md:hidden overflow-hidden ${isOpen ? 'max-h-96' : 'max-h-0'}`}
            initial={false}
            animate={{ height: isOpen ? 'auto' : 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="py-4 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive(item.path)
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-600 hover:bg-blue-50'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.nav>

      {/* Floating Calculator */}
      {showCalculator && (
        <motion.div
          className="fixed bottom-4 right-4 z-50"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="bg-white rounded-xl shadow-2xl p-4 w-64">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-800">Calculator</h3>
              <button
                onClick={() => setShowCalculator(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <Calculator />
          </div>
        </motion.div>
      )}
    </>
  )
}

export default Navbar