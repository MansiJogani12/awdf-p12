# Node 22 LTS (the course PDF shows node:18, which is end-of-life; Mongoose 8 runs fine on 22)
FROM node:22-alpine

WORKDIR /app

# Copy only the manifests first: this layer (and npm ci) is cached until dependencies change
COPY package*.json ./
RUN npm ci --omit=dev

# Then the source code (node_modules and .env are excluded by .dockerignore)
COPY . .

ENV NODE_ENV=production
EXPOSE 5000

CMD ["node", "server.js"]
