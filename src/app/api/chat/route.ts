// src/app/api/chat/route.ts
import OpenAI from 'openai';
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from 'zod';
import { nanoid } from 'nanoid';
import { systemMessage } from '@/app/constants';
import { timelineResponseSchema, appTimelineResponseSchema } from '@/types/timeline';
import { checkRateLimit, RateLimitResult } from '@/utils/rateLimit';
import { isBotRequest, containsInappropriateContent } from '@/utils/botDetection';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Input validation schema using zod
const chatRequestSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant', 'system']),
      content: z.string(),
    })
  ),
  sessionId: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    // Get IP address from headers (when behind a proxy)
    const forwardedFor = req.headers.get('x-forwarded-for');
    const clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : 'unknown';
    
    const body = await req.json();
    
    // Basic bot detection
    if (isBotRequest(req, body)) {
      return new Response(
        JSON.stringify({
          message: "Your request appears to be automated. If you're a human user, please try again with a more specific request or refresh the page.",
          error: 'potential_bot'
        }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Validate input
    const { messages, sessionId = nanoid() } = chatRequestSchema.parse(body);
    
    // Get the user message (last message in the array)
    const userMessage = messages[messages.length - 1];
    const userContent = userMessage.content.trim();
    
    // Check if the message is too long
    if (userContent.length > 2000) {
      return new Response(
        JSON.stringify({
          message: "Your message is too long. Please keep it under 2000 characters to ensure the best response quality.",
          error: 'message_too_long'
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Check for inappropriate content
    if (containsInappropriateContent(userContent)) {
      return new Response(
        JSON.stringify({
          message: "I'm sorry, but I can't process requests that may involve harmful content. If you have a legitimate request, please rephrase it.",
          error: 'inappropriate_content'
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Apply rate limiting - we'll use both session ID and IP for more robust protection
    const rateLimitResult = checkRateLimit(sessionId);
    const ipRateLimitResult = checkRateLimit(`ip-${clientIp}`, { maxRequestsPerHour: 50 });
    
    // Check if either rate limit is exceeded
    if (!rateLimitResult.success || !ipRateLimitResult.success) {
      const result = !rateLimitResult.success ? rateLimitResult : ipRateLimitResult;
      
      return new Response(
        JSON.stringify({
          message: result.userMessage,
          error: 'rate_limit_exceeded',
          resetAt: result.reset.toISOString(),
          waitTime: result.waitTime
        }),
        { 
          status: 429, 
          headers: { 
            'Content-Type': 'application/json',
            'X-Session-Id': sessionId,
            'X-RateLimit-Limit': result.limit.toString(),
            'X-RateLimit-Remaining': result.remaining.toString(),
            'X-RateLimit-Reset': Math.floor(result.reset.getTime() / 1000).toString(),
          } 
        }
      );
    }
    
    // Prepare messages for OpenAI, including system message
    const apiMessages = [
      { role: 'system' as const, content: systemMessage },
      ...messages.filter(m => m.role !== 'system').map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content
      }))
    ];
    
    // Use the beta.parse API with Zod validation
    const completion = await openai.beta.chat.completions.parse({
      model: process.env.OPENAI_MODEL || 'gpt-4o', // Make sure to use a model that supports structured output
      messages: apiMessages,
      temperature: 0.7,
      max_tokens: 1000,
      response_format: zodResponseFormat(timelineResponseSchema, "timeline"),
    });
    
    // Get the properly parsed and typed response
    const timelineData = completion.choices[0].message.parsed;
    
    // Validate with our application schema
    let validatedData;
    try {
      validatedData = appTimelineResponseSchema.parse(timelineData);
    } catch (validationError) {
      console.warn('Timeline data validation issue:', validationError);
      // We'll still use the data, but log the issue
    }
    
    // Determine a suitable message
    let responseMessage;
    const itemCount = timelineData?.items?.length ?? 0;

    // Focus on priorities instead of checking item count
    responseMessage = `I've planned your day with ${itemCount} activities focusing on your top priorities.`;
    
    // Add rate limit info to the response if the user is approaching their limit
    if (rateLimitResult.remaining <= 5) {
      responseMessage += ` ${rateLimitResult.userMessage}`;
    }
    
    // Return JSON response with the timeline data and a readable message
    return new Response(
      JSON.stringify({
        message: responseMessage,
        timeline: timelineData
      }),
      { 
        status: 200, 
        headers: { 
          'Content-Type': 'application/json',
          'X-Session-Id': sessionId,
          'X-RateLimit-Limit': rateLimitResult.limit.toString(),
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': Math.floor(rateLimitResult.reset.getTime() / 1000).toString(),
        } 
      }
    );
  } catch (error) {
    console.error('Error in chat API:', error);
    
    // Provide a friendly error message
    let errorMessage = 'I encountered a problem processing your request. Please try again in a moment.';
    let statusCode = 500;
    
    if (error instanceof z.ZodError) {
      errorMessage = 'There seems to be an issue with the format of your request. Please refresh the page and try again.';
      statusCode = 400;
    } else if (error instanceof OpenAI.APIError) {
      if (error.status === 429) {
        errorMessage = 'Our AI service is currently experiencing high demand. Please try again in a few minutes.';
      } else {
        errorMessage = 'There was a problem connecting to our AI service. Please try again shortly.';
      }
    }
    
    return new Response(
      JSON.stringify({ message: errorMessage, error: 'request_failed' }),
      { status: statusCode, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
