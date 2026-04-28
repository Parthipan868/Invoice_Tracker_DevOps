# Frontend Dockerfile (root)

FROM node:18-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

ARG REACT_APP_API_URL=http://backend:5000/api
ENV REACT_APP_API_URL=$REACT_APP_API_URL

COPY public/ ./public/
COPY src/ ./src/

RUN npm run build

FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]