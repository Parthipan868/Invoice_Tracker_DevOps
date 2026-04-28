# ── Stage 1: Build React App ──────────────────────────────────
FROM node:18-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

# Build-time API URL (change later when backend is deployed)
ARG REACT_APP_API_URL=http://host.docker.internal:5000/api
ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV NODE_ENV=production

COPY public/ ./public/
COPY src/    ./src/

RUN npm run build

# ── Stage 2: Serve with Nginx ─────────────────────────────────
FROM nginx:1.25-alpine

RUN rm -rf /usr/share/nginx/html/*

RUN printf 'server {\n\
    listen 80;\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
    location / { try_files $uri $uri/ /index.html; }\n\
    gzip on;\n\
    gzip_types text/plain text/css application/javascript application/json;\n\
}\n' > /etc/nginx/conf.d/default.conf

COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]