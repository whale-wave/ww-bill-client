FROM node:24.15.0-alpine
#RUN npm config set registry https://registry.npmmirror.com
RUN npm i -g pnpm@10.34.3
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build
CMD ["tail", "-f", "/dev/null"]
