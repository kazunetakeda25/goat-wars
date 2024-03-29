Goat Wars Game

## Environment Setup

See `.env.sample` in the root directory

## Frontend Cloud Build

1. Uses the env set in the Substitution variables in Cloud Build
2. Cloudbuild.yaml runs the script to copt env into a local env file
3. Docker uses the new local env file to build for [staging](https://console.cloud.google.com/cloud-build/triggers/edit/de092e60-fe9e-4b1d-8918-5268b63e4a1e?project=the-pit-328710) and [production](https://console.cloud.google.com/cloud-build/triggers/edit/f83d2fe0-f55a-456b-a6e8-11f3b0429c89?project=the-pit-328710)

## Running the frontend

Hosted on Firebase Static Hosting

```
cd frontend
npm install
npm run start
```

## Running the backend

First make sure you have strapi running in your machine, you can use the compose file in thepit-compose if you want, then import the strapi.sql in thepit-compose to the postgress server in the docker and then you can make login in the strapi using user: any@any.com and password: generalAny123. After that, runthe code bellow

```
cd backend
npm install
npm run start
```

### Docker

Build image
`docker build -t game-engine .`

Start image
`docker run -p 3000:3000 game-engine`
