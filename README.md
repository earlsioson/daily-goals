# Daily Goals App

A smart application that helps you plan your day with AI assistance. Submit your top priorities, and the app will generate a structured daily schedule with timestamps, explanations, and categories.

## Features

- **AI-Powered Scheduling**: Uses OpenAI to transform your priorities into a balanced daily schedule
- **Interactive Timeline**: Visualizes your daily schedule with category icons and time slots
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Real-time Updates**: Instantly generates schedules without page refreshes
- **Material UI**: Clean, intuitive interface with light/dark theme support
- **Security Features**:
  - Rate limiting to prevent API abuse and control costs
  - Bot detection to filter out automated traffic
  - Content filtering for inappropriate requests
  - User-friendly error handling with helpful messages and countdowns
  - Protection against excessive API usage without frustrating legitimate users

## Technology Stack

- **Frontend**: React 19, Next.js 15
- **UI Framework**: Material UI 7
- **State Management**: React Hooks
- **API Integration**: OpenAI GPT-4o
- **Type Safety**: TypeScript, Zod for schema validation
- **Security**: Rate limiting, bot detection, content filtering
- **Development Tools**: pnpm, TypeScript

## Getting Started

### Prerequisites

- Node.js (v18.17.0 or higher recommended)
- pnpm package manager
- OpenAI API key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/earlsioson/daily-goals.git
   cd daily-goals
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Create a `.env` file in the root directory with the following content:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   OPENAI_MODEL=gpt-4o
   ```

4. Start the development server:
   ```bash
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Usage

1. Enter your top priorities for the day in the text field
2. Click the send button or press Enter
3. The AI will generate a structured timeline based on your priorities
4. Each activity includes:
   - What: Task description
   - When: Scheduled time
   - Why: Importance explanation
   - Icon: Contextual category (work, food, rest, exercise, meeting, other)

### Rate Limiting

The application includes rate limiting:

- Users are limited to 20 requests per hour (configurable)
- Minimum 5-second interval between requests to prevent rapid-fire calls

## Building for Production

```bash
pnpm build
pnpm start
```
