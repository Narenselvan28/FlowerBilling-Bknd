# Use Node image
FROM node:18

# Set working dir
WORKDIR /app

# Copy files
COPY package*.json ./
RUN npm install --production

COPY . .

# Cloud Run uses PORT env
ENV PORT=8080

EXPOSE 8080

# Start app
CMD ["npm", "start"]
