# Stage 1: Build the Vite project
FROM node:22-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .
# Using standard Vite build output
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy the custom Nginx config to proxy the backend and serve SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build output to Nginx HTML directory
COPY --from=builder /usr/src/app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
