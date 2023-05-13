FROM node:16

ARG VUE_APP_TITLE
ENV VUE_APP_TITLE ${VUE_APP_TITLE}

WORKDIR /frontend
COPY ./frontend/package*.json ./
RUN npm install
COPY ./frontend .
RUN npm run build

WORKDIR /app
COPY ./backend/package.json ./backend/package-lock.json ./
RUN npm install
COPY ./backend .
RUN npm run build

RUN cp -r ../frontend/dist ./

EXPOSE 5000

CMD ["node", "build/main.js"]