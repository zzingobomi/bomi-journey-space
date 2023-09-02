FROM node:18 AS builder

WORKDIR /bomi-journey-space
COPY . .
RUN yarn install
RUN yarn build

FROM nginx:latest

COPY --from=builder /bomi-journey-space/dist /usr/share/nginx/html
CMD ["nginx","-g","daemon off;"]