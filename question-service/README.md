# Question Service

## Setup

Run the following command to install the dependencies

```bash
docker build -t question-service . --no-cache
docker run -p 4001:4001 --env-file .env.dev question-service
```

## Routes Endpoint

- GET /api/v1/questions/ - get all coding questions
- PUT /api/v1/questions/:id - update a coding question
- POST /api/v1/questions/ - create a coding question
- DELETE /api/v1/questions/:id - delete a coding question
- GET /api/v1/userQuestions/ - get all user questions
