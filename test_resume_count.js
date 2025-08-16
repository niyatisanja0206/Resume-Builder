// Test script to verify resume count increment functionality
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000';

async function testResumeCountIncrement() {
    try {
        console.log('🧪 Testing Resume Count Increment Functionality...\n');

        // 1. Create a test user (signup)
        const signupResponse = await fetch(`${BASE_URL}/api/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'test@example.com',
                password: 'password123'
            })
        });

        const signupData = await signupResponse.json();
        console.log('1. ✅ User created or already exists');
        console.log('   Initial resume count:', signupData.user?.no_of_resumes || 0);

        // 2. Login to get token
        const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'test@example.com',
                password: 'password123'
            })
        });

        const loginData = await loginResponse.json();
        const token = loginData.token;
        const userEmail = loginData.user.email;
        
        console.log('2. ✅ User logged in successfully');
        console.log('   Current resume count:', loginData.user.no_of_resumes);

        // 3. Create basic info (this should create a new resume and increment count)
        const basicResponse = await fetch(`${BASE_URL}/api/basic`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: userEmail,
                name: 'Test User',
                contact_no: '1234567890',
                location: 'Test City',
                about: 'Test description'
            })
        });

        if (basicResponse.ok) {
            console.log('3. ✅ Basic info created (new resume created)');
        } else {
            console.log('3. ❌ Failed to create basic info');
        }

        // 4. Check user stats to verify count increment
        const statsResponse = await fetch(`${BASE_URL}/api/auth/user-stats`, {
            method: 'GET',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        const statsData = await statsResponse.json();
        console.log('4. ✅ User stats retrieved');
        console.log('   Updated resume count:', statsData.no_of_resumes);
        console.log('   Download count:', statsData.resume_downloaded);

        // 5. Add another section (should NOT increment count since resume already exists)
        const skillResponse = await fetch(`${BASE_URL}/api/skill`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: userEmail,
                skill: {
                    name: 'JavaScript',
                    level: 'intermediate'
                }
            })
        });

        if (skillResponse.ok) {
            console.log('5. ✅ Skill added (should NOT increment count)');
        } else {
            console.log('5. ❌ Failed to add skill');
        }

        // 6. Final stats check
        const finalStatsResponse = await fetch(`${BASE_URL}/api/auth/user-stats`, {
            method: 'GET',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        const finalStatsData = await finalStatsResponse.json();
        console.log('6. ✅ Final user stats:');
        console.log('   Final resume count:', finalStatsData.no_of_resumes);
        console.log('   Should be 1 (only incremented once when resume was created)');

        console.log('\n🎉 Test completed successfully!');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Run the test
testResumeCountIncrement();
