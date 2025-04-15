// src/utils/botDetection.ts

/**
 * Simple bot detection using request attributes
 * Note: This is basic detection and could be enhanced with more sophisticated techniques
 */
export function isBotRequest(req: Request, body: any): boolean {
  // Check headers for bot signatures
  const userAgent = req.headers.get('user-agent') || '';
  if (!userAgent || 
      userAgent.toLowerCase().includes('bot') || 
      userAgent.toLowerCase().includes('crawl') ||
      userAgent.toLowerCase().includes('spider')) {
    return true;
  }
  
  // Check for missing referer on non-GET requests
  const referer = req.headers.get('referer');
  const origin = req.headers.get('origin');
  if (req.method !== 'GET' && !referer && !origin) {
    return true;
  }
  
  // Check message content for potential spam patterns
  if (body.messages && body.messages.length > 0) {
    const lastMessage = body.messages[body.messages.length - 1];
    const content = lastMessage.content || '';
    
    // Check for excessive URLs - often a sign of spam
    const urlCount = (content.match(/https?:\/\//g) || []).length;
    if (urlCount > 3) {
      return true;
    }
  }
  
  return false;
}

/**
 * Basic content filtering
 * Detects potentially harmful or inappropriate content
 */
export function containsInappropriateContent(text: string): boolean {
  const inappropriatePatterns = [
    /hack\s+(password|account|email)/i,
    /steal\s+(identity|credit\s+card)/i,
    /(make|create|build)\s+(bomb|weapon|virus)/i,
    /(illegal|illicit)\s+(drug|substance)/i,
    /(attack|exploit)\s+(website|server|database)/i
  ];
  
  return inappropriatePatterns.some(pattern => pattern.test(text));
}
