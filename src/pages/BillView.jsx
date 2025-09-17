import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, Download, Share2, Search, Filter, Calendar } from 'lucide-react'
import { useBilling } from '../context/BillingContext'
import toast from 'react-hot-toast'

const BillView = () => {
  const { state } = useBilling()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [sortBy, setSortBy] = useState('date')

  const filteredBills = state.bills
    .filter(bill => {
      const matchesSearch = bill.billNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           bill.clientName.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = filterStatus === 'all' || bill.status === filterStatus
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.createdAt) - new Date(a.createdAt)
        case 'amount':
          return b.grandTotal - a.grandTotal
        case 'client':
          return a.clientName.localeCompare(b.clientName)
        default:
          return 0
      }
    })

  const shareLink = (bill) => {
    const shareUrl = `${window.location.origin}/bill/${bill.shareId}`
    navigator.clipboard.writeText(shareUrl)
    toast.success('Share link copied to clipboard!')
  }

  const viewBill = (bill) => {
    const shareUrl = `${window.location.origin}/bill/${bill.shareId}`
    window.open(shareUrl, '_blank')
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    }
  }

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div 
        className="text-center"
        variants={itemVariants}
      >
        <h1 className="text-3xl font-bold gradient-text mb-4">Bill Management</h1>
        <p className="text-gray-600">View, share, and manage all your invoices</p>
      </motion.div>

      {/* Filters */}
      <motion.div 
        className="glass-card p-6 rounded-xl"
        variants={itemVariants}
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search bills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input-field"
          >
            <option value="all">All Status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input-field"
          >
            <option value="date">Sort by Date</option>
            <option value="amount">Sort by Amount</option>
            <option value="client">Sort by Client</option>
          </select>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {filteredBills.length} bill(s) found
            </span>
          </div>
        </div>
      </motion.div>

      {/* Bills Grid */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={containerVariants}
      >
        <AnimatePresence>
          {filteredBills.map((bill, index) => (
            <motion.div
              key={bill.id}
              className="glass-card p-6 rounded-xl floating-card"
              variants={itemVariants}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-800 text-lg">{bill.billNumber}</h3>
                  <p className="text-gray-600">{bill.clientName}</p>
                </div>
                <motion.span 
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    bill.status === 'paid' ? 'bg-green-100 text-green-800' :
                    bill.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
                </motion.span>
              </div>

              <div className="space-y-2 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">{new Date(bill.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Items:</span>
                  <span className="font-medium">{bill.items.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment:</span>
                  <span className="font-medium">{bill.paymentMethod}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <motion.span 
                    className="gradient-text"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    ₹{bill.grandTotal.toFixed(2)}
                  </motion.span>
                </div>
              </div>

              <div className="flex space-x-2">
                <motion.button
                  onClick={() => viewBill(bill)}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Eye className="w-4 h-4" />
                  <span>View</span>
                </motion.button>

                <motion.button
                  onClick={() => shareLink(bill)}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </motion.button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Empty State */}
      {filteredBills.length === 0 && (
        <motion.div 
          className="text-center py-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.div
            animate={{ float: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Calendar className="w-24 h-24 text-gray-300 mx-auto mb-6" />
          </motion.div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No bills found</h3>
          <p className="text-gray-500 mb-8">
            {searchTerm || filterStatus !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'Create your first bill to get started'
            }
          </p>
          <motion.a
            href="/billing"
            className="btn-primary inline-flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>Create New Bill</span>
          </motion.a>
        </motion.div>
      )}
    </motion.div>
  )
}

export default BillView