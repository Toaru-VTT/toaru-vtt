FROM node:22.6 AS builder
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build

FROM nginx:alpine
COPY --from=builder /app/dist /app/dist
COPY nginx/nginx.conf /etc/nginx/nginx.conf
EXPOSE 8080
