import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Download, Printer, Share2, ArrowLeft } from 'lucide-react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import toast from 'react-hot-toast'

const SharedBill = () => {
  const { shareId } = useParams()
  const [bill, setBill] = useState(null)
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load bill data from localStorage
    const savedData = localStorage.getItem('billingAppData')
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData)
        const foundBill = parsedData.bills?.find(b => b.shareId === shareId)
        
        if (foundBill) {
          setBill(foundBill)
          setSettings(parsedData.settings)
        }
      } catch (error) {
        console.error('Error loading bill:', error)
      }
    }
    setLoading(false)
  }, [shareId])

  const downloadPDF = async () => {
    try {
      const element = document.getElementById('bill-content')
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true
      })
      
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const imgWidth = 210
      const pageHeight = 295
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight
      
      let position = 0
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }
      
      pdf.save(`${bill.billNumber}.pdf`)
      toast.success('PDF downloaded successfully!')
    } catch (error) {
      toast.error('Failed to download PDF')
      console.error('Error generating PDF:', error)
    }
  }

  const printBill = () => {
    window.print()
  }

  const shareBill = () => {
    if (navigator.share) {
      navigator.share({
        title: `Invoice ${bill.billNumber}`,
        text: `View invoice ${bill.billNumber} from ${settings.companyName}`,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard!')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    )
  }

  if (!bill) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Bill Not Found</h1>
          <p className="text-gray-600 mb-8">The requested bill could not be found.</p>
          <motion.a
            href="/"
            className="btn-primary inline-flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Go to Dashboard</span>
          </motion.a>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Action Bar */}
      <motion.div 
        className="bg-white shadow-sm border-b sticky top-0 z-40 no-print"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.a
                href="/"
                className="text-gray-600 hover:text-gray-800 flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Dashboard</span>
              </motion.a>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-xl font-semibold text-gray-800">
                Invoice {bill.billNumber}
              </h1>
            </div>
            
            <div className="flex items-center space-x-3">
              <motion.button
                onClick={shareBill}
                className="btn-secondary flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </motion.button>
              
              <motion.button
                onClick={printBill}
                className="btn-secondary flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Printer className="w-4 h-4" />
                <span>Print</span>
              </motion.button>
              
              <motion.button
                onClick={downloadPDF}
                className="btn-primary flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Bill Content */}
      <motion.div 
        className="container mx-auto px-4 py-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div id="bill-content" className="p-8">
            <BillTemplate bill={bill} settings={settings} />
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// Reusable Bill Template
const BillTemplate = ({ bill, settings }) => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center border-b-2 border-gray-300 pb-6">
        <motion.h1 
          className="text-4xl font-bold text-gray-800 mb-2"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {settings.companyName}
        </motion.h1>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <p className="text-gray-600">{settings.companyAddress}</p>
          <p className="text-gray-600">Phone: {settings.companyPhone} | Email: {settings.companyEmail}</p>
          <p className="text-gray-600">GSTIN: {settings.companyGSTIN}</p>
        </motion.div>
      </div>

      {/* Bill Info */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 gap-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Bill To:</h3>
          <div className="space-y-1">
            <p className="font-semibold text-lg">{bill.clientName}</p>
            {bill.clientAddress && <p className="text-gray-600">{bill.clientAddress}</p>}
            {bill.clientPhone && <p className="text-gray-600">Phone: {bill.clientPhone}</p>}
            {bill.clientEmail && <p className="text-gray-600">Email: {bill.clientEmail}</p>}
            {bill.clientGSTIN && <p className="text-gray-600">GSTIN: {bill.clientGSTIN}</p>}
          </div>
        </div>
        
        <div className="text-right">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Invoice Details:</h3>
          <div className="space-y-1">
            <p><strong>Bill Number:</strong> {bill.billNumber}</p>
            <p><strong>Date:</strong> {new Date(bill.createdAt).toLocaleDateString()}</p>
            <p><strong>Time:</strong> {new Date(bill.createdAt).toLocaleTimeString()}</p>
            <p><strong>Payment Method:</strong> {bill.paymentMethod}</p>
          </div>
        </div>
      </motion.div>

      {/* Items Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 text-left py-3 px-4">S.No</th>
              <th className="border border-gray-300 text-left py-3 px-4">Item Description</th>
              <th className="border border-gray-300 text-right py-3 px-4">Rate</th>
              <th className="border border-gray-300 text-right py-3 px-4">Qty</th>
              <th className="border border-gray-300 text-right py-3 px-4">GST%</th>
              <th className="border border-gray-300 text-right py-3 px-4">Amount</th>
            </tr>
          </thead>
          <tbody>
            {bill.items.map((item, index) => (
              <motion.tr 
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1, duration: 0.3 }}
              >
                <td className="border border-gray-300 py-3 px-4">{index + 1}</td>
                <td className="border border-gray-300 py-3 px-4">{item.productName}</td>
                <td className="border border-gray-300 text-right py-3 px-4">₹{item.rate.toFixed(2)}</td>
                <td className="border border-gray-300 text-right py-3 px-4">{item.quantity}</td>
                <td className="border border-gray-300 text-right py-3 px-4">{item.gstRate}%</td>
                <td className="border border-gray-300 text-right py-3 px-4">₹{item.amount.toFixed(2)}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      {/* Totals */}
      <motion.div 
        className="flex justify-end"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <div className="w-80 space-y-3 bg-gray-50 p-6 rounded-lg">
          <div className="flex justify-between text-lg">
            <span>Subtotal:</span>
            <span>₹{bill.subtotal.toFixed(2)}</span>
          </div>
          
          {bill.discountAmount > 0 && (
            <div className="flex justify-between text-lg text-red-600">
              <span>
                Discount {bill.discountType === 'percentage' ? `(${bill.discount}%)` : ''}:
              </span>
              <span>-₹{bill.discountAmount.toFixed(2)}</span>
            </div>
          )}
          
          {bill.taxAmount > 0 && (
            <div className="flex justify-between text-lg">
              <span>
                Tax {bill.taxType === 'percentage' ? `(${bill.tax}%)` : ''}:
              </span>
              <span>₹{bill.taxAmount.toFixed(2)}</span>
            </div>
          )}
          
          <div className="border-t-2 border-gray-300 pt-3">
            <motion.div 
              className="flex justify-between text-2xl font-bold text-gray-800"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span>Grand Total:</span>
              <span>₹{bill.grandTotal.toFixed(2)}</span>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Notes */}
      {bill.notes && (
        <motion.div 
          className="border-t border-gray-300 pt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <h4 className="font-semibold text-gray-800 mb-3">Notes:</h4>
          <p className="text-gray-600 bg-gray-50 p-4 rounded-lg">{bill.notes}</p>
        </motion.div>
      )}

      {/* Footer */}
      <motion.div 
        className="text-center border-t border-gray-300 pt-6 space-y-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        <p className="text-lg font-semibold text-gray-800">Thank you for your business!</p>
        <p className="text-gray-600">We appreciate your trust in our services</p>
        <p className="text-sm text-gray-500">Terms: Goods sold are not returnable unless defective</p>
      </motion.div>
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-gray-600">Loading bill...</p>
        </motion.div>
      </div>
    )
  }

  if (!bill) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Bill Not Found</h1>
          <p className="text-gray-600 mb-8">The requested bill could not be found or may have been removed.</p>
          <motion.a
            href="/"
            className="btn-primary inline-flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Go to Dashboard</span>
          </motion.a>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Action Bar */}
      <motion.div 
        className="bg-white/80 backdrop-blur-sm shadow-lg border-b sticky top-0 z-40 no-print"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <motion.a
                href="/"
                className="text-gray-600 hover:text-gray-800 flex items-center space-x-2 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Back to Dashboard</span>
              </motion.a>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-xl font-semibold text-gray-800">
                Invoice {bill.billNumber}
              </h1>
            </div>
            
            <div className="flex items-center space-x-3">
              <motion.button
                onClick={shareBill}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </motion.button>
              
              <motion.button
                onClick={printBill}
                className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Printer className="w-4 h-4" />
                <span>Print</span>
              </motion.button>
              
              <motion.button
                onClick={downloadPDF}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Bill Content */}
      <motion.div 
        className="container mx-auto px-4 py-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden max-w-4xl mx-auto">
          <div id="bill-content" className="p-8 md:p-12">
            {/* Company Header */}
            <motion.div 
              className="text-center border-b-2 border-gray-300 pb-8 mb-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl font-bold text-gray-800 mb-3">{settings.companyName}</h1>
              <div className="space-y-1 text-gray-600">
                <p>{settings.companyAddress}</p>
                <p>Phone: {settings.companyPhone} | Email: {settings.companyEmail}</p>
                <p>GSTIN: {settings.companyGSTIN}</p>
              </div>
              <motion.div 
                className="mt-4 inline-block bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-full"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                TAX INVOICE
              </motion.div>
            </motion.div>

            {/* Bill Details */}
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                  Bill To:
                </h3>
                <div className="space-y-2">
                  <p className="font-semibold text-lg text-gray-800">{bill.clientName}</p>
                  {bill.clientAddress && <p className="text-gray-600">{bill.clientAddress}</p>}
                  {bill.clientPhone && <p className="text-gray-600">📞 {bill.clientPhone}</p>}
                  {bill.clientEmail && <p className="text-gray-600">✉️ {bill.clientEmail}</p>}
                  {bill.clientGSTIN && <p className="text-gray-600">🏢 GSTIN: {bill.clientGSTIN}</p>}
                </div>
              </div>
              
              <div className="text-right">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                  Invoice Details:
                </h3>
                <div className="space-y-2">
                  <p><strong>Bill Number:</strong> {bill.billNumber}</p>
                  <p><strong>Date:</strong> {new Date(bill.createdAt).toLocaleDateString('en-IN')}</p>
                  <p><strong>Time:</strong> {new Date(bill.createdAt).toLocaleTimeString('en-IN')}</p>
                  <p><strong>Payment Method:</strong> {bill.paymentMethod}</p>
                </div>
              </div>
            </motion.div>

            {/* Items Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="mb-8"
            >
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                    <th className="border border-gray-300 text-left py-4 px-4 font-semibold">S.No</th>
                    <th className="border border-gray-300 text-left py-4 px-4 font-semibold">Item Description</th>
                    <th className="border border-gray-300 text-right py-4 px-4 font-semibold">Rate (₹)</th>
                    <th className="border border-gray-300 text-right py-4 px-4 font-semibold">Qty</th>
                    <th className="border border-gray-300 text-right py-4 px-4 font-semibold">GST%</th>
                    <th className="border border-gray-300 text-right py-4 px-4 font-semibold">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {bill.items.map((item, index) => (
                    <motion.tr 
                      key={index}
                      className="hover:bg-gray-50 transition-colors"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1, duration: 0.3 }}
                    >
                      <td className="border border-gray-300 py-4 px-4 text-center">{index + 1}</td>
                      <td className="border border-gray-300 py-4 px-4 font-medium">{item.productName}</td>
                      <td className="border border-gray-300 text-right py-4 px-4">₹{item.rate.toFixed(2)}</td>
                      <td className="border border-gray-300 text-right py-4 px-4">{item.quantity}</td>
                      <td className="border border-gray-300 text-right py-4 px-4">{item.gstRate}%</td>
                      <td className="border border-gray-300 text-right py-4 px-4 font-semibold">₹{item.amount.toFixed(2)}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </motion.div>

            {/* Totals Section */}
            <motion.div 
              className="flex justify-end mb-8"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <div className="w-96 bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200">
                <div className="space-y-3">
                  <div className="flex justify-between text-lg">
                    <span className="text-gray-700">Subtotal:</span>
                    <span className="font-semibold">₹{bill.subtotal.toFixed(2)}</span>
                  </div>
                  
                  {bill.discountAmount > 0 && (
                    <div className="flex justify-between text-lg text-red-600">
                      <span>
                        Discount {bill.discountType === 'percentage' ? `(${bill.discount}%)` : ''}:
                      </span>
                      <span className="font-semibold">-₹{bill.discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  {bill.taxAmount > 0 && (
                    <div className="flex justify-between text-lg text-green-600">
                      <span>
                        Tax {bill.taxType === 'percentage' ? `(${bill.tax}%)` : ''}:
                      </span>
                      <span className="font-semibold">₹{bill.taxAmount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="border-t-2 border-gray-300 pt-4">
                    <motion.div 
                      className="flex justify-between text-2xl font-bold"
                      animate={{ 
                        color: ['#1f2937', '#3b82f6', '#8b5cf6', '#1f2937'],
                        scale: [1, 1.02, 1]
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      <span>Grand Total:</span>
                      <span>₹{bill.grandTotal.toFixed(2)}</span>
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Notes Section */}
            {bill.notes && (
              <motion.div 
                className="border-t border-gray-300 pt-8 mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.5 }}
              >
                <h4 className="font-semibold text-gray-800 mb-3 text-lg">Additional Notes:</h4>
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                  <p className="text-gray-700">{bill.notes}</p>
                </div>
              </motion.div>
            )}

            {/* Footer */}
            <motion.div 
              className="text-center border-t-2 border-gray-300 pt-8 space-y-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              <motion.p 
                className="text-2xl font-bold gradient-text"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Thank you for your business!
              </motion.p>
              <p className="text-gray-600 text-lg">We appreciate your trust in our services</p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                <p className="text-sm text-gray-600 font-medium">
                  <strong>Terms & Conditions:</strong> Goods sold are not returnable unless defective. 
                  All disputes subject to local jurisdiction only.
                </p>
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  Generated on {new Date().toLocaleDateString('en-IN')} at {new Date().toLocaleTimeString('en-IN')}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Powered by Billing Pro - Professional Invoice Management
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default SharedBill