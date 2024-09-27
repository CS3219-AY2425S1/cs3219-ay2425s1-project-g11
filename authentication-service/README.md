# Account Creation Service

## Setup

Run the following command to install the dependencies

```bash
docker build -t account-creation-service . --no-cache
docker run -p 4040:4040 --env-file .env acc account-creation-service
```

## Example Usage

1. Make sure your json struct has a similar structure:
``` {
  "email": "example@example.com",
  "name": "exampleUser",
  "password": "securePassword123",
  "type": "User"
}```

2. Make a POST request to http://localhost:4040/register

## Template code for Javascript

```const myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json");

const raw = JSON.stringify({
  "email": "example@example.com",
  "name": "exampleUser",
  "password": "securePassword123",
  "type": "User"
});

const requestOptions = {
  method: "POST",
  headers: myHeaders,
  body: raw,
  redirect: "follow"
};

fetch("http://localhost:4040/register", requestOptions)
  .then((response) => response.text())
  .then((result) => console.log(result))
  .catch((error) => console.error(error));```
