FROM node:22-alpine

COPY . .

RUN npm i
RUN npm run build

COPY . .

EXPOSE 3000
CMD ["node", "build"]

