// Improved user creation with secure random password
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Function to generate a secure random password
function generateSecurePassword(length = 12) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
  let password = ''
  
  // Ensure at least one uppercase, lowercase, number, and special char
  password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]
  password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]
  password += '0123456789'[Math.floor(Math.random() * 10)]
  password += '!@#$%^&*'[Math.floor(Math.random() * 8)]
  
  // Fill the rest randomly
  for (let i = 4; i < length; i++) {
    password += chars[Math.floor(Math.random() * chars.length)]
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('')
}

// In the create user API:
const temporaryPassword = generateSecurePassword()

const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
  email,
  password: temporaryPassword,
  email_confirm: true,
  user_metadata: {
    full_name,
    user_type,
    must_change_password: true // Flag to force password change on first login
  }
})

// Return credentials to admin (should be sent via secure email)
return NextResponse.json({
  success: true,
  message: `User created successfully! Temporary credentials have been generated.`,
  user_id: authUser.user.id,
  credentials: {
    email,
    temporary_password: temporaryPassword,
    note: "User must change password on first login"
  }
})
