FROM node:18 as build

WORKDIR /app
COPY . .
RUN npm ci
RUN npm run build

FROM node:18

WORKDIR /app
COPY package.json package-lock.json /app/

RUN npm ci --omit dev

COPY --from=build /app/build /app/build

EXPOSE 3000

ARG GITHUB_SHA=unknown
ENV GIT_HASH=${GITHUB_SHA}

CMD ["node", "build"]
