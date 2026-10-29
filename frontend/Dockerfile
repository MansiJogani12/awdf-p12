# ---------- Stage 1: build the React app ----------
# Vite 8 needs Node 20.19+ (node:18 from the course PDF cannot run it)
FROM node:22-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# Vite bakes this into the JS bundle at build time. It is the URL the *browser*
# uses, so it points at the host-mapped port, not the Compose service name.
ARG VITE_API_URL=http://localhost:5000
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# ---------- Stage 2: serve the static files ----------
# Only the built dist/ folder is copied; Node, node_modules and the source are left behind,
# so the final image is ~50 MB instead of ~500 MB.
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
