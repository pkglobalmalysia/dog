console.log('🧪 Testing Create User API...');

// Test the Create User API directly
const testData = {
    email: `test.user.${Date.now()}@example.com`,
    password: 'TestPassword123!',
    fullName: 'Test User Name',
    role: 'student',
    icNumber: `IC${Date.now()}`,
    address: '123 Test Street'
};

console.log('📤 Sending request with data:', testData);

fetch('http://localhost:3000/api/admin/create-user', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify(testData)
})
.then(response => {
    console.log('📊 Response status:', response.status);
    return response.json();
})
.then(data => {
    console.log('📊 Response data:', data);
    if (data.error) {
        console.error('❌ Error:', data.error);
    } else {
        console.log('✅ Success! User created:', data);
    }
})
.catch(error => {
    console.error('❌ Request failed:', error.message);
});
