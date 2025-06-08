FROM node:22-alpine

COPY . .

RUN npm ci
RUN npm run build

COPY . .

EXPOSE 3000
CMD ["node", "build"]

