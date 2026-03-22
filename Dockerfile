FROM node:20-alpine

WORKDIR /app


COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build && npm run postbuild

CMD ["node", "dist/main.js"]