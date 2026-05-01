FROM node:24-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
COPY apps/backend/package.json apps/backend/package.json

RUN npm install --workspace backend

COPY apps/backend apps/backend
COPY docker docker

WORKDIR /app/apps/backend

EXPOSE 4000

CMD ["npm", "run", "start"]
