FROM node:20-alpine
#RUN npm config set registry https://registry.npmmirror.com
RUN npm i -g pnpm@9.1.4
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm i
COPY . .
RUN pnpm build
CMD ["tail", "-f", "/dev/null"]
