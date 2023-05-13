FROM node:16

ARG VITE_APP_TITLE

WORKDIR /frontend
COPY ./frontend/package*.json ./
RUN npm install
COPY ./frontend .
RUN VITE_APP_TITLE=${VITE_APP_TITLE} npm run build

WORKDIR /app
COPY ./backend/package.json ./backend/package-lock.json ./
RUN npm install
COPY ./backend .
RUN npm run build

RUN cp -r ../frontend/dist ./

EXPOSE 5000

CMD ["node", "build/main.js"]