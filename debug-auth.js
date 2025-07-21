// Test auth and check current user session
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

let supabaseUrl, supabaseKey;

try {
  const envPath = path.join(__dirname, '.env.local');
  const envFile = fs.readFileSync(envPath, 'utf8');
  
  envFile.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key === 'NEXT_PUBLIC_SUPABASE_URL') {
      supabaseUrl = value;
    }
    if (key === 'SUPABASE_SERVICE_ROLE_KEY') {
      supabaseKey = value;
    }
  });
} catch (error) {
  console.error('Error reading .env.local:', error);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAuth() {
  console.log('🔐 Testing Authentication\n');
  
  // Check all users
  const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
  
  if (usersError) {
    console.error('❌ Error listing users:', usersError);
    return;
  }
  
  console.log(`👥 Total users: ${users.users.length}`);
  
  users.users.forEach(user => {
    console.log(`   - ${user.email} (ID: ${user.id})`);
    console.log(`     Metadata:`, user.user_metadata);
    console.log(`     App Metadata:`, user.app_metadata);
  });
  
  // Check profiles
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*');
    
  console.log(`\n👤 Profiles: ${profiles?.length || 0}`);
  if (profiles) {
    profiles.forEach(profile => {
      console.log(`   - ${profile.email} (${profile.role}) - Profile ID: ${profile.id}`);
    });
  }
  
  // Check if there's a teacher we can use to test
  const teacherUser = users.users.find(u => u.user_metadata?.role === 'teacher' || profiles?.find(p => p.id === u.id && p.role === 'teacher'));
  
  if (teacherUser) {
    console.log(`\n🎯 Found teacher user: ${teacherUser.email} (ID: ${teacherUser.id})`);
    
    // Check events for this teacher
    const { data: events } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('teacher_id', teacherUser.id);
      
    console.log(`   📅 This teacher has ${events?.length || 0} events`);
  }
}

testAuth().then(() => {
  console.log('\n✅ Auth test complete');
}).catch(error => {
  console.error('❌ Auth test failed:', error);
});
