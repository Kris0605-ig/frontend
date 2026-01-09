# Sử dụng Node.js thay vì Java
FROM node:18-slim

# Tạo thư mục làm việc
WORKDIR /app

# Copy package.json và cài đặt thư viện (bao gồm express và cors)
COPY package*.json ./
RUN npm install

# Copy toàn bộ code (bao gồm file server-local.js)
COPY . .

# Mở cổng (Render thường dùng cổng 10000 hoặc bạn có thể chỉnh lại)
EXPOSE 8080

# Lệnh để chạy server Node.js của bạn
CMD ["node", "server-local.js"]