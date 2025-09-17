import React, { createContext, useContext, useReducer, useEffect } from 'react'

const BillingContext = createContext()

const initialState = {
  bills: [],
  clients: [],
  products: [],
  settings: {
    companyName: 'Sivabharathi Traders',
    companyAddress: '123 Business Street, City - 600001',
    companyPhone: '+91 9876543210',
    companyEmail: 'info@sivabharathi.com',
    companyGSTIN: 'GSTIN123456789',
    defaultGSTRate: 18,
    defaultDiscountType: 'percentage',
    defaultTaxType: 'percentage',
    currency: '₹',
    theme: 'light'
  },
  loading: false,
  error: null
}

function billingReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false }
    
    case 'ADD_BILL':
      return { 
        ...state, 
        bills: [action.payload, ...state.bills],
        loading: false 
      }
    
    case 'UPDATE_BILL':
      return {
        ...state,
        bills: state.bills.map(bill => 
          bill.id === action.payload.id ? action.payload : bill
        )
      }
    
    case 'DELETE_BILL':
      return {
        ...state,
        bills: state.bills.filter(bill => bill.id !== action.payload)
      }
    
    case 'SET_BILLS':
      return { ...state, bills: action.payload, loading: false }
    
    case 'ADD_CLIENT':
      return { 
        ...state, 
        clients: [action.payload, ...state.clients] 
      }
    
    case 'UPDATE_CLIENT':
      return {
        ...state,
        clients: state.clients.map(client => 
          client.id === action.payload.id ? action.payload : client
        )
      }
    
    case 'DELETE_CLIENT':
      return {
        ...state,
        clients: state.clients.filter(client => client.id !== action.payload)
      }
    
    case 'SET_CLIENTS':
      return { ...state, clients: action.payload }
    
    case 'ADD_PRODUCT':
      return { 
        ...state, 
        products: [action.payload, ...state.products] 
      }
    
    case 'UPDATE_PRODUCT':
      return {
        ...state,
        products: state.products.map(product => 
          product.id === action.payload.id ? action.payload : product
        )
      }
    
    case 'DELETE_PRODUCT':
      return {
        ...state,
        products: state.products.filter(product => product.id !== action.payload)
      }
    
    case 'SET_PRODUCTS':
      return { ...state, products: action.payload }
    
    case 'UPDATE_SETTINGS':
      return { 
        ...state, 
        settings: { ...state.settings, ...action.payload } 
      }
    
    default:
      return state
  }
}

export function BillingProvider({ children }) {
  const [state, dispatch] = useReducer(billingReducer, initialState)

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('billingAppData')
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData)
        dispatch({ type: 'SET_BILLS', payload: parsedData.bills || [] })
        dispatch({ type: 'SET_CLIENTS', payload: parsedData.clients || [] })
        dispatch({ type: 'SET_PRODUCTS', payload: parsedData.products || [] })
        dispatch({ type: 'UPDATE_SETTINGS', payload: parsedData.settings || {} })
      } catch (error) {
        console.error('Error loading saved data:', error)
      }
    }
    
    // Load sample data if no data exists
    if (!savedData) {
      loadSampleData()
    }
  }, [])

  // Save data to localStorage whenever state changes
  useEffect(() => {
    const dataToSave = {
      bills: state.bills,
      clients: state.clients,
      products: state.products,
      settings: state.settings
    }
    localStorage.setItem('billingAppData', JSON.stringify(dataToSave))
  }, [state.bills, state.clients, state.products, state.settings])

  const loadSampleData = () => {
    // Sample products
    const sampleProducts = [
      { id: '1', name: 'Premium Rice 5kg', price: 450, stock: 50, gstRate: 5 },
      { id: '2', name: 'Sunflower Oil 1L', price: 180, stock: 30, gstRate: 18 },
      { id: '3', name: 'Wheat Flour 2kg', price: 120, stock: 25, gstRate: 5 },
      { id: '4', name: 'Sugar 1kg', price: 45, stock: 40, gstRate: 5 },
      { id: '5', name: 'Tea Powder 250g', price: 85, stock: 60, gstRate: 18 }
    ]
    
    // Sample clients
    const sampleClients = [
      { 
        id: '1', 
        name: 'Ramesh Kumar', 
        email: 'ramesh@example.com', 
        phone: '+91 9876543210',
        address: '123 Main Street, Chennai - 600001',
        gstin: 'GSTIN123456789'
      },
      { 
        id: '2', 
        name: 'Suresh Babu', 
        email: 'suresh@example.com', 
        phone: '+91 9876543211',
        address: '456 Park Avenue, Chennai - 600002',
        gstin: ''
      }
    ]
    
    dispatch({ type: 'SET_PRODUCTS', payload: sampleProducts })
    dispatch({ type: 'SET_CLIENTS', payload: sampleClients })
  }

  const value = {
    state,
    dispatch,
    
    // Bill actions
    addBill: (bill) => dispatch({ type: 'ADD_BILL', payload: bill }),
    updateBill: (bill) => dispatch({ type: 'UPDATE_BILL', payload: bill }),
    deleteBill: (billId) => dispatch({ type: 'DELETE_BILL', payload: billId }),
    
    // Client actions
    addClient: (client) => dispatch({ type: 'ADD_CLIENT', payload: client }),
    updateClient: (client) => dispatch({ type: 'UPDATE_CLIENT', payload: client }),
    deleteClient: (clientId) => dispatch({ type: 'DELETE_CLIENT', payload: clientId }),
    
    // Product actions
    addProduct: (product) => dispatch({ type: 'ADD_PRODUCT', payload: product }),
    updateProduct: (product) => dispatch({ type: 'UPDATE_PRODUCT', payload: product }),
    deleteProduct: (productId) => dispatch({ type: 'DELETE_PRODUCT', payload: productId }),
    
    // Settings actions
    updateSettings: (settings) => dispatch({ type: 'UPDATE_SETTINGS', payload: settings }),
    
    // Utility functions
    setLoading: (loading) => dispatch({ type: 'SET_LOADING', payload: loading }),
    setError: (error) => dispatch({ type: 'SET_ERROR', payload: error })
  }

  return (
    <BillingContext.Provider value={value}>
      {children}
    </BillingContext.Provider>
  )
}

export function useBilling() {
  const context = useContext(BillingContext)
  if (!context) {
    throw new Error('useBilling must be used within a BillingProvider')
  }
  return context
}