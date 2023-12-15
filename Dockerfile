FROM node:16-alpine
RUN npm config set registry https://registry.npmmirror.com && \
    npm i -g pnpm@6
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm i
COPY . .
RUN pnpm build
CMD ["tail", "-f", "/dev/null"]
