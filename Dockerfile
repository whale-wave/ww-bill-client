FROM node:24.15.0-alpine AS builder
ARG APP_VERSION
ARG APP_BUILD_ID
ENV APP_VERSION=$APP_VERSION
ENV APP_BUILD_ID=$APP_BUILD_ID
ENV VITE_APP_VERSION=$APP_VERSION
ENV VITE_APP_BUILD_ID=$APP_BUILD_ID
ARG VITE_IOS_SHORTCUT_URL
ENV VITE_IOS_SHORTCUT_URL=$VITE_IOS_SHORTCUT_URL
WORKDIR /app
#RUN npm config set registry https://registry.npmmirror.com
RUN npm i -g pnpm@10
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
