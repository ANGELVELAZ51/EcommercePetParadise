# Etapa de construcción
FROM node:18-alpine as builder

WORKDIR /app

COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY . .

RUN npm run build

# Etapa de producción
FROM nginx:alpine

COPY --from=builder /app/dist/ecommerce /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]