import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  vus: 10, // Virtual Users
  duration: '30s', // Test duration
};

export default function () {
  const url = 'http://localhost:3000/dashboard';
  
  // Note: Local tests need a valid session cookie to bypass login
  // You would typically get this cookie by logging in first
  const params = {
    cookies: {
      'authjs.session-token': 'YOUR_SESSION_TOKEN_HERE',
    },
  };

  const res = http.get(url, params);
  
  check(res, {
    'is status 200': (r) => r.status === 200,
    'load time < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1);
}
