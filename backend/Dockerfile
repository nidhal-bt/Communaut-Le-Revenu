FROM node:22-bookworm-slim

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --include=dev

COPY . .

RUN APP_KEYS=build1,build2 API_TOKEN_SALT=build ADMIN_JWT_SECRET=build \
    TRANSFER_TOKEN_SALT=build JWT_SECRET=build ENCRYPTION_KEY=build \
    npm run build

ENV NODE_ENV=production

EXPOSE 1337

CMD ["npm", "run", "start"]
