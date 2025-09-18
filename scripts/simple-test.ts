import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';

async function simpleTest() {
  try {
    console.log('Testing basic connectivity...');
    await axios.get(`http://localhost:8000/api-docs`);
    console.log('✅ Server is reachable');

    // Test login
    console.log('Testing login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/users/login`, {
      email: 'myselfharshal2004@gmail.com',
      password: 'harshal2004',
    });

    console.log('✅ Login successful');
    console.log('Response:', loginResponse.data);
  } catch (error: unknown) {
    const err = error as Error & {
      response?: { status: number; data: unknown };
    };
    console.log('❌ Error:', err.message);
    if (err.response) {
      console.log('Status:', err.response.status);
      console.log('Data:', err.response.data);
    }
  }
}

simpleTest();
