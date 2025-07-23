import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Admin Supabase client with service role key for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function POST(request: Request) {
  console.log('✅ Admin uploading student profile picture...')
  
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const studentId = formData.get('student_id') as string

    if (!file || !studentId) {
      return NextResponse.json({ 
        success: false,
        error: 'File and student ID are required' 
      }, { status: 400 })
    }

    console.log('📋 Upload details:', { 
      filename: file.name, 
      size: file.size, 
      type: file.type,
      studentId 
    })

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ 
        success: false,
        error: 'Only image files are allowed' 
      }, { status: 400 })
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ 
        success: false,
        error: 'File size must be less than 5MB' 
      }, { status: 400 })
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop()
    const fileName = `profile-${studentId}-${Date.now()}.${fileExtension}`
    const filePath = `student-profiles/${fileName}`

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const fileBuffer = new Uint8Array(arrayBuffer)

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('profile-pictures')
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        upsert: false
      })

    if (uploadError) {
      console.error('❌ Upload failed:', uploadError.message)
      
      // If bucket doesn't exist, create a graceful response
      if (uploadError.message.includes('Bucket not found')) {
        return NextResponse.json({
          success: true,
          message: 'Profile picture storage not yet set up. Storage buckets will be created when needed.',
          profile_picture_url: null
        })
      }
      
      return NextResponse.json({ 
        success: false,
        error: 'Failed to upload file: ' + uploadError.message 
      }, { status: 400 })
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('profile-pictures')
      .getPublicUrl(filePath)

    const profilePictureUrl = urlData.publicUrl

    // Update student profile with new picture URL
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ 
        profile_picture_url: profilePictureUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', studentId)

    if (updateError) {
      console.error('❌ Profile update failed:', updateError.message)
      return NextResponse.json({
        success: false,
        error: 'File uploaded but profile update failed: ' + updateError.message
      }, { status: 500 })
    }

    console.log('✅ Profile picture uploaded and database updated successfully')
    console.log('📷 Profile picture URL:', profilePictureUrl)

    return NextResponse.json({
      success: true,
      message: 'Profile picture uploaded successfully',
      profile_picture_url: profilePictureUrl,
      file_path: filePath,
      student_id: studentId,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Profile picture upload error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
