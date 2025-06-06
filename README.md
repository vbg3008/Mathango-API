# Mathango Chapter Management API

A Node.js application for managing educational chapter data with Redis caching and MongoDB storage. The application tracks subject chapters, question statistics, and completion status.

## Features

- Chapter data management with detailed metrics
- Redis-based rate limiting (30 requests/minute/IP)
- MongoDB persistence with Mongoose ODM
- Data seeding functionality
- Year-wise question tracking
- Chapter status monitoring

## Tech Stack

- Node.js
- Express.js
- MongoDB
- Redis
- Mongoose

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Redis

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
PORT=8000
MONGO_URI=your_mongodb_connection_string
REDIS_USERNAME=your_redis_username
REDIS_PASSWORD=your_redis_password
REDIS_SOCKET=your_redis_host
REDIS_PORT=your_redis_port
```

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Seed the database:
   ```bash
   node seeder.js
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## Data Model

### Chapter Schema

- `subject`: String (required)
- `chapter`: String (required)
- `class`: String (required)
- `unit`: String (required)
- `yearWiseQuestionCount`: Array of year-wise question counts
- `questionSolved`: Number
- `status`: Enum ['Not Started', 'In Progress', 'Completed']
- `isWeakChapter`: Boolean

### Sample Data Format

```json
{
  "subject": "Physics",
  "chapter": "Mathematics in Physics",
  "class": "Class 11",
  "unit": "Mechanics 1",
  "yearWiseQuestionCount": [
    { "year": 2019, "questionCount": 0 },
    { "year": 2020, "questionCount": 2 },
    { "year": 2021, "questionCount": 5 },
    { "year": 2022, "questionCount": 5 },
    { "year": 2023, "questionCount": 3 },
    { "year": 2024, "questionCount": 7 },
    { "year": 2025, "questionCount": 6 }
  ],
  "questionSolved": 0,
  "status": "Not Started",
  "isWeakChapter": false
}
```

## Rate Limiting

The API implements rate limiting using Redis:
- 30 requests per minute per IP address
- Excess requests receive 429 (Too Many Requests) response

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

ISC