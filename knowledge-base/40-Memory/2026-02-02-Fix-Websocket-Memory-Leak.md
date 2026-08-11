<!-- Knowledge Base -->
# Tri Thức Fix Bug: Xử lý Memory Leak trong WebSocket Node.js

## Mục lục
1. [Bối Cảnh & Sự Cố](#1-bối-cảnh--sự-cố)
2. [Nguyên Nhân Gốc Rễ](#2-nguyên-nhân-gốc-rễ)
3. [Giải Pháp Khắc Phục](#3-giải-pháp-khắc-phục)
4. [Bài Học Cho AI & Team](#4-bài-học-cho-ai--team)
5. [Tài Liệu Tham Khảo](#tài-liệu-tham-khảo)

---

## 1. Bối Cảnh & Sự Cố
- **Ngày ghi nhận:** 02/02/2026
- **Người thực hiện:** Senior Dev & TNMCORE-OS Agent
- **Vấn đề:** Server bị crash sau khoảng 4 giờ hoạt động liên tục. Log ghi nhận lỗi `FATAL ERROR: Ineffective mark-compacts near heap limit Allocation failed - JavaScript heap out of memory`.

## 2. Nguyên Nhân Gốc Rễ
Khi sử dụng thư viện `ws` cho WebSocket, các `event listeners` (`message`, `close`) được đăng ký nhưng không được gỡ bỏ (cleanup) đúng cách khi client ngắt kết nối không mong muốn (abrupt disconnect). Điều này khiến các object liên quan đến socket không được Garbage Collector thu hồi.

## 3. Giải Pháp Khắc Phục
Bổ sung cơ chế **Cleanup** chủ động trong event `close` và sử dụng `once` cho các event chỉ cần chạy một lần.

**Code ví dụ (Trước - Lỗi):**
```typescript
socket.on('message', (data) => {
  // logic xử lý
});
```

**Code ví dụ (Sau - Đã sửa):**
```typescript
const messageHandler = (data: any) => { /* logic */ };
socket.on('message', messageHandler);

socket.on('close', () => {
  socket.removeListener('message', messageHandler);
  socket.removeAllListeners(); // Đảm bảo dọn sạch
});
```

## 4. Bài Học Cho AI & Team (Chỉ dẫn cho lần sau)
- **Cho AI:** Luôn phải kiểm tra phần `cleanup code` khi viết các hàm xử lý Stream, WebSocket hoặc Event Emitters. Nếu thấy `on()`, phải tìm thấy `off()` hoặc `removeListener()`.
- **Cho Team:** Cấu hình cảnh báo Prometheus cho Heap Memory khi vượt ngưỡng 80%.

---

## Tài Liệu Tham Khảo
1. [Node.js Memory Management Best Practices](https://nodejs.org/en/docs/guides/diagnosing-memory-issues/)
2. [WS Library Documentation - FAQ](https://github.com/websockets/ws)
