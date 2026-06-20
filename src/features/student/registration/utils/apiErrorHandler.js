const strategies = {
  ACTION_VALIDATION_FAILURE: (error, setError, setErrorModal, setCurrentStep) => {
    const rawDetails = error.details?.rawDetails || [];
    let shouldGoToStep1 = false;
    
    // Mapping from API request payload path to frontend react-hook-form name
    const fieldMapping = {
      'profile.student_name': 'fullName',
      'profile.email': 'email',
      'profile.dob': 'dob',
      'profile.gender': 'gender',
      'contact.mobile_number': 'mobile',
      'address.line1': 'address1',
      'address.city': 'city',
      'address.state': 'state',
      'address.pin_code': 'pincode',
      'contact.emergency_name': 'emergencyContactName',
      'contact.emergency_relationship': 'emergencyContactRelationship',
      'contact.emergency_phone': 'emergencyContactPhone',
    };

    rawDetails.forEach(item => {
      const fieldName = fieldMapping[item.field] || item.field;
      setError(fieldName, { type: 'server', message: item.issue || 'Field failed validation.' });
      
      // Step 1 check
      if ([
        'fullName', 'mobile', 'gender', 'dob', 'email', 
        'address1', 'city', 'state', 'pincode', 
        'emergencyContactName', 'emergencyContactPhone', 'emergencyContactRelationship'
      ].includes(fieldName)) {
        shouldGoToStep1 = true;
      }
    });

    if (shouldGoToStep1) {
      setCurrentStep(1);
    }

    setErrorModal({
      isOpen: true,
      title: 'Action Validation Failed',
      error: {
        type: 'ACTION_VALIDATION_FAILURE',
        message: error.message || 'One or more fields failed client-side action validation.',
        details: JSON.stringify({
          correlationId: error.details?.correlationId || 'N/A',
          issues: rawDetails
        }, null, 2)
      }
    });
  },

  VALIDATION_FAILURE: (error, setError, setErrorModal, setCurrentStep) => {
    const rawDetails = error.details?.rawDetails || {};
    const errorsList = rawDetails.errors || [];
    let shouldGoToStep1 = false;

    // Mapping from database schema column names to frontend react-hook-form names
    const fieldMapping = {
      'student_name': 'fullName',
      'email': 'email',
      'dob': 'dob',
      'gender': 'gender',
      'mobile_number': 'mobile',
      'line1': 'address1',
      'city': 'city',
      'state': 'state',
      'pin_code': 'pincode',
      'emergency_name': 'emergencyContactName',
      'emergency_relationship': 'emergencyContactRelationship',
      'emergency_phone': 'emergencyContactPhone',
    };

    errorsList.forEach(item => {
      const fieldName = fieldMapping[item.fieldName] || item.fieldName;
      const msg = item.message || `Field '${item.fieldName}' failed validation.`;
      setError(fieldName, { type: 'server', message: msg });
      
      // Step 1 check
      if ([
        'fullName', 'mobile', 'gender', 'dob', 'email', 
        'address1', 'city', 'state', 'pincode', 
        'emergencyContactName', 'emergencyContactPhone', 'emergencyContactRelationship'
      ].includes(fieldName)) {
        shouldGoToStep1 = true;
      }
    });

    if (shouldGoToStep1) {
      setCurrentStep(1);
    }

    setErrorModal({
      isOpen: true,
      title: 'Database Constraints Failed',
      error: {
        type: 'VALIDATION_FAILURE',
        message: error.message || 'Database schema constraints validation failed.',
        details: JSON.stringify({
          correlationId: error.details?.correlationId || 'N/A',
          errors: errorsList
        }, null, 2)
      }
    });
  },

  DEFAULT: (error, setError, setErrorModal) => {
    setErrorModal({
      isOpen: true,
      title: 'API Request Error',
      error: {
        type: error.code || 'APIError',
        message: error.message || 'An unexpected error occurred during student registration.',
        details: JSON.stringify({
          correlationId: error.details?.correlationId || 'N/A',
          details: error.details?.rawDetails || null
        }, null, 2)
      }
    });
  }
};

/**
 * Strategy-pattern API Error handler and RHF error mapper dispatcher.
 * 
 * @param {object} response - The API response object (success: false envelope).
 * @param {function} setError - RHF setError callback.
 * @param {function} setErrorModal - State setter for display error modal.
 * @param {function} setCurrentStep - State setter for active wizard step.
 */
export const handleAPIError = (response, setError, setErrorModal, setCurrentStep) => {
  const errorObj = response?.error || {};
  const code = errorObj.code || 'DEFAULT';
  const correlationId = response?.meta?.correlation_id;

  const errorContext = {
    ...errorObj,
    details: {
      rawDetails: errorObj.details,
      correlationId: correlationId || 'N/A'
    }
  };

  const strategy = strategies[code] || strategies.DEFAULT;
  strategy(errorContext, setError, setErrorModal, setCurrentStep);
};
