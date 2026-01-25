FROM node:24 as build
WORKDIR /app/src
COPY package*.json ./
RUN npm ci
COPY . ./
RUN npm run build

FROM node:24
WORKDIR /usr/app
COPY --from=build /app/src/dist/vt-front/ ./
CMD node server/server.mjs
EXPOSE 4000
