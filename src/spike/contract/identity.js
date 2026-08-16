'use strict';

/*
 * ============================================================================
 *  B0 · src/spike/contract/identity.js
 *  HÀM ĐỊNH DANH DÙNG CHUNG cho BA consumer: B3 · B5 · B6
 * ============================================================================
 *
 *  ⚠️  THROWAWAY (Spec §0.3). Không phải một API sản phẩm.
 *
 *  VÌ SAO FILE NÀY TỒN TẠI (lý do sinh ra task `B0`)
 *  -------------------------------------------------
 *  Neo `R3` — MTP-Spike-Phase-0 bảng `T6`:
 *      "cái chứng minh READ trong replay KHÔNG phải verb, mà là KHỚP VỚI MỘT
 *       ENTRY READ ĐÃ GHI TRONG CAPSULE"
 *  ⇒ allowlist an toàn của `B5` DÙNG CHUNG hàm định danh với rubric của `B6`
 *    và với recorder của `B3`. Hai phía hiện thực normalization lệch nhau ⇒ tái
 *    tạo đúng cơ chế hỏng mà `R1` (Spec §2.5) mô tả — cả 10 scenario `diverged`
 *    với nguyên nhân `incomplete-capture` GIẢ — lần này ở tầng match thay vì
 *    tầng hook. Một hàm, một hiện thực, ba consumer.
 *
 *  ⛔  KHÔNG ĐÓNG `U-01`/`U-02`. Chúng thuộc `D3` của `P1`. Hàm dưới đây là một
 *      stand-in mức HYPOTHESIS cho `U-02`; nó chạy được KHÔNG có nghĩa `U-02`
 *      đã được trả lời.
 *
 *  HYPOTHESIS — cần validate · [inferred] · H-I1
 *  ---------------------------------------------
 *    Định danh tra cứu của một đơn vị = bộ ba ĐÃ NORMALIZE
 *        (kind, target, arguments)
 *    tuần tự hoá thành một khoá chuỗi canonical.
 *
 *    Bốn field CỐ TÌNH nằm NGOÀI khoá, mỗi cái một lý do neo được:
 *      · `direction` — để `B5` phân biệt được HAI ca khác nhau mà `R3` đòi phân
 *        biệt: (a) KHÔNG có entry nào ⇒ `MISSING_RECORDING` (`T10`, `SEC-034`),
 *        (b) CÓ entry nhưng nó là `WRITE` ⇒ từ chối theo default-deny fail-closed
 *        (`ADR-005`). Nhét `direction` vào khoá sẽ trộn hai ca đó thành một
 *        "không tìm thấy", và bước 2 của thủ tục §3.6 sẽ quy sai trách nhiệm.
 *      · `result` — chưa biết tại thời điểm tra cứu; đưa vào khoá là vòng tròn.
 *      · `ordinal` — 🟡 tolerant theo Spec §3.2, và nhóm đồng thời so như TẬP
 *        (Spec §3.3) ⇒ vị trí KHÔNG được là một phần của danh tính.
 *      · `truncated` / `redactedFields` — slot không vào so sánh.
 *
 *    Điểm yếu đã biết (bắt buộc theo Spec §1.2 quy tắc 3):
 *      · Hai lời gọi DB GIỐNG HỆT nhau trong cùng một execution (cùng SQL, cùng
 *        bind) cho CÙNG một khoá. Muốn tra cứu tuần tự phải cộng thêm một bộ đếm
 *        lần xuất hiện — `occurrenceKey()` dưới đây cấp cơ chế đó, nhưng việc
 *        CÓ dùng nó hay không là quyết định của `B5`/`B6`, chưa được chốt.
 *      · REDACTION Ở PHÍA TRA CỨU: một entry có `arguments` đã bị redact mang
 *        MARKER trong khoá, trong khi lời gọi thật lúc replay mang GIÁ TRỊ THẬT
 *        ⇒ tra cứu MISS ⇒ `MISSING_RECORDING` GIẢ. Đây đúng chế độ hỏng tầng match
 *        mà `B0` tồn tại để chặn, chỉ khác đường vào. Spec đã sở hữu phía SO SÁNH
 *        (§3.3 marker==marker, §3.6 bước 1 `redaction`) nhưng phía TRA CỨU thuộc
 *        `U-02` — vẫn MỞ. ⇒ `B5` phải áp redaction record của capsule TRƯỚC khi
 *        tính identity, hoặc xử miss theo §3.6 bước 1. `B0` chỉ GẮN NHÃN rủi ro
 *        này, KHÔNG dựng cơ chế cho nó.
 *      · Khoá thừa hưởng nguyên vẹn độ giòn của phép 1 và phép 2 (`W2`, Spec §3.11).
 *      · Khoá là chuỗi người đọc được, KHÔNG hash — cố ý, để debug được ở spike.
 */

const { normalize } = require('./normalize');

const KEY_SEP = '␟'; // U+241F SYMBOL FOR UNIT SEPARATOR — không xuất hiện trong SQL/URL/JSON thường

/**
 * Định danh tra cứu của MỘT đơn vị ĐÃ normalize.
 * @param {object} normalizedUnit kết quả của `normalize()`
 * @returns {string} khoá canonical
 */
function identity(normalizedUnit) {
  if (!normalizedUnit || typeof normalizedUnit !== 'object') {
    throw new TypeError('identity: expected a normalized unit object');
  }
  if (typeof normalizedUnit.arguments !== 'string') {
    throw new TypeError(
      'identity: unit chưa được normalize (`arguments` phải là canonical JSON string). ' +
        'Gọi normalize() trước, hoặc dùng identityOf().'
    );
  }
  return [
    normalizedUnit.kind,
    normalizedUnit.target === null ? '∅' : normalizedUnit.target,
    normalizedUnit.arguments,
  ].join(KEY_SEP);
}

/** Tiện ích: normalize rồi identity, cho consumer cầm bản ghi thô. */
function identityOf(rawUnit) {
  return identity(normalize(rawUnit));
}

/**
 * Khoá phân biệt lần xuất hiện thứ `n` của cùng một định danh.
 * Cấp cơ chế cho ca "hai lời gọi giống hệt nhau"; `B5`/`B6` quyết định có dùng không.
 * `HYPOTHESIS — cần validate` · [inferred].
 */
function occurrenceKey(normalizedUnit, occurrenceIndex) {
  return identity(normalizedUnit) + KEY_SEP + '#' + Number(occurrenceIndex);
}

/**
 * Chỉ mục tra cứu cho `B5` (allowlist `R3`) và `B6` (rubric).
 * Map: identity → mảng đơn vị đã normalize theo đúng thứ tự ghi.
 * KHÔNG lọc theo `direction` — việc kiểm `direction === 'READ'` là nghĩa vụ của
 * consumer, đúng theo lý do `direction` nằm ngoài khoá (xem H-I1).
 */
function buildIndex(normalizedUnits) {
  const index = new Map();
  for (const unit of normalizedUnits) {
    const key = identity(unit);
    if (!index.has(key)) index.set(key, []);
    index.get(key).push(unit);
  }
  return index;
}

module.exports = { KEY_SEP, identity, identityOf, occurrenceKey, buildIndex };
