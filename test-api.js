const fetch = require('node-fetch');

(async () => {
  try {
    const res = await fetch('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test', email: 'test@test.com', password: 'password123' })
    });
    const text = await res.text();
    console.log('STATUS:', res.status);
    console.log('BODY:', text);
  } catch (e) {
    console.error(e);
  }
})();
