#!/usr/bin/env node

// Test script for student functionality
const fs = require('fs');

const testResults = {
  timestamp: new Date().toISOString(),
  credentials: {
    email: "sofeaqistina@spectrum2u.com",
    password: "studentsophie"
  },
  tests: []
};

const testEndpoints = [
  {
    name: "Database Test",
    url: "http://localhost:3000/api/test-db",
    method: "GET"
  },
  {
    name: "Login Test", 
    url: "http://localhost:3000/api/auth/signin",
    method: "POST",
    body: {
      email: "sofeaqistina@spectrum2u.com",
      password: "studentsophie"
    }
  }
];

async function runTests() {
  console.log("🧪 Starting student functionality tests...");
  console.log(`📧 Testing with email: ${testResults.credentials.email}`);
  
  for (const test of testEndpoints) {
    console.log(`\n🔍 Testing: ${test.name}`);
    
    try {
      const options = {
        method: test.method,
        headers: {
          'Content-Type': 'application/json',
        }
      };
      
      if (test.body) {
        options.body = JSON.stringify(test.body);
      }
      
      const response = await fetch(test.url, options);
      const data = await response.text();
      
      const result = {
        name: test.name,
        url: test.url,
        status: response.status,
        statusText: response.statusText,
        success: response.ok,
        response: data,
        timestamp: new Date().toISOString()
      };
      
      testResults.tests.push(result);
      
      if (response.ok) {
        console.log(`✅ ${test.name}: PASSED (${response.status})`);
      } else {
        console.log(`❌ ${test.name}: FAILED (${response.status})`);
        console.log(`   Response: ${data.substring(0, 200)}...`);
      }
      
    } catch (error) {
      const result = {
        name: test.name,
        url: test.url,
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
      
      testResults.tests.push(result);
      console.log(`❌ ${test.name}: ERROR - ${error.message}`);
    }
  }
  
  // Save results
  fs.writeFileSync(
    'student-test-results.json', 
    JSON.stringify(testResults, null, 2)
  );
  
  console.log("\n📊 Test Summary:");
  console.log(`   Total tests: ${testResults.tests.length}`);
  console.log(`   Passed: ${testResults.tests.filter(t => t.success).length}`);
  console.log(`   Failed: ${testResults.tests.filter(t => !t.success).length}`);
  console.log("   Results saved to: student-test-results.json");
}

runTests().catch(console.error);
