import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit, Trash2, Search, Mail, Phone } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useBilling } from '../context/BillingContext'
import toast from 'react-hot-toast'

const ClientManagement = () => {
  const { state, addClient, updateClient, deleteClient } = useBilling()
  const [showForm, setShowForm] = useState(false)
  const [editingClient, setEditingClient] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm()

  const filteredClients = state.clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.includes(searchTerm)
  )

  const onSubmit = (data) => {
    try {
      if (editingClient) {
        updateClient({ ...data, id: editingClient.id })
        toast.success('Client updated successfully!')
      } else {
        addClient({ ...data, id: Date.now().toString() })
        toast.success('Client added successfully!')
      }
      
      reset()
      setShowForm(false)
      setEditingClient(null)
    } catch (error) {
      toast.error('Failed to save client')
    }
  }

  const handleEdit = (client) => {
    setEditingClient(client)
    setValue('name', client.name)
    setValue('email', client.email)
    setValue('phone', client.phone)
    setValue('address', client.address)
    setValue('gstin', client.gstin)
    setShowForm(true)
  }

  const handleDelete = (clientId) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      deleteClient(clientId)
      toast.success('Client deleted successfully!')
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
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div 
        className="flex flex-col sm:flex-row items-center justify-between"
        variants={itemVariants}
      >
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-2">Client Management</h1>
          <p className="text-gray-600">Manage your customer database</p>
        </div>
        
        <motion.button
          onClick={() => {
            setShowForm(true)
            setEditingClient(null)
            reset()
          }}
          className="btn-primary flex items-center space-x-2 mt-4 sm:mt-0"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus className="w-5 h-5" />
          <span>Add Client</span>
        </motion.button>
      </motion.div>

      {/* Search and Filter */}
      <motion.div 
        className="glass-card p-6 rounded-xl"
        variants={itemVariants}
      >
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              {filteredClients.length} client(s) found
            </span>
          </div>
        </div>
      </motion.div>

      {/* Clients Grid */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={containerVariants}
      >
        <AnimatePresence>
          {filteredClients.map((client, index) => (
            <motion.div
              key={client.id}
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
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 text-lg mb-1">{client.name}</h3>
                  {client.gstin && (
                    <p className="text-sm text-gray-500">GSTIN: {client.gstin}</p>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  <motion.button
                    onClick={() => handleEdit(client)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Edit className="w-4 h-4" />
                  </motion.button>
                  
                  <motion.button
                    onClick={() => handleDelete(client.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>

              <div className="space-y-3">
                {client.email && (
                  <div className="flex items-center space-x-3 text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">{client.email}</span>
                  </div>
                )}
                
                {client.phone && (
                  <div className="flex items-center space-x-3 text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span className="text-sm">{client.phone}</span>
                  </div>
                )}
                
                {client.address && (
                  <div className="text-gray-600">
                    <p className="text-sm">{client.address}</p>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Bills Created:</span>
                  <span className="font-medium">
                    {state.bills.filter(bill => bill.clientName === client.name).length}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Empty State */}
      {filteredClients.length === 0 && (
        <motion.div 
          className="text-center py-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.div
            animate={{ float: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Plus className="w-24 h-24 text-gray-300 mx-auto mb-6" />
          </motion.div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No clients found</h3>
          <p className="text-gray-500 mb-8">
            {searchTerm 
              ? 'Try adjusting your search criteria'
              : 'Add your first client to get started'
            }
          </p>
          <motion.button
            onClick={() => setShowForm(true)}
            className="btn-primary inline-flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="w-5 h-5" />
            <span>Add First Client</span>
          </motion.button>
        </motion.div>
      )}

      {/* Client Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowForm(false)}
          >
            <motion.div
              className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b">
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingClient ? 'Edit Client' : 'Add New Client'}
                </h2>
              </div>
              
              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Client Name *
                    </label>
                    <input
                      {...register('name', { required: 'Client name is required' })}
                      className="input-field"
                      placeholder="Enter client name"
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      {...register('email', {
                        pattern: {
                          value: /^\S+@\S+$/i,
                          message: 'Invalid email address'
                        }
                      })}
                      type="email"
                      className="input-field"
                      placeholder="Enter email address"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      {...register('phone')}
                      type="tel"
                      className="input-field"
                      placeholder="Enter phone number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      GSTIN
                    </label>
                    <input
                      {...register('gstin')}
                      className="input-field"
                      placeholder="Enter GSTIN"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <textarea
                    {...register('address')}
                    className="input-field"
                    placeholder="Enter client address"
                    rows="3"
                  />
                </div>

                <div className="flex space-x-4 pt-4">
                  <motion.button
                    type="button"
                    onClick={() => {
                      setShowForm(false)
                      setEditingClient(null)
                      reset()
                    }}
                    className="btn-secondary flex-1"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </motion.button>
                  
                  <motion.button
                    type="submit"
                    className="btn-primary flex-1"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {editingClient ? 'Update Client' : 'Add Client'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default ClientManagement