FROM node:18-slim
WORKDIR /app

# Sửa đường dẫn COPY để trỏ vào thư mục chứa package.json của bạn
# Giả sử thư mục đó tên là 'backend'
COPY backend/package*.json ./
RUN npm install

# Copy toàn bộ nội dung của thư mục backend vào /app
COPY backend/ . 

EXPOSE 8080
CMD ["node", "server-local.js"]