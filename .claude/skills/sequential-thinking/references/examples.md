# Ứng dụng Thực chiến (Examples)

Tài liệu này cho thấy ví dụ code block json khi tool được Agent thực thi bên ngoài hệ thống.

## Mục lục (Table of Contents)
1. Bài toán Hiệu Năng Database (Database Performance Problem)
2. Logic Thiết Kế Kiến trúc Đa Nhánh (Architecture Decision with Branching)
3. Gỡ Rối Fix Bug với Revisions (Debugging with Revision)
4. Lập Kế Hoạch Complex Features (Complex Feature Planning)
5. Pattern Trọng Tâm
6. 6 mẹo chốt (Tips)
7. Tài Liệu Tham Khảo (References)

## 1. Bài toán Hiệu Năng Database (Database Performance Problem)
**Bối cảnh (Context)**: API endpoints chạy lề rề (timing out), đè đầu tìm nguyên nhân (diagnose and fix).

```typescript
// Thought 1
{
  thought: "Có cái timeout reports hú còi nghẽn cổ chai database. Phải chạy profiling soi query ngay và luôn.",
  thoughtNumber: 1,
  totalThoughts: 6,
  nextThoughtNeeded: true
}

// Thought 2
{
  thought: "Theo logs thì endpoint fetch user profile đang gánh liền tù tì 50+ queries mỗi requests. Điền hình của lỗi bệnh N+1 đây rồi.",
  thoughtNumber: 2,
  totalThoughts: 6,
  nextThoughtNeeded: true
}

// Thought 3
{
  thought: "Đào sâu vào eager loading để móc nối entity relationships. Khớp lại với mô hình tài liệu ORM xem cấu hình xịn nhất là cách nào nào.",
  thoughtNumber: 3,
  totalThoughts: 7, // Adjusted scope (tăng thought lên 1 xíu do thấy cần đọc tài liệu)
  nextThoughtNeeded: true
}

// Thought 4
{
  thought: "Framework ORM nó sẵn support `include` ở params eager loading. Nhắm mắt sửa cho 3 luồng api là: /profile, /dashboard, /settings.",
  thoughtNumber: 4,
  totalThoughts: 7,
  nextThoughtNeeded: true
}

// Thought 5
{
  thought: "Triển code mượt. Số queries giãm ngay từ 52 vọt xuống còn 4 cho mỗi luồng. Response time giảm từ: 2.1s → 180ms.",
  thoughtNumber: 5,
  totalThoughts: 6, // Rút scope vì test có kết quả ngay
  nextThoughtNeeded: true
}

// Thought 6
{
  thought: "Ngon lành. Chốt hướng xử lý: eager loading diệt dứt điểm the N+1 queries. Giờ thêm cục query monitoring rào bug tương lai thôi.",
  thoughtNumber: 6,
  totalThoughts: 6,
  nextThoughtNeeded: false // Done thì đóng lệnh false
}
```

## 2. Logic Thiết Kế Kiến trúc Đa Nhánh (Architecture Decision with Branching)
**Bối cảnh**: Decision Making lúc đầu dự án cân đo giữa Monolith vs Microservices.

```typescript
// Thought 1
{
  thought: "Tính code nền gì đây ta. Tham số đầu đĩa: team nhỏ thó (5 devs), Deadline dí sát đít (3 months), Tích luỹ tầm hệ thống ban đầu nhỏ (10k users initially).",
  thoughtNumber: 1,
  totalThoughts: 8,
  nextThoughtNeeded: true
}

// Thought 2
{
  thought: "Gặp kèo này 1 là Monolith thần thánh đơn giản dễ thở, hay là Microservices phức tạp. Chắc cạo thử 2 thằng luôn coi sao.",
  thoughtNumber: 2,
  totalThoughts: 10,
  nextThoughtNeeded: true
}

// ---------------------------------
// Branch A: Phẫu thuật Monolith approach
{
  thought: "Monolith pros điểm tốt: dev cực nhanh đóng app nhanh gọn lẹ, debug nhắm mắt cũng chạy... Cons: Mở rộng sau này refactor lác mắt.",
  thoughtNumber: 3,
  totalThoughts: 6,
  branchFromThought: 2,
  branchId: "monolith",
  nextThoughtNeeded: true
}

{
  thought: "Nhưng mà 10k users thì single server handle gánh phút mốt. Deployment chỉ có 1 cục container, CI/CD thì mượt khỏi nói.",
  thoughtNumber: 4,
  totalThoughts: 6,
  branchId: "monolith",
  nextThoughtNeeded: true
}

{
  thought: "Team chạy High velocity ship được app cái vèo ra t1,t2,t3. Scaling về sau có thể tẻ services sau.",
  thoughtNumber: 5,
  totalThoughts: 6,
  branchId: "monolith",
  nextThoughtNeeded: true
}

// ---------------------------------
// Branch B: Phẫu thuật Microservices approach
{
  thought: "Điểm tốt Microservices pros: scale độc lập ngầu lòi, trần nào riêng trần đó. Cons điểm dở: Code sập mặt độ gồng cấu trúc, đau đầu đồng bộ Distributed systems challenges.",
  thoughtNumber: 3,
  totalThoughts: 7,
  branchFromThought: 2,
  branchId: "microservices",
  nextThoughtNeeded: true
}

{
  thought: "Có 5 tay dev tự code nhốt chung Microservices với sự điều tiết qua lại coordination sập mặt, API contracts mệt nghỉ, ai rảnh mướn ông infrastructure đâu.",
  thoughtNumber: 4,
  totalThoughts: 7,
  branchId: "microservices",
  nextThoughtNeeded: true
}

{
  thought: "Deadline xịn 3 tháng là chém gió. Viết microservices setup phân rã Distributed tracing lằng nhằng vớt mẹ mất cả tháng dev.",
  thoughtNumber: 5,
  totalThoughts: 7,
  branchId: "microservices",
  nextThoughtNeeded: true
}

// ---------------------------------
// Kết luận chung (Convergence)
{
  thought: "Bắt chéo so sánh (Branches): monolith ăn chắc mặc bền hơn hẳn. Team quèn, deadline dí, user vơi. Ép viết microservices là tự sát tập thể.",
  thoughtNumber: 6,
  totalThoughts: 7,
  nextThoughtNeeded: true
}

{
  thought: "Chốt hạ giải pháp: Code kiến trúc monolith design hệ module tách dòng (Modular design). Có vỡ thì tách vài services rời lẻ sau hẵng tính.",
  thoughtNumber: 7,
  totalThoughts: 7,
  nextThoughtNeeded: false
}
```

## 3. Gỡ Rối Fix Bug với Revisions (Debugging with Revision)
**Bối cảnh**: Chết giẫm trên Production nhưng run êm đềm ở Test Môi Trường Dev.

```typescript
// Thought 1
{
  thought: "Thanh toán (Payment processing) Dev thì sống, prod thì oẳng. Kéo server logs check liền.",
  thoughtNumber: 1,
  totalThoughts: 5,
  nextThoughtNeeded: true
}

// Thought 2
{
  thought: "Có dòng logs đỏ lòm báo 'Connection refused' đến API Payment. Thể nào cũng dính firewall hay network config port lủng củng.",
  thoughtNumber: 2,
  totalThoughts: 5,
  nextThoughtNeeded: true
}

// Thought 3
{
  thought: "Nhòm thử file rules Firewall rùi—port ăn API cổng tĩnh 443 đã unblock gỡ. Có lỗi quái gì ở đây nhở?!",
  thoughtNumber: 3,
  totalThoughts: 6,
  nextThoughtNeeded: true
}

// Thought 4 - Khởi động cơ chế Sửa Chữa (Revision)
{
  thought: "Ế khoaaannnn—đọc kỹ logs báo error message có chèn quả đuôi text 'certificate verify failed'. Hóa ra không phải firewall chém đứt ngầm, lỗi chứng chỉ SSL/TLS issue rồi.",
  thoughtNumber: 4,
  totalThoughts: 6,
  isRevision: true,
  revisesThought: 2,
  nextThoughtNeeded: true
}

// Thought 5
{
  thought: "Quả môi trường Prod lại quên nhúng tệp chứng chỉ CA certificates. Ở local Dev hoạt động được là do tự kỷ bật sẵn mode verify disabled trên file tự phát hành.",
  thoughtNumber: 5,
  totalThoughts: 6,
  nextThoughtNeeded: true
}

// Thought 6
{
  thought: "Patch cục CA bundle up lên prod server. Luồng Payment giờ mới đóng ngon cành đào. Nguyên nhân gốc lõi: đứt kết nối chứng chỉ SSL cert chain incomplete.",
  thoughtNumber: 6,
  totalThoughts: 6,
  nextThoughtNeeded: false
}
```

## 4. Lập Kế Hoạch Complex Features (Complex Feature Planning)
**Bối cảnh**: Code một siêu realtime app xịn cho thao tác đa tác vụ (Collaborative editing feature).

Trường hợp diễn giải khá dài, chi tiết xem thêm bản gốc nguyên bản. Nội dung áp dụng tương tự logic phía trên xoay theo framework (12 thoughts expand -> 14 thoughts).

## 5. Pattern Trọng Tâm (Usage Patterns)
| Schema Tình Huống | Tỉ Lệ Tích Hợp Pattern | Chìa Khoá Tính Năng Trọng Đoạn |
|----------|---------|--------------|
| Code luồng chuẩn đường thẳng tuyến tính linear | Dùng default tuần tự (Sequential) | Tịnh tiến tiến trình dần dần (Steady progress), gò cương chỉnh scale steps chóp. |
| Bấn loạn đa luồng code mảng hẹp lủng củng | Rẽ Đa logic (Branching) | Chạy mô phỏng song song và tự bóc tách tại điểm mù (crossroads decision) |
| Bug ẩn sau bug nhầm giả thiết | Tự Lục lại (Revision) | Liên kết thoughts đổ đèo, bẻ cong conclusions đã ấn định |
| Mix tẩu hoả nhập ma analysis lằng nhằng nhiều chiều | Mixed Total | Cọ xát toàn bộ luồng framework logic |

## 6. 6 mẹo chốt (Tips)
1. **Đoán đỉnh núi, rà hẻm núi**: Nghĩ cho rộng vấn đề trước xong mới filter bó vào scope hạt nhỏ specifics problems dần.
2. **Viết lý luận chứ đừng nói nhảm kết luận (Show work)**: Phải chứng minh step này nghĩ ra tại sao bằng fact base, chứ không tự đoán láo kết luận output rỗng bỗng.
3. **Đừng ngại tự huỷ (Revise when fail)**: Đã đâm lấm sai hướng, lập track revise đập đi tư duy lại 0% gốc gác.
4. **Quyết đoán tại Ngã Ba (Crossroads branch)**: Chặn đường chốt được 2 con path thì chạy bóc trần test branch độc lập dứt khoát.
5. **Scale scope tuỳ tình hình thực chiến**: Khỏi bó cứng 10 Thoughts hay 3 Thoughts, estimate động linh động trọn vẹn số target steps.
6. **Bóp cò chuẩn xác (End decisively)**: Có Action Items cụ thể hoặc conclusion sát hạch rõ tại End Thought false check mốc đích.

## 7. Tài Liệu Tham Khảo (References)
- Tham khảo từ tài liệu gốc.
