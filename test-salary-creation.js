// Test script for salary creation
const fetch = require('node-fetch');

async function testSalaryCreation() {
  try {
    console.log('Testing salary creation API...');
    
    // Test data
    const testData = {
      teacher_id: "test-teacher-id", // Replace with actual teacher ID
      month: 7,
      year: 2025,
      total_classes: 20,
      total_amount: 2000.00,
      bonus_amount: 200.00,
      status: 'pending'
    };
    
    console.log('Test data:', testData);
    
    // Make API call
    const response = await fetch('http://localhost:3000/api/admin/add-teacher-salary', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    const result = await response.json();
    console.log('API Response:', result);
    
    if (result.success) {
      console.log('✅ Salary creation successful!');
      console.log('Created salary record:', result.salary);
    } else {
      console.log('❌ Salary creation failed:', result.error);
    }
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

// Run the test
testSalaryCreation();
