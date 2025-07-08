export const logUserAction = async (action: string, details: any = {}) => {
  try {
    const logData = {
      action,
      details,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    await fetch('http://localhost:3001/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(logData),
    });

    console.log(`[Log] ${action}`, details);
  } catch (error) {
    console.error('[Log Error]:', error);
  }
};
