# --- Build stage ---
FROM node:20-bullseye AS build 

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# --- Production stage ---
FROM node:20-bullseye AS prod  
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY package*.json ./
RUN npm install --omit=dev

CMD ["node", "dist/server.js"]
