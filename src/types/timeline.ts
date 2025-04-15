// src/types/timeline.ts
import { z } from 'zod';

export const timelineItemSchema = z.object({
  what: z.string().describe("The task to be done"),
  when: z.string().describe("The time when the task should be done (e.g., '9:00 am')"),
  why: z.string().describe("Explanation of why this task is important"),
  icon: z.enum([
    'work',
    'food',
    'rest',
    'exercise',
    'meeting',
    'learning',
    'social',
    'travel',
    'shopping',
    'housekeeping',
    'entertainment',
    'health',
    'creative',
    'personal',
    'other'
  ]).describe("Category icon for the task")
});

// For OpenAI structured output, we need to remove min/max constraints
export const timelineResponseSchema = z.object({
  explanation: z.string().describe("Explanation of why the schedule is ordered this way"),
  items: z.array(timelineItemSchema)
    .describe("List of tasks for the day with timing, explanation, and category")
});

// For application validation, we've removed the strict constraints
export const appTimelineResponseSchema = z.object({
  explanation: z.string().describe("Explanation of why the schedule is ordered this way"),
  items: z.array(timelineItemSchema)
    .describe("List of tasks for the day with timing, explanation, and category")
});

export type TimelineItem = z.infer<typeof timelineItemSchema>;
export type TimelineResponse = z.infer<typeof timelineResponseSchema>;
