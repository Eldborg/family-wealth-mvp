import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
export const errorRate = new Rate('errors');
export const duration = new Trend('request_duration');
export const loginCounter = new Counter('logins');
export const goalCreations = new Counter('goal_creations');

// Test configuration
export const options = {
  stages: [
    { duration: '2m', target: 20 }, // Ramp up to 20 users
    { duration: '3m', target: 50 }, // Ramp up to 50 users
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 20 }, // Ramp down
    { duration: '1m', target: 0 }, // Finish
  ],
  thresholds: {
    errors: ['rate<0.1'], // <10% errors
    'request_duration': ['p(95)<500'], // p95 <500ms
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001';

export default function () {
  // Test data
  const testUser = {
    email: `user_${__VU}_${__ITER}@test.com`,
    password: 'TestPassword123!',
    name: `Test User ${__VU}`,
  };

  group('User Registration', () => {
    const signupRes = http.post(`${BASE_URL}/api/auth/register`, JSON.stringify(testUser), {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const isSuccess =
      check(signupRes, {
        'signup status is 201': (r) => r.status === 201,
        'signup response valid': (r) => r.body.includes('success'),
      }) || false;

    errorRate.add(!isSuccess);
    duration.add(signupRes.timings.duration);
  });

  sleep(1);

  let authToken = '';

  group('User Login', () => {
    const loginRes = http.post(
      `${BASE_URL}/api/auth/login`,
      JSON.stringify({
        email: testUser.email,
        password: testUser.password,
      }),
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const isSuccess =
      check(loginRes, {
        'login status is 200': (r) => r.status === 200,
        'login returns token': (r) => r.body.includes('token'),
      }) || false;

    if (isSuccess) {
      const loginData = JSON.parse(loginRes.body);
      authToken = loginData.token;
      loginCounter.add(1);
    }

    errorRate.add(!isSuccess);
    duration.add(loginRes.timings.duration);
  });

  sleep(1);

  if (authToken) {
    group('Fetch Goals', () => {
      const goalsRes = http.get(`${BASE_URL}/api/goals`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      const isSuccess =
        check(goalsRes, {
          'get goals status is 200': (r) => r.status === 200,
          'goals response valid': (r) => r.body.includes('success'),
        }) || false;

      errorRate.add(!isSuccess);
      duration.add(goalsRes.timings.duration);
    });

    sleep(1);

    group('Create Goal', () => {
      const goalData = {
        familyGroupId: 'default',
        title: `Goal ${__ITER}`,
        targetAmount: 5000 + Math.random() * 10000,
        deadline: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
        category: ['education', 'vacation', 'home', 'investment'][Math.floor(Math.random() * 4)],
      };

      const createRes = http.post(`${BASE_URL}/api/goals`, JSON.stringify(goalData), {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      const isSuccess =
        check(createRes, {
          'create goal status is 201': (r) => r.status === 201,
          'goal created successfully': (r) => r.body.includes('success'),
        }) || false;

      if (isSuccess) {
        goalCreations.add(1);
      }

      errorRate.add(!isSuccess);
      duration.add(createRes.timings.duration);
    });

    sleep(1);
  }
}

export function handleSummary(data) {
  return {
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}
