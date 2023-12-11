FROM node:18-alpine as production

WORKDIR /app

COPY package*.json ./

RUN npm install --include=dev

COPY . .

# Build TS
RUN npm run build
EXPOSE 3000

CMD [ "npm", "run", "prod" ]