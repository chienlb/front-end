# Backend: Redirect OAuth (Facebook / Google) về Frontend

Hiện tại khi đăng nhập Facebook (và có thể Google) thành công, backend **trả JSON** tại `/api/v1/auths/facebook/callback`, nên trình duyệt mở thẳng trang API và hiển thị raw JSON.

**Yêu cầu:** Sau khi xác thực OAuth thành công, backend phải **redirect (302)** sang trang frontend, không trả JSON.

## Cách sửa trên Backend

### 1. Cấu hình biến môi trường

Thêm trên backend (Heroku / .env):

```env
FRONTEND_URL=https://your-frontend-domain.com
```

Ví dụ production: `https://smartkids.vercel.app`  
Ví dụ local: `http://localhost:3000`

### 2. Facebook callback – redirect thay vì trả JSON

**Trước (sai):**
```js
// Đừng trả JSON cho browser
return res.status(200).json({
  success: true,
  message: "Facebook login successfully",
  data: { accessToken, refreshToken }
});
```

**Sau (đúng):**
```js
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
const params = new URLSearchParams({
  accessToken,
  refreshToken,
  user: encodeURIComponent(JSON.stringify(user))  // object user từ DB/session
});
return res.redirect(302, `${frontendUrl}/oauth-success?${params.toString()}`);
```

### 3. Google callback

Nếu Google callback cũng đang trả JSON tại `/api/v1/auths/google/callback`, áp dụng cùng cách: sau khi có `accessToken`, `refreshToken` và `user`, redirect:

```js
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
const params = new URLSearchParams({
  accessToken,
  refreshToken,
  user: encodeURIComponent(JSON.stringify(user))
});
return res.redirect(302, `${frontendUrl}/oauth-success?${params.toString()}`);
```

## Frontend đã xử lý

- Trang **`/oauth-success`** đọc query `accessToken`, `refreshToken`, `user` → lưu vào `localStorage` → **redirect về trang chủ `/`**.
- Chỉ cần backend redirect đúng tới:  
  `{FRONTEND_URL}/oauth-success?accessToken=...&refreshToken=...&user=...`
