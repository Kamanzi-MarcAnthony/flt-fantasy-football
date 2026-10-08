export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
console.log('USER IN AUTHORIZE:', req.user)
// console.log('ALLOWED ROLES:', roles)
console.log('USER ROLE:', req.user?.role)

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      })
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action',
      })
    }

    next()
  }
}
