# API Design & Connection Strategy

The Dazzling ERP system uses a **Centralized Static Registry Pattern** for all backend communications via Google Apps Script (GAS).

## 1. Core Architecture

The API interaction is decoupled into three layers:
1.  **Registry (`apiRegistry.js`)**: Maps logical domain actions to backend action strings.
2.  **Client (`apiClient.js`)**: A central dispatcher using `fetch` to execute registered actions.
3.  **Error Handling**: Custom `ApiError` class and `errorMapper.js` for user-friendly messaging.

## 2. Connection Strategy

- **Endpoint**: Single Google Apps Script Web App URL.
- **Method**: Always `POST`.
- **CORS Bypass**: Requests use `Content-Type: text/plain;charset=utf-8` to avoid preflight (OPTIONS) requests, as GAS doesn't handle them natively.
- **Envelope Protocol**:
    ```json
    {
      "action": "backend_action_string",
      "token": "auth_token",
      "payload": { ...data }
    }
    ```

## 3. The Dispatcher (`executeAction`)

All feature modules should use `executeAction` from `apiClient.js` instead of direct `fetch` or `axios` calls.

```javascript
import { executeAction } from '../services/apiClient';

// Usage
const result = await executeAction('DOMAIN.ACTION', payload, token);
```

## 4. Registry Domains

- **AUTH**: Login, Register, Logout.
- **STUDENT**: Student lifecycle (registration, etc.).
- **ACADEMIC**: Course, Batch, and Enrollment management.
- **DATA**: Generic CRUD operations.
- **STAFF**: Teacher onboarding, attendance, and salary.
- **ADMIN**: Schema retrieval and table maintenance.
