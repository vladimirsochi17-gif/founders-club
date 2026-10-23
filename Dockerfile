FROM node:24-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build && npm prune --omit=dev --ignore-scripts --offline

FROM node:24-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/server/db/migrations ./server/db/migrations
COPY --from=build /app/certs ./certs
RUN mkdir -p /app/data/uploads && chown -R node:node /app/data
USER node
EXPOSE 8787
CMD ["node", "dist/server/index.js"]
