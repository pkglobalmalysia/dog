// Alternative: Create user and send password reset email
const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
  email,
  password: 'temporary_password_' + Date.now(), // Temporary, they won't use this
  email_confirm: true,
  user_metadata: {
    full_name,
    user_type
  }
})

// Immediately send password reset email
const { error: resetError } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
  redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`
})

return NextResponse.json({
  success: true,
  message: `User created successfully! A password setup email has been sent to ${email}`,
  user_id: authUser.user.id,
  note: "User will receive an email to set their password"
})
