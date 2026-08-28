---
trigger: always_on
---

# Kỷ luật Kiểm chứng (Verification Discipline)

Một suite test xanh **KHÔNG** phải bằng chứng rằng fix đã đúng — nó chỉ là bằng chứng rằng bộ test hiện tại không phát hiện được gì. Trước khi tuyên bố một fix đã xong:

*   **Mutation test (BẮT BUỘC với mọi fix có kèm test)**: Sửa code trở lại trạng thái hỏng → chạy đúng file test đó → **nó phải FAIL**. Nếu vẫn xanh thì test đó không khoá được gì, phải viết lại. Backup ra scratchpad trước, restore và `grep` xác nhận sau.
*   **Đừng assert lên hai giá trị đọc động khi chưa biết chúng tồn tại**: `toBe`/`toEqual` giữa hai `undefined` luôn xanh. Luôn `expect(x).toBeDefined()` trước khi so sánh.
*   **"Rỗng" có nhiều loại**: chưa chạm (`undefined`) khác đã gõ rồi xoá (`''`). Viết test theo state THẬT mà thao tác tạo ra, không theo ý định diễn đạt bằng lời.
*   **Fixture mô tả thực tế, không mô tả kỳ vọng**: Nếu phải chỉnh fixture cho khớp assertion thì hoặc fixture sai, hoặc code sai — không bao giờ là assertion sai.
*   **Chỉ khẳng định những gì đã kiểm chứng bằng ĐÚNG loại bằng chứng**: khẳng định về layout cần số đo hoặc ảnh, không phải `tsc` xanh. Phần nào chưa kiểm chứng được thì nêu rõ và tách riêng, không gộp vào mục "cần verify thủ công" chung chung.

---

> [!NOTE]
> Phần **Mindset & Cognitive Architecture** (Dual-System Thinking, Systems Thinking, Second Brain & Context, Role Guidance Protocol) đã rút khỏi auto-load, nay nằm ở `.agent/rules/mindset.md` — đọc khi thực sự cần. Lý do: nó là hướng dẫn meta-cognitive, không phải ràng buộc kiểm chứng được, nên không đáng nằm trong context của mọi spawn.
