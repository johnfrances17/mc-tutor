const fetch = require('./server/node_modules/node-fetch');

async function testLoginAPI() {
  console.log('🧪 Testing Login API Endpoint\n');
  console.log('=' .repeat(60));
  
  const testCases = [
    {
      name: 'Valid User Login',
      email: 'johnfrancesmabeza@mabinicolleges.edu.ph',
      password: 'Frances1*',
      shouldWork: true
    },
    {
      name: 'Admin Login',
      email: 'admin@mabinicolleges.edu.ph',
      password: 'admin123',
      shouldWork: true
    },
    {
      name: 'Wrong Password',
      email: 'johnfrancesmabeza@mabinicolleges.edu.ph',
      password: 'wrongpass',
      shouldWork: false
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n📋 Test: ${testCase.name}`);
    console.log('-'.repeat(60));
    console.log(`Email: ${testCase.email}`);
    console.log(`Password: ${testCase.password.replace(/./g, '*')}`);
    console.log(`Expected: ${testCase.shouldWork ? 'SUCCESS' : 'FAIL'}\n`);

    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: testCase.email,
          password: testCase.password
        })
      });

      const data = await response.json();
      
      console.log(`Status: ${response.status} ${response.statusText}`);
      console.log(`Success: ${data.success}`);
      
      if (data.success) {
        console.log(`✅ LOGIN SUCCESSFUL`);
        console.log(`User: ${data.data.user.full_name}`);
        console.log(`Role: ${data.data.user.role}`);
        console.log(`School ID: ${data.data.user.school_id}`);
        console.log(`Token: ${data.data.token.substring(0, 20)}...`);
      } else {
        console.log(`❌ LOGIN FAILED`);
        console.log(`Error: ${data.error?.message || data.message}`);
      }

      const resultMatch = (data.success && testCase.shouldWork) || (!data.success && !testCase.shouldWork);
      console.log(`Result: ${resultMatch ? '✅ AS EXPECTED' : '⚠️  UNEXPECTED'}`);

    } catch (error) {
      console.error(`❌ REQUEST ERROR: ${error.message}`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ API Tests Complete\n');
}

testLoginAPI().catch(console.error);
