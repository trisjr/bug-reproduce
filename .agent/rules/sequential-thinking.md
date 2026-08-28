---
trigger: always_on
---

Một công cụ chi tiết để giải quyết vấn đề một cách linh hoạt và phản biện thông qua các suy nghĩ (thoughts).
Công cụ này giúp phân tích các vấn đề thông qua một quá trình tư duy mềm dẻo, có thể thích ứng và phát triển.
Mỗi suy nghĩ có thể xây dựng dựa trên, đặt câu hỏi cho, hoặc chỉnh sửa các insight trước đó khi sự hiểu biết ngày càng sâu sắc hơn.

**Khi nào nên dùng công cụ này:**
- Chia nhỏ các vấn đề phức tạp thành từng bước.
- Lập kế hoạch và thiết kế với khả năng có thể chỉnh sửa.
- Phân tích những vấn đề có thể cần điều chỉnh hướng đi.
- Các vấn đề mà phạm vi đầy đủ có thể chưa rõ ràng ngay từ đầu.
- Các vấn đề yêu cầu giải pháp đa bước.
- Các task cần duy trì Context qua nhiều bước.
- Các tình huống cần lọc bỏ những thông tin không liên quan.

**Các tính năng chính:**
- Bạn có thể điều chỉnh `total_thoughts` lên hoặc xuống khi tiến hành.
- Bạn có thể đặt câu hỏi hoặc chỉnh sửa các suy nghĩ trước đó.
- Bạn có thể thêm nhiều suy nghĩ hơn ngay cả khi đã đạt đến giai đoạn tưởng chừng như kết thúc.
- Bạn có thể bày tỏ sự không chắc chắn và khám phá các cách tiếp cận thay thế.
- Không phải mọi suy nghĩ đều cần phát triển tuyến tính - bạn có thể rẽ nhánh (branch) hoặc quay lui (backtrack).
- Tạo ra giả thuyết giải pháp (solution hypothesis).
- Xác minh giả thuyết dựa trên các bước Chain of Thought.
- Lặp lại quá trình cho đến khi hài lòng.
- Đưa ra câu trả lời chính xác.

**Giải thích các tham số (Parameters):**
- **thought**: Bước tư duy hiện tại của bạn, có thể bao gồm:
  * Các bước phân tích thông thường.
  * Chỉnh sửa các suy nghĩ trước đó.
  * Đặt câu hỏi về các quyết định trước đó.
  * Nhận ra nhu cầu cần phân tích thêm.
  * Thay đổi phương pháp tiếp cận.
  * Tạo giả thuyết (Hypothesis generation).
  * Xác minh giả thuyết (Hypothesis verification).
- **nextThoughtNeeded**: True nếu bạn cần tư duy thêm, ngay cả khi tưởng chừng đã kết thúc.
- **thoughtNumber**: Số thứ tự hiện tại trong chuỗi (có thể vượt qua tổng số ban đầu nếu cần).
- **totalThoughts**: Ước tính hiện tại về tổng số suy nghĩ cần thiết (có thể điều chỉnh lên/xuống).
- **isRevision**: Một giá trị boolean cho biết suy nghĩ này có chỉnh sửa tư duy trước đó hay không.
- **revisesThought**: Nếu `is_revision` là true, số thứ tự của suy nghĩ đang được xem xét lại.
- **branchFromThought**: Nếu rẽ nhánh, số thứ tự của suy nghĩ là điểm rẽ nhánh.
- **branchId**: Định danh cho nhánh hiện tại (nếu có).
- **needsMoreThoughts**: Nếu đã đến cuối nhưng nhận ra cần thêm các suy nghĩ khác.

**Bạn nên:**
1. Bắt đầu với một ước tính ban đầu về số lượng suy nghĩ cần thiết, nhưng sẵn sàng điều chỉnh.
2. Thoải mái đặt câu hỏi hoặc chỉnh sửa các suy nghĩ trước đó.
3. Đừng ngần ngại thêm nhiều suy nghĩ hơn nếu cần, ngay cả khi đã ở giai đoạn "kết thúc".
4. Bày tỏ sự không chắc chắn khi hiện diện.
5. Đánh dấu các suy nghĩ chỉnh sửa tư duy trước đó hoặc rẽ nhánh sang con đường mới.
6. Bỏ qua thông tin không liên quan đến bước hiện tại.
7. Tạo một giả thuyết giải pháp (solution hypothesis) khi phù hợp.
8. Xác minh giả thuyết dựa trên các bước Chain of Thought.
9. Lặp lại quá trình cho đến khi hài lòng với giải pháp.
10. Cung cấp một câu trả lời duy nhất, lý tưởng nhất là chính xác, làm output cuối cùng.
11. Chỉ đặt `nextThoughtNeeded` thành false khi thực sự hoàn thành và đạt được câu trả lời thỏa đáng.