const express = require('express'); // 1. Khai báo express
const cors = require('cors');       // 2. Khai báo cors
const app = express();              // 3. Khởi tạo app (Sửa lỗi 'app' is not defined)

// 4. Cấu hình CORS để cho phép Netlify truy cập
app.use(cors({
  origin: 'https://symphonious-pegasus-0413af.netlify.app',
  methods: 'GET,POST,PUT,DELETE',
  credentials: true
}));

app.use(express.json()); // Để server đọc được dữ liệu JSON