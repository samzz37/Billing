import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, TrendingUp, Calendar, Download, Filter } from 'lucide-react'
import { useBilling } from '../context/BillingContext'

const Reports = () => {
  const { state } = useBilling()
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  })
  const [reportData, setReportData] = useState({
    totalSales: 0,
    totalBills: 0,
    averageBillValue: 0,
    topProducts: [],
    salesByDay: []
  })

  useEffect(() => {
    calculateReportData()
  }, [state.bills, dateRange])

  const calculateReportData = () => {
    const filteredBills = state.bills.filter(bill => {
      const billDate = new Date(bill.createdAt).toISOString().split('T')[0]
      return billDate >= dateRange.start && billDate <= dateRange.end
    })

    const totalSales = filteredBills.reduce((sum, bill) => sum + bill.grandTotal, 0)
    const totalBills = filteredBills.length
    const averageBillValue = totalBills > 0 ? totalSales / totalBills : 0

    // Calculate top products
    const productSales = {}
    filteredBills.forEach(bill => {
      bill.items.forEach(item => {
        if (productSales[item.productName]) {
          productSales[item.productName] += item.amount
        } else {
          productSales[item.productName] = item.amount
        }
      })
    })

    const topProducts = Object.entries(productSales)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([name, amount]) => ({ name, amount }))

    // Calculate sales by day
    const salesByDay = {}
    filteredBills.forEach(bill => {
      const date = new Date(bill.createdAt).toISOString().split('T')[0]
      if (salesByDay[date]) {
        salesByDay[date] += bill.grandTotal
      } else {
        salesByDay[date] = bill.grandTotal
      }
    })

    setReportData({
      totalSales,
      totalBills,
      averageBillValue,
      topProducts,
      salesByDay: Object.entries(salesByDay).map(([date, amount]) => ({ date, amount }))
    })
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

  const StatCard = ({ title, value, icon: Icon, color, prefix = '', suffix = '' }) => (
    <motion.div
      className="glass-card p-6 rounded-xl floating-card"
      variants={itemVariants}
      whileHover={{ scale: 1.05 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium mb-2">{title}</p>
          <motion.p 
            className={`text-3xl font-bold ${color}`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
          >
            {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
          </motion.p>
        </div>
        <motion.div 
          className={`p-3 rounded-full ${color.replace('text-', 'bg-').replace('-600', '-100')}`}
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Icon className={`w-8 h-8 ${color}`} />
        </motion.div>
      </div>
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
        variants={itemVariants}
      >
        <h1 className="text-3xl font-bold gradient-text mb-4">Sales Reports</h1>
        <p className="text-gray-600">Analyze your business performance with detailed insights</p>
      </motion.div>

      {/* Date Filter */}
      <motion.div 
        className="glass-card p-6 rounded-xl"
        variants={itemVariants}
      >
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-700">Date Range:</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="input-field"
            />
            <span className="text-gray-500">to</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="input-field"
            />
          </div>
          
          <motion.button
            onClick={() => window.print()}
            className="btn-secondary flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        variants={containerVariants}
      >
        <StatCard
          title="Total Sales"
          value={reportData.totalSales}
          icon={TrendingUp}
          color="text-green-600"
          prefix="₹"
        />
        <StatCard
          title="Total Bills"
          value={reportData.totalBills}
          icon={BarChart3}
          color="text-blue-600"
        />
        <StatCard
          title="Average Bill Value"
          value={Math.round(reportData.averageBillValue)}
          icon={Calendar}
          color="text-purple-600"
          prefix="₹"
        />
        <StatCard
          title="Active Clients"
          value={state.clients.length}
          icon={Filter}
          color="text-orange-600"
        />
      </motion.div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Products */}
        <motion.div 
          className="glass-card p-6 rounded-xl"
          variants={itemVariants}
        >
          <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
            <BarChart3 className="w-6 h-6 mr-2 text-blue-600" />
            Top Selling Products
          </h3>
          
          <div className="space-y-4">
            {reportData.topProducts.map((product, index) => (
              <motion.div
                key={product.name}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center space-x-3">
                  <span className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold">
                    {index + 1}
                  </span>
                  <span className="font-medium text-gray-800">{product.name}</span>
                </div>
                <span className="font-semibold text-gray-800">₹{product.amount.toLocaleString()}</span>
              </motion.div>
            ))}
            
            {reportData.topProducts.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No sales data available for the selected period</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Sales Trend */}
        <motion.div 
          className="glass-card p-6 rounded-xl"
          variants={itemVariants}
        >
          <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
            <TrendingUp className="w-6 h-6 mr-2 text-green-600" />
            Sales Trend
          </h3>
          
          <div className="space-y-4">
            {reportData.salesByDay.slice(-7).map((day, index) => (
              <motion.div
                key={day.date}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <span className="font-medium text-gray-800">
                  {new Date(day.date).toLocaleDateString()}
                </span>
                <div className="flex items-center space-x-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <motion.div
                      className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ 
                        width: `${Math.min((day.amount / Math.max(...reportData.salesByDay.map(d => d.amount))) * 100, 100)}%` 
                      }}
                      transition={{ delay: index * 0.1 + 0.5, duration: 0.8 }}
                    />
                  </div>
                  <span className="font-semibold text-gray-800 w-20 text-right">
                    ₹{day.amount.toLocaleString()}
                  </span>
                </div>
              </motion.div>
            ))}
            
            {reportData.salesByDay.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No sales data available for the selected period</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default Reports