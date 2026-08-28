# Sử Dụng Nâng Cao: Revision và Branching (Advanced Usage: Revision and Branching)

Tài liệu này giới thiệu hai tính năng cực kỳ mạnh mẽ của Sequential Thinking đó là khả năng sửa đối, thay đổi logic từ quá khứ (Revision) và khả năng tạo lập đa luồng xử lý (Branching).

## Mục lục (Table of Contents)
1. Cấu hình Revision Ý tưởng Trước đó (Revising Previous Thoughts)
2. Thay Đổi Rẽ Nhánh Khái Niệm Mới (Branching Into Alternatives)
3. Mix Revision & Branching (Combining Revision and Branching)
4. Scale Scope Tùy Ý (Dynamic Scope Adjustment)
5. Tracking Lịch sử Session (Session Management)
6. Best Practices Thực Tiễn (Best Practices)
7. Tài Liệu Tham Khảo (References)

## 1. Cấu hình Revision Ý tưởng Trước đó (Revising Previous Thoughts)

Khi một `thought` sai quy chuẩn, lỗi thời hoặc thiếu facts, hãy chủ động dùng chức năng Revision để update lại khối reasoning chain:

```typescript
{
  thought: "Sự thật là câu chuyện lỗi N+1 chưa chắc là bottleneck chủ chốt—số liệu profiling cho thấy do thiếu indexes ở các cột tham gia lệnh join.",
  thoughtNumber: 5,
  totalThoughts: 7,
  isRevision: true,
  revisesThought: 2, // Áp dụng overwrite ngược lên thought #2
  nextThoughtNeeded: true
}
```

**Lúc nào phù hợp để revising**:
- Các evidence mới thu được lại mâu thuẫn hoàn toàn với suy nghĩ lúc trước.
- Rất nhiều assumptions (giả định) trước đây bị phá vỡ.
- Giới hạn hệ thống (Scope) bỗng nhiên bị hiểu nhầm.
- Lọc triệt để được các factual errors trong nội dung xử lý.

## 2. Thay Đổi Rẽ Nhánh Khái Niệm Mới (Branching Into Alternatives)

Khi một logic dẫn đến ngã 3 đường, cần explore và so sánh đồng thời nhiều solution paths:

```typescript
// Luồng xử lý mặc định (thoughts 1-3)
{
  thought: "Hmm... mình sẽ code để optimized performance qua caching hoặc chèn database indexes đây.",
  thoughtNumber: 3,
  totalThoughts: 6,
  nextThoughtNeeded: true
}

// Nhánh nhánh rẽ A: Khai thác luồng caching
{
  thought: "Giả dụ tích hợp Redis caching ở nhánh này, ta cần handle cẩn thận vụ cache invalidation.",
  thoughtNumber: 4,
  totalThoughts: 6,
  branchFromThought: 3,
  branchId: "caching-approach",
  nextThoughtNeeded: true
}

// Nhánh nhánh rẽ B: Thử khai thác luôn indexing (tách nhánh từ thought 3)
{
  thought: "Khoan, nếu xài composite index thì overhead dư thừa query bay sạch rồi.",
  thoughtNumber: 4,
  totalThoughts: 5,
  branchFromThought: 3,
  branchId: "indexing-approach",
  nextThoughtNeeded: true
}
```

**Khi nào thì Branching**:
- Rất nhiều approach có vẻ sẽ code ra success rate cao.
- Có bài toán cần mang trade-offs đối đầu nhau để cân đo.
- Để đào hố sâu xem contingencies của bài toán là gì.
- Kiểm thử giả thiết song song với logic.

## 3. Mix Revision & Branching (Combining Revision and Branching)

Sức mạnh thực sự nằm ở việc đảo logic branch linh động nếu rẽ lối sai:

```typescript
// Nhánh nhánh rẽ A sai lầm, quay xe về lại branch cũ
{
  thought: "Thôi mệt quá, đi theo nhánh redis caching này phải nhúng nhiều edge cases quá, không kịp timeline dự án.",
  thoughtNumber: 6,
  totalThoughts: 8,
  branchId: "caching-approach",
  isRevision: true,
  revisesThought: 4,
  nextThoughtNeeded: true
}

// Nhảy về nhánh Indexing chốt hạ
{
  thought: "Đành về lại máng lợn index optimization—cách này chán mà nó reliable sống lâu hơn.",
  thoughtNumber: 7,
  totalThoughts: 9,
  branchId: "indexing-approach",
  nextThoughtNeeded: true
}
```

## 4. Scale Scope Tùy Ý (Dynamic Scope Adjustment)

Hoàn toàn điều chỉnh được `totalThoughts` theo cảm giác tiến độ logic:

```typescript
// Initial estimate lần đầu đoán thử
{ thoughtNumber: 1, totalThoughts: 5, ... }

// Có biến căng, mệt quá phải thêm task
{ thoughtNumber: 3, totalThoughts: 8, ... }

// Hoá ra nó dễ hơn tưởng tượng, giảm trừ đi 
{ thoughtNumber: 5, totalThoughts: 6, ... }
```

**Đích đến**: Tạo góc nhìn toàn cảnh về chặng đường phía trước (progress visibility). Tổng dự tính `totalThoughts` không hề gò bó, Agent chốt xong là đóng tool nghỉ việc tự nhiên nhất.

## 5. Tracking Lịch sử Session (Session Management)

Mỗi lần Agent code suy diễn (reasoning session) thông qua tool mặc định duy trì session nội bộ context:
- Logic chain tất cả các thoughts cũ mới nhất.
- Revision relationships (Sợi chỉ lịch sử bản thay đổi cũ mới).
- Branch hierarchies cấp độ đa tầng mẹ con.
- Vòng đời (State).

## 6. Best Practices Thực Tiễn (Best Practices)

1. **Trình bày rõ trạng thái mập mờ (uncertainty)**: "Cách này hên xui...", "Không dám fix vì...", "Cần đọc lại file kia để soi..."
2. **Luôn chứng minh suy luận (Show reasoning)**: Nói thẳng ra tại sao mình code ra output đấy. Đừng dump lủng củng kết luận.
3. **Mạnh dạn đập đi xây lại (Revise freely)**: Chuyện đập logic cũ làm ván mới có gí trị vô cùng cao trong Agent, xoá não bớt hallucination.
4. **Nới lỏng giới hạn linh hoạt (Adjust scope)**: Gò bó mãi vào Initial scope (5 steps, 10 steps) là tự sát vào những bug nan y.
5. **Duy trì mức độ rành mạch (Maintain clarity)**: Một khối thought không được liên đới và mập mờ, phải bao gồm bối cảnh ngay trong thought đó để đọc hiểu riêng lẻ bình thường.

## 7. Tài Liệu Tham Khảo (References)
- Tham khảo từ tài liệu gốc.
