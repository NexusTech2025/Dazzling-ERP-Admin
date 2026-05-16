/**
 * src/services/errorMapper.js
 * Translates backend error codes/strings to user-friendly messages.
 */
export const getFriendlyErrorMessage = (backendMessage, actionPath) => {
  console.log("Mapping backend error message:", backendMessage, "for action:", actionPath);

  // 1. Safely extract the message string if backendMessage is an object (as per API spec)
  const rawMessage = typeof backendMessage === 'object' 
    ? (backendMessage?.message || backendMessage?.error || "") 
    : (backendMessage || "");

  const message = String(rawMessage).toLowerCase();

  if (message.includes("not found")) {
    return "The requested record could not be found. It may have been deleted.";
  }
  if (message.includes("duplicate") || message.includes("already exists")) {
    return "A record with this information already exists in the system.";
  }
  if (message.includes("invalid token") || message.includes("unauthorized")) {
    return "Your session has expired or is invalid. Please log in again.";
  }
  
  // If the backend provided a specific descriptive message (like Auth errors), surface it.
  if (rawMessage && rawMessage.trim().length > 0) {
    return rawMessage;
  }
  
  // Default fallback
  return `An error occurred while processing your request (${actionPath}). Please try again.`;
};
