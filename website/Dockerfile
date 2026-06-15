FROM node:26 AS build

ARG VITE_MAP_API_BASE="http://localhost:8000/api/"
ARG VITE_MAP_AUTH_BASE="http://localhost:8000/auth/"

# Set up container
WORKDIR /web
COPY . /web/

# Install dependencies and build frontend
RUN npm install
RUN npm run build

FROM nginx:1.31

# Copy server config and files to be served
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=build /web/dist/ /usr/share/nginx/html
