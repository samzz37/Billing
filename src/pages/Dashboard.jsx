import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  FileText, 
  Users, 
  AlertTriangle,
  Plus,
  Eye,
  Calendar,
  DollarSign
} from 'lucide-react'
import { useBilling } from '../context/BillingContext'

const Dashboard = () => {
  const { state } = useBilling()
  const [stats, setStats] = useState({
    todaysSales: 0,
    todaysBills: 0,
    totalClients: 0,
    lowStockItems: 0
  })

  useEffect(() => {
    // Calculate dashboard statistics
    const today = new Date().toDateString()
    const todaysBills = state.bills.filter(bill => 
      new Date(bill.createdAt).toDateString() === today
    )
    
    const todaysSales = todaysBills.reduce((sum, bill) => sum + bill.grandTotal, 0)
    const lowStockItems = state.products.filter(product => product.stock <= 10).length

    setStats({
      todaysSales,
      todaysBills: todaysBills.length,
      totalClients: state.clients.length,
      lowStockItems
    })
  }, [state.bills, state.clients, state.products])

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

  const StatCard = ({ icon: Icon, title, value, color, delay }) => (
    <motion.div
      className="glass-card p-6 rounded-xl floating-card"
      variants={itemVariants}
      whileHover={{ 
        scale: 1.05,
        boxShadow: "0 20px 40px rgba(0,0,0,0.1)"
      }}
      transition={{ delay }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <motion.p 
            className={`text-3xl font-bold ${color}`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: delay + 0.2, type: "spring" }}
          >
            {typeof value === 'number' && title.includes('Sales') 
              ? `₹${value.toLocaleString()}` 
              : value}
          </motion.p>
        </div>
        <motion.div 
          className={`p-3 rounded-full ${color.replace('text-', 'bg-').replace('-600', '-100')}`}
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ delay: delay + 0.3, duration: 0.5 }}
        >
          <Icon className={`w-8 h-8 ${color}`} />
        </motion.div>
      </div>
    </motion.div>
  )

  const QuickActionCard = ({ to, icon: Icon, title, description, color, delay }) => (
    <motion.div
      variants={itemVariants}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ delay }}
    >
      <Link to={to} className="block">
        <div className="glass-card p-6 rounded-xl h-full animated-border">
          <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center mb-4`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
          <p className="text-gray-600 text-sm">{description}</p>
        </div>
      </Link>
    </motion.div>
  )

  return (
    <motion.div
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div 
        className="text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-4xl font-bold gradient-text mb-4">
          Welcome to Billing Pro
        </h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Streamline your business with our professional billing solution featuring 
          animated interfaces and shareable invoice links.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        variants={containerVariants}
      >
        <StatCard
          icon={DollarSign}
          title="Today's Sales"
          value={stats.todaysSales}
          color="text-green-600"
          delay={0}
        />
        <StatCard
          icon={FileText}
          title="Today's Bills"
          value={stats.todaysBills}
          color="text-blue-600"
          delay={0.1}
        />
        <StatCard
          icon={Users}
          title="Total Clients"
          value={stats.totalClients}
          color="text-purple-600"
          delay={0.2}
        />
        <StatCard
          icon={AlertTriangle}
          title="Low Stock Items"
          value={stats.lowStockItems}
          color="text-orange-600"
          delay={0.3}
        />
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={containerVariants}>
        <motion.h2 
          className="text-2xl font-bold text-gray-800 mb-6"
          variants={itemVariants}
        >
          Quick Actions
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <QuickActionCard
            to="/billing"
            icon={Plus}
            title="Create New Bill"
            description="Generate professional invoices with animated forms"
            color="bg-gradient-to-r from-blue-500 to-blue-600"
            delay={0}
          />
          <QuickActionCard
            to="/bills"
            icon={Eye}
            title="View Bills"
            description="Browse and manage all your invoices"
            color="bg-gradient-to-r from-green-500 to-green-600"
            delay={0.1}
          />
          <QuickActionCard
            to="/clients"
            icon={Users}
            title="Manage Clients"
            description="Add and organize your customer database"
            color="bg-gradient-to-r from-purple-500 to-purple-600"
            delay={0.2}
          />
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        variants={containerVariants}
      >
        {/* Recent Bills */}
        <motion.div 
          className="glass-card p-6 rounded-xl"
          variants={itemVariants}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-800">Recent Bills</h3>
            <Link to="/bills" className="text-blue-600 hover:text-blue-700 font-medium">
              View All
            </Link>
          </div>
          
          <div className="space-y-4">
            {state.bills.slice(0, 5).map((bill, index) => (
              <motion.div
                key={bill.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <div>
                  <p className="font-medium text-gray-800">{bill.billNumber}</p>
                  <p className="text-sm text-gray-600">{bill.clientName || 'Walk-in Customer'}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-800">₹{bill.grandTotal.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(bill.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </motion.div>
            ))}
            
            {state.bills.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No bills created yet</p>
                <Link to="/billing" className="text-blue-600 hover:text-blue-700 font-medium">
                  Create your first bill
                </Link>
              </div>
            )}
          </div>
        </motion.div>

        {/* Low Stock Alert */}
        <motion.div 
          className="glass-card p-6 rounded-xl"
          variants={itemVariants}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-800">Stock Alerts</h3>
            <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
              {stats.lowStockItems} items
            </span>
          </div>
          
          <div className="space-y-4">
            {state.products
              .filter(product => product.stock <= 10)
              .slice(0, 5)
              .map((product, index) => (
                <motion.div
                  key={product.id}
                  className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200"
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div>
                    <p className="font-medium text-gray-800">{product.name}</p>
                    <p className="text-sm text-orange-600">Low Stock Alert</p>
                  </div>
                  <div className="text-right">
                    <span className="bg-orange-500 text-white px-2 py-1 rounded-full text-sm font-medium">
                      {product.stock} left
                    </span>
                  </div>
                </motion.div>
              ))}
            
            {stats.lowStockItems === 0 && (
              <div className="text-center py-8 text-gray-500">
                <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>All products have sufficient stock</p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Floating Action Button */}
      <motion.div
        className="fixed bottom-8 right-8 z-40"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 300 }}
      >
        <Link to="/billing">
          <motion.button
            className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full shadow-2xl flex items-center justify-center"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            animate={{ 
              boxShadow: [
                "0 0 20px rgba(59, 130, 246, 0.5)",
                "0 0 30px rgba(147, 51, 234, 0.5)",
                "0 0 20px rgba(59, 130, 246, 0.5)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Plus className="w-8 h-8" />
          </motion.button>
        </Link>
      </motion.div>
    </motion.div>
  )
}

export default Dashboard