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

export default Navbar