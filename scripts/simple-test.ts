import axios from "axios";

const API_BASE_URL = "http://localhost:8000/api/v1";

async function simpleTest() {
  try {
    console.log("Testing basic connectivity...");
    const response = await axios.get(`http://localhost:8000/api-docs`);
    console.log("✅ Server is reachable");

    // Test login
    console.log("Testing login...");
    const loginResponse = await axios.post(`${API_BASE_URL}/users/login`, {
      email: "myselfharshal2004@gmail.com",
      password: "harshal2004",
    });

    console.log("✅ Login successful");
    console.log("Response:", loginResponse.data);
  } catch (error: any) {
    console.log("❌ Error:", error.message);
    if (error.response) {
      console.log("Status:", error.response.status);
      console.log("Data:", error.response.data);
    }
  }
}

simpleTest();
