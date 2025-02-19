FROM node:12.22.1 as builder
WORKDIR /home/node/app
COPY ./package.json ./
COPY ./yarn.lock ./
RUN chown -R node:node /home/node/app
COPY . .
RUN yarn install
RUN yarn build
RUN rm -r node_modules
RUN yarn install --frozen-lockfile --production
RUN rm -r node_modules/ganache-core
RUN rm -r node_modules/typescript
RUN rm -r node_modules/sodium-native

FROM node:12-alpine as production
WORKDIR /home/node/app
COPY --from=builder /home/node/app ./
EXPOSE 3000
CMD ["node", "dist/main.js"]