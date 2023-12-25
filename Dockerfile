FROM node:16-alpine
#RUN npm config set registry https://registry.npmmirror.com
RUN npm i -g pnpm@6
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm i
COPY . .
ENV VITE_HOST=http://bill.easyhappy.top
RUN pnpm build
CMD ["tail", "-f", "/dev/null"]
