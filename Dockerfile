FROM oven/bun:alpine AS build

WORKDIR /build
COPY . .

RUN bun i
RUN bun run build

FROM oven/bun:alpine AS runtime

WORKDIR /app
COPY --from=build /build/build ./

EXPOSE 3000
CMD ["bun", "index.js"]

