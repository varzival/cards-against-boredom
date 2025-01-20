FROM node:20-alpine

ARG VITE_APP_TITLE

WORKDIR /frontend
COPY ./frontend/package*.json ./
RUN npm install
COPY ./frontend .
RUN VITE_APP_TITLE=${VITE_APP_TITLE} npm run build

WORKDIR /app
COPY ./colyseus/package.json ./colyseus/package-lock.json ./
RUN npm install
COPY ./colyseus .
RUN npm run build

RUN cp -r ../frontend/dist ./

EXPOSE 5000

CMD ["node", "build/index.js"]