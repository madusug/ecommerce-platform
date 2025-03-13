# Build frontend
FROM node:18 AS frontend-build
WORKDIR /app/webapp
COPY webapp/package*.json ./
RUN npm ci
COPY webapp/ ./
RUN npm run build

# Build backend with frontend assets
FROM node:18
WORKDIR /app/api
COPY api/package*.json ./
RUN npm ci
COPY api/ ./
COPY --from=frontend-build /app/webapp/build ./webapp
EXPOSE 3000
CMD ["node", "server.js"]
