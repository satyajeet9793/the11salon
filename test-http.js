const http = require('http');

http.get('http://localhost:3000/api/admin/appointments?date=2026-06-10', (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log("Status:", res.statusCode);
    console.log("Response:", data);
  });
}).on('error', (err) => {
  console.log("Error:", err.message);
});
