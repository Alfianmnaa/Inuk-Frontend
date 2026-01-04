# client/Dockerfile

# ---------- DEV (alpine) ----------
FROM node:25-alpine AS dev
WORKDIR /app
RUN apk add --no-cache git
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# ---------- BUILD ----------
FROM node:25-bookworm AS build
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build with environment variables
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

RUN npm run build

# ---------- PROD: nginx (bookworm) ----------
FROM nginx:1.29-bookworm AS prod
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/dist /usr/share/nginx/html
RUN apt-get update && apt-get install -y curl gettext-base && rm -rf /var/lib/apt/lists/*
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=2 \
  CMD curl -f http://localhost:80/healthz || exit 1
  
CMD sh -c "
  envsubst '\$CLIENT_DOMAIN' \
    < /etc/nginx/nginx.conf \
    > /etc/nginx/nginx.conf.tmp \
  && mv /etc/nginx/nginx.conf.tmp /etc/nginx/nginx.conf \
  && nginx -g 'daemon off;'
"
# CMD ["nginx", "-g", "daemon off;"]
