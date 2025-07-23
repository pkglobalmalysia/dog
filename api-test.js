// AUTOMATED API TESTING HELPER
// Run this in Node.js to test API endpoints

const https = require('http');

class APITester {
    constructor(baseUrl = 'http://localhost:3000') {
        this.baseUrl = baseUrl;
        this.results = {};
    }

    async makeRequest(path, method = 'GET', data = null, headers = {}) {
        return new Promise((resolve, reject) => {
            const url = new URL(path, this.baseUrl);
            const options = {
                hostname: url.hostname,
                port: url.port || 3000,
                path: url.pathname + url.search,
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    ...headers
                }
            };

            const req = https.request(options, (res) => {
                let body = '';
                res.on('data', chunk => body += chunk);
                res.on('end', () => {
                    try {
                        const parsedBody = body ? JSON.parse(body) : {};
                        resolve({
                            status: res.statusCode,
                            headers: res.headers,
                            data: parsedBody
                        });
                    } catch (e) {
                        resolve({
                            status: res.statusCode,
                            headers: res.headers,
                            data: body
                        });
                    }
                });
            });

            req.on('error', reject);
            
            if (data) {
                req.write(JSON.stringify(data));
            }
            
            req.end();
        });
    }

    async testEndpoint(name, path, expectedStatus = 200, method = 'GET', data = null) {
        try {
            console.log(`🧪 Testing ${name}: ${method} ${path}`);
            const result = await this.makeRequest(path, method, data);
            
            const success = result.status === expectedStatus;
            const status = success ? '✅' : '❌';
            
            console.log(`${status} ${name}: Status ${result.status} (expected ${expectedStatus})`);
            
            if (!success) {
                console.log(`   Error details:`, result.data);
            }
            
            this.results[name] = {
                success,
                expectedStatus,
                actualStatus: result.status,
                data: result.data
            };
            
            return result;
        } catch (error) {
            console.log(`❌ ${name}: Request failed -`, error.message);
            this.results[name] = {
                success: false,
                error: error.message
            };
        }
    }

    async runBasicTests() {
        console.log('🚀 Running Basic API Tests...\n');
        
        // Test public endpoints that should work without auth
        await this.testEndpoint('Admin Check', '/api/check-admin');
        await this.testEndpoint('Courses List', '/api/courses');  
        await this.testEndpoint('Events List', '/api/events');
        
        // Test auth-required endpoints (should return 400/401)
        await this.testEndpoint('Course Creation (no auth)', '/api/courses', 400, 'POST', {
            title: 'Test Course',
            description: 'Test'
        });
        
        await this.testEndpoint('Mark Complete (no auth)', '/api/teacher/mark-complete', 400, 'POST', {
            calendar_event_id: 'test-id'
        });
        
        console.log('\n📊 Test Results Summary:');
        console.table(this.results);
        
        const passed = Object.values(this.results).filter(r => r.success).length;
        const total = Object.keys(this.results).length;
        
        console.log(`\n🎯 Results: ${passed}/${total} tests passed`);
        
        return this.results;
    }

    async testDataIntegrity() {
        console.log('🔍 Testing Data Integrity...\n');
        
        // Test that courses have required fields
        const coursesResult = await this.makeRequest('/api/courses');
        if (coursesResult.status === 200 && coursesResult.data.courses) {
            const courses = coursesResult.data.courses;
            console.log(`📚 Found ${courses.length} courses`);
            
            courses.forEach((course, index) => {
                const requiredFields = ['id', 'title', 'teacher_name', 'scheduled_time'];
                const missingFields = requiredFields.filter(field => !course[field]);
                
                if (missingFields.length === 0) {
                    console.log(`✅ Course ${index + 1}: "${course.title}" - All required fields present`);
                } else {
                    console.log(`❌ Course ${index + 1}: "${course.title}" - Missing fields: ${missingFields.join(', ')}`);
                }
            });
        }
        
        // Test that events have required fields  
        const eventsResult = await this.makeRequest('/api/events');
        if (eventsResult.status === 200 && Array.isArray(eventsResult.data)) {
            const events = eventsResult.data;
            console.log(`📅 Found ${events.length} events`);
            
            const eventTypes = {};
            events.forEach(event => {
                eventTypes[event.event_type] = (eventTypes[event.event_type] || 0) + 1;
            });
            
            console.log('📊 Event types distribution:', eventTypes);
        }
    }
}

// Run the tests
async function runTests() {
    const tester = new APITester();
    
    console.log('🔧 COMPREHENSIVE API TESTING');
    console.log('============================\n');
    
    await tester.runBasicTests();
    console.log('\n' + '='.repeat(50) + '\n');
    await tester.testDataIntegrity();
    
    console.log('\n✨ Testing complete! Check results above.');
}

// Export for use in other contexts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { APITester, runTests };
}

// Run automatically if called directly
if (require.main === module) {
    runTests().catch(console.error);
}

console.log('📋 API Testing helper loaded!');
console.log('💡 Run: node api-test.js');
console.log('🌐 Or run in browser console for UI context');
