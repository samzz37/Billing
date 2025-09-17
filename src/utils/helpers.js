import { v4 as uuidv4 } from 'uuid'

export const generateBillNumber = () => {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0')
  
  return `BILL-${year}${month}${day}-${random}`
}

export const generateShareableLink = () => {
  return uuidv4()
}

export const formatCurrency = (amount, currency = '₹') => {
  return `${currency}${amount.toLocaleString('en-IN', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })}`
}

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export const formatTime = (date) => {
  return new Date(date).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const calculateGST = (amount, gstRate) => {
  return (amount * gstRate) / 100
}

export const calculateDiscount = (amount, discount, discountType) => {
  if (discountType === 'percentage') {
    return (amount * discount) / 100
  }
  return discount
}

export const calculateTax = (amount, tax, taxType) => {
  if (taxType === 'percentage') {
    return (amount * tax) / 100
  }
  return tax
}

export const validateGSTIN = (gstin) => {
  const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/
  return gstinRegex.test(gstin)
}

export const validatePhone = (phone) => {
  const phoneRegex = /^[+]?[0-9]{10,15}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const generateQRCode = async (text) => {
  try {
    const QRCode = await import('qrcode')
    return await QRCode.toDataURL(text)
  } catch (error) {
    console.error('Error generating QR code:', error)
    return null
  }
}

export const downloadPDF = async (elementId, filename) => {
  try {
    const html2canvas = (await import('html2canvas')).default
    const jsPDF = (await import('jspdf')).default
    
    const element = document.getElementById(elementId)
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
    
    pdf.save(filename)
    return true
  } catch (error) {
    console.error('Error generating PDF:', error)
    return false
  }
}

export const shareViaWhatsApp = (phone, message) => {
  const cleanPhone = phone.replace(/[^0-9]/g, '')
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
  window.open(whatsappUrl, '_blank')
}

export const shareViaEmail = (email, subject, body) => {
  const emailUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  window.open(emailUrl)
}

export const getGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good Morning!'
  if (hour < 17) return 'Good Afternoon!'
  return 'Good Evening!'
}

export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

export const throttle = (func, limit) => {
  let inThrottle
  return function() {
    const args = arguments
    const context = this
    if (!inThrottle) {
      func.apply(context, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}