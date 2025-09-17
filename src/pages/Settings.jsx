import React from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { Save, Building, Percent, DollarSign } from 'lucide-react'
import { useBilling } from '../context/BillingContext'
import toast from 'react-hot-toast'

const Settings = () => {
  const { state, updateSettings } = useBilling()
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: state.settings
  })

  const onSubmit = (data) => {
    try {
      updateSettings(data)
      toast.success('Settings updated successfully!')
    } catch (error) {
      toast.error('Failed to update settings')
    }
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
      className="max-w-4xl mx-auto space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div 
        className="text-center"
        variants={itemVariants}
      >
        <h1 className="text-3xl font-bold gradient-text mb-4">System Settings</h1>
        <p className="text-gray-600">Configure your billing application preferences</p>
      </motion.div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Company Information */}
        <motion.div 
          className="glass-card p-6 rounded-xl"
          variants={itemVariants}
        >
          <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
            <Building className="w-6 h-6 mr-2 text-blue-600" />
            Company Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name *
              </label>
              <input
                {...register('companyName', { required: 'Company name is required' })}
                className="input-field"
                placeholder="Enter company name"
              />
              {errors.companyName && (
                <p className="text-red-500 text-sm mt-1">{errors.companyName.message}</p>
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
                {...register('companyPhone', { required: 'Phone number is required' })}
                className="input-field"
                placeholder="Enter phone number"
              />
              {errors.companyPhone && (
                <p className="text-red-500 text-sm mt-1">{errors.companyPhone.message}</p>
              )}
            </motion.div>

            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                {...register('companyEmail', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: 'Invalid email address'
                  }
                })}
                type="email"
                className="input-field"
                placeholder="Enter email address"
              />
              {errors.companyEmail && (
                <p className="text-red-500 text-sm mt-1">{errors.companyEmail.message}</p>
              )}
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
                {...register('companyGSTIN')}
                className="input-field"
                placeholder="Enter GSTIN"
              />
            </motion.div>

            <motion.div
              className="md:col-span-2"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Address *
              </label>
              <textarea
                {...register('companyAddress', { required: 'Address is required' })}
                className="input-field"
                placeholder="Enter company address"
                rows="3"
              />
              {errors.companyAddress && (
                <p className="text-red-500 text-sm mt-1">{errors.companyAddress.message}</p>
              )}
            </motion.div>
          </div>
        </motion.div>

        {/* Default Settings */}
        <motion.div 
          className="glass-card p-6 rounded-xl"
          variants={itemVariants}
        >
          <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
            <Percent className="w-6 h-6 mr-2 text-green-600" />
            Default Tax & Discount Settings
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default GST Rate (%)
              </label>
              <input
                {...register('defaultGSTRate', { 
                  required: 'GST rate is required',
                  min: { value: 0, message: 'GST rate cannot be negative' },
                  max: { value: 100, message: 'GST rate cannot exceed 100%' }
                })}
                type="number"
                step="0.01"
                className="input-field"
                placeholder="18"
              />
              {errors.defaultGSTRate && (
                <p className="text-red-500 text-sm mt-1">{errors.defaultGSTRate.message}</p>
              )}
            </motion.div>

            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Discount Type
              </label>
              <select {...register('defaultDiscountType')} className="input-field">
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </motion.div>

            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Tax Type
              </label>
              <select {...register('defaultTaxType')} className="input-field">
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </motion.div>
          </div>
        </motion.div>

        {/* Currency Settings */}
        <motion.div 
          className="glass-card p-6 rounded-xl"
          variants={itemVariants}
        >
          <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
            <DollarSign className="w-6 h-6 mr-2 text-purple-600" />
            Currency & Display Settings
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Currency Symbol
              </label>
              <input
                {...register('currency')}
                className="input-field"
                placeholder="₹"
              />
            </motion.div>

            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Theme
              </label>
              <select {...register('theme')} className="input-field">
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto</option>
              </select>
            </motion.div>
          </div>
        </motion.div>

        {/* Save Button */}
        <motion.div 
          className="text-center"
          variants={itemVariants}
        >
          <motion.button
            type="submit"
            className="btn-primary flex items-center space-x-2 mx-auto"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Save className="w-5 h-5" />
            <span>Save Settings</span>
          </motion.button>
        </motion.div>
      </form>
    </motion.div>
  )
}

export default Settings