<!-- viết docs hướng dẫn cách cài đặt và chạy server -->

# Hướng dẫn cài đặt và chạy server

## Các công nghệ sử dụng

- [Express.js](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Socket.IO](https://socket.io/)

## Yêu cầu

- Git
- Node.js
- MongoDB

## Cài đặt

### 1. Cài đặt Git

![](https://img.shields.io/badge/Git-2.33.0-green)

Trước tiên, bạn cần cài đặt Git. Bạn có thể tải Git tại [đây](https://git-scm.com/).

### 2. Cài đặt Node.js

![](https://img.shields.io/badge/Node.js-21.7.3-green)

Sau đó, bạn cần cài đặt Node.js. Bạn có thể tải Node.js tại [đây](https://nodejs.org/en/).

### 3. Clone repository

Clone repository từ GitHub về máy của bạn.

Mở terminal và chuyển đến thư mục bạn muốn lưu trữ mã nguồn, sau đó chạy lệnh sau:

```bash
git clone https://github.com/HIT-Moments/hit-moments-api.git
```

### 4. Cài đặt các thư viện cần thiết

Chuyển đến thư mục `hit-moments-api` và cài đặt các thư viện cần thiết bằng lệnh sau:

```bash
cd hit-moments-api
npm install
```

hoặc sử dụng lệnh sau nếu gặp lỗi khi cài đặt:

```bash
cd hit-moments-api
npm install --force
```

### 5. Tùy chỉnh các biến môi trường

Tạo file `.env` trong thư mục `hit-moments-api` và tùy chỉnh các biến môi trường trong file `.env.example`.

```bash
cp .env.example .env
```

### 6. Cài đặt MongoDB

![](https://img.shields.io/badge/MongoDB-5.0.2-green)

Bạn cần cài đặt MongoDB để lưu trữ dữ liệu. Bạn có thể tải MongoDB tại [đây](https://www.mongodb.com/try/download/community).

## Chạy server

Cho môi trường development:

```bash
npm run start
```

Cho môi trường production:

```bash
npm run pro
```

Truy cập [http://localhost:PORT](http://localhost:PORT) để xem server đã chạy thành công hay chưa. (PORT mặc định là 3000)

## Cấu trúc thư mục

```
hit-moments-api
├── log
├── public
├── src
│   ├── config
│   ├── constants
│   ├── controllers
│   ├── helpers
│   ├── i18n
│   ├── middlewares
│   ├── models
│   ├── routes
│   ├── services
│   ├── socket
│   ├── templates
│   ├── utils
│   ├── validations
│   └── server.js
├── uploads
├── .env
├── .env.example
├── .gitignore
├── .prettierignore
├── .prettierrc
├── package-lock.json
├── package.json
└── README.md
```

## Tài liệu tham khảo

- [Express.js](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Socket.IO](https://socket.io/)
