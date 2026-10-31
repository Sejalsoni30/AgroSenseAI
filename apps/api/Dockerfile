FROM node:20-alpine

WORKDIR /app

COPY apps/api/package*.json ./
RUN npm install

COPY apps/api ./
RUN npm run build

EXPOSE 5000

CMD ["node", "dist/index.js"]

