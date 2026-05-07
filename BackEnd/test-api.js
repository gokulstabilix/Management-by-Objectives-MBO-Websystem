const http = require('http');

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost', port: 5000,
      path, method,
      headers: { 'Content-Type': 'application/json' },
    };
    if (token) options.headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function run() {
  console.log('=== 1. Health Check ===');
  const health = await request('GET', '/health');
  console.log(health.status, health.body);

  console.log('\n=== 2. Login as Admin ===');
  const login = await request('POST', '/api/auth/login', { email: 'admin@mbo.com', password: 'Admin@1234' });
  console.log(login.status, JSON.stringify(login.body, null, 2));
  const token = login.body?.data?.accessToken;

  if (!token) { console.log('Login failed, stopping.'); process.exit(1); }

  console.log('\n=== 3. List Users ===');
  const users = await request('GET', '/api/users', null, token);
  console.log(users.status, JSON.stringify(users.body, null, 2));

  console.log('\n=== 4. List Quarters ===');
  const quarters = await request('GET', '/api/quarters', null, token);
  console.log(quarters.status, JSON.stringify(quarters.body, null, 2));

  console.log('\n=== 5. 404 Test ===');
  const notFound = await request('GET', '/api/nonexistent', null, token);
  console.log(notFound.status, notFound.body);

  console.log('\n=== 6. Unauthorized Test (no token) ===');
  const noAuth = await request('GET', '/api/users');
  console.log(noAuth.status, noAuth.body);

  console.log('\n✅ All tests complete.');
  process.exit(0);
}

run().catch((e) => { console.error(e); process.exit(1); });
