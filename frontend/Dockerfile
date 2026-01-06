# ===== BUILD STAGE =====
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build


# ===== NGINX STAGE =====
FROM nginx:alpine

# obriši default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# ubaci naš SPA nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# kopiraj build
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
