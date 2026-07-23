FROM node:18

# Install osmium-tool
RUN apt-get update && \
    apt-get install -y osmium-tool && \
    apt-get clean

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
