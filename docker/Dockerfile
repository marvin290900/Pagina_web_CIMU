FROM node:22-alpine AS dependencies
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM dependencies AS build
COPY . .
RUN npm run build

FROM node:22-alpine AS production-dependencies
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

FROM node:22-alpine AS runtime
WORKDIR /app
RUN apk add --no-cache poppler-utils
COPY --from=production-dependencies /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/scripts ./scripts
COPY --from=build /app/src/lib ./src/lib
RUN mkdir -p /app/public/uploads /app/storage/private \
    && chown -R node:node /app/public /app/storage \
    && chown node:node /app
USER node
ENV HOST=0.0.0.0 PORT=4321 PRIVATE_UPLOAD_DIR=/app/storage/private
EXPOSE 4321
CMD ["node", "scripts/start.mjs"]
