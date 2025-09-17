import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm, useFieldArray } from 'react-hook-form'
import { Plus, Trash2, Save, Eye, Send } from 'lucide-react'
import toast from 'react-hot-toast'
import { useBilling } from '../context/BillingContext'
import { generateBillNumber, generateShareableLink } from '../utils/helpers'

const BillingForm = () => {
  const { state, addBill } = useBilling()
  const [showPreview, setShowPreview] = useState(false)
  const [generatedBill, setGeneratedBill] = useState(null)

  const { register, control, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm({
    defaultValues: {
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      clientAddress: '',
      clientGSTIN: '',
      paymentMethod: 'Cash',
      items: [{ productId: '', quantity: 1, rate: 0, gstRate: state.settings.defaultGSTRate }],
      discount: 0,
      discountType: state.settings.defaultDiscountType,
      tax: 0,
      taxType: state.settings.defaultTaxType,
      notes: ''
    }
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items'
  })

  const watchedItems = watch('items')
  const watchedDiscount = watch('discount')
  const watchedDiscountType = watch('discountType')
  const watchedTax = watch('tax')
  const watchedTaxType = watch('taxType')

  // Calculate totals
  const calculateTotals = () => {
    const subtotal = watchedItems.reduce((sum, item) => {
      const product = state.products.find(p => p.id === item.productId)
      if (product) {
        return sum + (item.quantity * item.rate)
      }
      return sum
    }, 0)

    const discountAmount = watchedDiscountType === 'percentage' 
      ? (subtotal * watchedDiscount / 100) 
      : watchedDiscount

    const taxableAmount = subtotal - discountAmount
    const taxAmount = watchedTaxType === 'percentage' 
      ? (taxableAmount * watchedTax / 100) 
      : watchedTax

    const grandTotal = taxableAmount + taxAmount

    return {
      subtotal,
      discountAmount,
      taxAmount,
      grandTotal
    }
  }

  const totals = calculateTotals()

  const onSubmit = async (data) => {
    try {
      const billNumber = generateBillNumber()
      const shareId = generateShareableLink()
      
      const bill = {
        id: Date.now().toString(),
        billNumber,
        shareId,
        clientName: data.clientName,
        clientEmail: data.clientEmail,
        clientPhone: data.clientPhone,
        clientAddress: data.clientAddress,
        clientGSTIN: data.clientGSTIN,
        paymentMethod: data.paymentMethod,
        items: data.items.map(item => ({
          ...item,
          productName: state.products.find(p => p.id === item.productId)?.name || '',
          amount: item.quantity * item.rate
        })),
        subtotal: totals.subtotal,
        discount: data.discount,
        discountType: data.discountType,
        discountAmount: totals.discountAmount,
        tax: data.tax,
        taxType: data.taxType,
        taxAmount: totals.taxAmount,
        grandTotal: totals.grandTotal,
        notes: data.notes,
        createdAt: new Date().toISOString(),
        status: 'paid'
      }

      addBill(bill)
      setGeneratedBill(bill)
      setShowPreview(true)
      
      toast.success('Bill created successfully!', {
        icon: '🎉',
        style: {
          background: '#10B981',
          color: 'white',
        }
      })

      // Reset form
      reset()
    } catch (error) {
      toast.error('Failed to create bill')
      console.error('Error creating bill:', error)
    }
  }

  const addItem = () => {
    append({ 
      productId: '', 
      quantity: 1, 
      rate: 0, 
      gstRate: state.settings.defaultGSTRate 
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

  return (
    <motion.div
      className="max-w-6xl mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div 
        className="text-center mb-8"
        variants={itemVariants}
      >
        <h1 className="text-3xl font-bold gradient-text mb-4">Create New Bill</h1>
        <p className="text-gray-600">Generate professional invoices with animated previews</p>
      </motion.div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Client Information */}
        <motion.div 
          className="glass-card p-6 rounded-xl"
          variants={itemVariants}
        >
          <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
            <Users className="w-6 h-6 mr-2 text-blue-600" />
            Client Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client Name *
              </label>
              <input
                {...register('clientName', { required: 'Client name is required' })}
                className="input-field"
                placeholder="Enter client name"
              />
              {errors.clientName && (
                <motion.p 
                  className="text-red-500 text-sm mt-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {errors.clientName.message}
                </motion.p>
              )}
            </motion.div>

            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                {...register('clientPhone', { required: 'Phone number is required' })}
                className="input-field"
                placeholder="Enter phone number"
                type="tel"
              />
              {errors.clientPhone && (
                <motion.p 
                  className="text-red-500 text-sm mt-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {errors.clientPhone.message}
                </motion.p>
              )}
            </motion.div>

            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                {...register('clientEmail')}
                className="input-field"
                placeholder="Enter email address"
                type="email"
              />
            </motion.div>

            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">
                GSTIN
              </label>
              <input
                {...register('clientGSTIN')}
                className="input-field"
                placeholder="Enter GSTIN"
              />
            </motion.div>

            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method
              </label>
              <select {...register('paymentMethod')} className="input-field">
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="UPI">UPI</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </select>
            </motion.div>

            <motion.div
              className="md:col-span-2 lg:col-span-1"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <textarea
                {...register('clientAddress')}
                className="input-field"
                placeholder="Enter client address"
                rows="2"
              />
            </motion.div>
          </div>
        </motion.div>

        {/* Items Section */}
        <motion.div 
          className="glass-card p-6 rounded-xl"
          variants={itemVariants}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center">
              <FileText className="w-6 h-6 mr-2 text-blue-600" />
              Bill Items
            </h3>
            <motion.button
              type="button"
              onClick={addItem}
              className="btn-primary flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus className="w-5 h-5" />
              <span>Add Item</span>
            </motion.button>
          </div>

          <div className="space-y-4">
            <AnimatePresence>
              {fields.map((field, index) => (
                <motion.div
                  key={field.id}
                  className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 bg-gray-50 rounded-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product
                    </label>
                    <select
                      {...register(`items.${index}.productId`, { required: 'Product is required' })}
                      className="input-field"
                      onChange={(e) => {
                        const product = state.products.find(p => p.id === e.target.value)
                        if (product) {
                          setValue(`items.${index}.rate`, product.price)
                          setValue(`items.${index}.gstRate`, product.gstRate)
                        }
                      }}
                    >
                      <option value="">Select Product</option>
                      {state.products.map(product => (
                        <option key={product.id} value={product.id}>
                          {product.name} (Stock: {product.stock})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity
                    </label>
                    <input
                      {...register(`items.${index}.quantity`, { 
                        required: 'Quantity is required',
                        min: { value: 1, message: 'Minimum quantity is 1' }
                      })}
                      type="number"
                      className="input-field"
                      min="1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rate (₹)
                    </label>
                    <input
                      {...register(`items.${index}.rate`, { 
                        required: 'Rate is required',
                        min: { value: 0.01, message: 'Rate must be greater than 0' }
                      })}
                      type="number"
                      step="0.01"
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      GST (%)
                    </label>
                    <input
                      {...register(`items.${index}.gstRate`)}
                      type="number"
                      step="0.01"
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amount (₹)
                    </label>
                    <input
                      type="text"
                      className="input-field bg-gray-100"
                      value={(watchedItems[index]?.quantity * watchedItems[index]?.rate || 0).toFixed(2)}
                      readOnly
                    />
                  </div>

                  <div className="flex items-end">
                    {fields.length > 1 && (
                      <motion.button
                        type="button"
                        onClick={() => remove(index)}
                        className="p-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Trash2 className="w-5 h-5" />
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Totals Section */}
        <motion.div 
          className="glass-card p-6 rounded-xl"
          variants={itemVariants}
        >
          <h3 className="text-xl font-semibold text-gray-800 mb-6">Bill Summary</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-700 w-24">Discount:</label>
                <input
                  {...register('discount')}
                  type="number"
                  step="0.01"
                  className="input-field flex-1"
                  placeholder="0"
                />
                <select {...register('discountType')} className="input-field w-24">
                  <option value="fixed">₹</option>
                  <option value="percentage">%</option>
                </select>
              </div>

              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-700 w-24">Tax:</label>
                <input
                  {...register('tax')}
                  type="number"
                  step="0.01"
                  className="input-field flex-1"
                  placeholder="0"
                />
                <select {...register('taxType')} className="input-field w-24">
                  <option value="fixed">₹</option>
                  <option value="percentage">%</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  {...register('notes')}
                  className="input-field"
                  placeholder="Additional notes..."
                  rows="3"
                />
              </div>
            </div>

            <div className="space-y-4">
              <motion.div 
                className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg"
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-semibold">₹{totals.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Discount:</span>
                    <span className="font-semibold text-red-600">-₹{totals.discountAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax:</span>
                    <span className="font-semibold">₹{totals.taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between text-lg">
                      <span className="font-bold text-gray-800">Grand Total:</span>
                      <motion.span 
                        className="font-bold text-2xl gradient-text"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        ₹{totals.grandTotal.toFixed(2)}
                      </motion.span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div 
          className="flex flex-col sm:flex-row gap-4 justify-center"
          variants={itemVariants}
        >
          <motion.button
            type="button"
            onClick={() => setShowPreview(true)}
            className="btn-secondary flex items-center justify-center space-x-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Eye className="w-5 h-5" />
            <span>Preview</span>
          </motion.button>

          <motion.button
            type="submit"
            className="btn-primary flex items-center justify-center space-x-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Save className="w-5 h-5" />
            <span>Generate Bill</span>
          </motion.button>
        </motion.div>
      </form>

      {/* Bill Preview Modal */}
      <AnimatePresence>
        {showPreview && generatedBill && (
          <BillPreviewModal 
            bill={generatedBill} 
            onClose={() => setShowPreview(false)}
            settings={state.settings}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// Bill Preview Modal Component
const BillPreviewModal = ({ bill, onClose, settings }) => {
  const shareUrl = `${window.location.origin}/bill/${bill.shareId}`

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareUrl)
    toast.success('Share link copied to clipboard!')
  }

  const sendWhatsApp = () => {
    const message = `Hi ${bill.clientName}, your bill is ready! View and print it here: ${shareUrl}`
    const whatsappUrl = `https://wa.me/${bill.clientPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  const sendEmail = () => {
    const subject = `Invoice ${bill.billNumber} - ${settings.companyName}`
    const body = `Dear ${bill.clientName},\n\nYour invoice is ready. You can view and print it using this link:\n${shareUrl}\n\nThank you for your business!\n\n${settings.companyName}`
    const emailUrl = `mailto:${bill.clientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.open(emailUrl)
  }

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">Bill Preview</h2>
            <div className="flex items-center space-x-3">
              <motion.button
                onClick={copyShareLink}
                className="btn-secondary flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>Copy Link</span>
              </motion.button>
              
              {bill.clientPhone && (
                <motion.button
                  onClick={sendWhatsApp}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Send className="w-4 h-4" />
                  <span>WhatsApp</span>
                </motion.button>
              )}
              
              {bill.clientEmail && (
                <motion.button
                  onClick={sendEmail}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Send className="w-4 h-4" />
                  <span>Email</span>
                </motion.button>
              )}
              
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <BillTemplate bill={bill} settings={settings} />
        </div>
      </motion.div>
    </motion.div>
  )
}

// Bill Template Component
const BillTemplate = ({ bill, settings }) => {
  return (
    <div className="bg-white p-8 rounded-lg" id="bill-template">
      {/* Header */}
      <div className="text-center border-b-2 border-gray-300 pb-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-800">{settings.companyName}</h1>
        <p className="text-gray-600">{settings.companyAddress}</p>
        <p className="text-gray-600">Phone: {settings.companyPhone} | Email: {settings.companyEmail}</p>
        <p className="text-gray-600">GSTIN: {settings.companyGSTIN}</p>
      </div>

      {/* Bill Details */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Bill To:</h3>
          <p className="font-semibold">{bill.clientName}</p>
          {bill.clientAddress && <p className="text-gray-600">{bill.clientAddress}</p>}
          {bill.clientPhone && <p className="text-gray-600">Phone: {bill.clientPhone}</p>}
          {bill.clientEmail && <p className="text-gray-600">Email: {bill.clientEmail}</p>}
          {bill.clientGSTIN && <p className="text-gray-600">GSTIN: {bill.clientGSTIN}</p>}
        </div>
        
        <div className="text-right">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Invoice Details:</h3>
          <p><strong>Bill Number:</strong> {bill.billNumber}</p>
          <p><strong>Date:</strong> {new Date(bill.createdAt).toLocaleDateString()}</p>
          <p><strong>Payment Method:</strong> {bill.paymentMethod}</p>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full mb-8">
        <thead>
          <tr className="border-b-2 border-gray-300">
            <th className="text-left py-3 px-2">Item</th>
            <th className="text-right py-3 px-2">Rate</th>
            <th className="text-right py-3 px-2">Qty</th>
            <th className="text-right py-3 px-2">GST%</th>
            <th className="text-right py-3 px-2">Amount</th>
          </tr>
        </thead>
        <tbody>
          {bill.items.map((item, index) => (
            <tr key={index} className="border-b border-gray-200">
              <td className="py-3 px-2">{item.productName}</td>
              <td className="text-right py-3 px-2">₹{item.rate.toFixed(2)}</td>
              <td className="text-right py-3 px-2">{item.quantity}</td>
              <td className="text-right py-3 px-2">{item.gstRate}%</td>
              <td className="text-right py-3 px-2">₹{item.amount.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end">
        <div className="w-64 space-y-2">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>₹{bill.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-red-600">
            <span>Discount:</span>
            <span>-₹{bill.discountAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax:</span>
            <span>₹{bill.taxAmount.toFixed(2)}</span>
          </div>
          <div className="border-t-2 border-gray-300 pt-2">
            <div className="flex justify-between text-xl font-bold">
              <span>Grand Total:</span>
              <span>₹{bill.grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      {bill.notes && (
        <div className="mt-8 pt-6 border-t border-gray-300">
          <h4 className="font-semibold text-gray-800 mb-2">Notes:</h4>
          <p className="text-gray-600">{bill.notes}</p>
        </div>
      )}
      
      <div className="mt-8 pt-6 border-t border-gray-300 text-center text-gray-600">
        <p>Thank you for your business!</p>
        <p className="text-sm">Terms: Goods sold are not returnable unless defective</p>
      </div>
    </div>
  )
}

export default BillingForm