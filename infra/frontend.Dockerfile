FROM node:22-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    libc6 && \
    rm -rf /var/lib/apt/lists/*

EXPOSE 3000
CMD ["npm", "run", "dev"]
