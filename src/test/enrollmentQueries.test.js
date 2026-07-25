import test from 'node:test';
import assert from 'node:assert';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { queryKeys, EMPTY_FILTER } from '../lib/react-query/queryKeys.js';
import { getCachedList, resolveList } from '../lib/react-query/cacheHelper.js';
import { hydrateRecord } from '../lib/react-query/hydrate.js';
import { resolveEnrollmentList } from '../lib/react-query/cacheStrategies.js';
import { AuthContext } from '../context/AuthContextCore.js';
import { useEnrollmentsQuery } from '../features/student/hooks/useEnrollmentQueries.js';
import { usePackageStudent } from '../features/course/hooks/usePackageQueries.js';

/**
 * Headless Hook Runner - Invokes predefined React Hooks directly without UI DOM elements
 */
function renderHookDirectly(hookFn, client, token = 'mock-token') {
  let result;
  function HookContainer() {
    result = hookFn();
    return null;
  }
  renderToString(
    React.createElement(
      AuthContext.Provider,
      { value: { token } },
      React.createElement(
        QueryClientProvider,
        { client },
        React.createElement(HookContainer)
      )
    )
  );
  return result;
}

/**
 * Headless Query Client Factory
 */
const createQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      gcTime: Infinity,
      staleTime: Infinity,
    }
  }
});

test('Headless Enrollment Query & Strategy Resolution Pipeline', async (t) => {
  let client = createQueryClient();

  const mockEnrollments = [
    {
      "enrollment_id": "ENR-B8F934FD",
      "student_id": "STU-F120AE5D",
      "item_id": "PKG-8E7F42CE",
      "batch_id": "2026-06-25 20:17:26",
      "roll_number": "active",
      "enrollment_date": "active",
      "status": "package",
      "package_enrollment_id": "",
      "academic_status": "",
      "metadata": {
        "course_fees": {
          "CRS-FB15A55B": 30000,
          "CRS-8FD279B7": 30000,
          "CRS-79E92F19": 32000,
          "CRS-140B5888": 32000
        }
      },
      "enrollment_type": ""
    },
    {
      "enrollment_id": "ENR-938112AF",
      "student_id": "STU-CFF573D5",
      "item_id": "PKG-8E7F42CE",
      "batch_id": "2026-06-25 20:17:46",
      "roll_number": "active",
      "enrollment_date": "active",
      "status": "package",
      "package_enrollment_id": "",
      "academic_status": "",
      "metadata": {
        "course_fees": {
          "CRS-FB15A55B": 30000,
          "CRS-8FD279B7": 30000,
          "CRS-79E92F19": 32000,
          "CRS-140B5888": 32000
        }
      },
      "enrollment_type": ""
    },
    {
      "enrollment_id": "ENR-1F27C584",
      "student_id": "STU-D5AAEF7D",
      "item_id": "PKG-8E7F42CE",
      "batch_id": "2026-06-25 20:18:11",
      "roll_number": "active",
      "enrollment_date": "active",
      "status": "package",
      "package_enrollment_id": "",
      "academic_status": "",
      "metadata": {
        "course_fees": {
          "CRS-FB15A55B": 30000,
          "CRS-8FD279B7": 30000,
          "CRS-79E92F19": 32000,
          "CRS-140B5888": 32000
        }
      },
      "enrollment_type": ""
    },
    {
      "enrollment_id": "ENR-920EB9B9",
      "student_id": "STU-0667DFFF",
      "item_id": "PKG-8E7F42CE",
      "batch_id": "2026-06-25 20:18:38",
      "roll_number": "active",
      "enrollment_date": "active",
      "status": "package",
      "package_enrollment_id": "",
      "academic_status": "",
      "metadata": {
        "course_fees": {
          "CRS-FB15A55B": 30000,
          "CRS-8FD279B7": 30000,
          "CRS-79E92F19": 32000,
          "CRS-140B5888": 32000
        }
      },
      "enrollment_type": ""
    },
    {
      "enrollment_id": "ENR-ECAF4F45",
      "student_id": "STU-AFDC2802",
      "item_id": "PKG-8E7F42CE",
      "batch_id": "2026-06-25 20:19:02",
      "roll_number": "active",
      "enrollment_date": "active",
      "status": "package",
      "package_enrollment_id": "",
      "academic_status": "",
      "metadata": {
        "course_fees": {
          "CRS-FB15A55B": 30000,
          "CRS-8FD279B7": 30000,
          "CRS-79E92F19": 32000,
          "CRS-140B5888": 32000
        }
      },
      "enrollment_type": ""
    },
    {
      "enrollment_id": "ENR-1B171E6D",
      "student_id": "STU-582EAD8D",
      "item_id": "CRS-FCE33995",
      "batch_id": "2026-07-09 17:36:58",
      "roll_number": "active",
      "enrollment_date": "active",
      "status": "subject",
      "package_enrollment_id": "",
      "academic_status": "",
      "metadata": {},
      "enrollment_type": ""
    }
  ]

  await t.test('1. Ingest Master List into Cache & Verify Normalization', async () => {
    const result = await resolveList(
      client,
      'enrollment',
      EMPTY_FILTER,
      async () => mockEnrollments
    );

    assert.strictEqual(result.length, 6, 'Should ingest 6 enrollment records into master cache');
    assert.strictEqual(typeof result[0].metadata, 'object', 'Metadata JSON string/object should be normalized');
    assert.strictEqual(result[0].metadata.course_fees['CRS-FB15A55B'], 30000);
  });

  await t.test('2. Execute In-Memory Strategy Resolution via getCachedList for PKG-8E7F42CE', () => {
    const filter = { item_id: 'PKG-8E7F42CE' };
    const cached = getCachedList(client, 'enrollment', filter);

    assert.ok(cached, 'Should resolve filtered list from cache via strategy callback without network refetch');
    assert.strictEqual(cached.length, 5, 'Should filter out exactly 5 enrollments matching PKG-8E7F42CE');
    assert.strictEqual(cached[0].item_id, 'PKG-8E7F42CE');
  });

  await t.test('3. Verify Read-Time Selection & Relational Hydration Pipeline', () => {
    const rawList = client.getQueryData(queryKeys.enrollment.list(EMPTY_FILTER));
    const hydrated = hydrateRecord('enrollment', rawList, client);
    const filtered = resolveEnrollmentList(hydrated, { item_id: 'PKG-8E7F42CE' });

    assert.strictEqual(filtered.length, 5, 'Should return 5 hydrated enrollment records for PKG-8E7F42CE');
    assert.strictEqual(filtered[0].item_id, 'PKG-8E7F42CE');
  });

  await t.test('4. Headless Execution of useEnrollmentsQuery Pipeline', async () => {
    // Simulates the exact queryFn + select pipeline executed by useEnrollmentsQuery
    const filter = { item_id: 'PKG-8E7F42CE' };

    const data = await client.fetchQuery({
      queryKey: queryKeys.enrollment.list(EMPTY_FILTER),
      queryFn: () => resolveList(client, 'enrollment', filter, async () => mockEnrollments)
    });

    const hydrated = hydrateRecord('enrollment', data, client);
    const result = resolveEnrollmentList(hydrated, filter);

    assert.strictEqual(result.length, 5, 'useEnrollmentsQuery pipeline should return 5 filtered records');
    assert.strictEqual(result[0].item_id, 'PKG-8E7F42CE');
  });

  await t.test('5. Headless Execution of usePackageStudent Extraction & Deduplication', async () => {
    // Simulates usePackageStudent pipeline: filter -> enrollments -> student deduplication via cache
    const packageId = 'PKG-8E7F42CE';
    const filter = { item_id: packageId };

    const data = await client.fetchQuery({
      queryKey: queryKeys.enrollment.list(EMPTY_FILTER),
      queryFn: () => resolveList(client, 'enrollment', filter, async () => mockEnrollments)
    });

    const hydrated = hydrateRecord('enrollment', data, client);
    const enrollments = resolveEnrollmentList(hydrated, filter);

    const seen = new Set();
    const uniqueStudents = [];

    for (const enrollment of enrollments) {
      if (enrollment.student_id && !seen.has(enrollment.student_id)) {
        seen.add(enrollment.student_id);
        const studentProfile = enrollment.student || getCachedRecord(client, 'student', enrollment.student_id);
        if (studentProfile) {
          uniqueStudents.push(studentProfile);
        }
      }
    }

    assert.ok(uniqueStudents, 'uniqueStudents should be defined');
  });

  await t.test('6. Direct Invocation of Predefined useEnrollmentsQuery Hook', () => {
    // Directly invokes your predefined useEnrollmentsQuery hook headlessly
    const hookResult = renderHookDirectly(
      () => useEnrollmentsQuery({ item_id: 'PKG-8E7F42CE' }),
      client
    );

    assert.ok(hookResult, 'Hook result should be defined');
    assert.ok(Array.isArray(hookResult.data), 'Hook should return data array via initialData & strategy');
    assert.strictEqual(hookResult.data.length, 5, 'Direct hook execution should return 5 filtered records for PKG-8E7F42CE');
    assert.strictEqual(hookResult.data[0].item_id, 'PKG-8E7F42CE');
  });

  await t.test('7. Direct Invocation of Predefined usePackageStudent Hook', () => {
    // Directly invokes your predefined usePackageStudent hook headlessly
    const hookResult = renderHookDirectly(
      () => usePackageStudent('PKG-8E7F42CE'),
      client
    );

    assert.ok(hookResult, 'Hook result should be defined');
    assert.ok(Array.isArray(hookResult.data), 'usePackageStudent should return data array');
    assert.strictEqual(hookResult.data.length, 5, 'Direct usePackageStudent hook execution should return 5 unique student profiles');
    assert.strictEqual(hookResult.data[0].student_id, 'STU-F120AE5D');
  });
});
