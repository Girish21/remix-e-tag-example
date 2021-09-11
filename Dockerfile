FROM node:16.3-alpine3.12 as base

ARG REMIX_TOKEN
ENV REMIX_TOKEN=$REMIX_TOKEN

FROM base as deps

ARG REMIX_TOKEN
ENV REMIX_TOKEN=$REMIX_TOKEN

RUN mkdir /app/
WORKDIR /app/

ADD package.json package-lock.json .npmrc ./
RUN npm install --production=false

FROM base as production-deps

RUN mkdir /app/
WORKDIR /app/

ARG REMIX_TOKEN
ENV REMIX_TOKEN=$REMIX_TOKEN

COPY --from=deps /app/node_modules /app/node_modules
ADD package.json package-lock.json .npmrc ./
RUN npm prune --production

FROM base as build

RUN mkdir /app/
WORKDIR /app/

ARG REMIX_TOKEN
ENV REMIX_TOKEN=$REMIX_TOKEN

COPY --from=deps /app/node_modules /app/node_modules
ADD . .
RUN npm run build

FROM base

ENV NODE_ENV=production

RUN mkdir /app/
WORKDIR /app/

COPY --from=production-deps /app/node_modules /app/node_modules
COPY --from=build /app/build/ /app/build/
COPY --from=build /app/public/ /app/public/
ADD . .

CMD ["npm", "run", "start"]
