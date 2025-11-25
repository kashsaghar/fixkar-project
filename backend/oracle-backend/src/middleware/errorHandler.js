// Error handling middleware
const errorHandler = (err, req, res, next) => {
    console.error('Error occurred:', err)
    
    // Log the stack trace in development
    if (process.env.NODE_ENV !== 'production') {
      console.error(err.stack)
    }
    
    // Handle specific Oracle errors
    if (err.code && err.code.startsWith('ORA-')) {
      return res.status(500).json({
        error: 'Database error occurred',
        code: err.code,
        details: process.env.NODE_ENV !== 'production' ? err.message : 'Contact administrator for details'
      })
    }
    
    // Handle validation errors
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation error',
        details: err.message
      })
    }
    
    // Default error response
    const statusCode = err.statusCode || 500
    res.status(statusCode).json({
      error: err.message || 'An unexpected error occurred',
      code: err.code || 'UNKNOWN_ERROR',
      details: process.env.NODE_ENV !== 'production' ? err.stack : 'Contact administrator for details'
    })
  }
  
  module.exports = errorHandler