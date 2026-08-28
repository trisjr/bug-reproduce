---
name: frontend-design
description: Tạo giao diện Frontend độc đáo, chuẩn Production với chất lượng thiết kế cao. Sử dụng skill này khi người dùng yêu cầu xây dựng các component web, trang, artifact, poster hoặc ứng dụng (ví dụ: website, landing page, dashboard, React component, layout HTML/CSS, hoặc khi cần làm đẹp bất kỳ UI web nào). Tạo ra code và thiết kế UI sáng tạo, chỉnh chu, tránh các thẩm mỹ AI thông thường.
---

# Frontend Design

Skill này hướng dẫn việc tạo ra các giao diện Frontend độc đáo, chuẩn Production và tránh thẩm mỹ "AI slop" thông thường. Thực hiện code thực tế với sự chú ý đặc biệt đến các chi tiết thẩm mỹ và lựa chọn sáng tạo.

## Table of Contents
1. [Tư duy Thiết kế](#tư-duy-thiết-kế)
2. [Hướng dẫn Thẩm mỹ Frontend](#hướng-dẫn-thẩm-mỹ-frontend)
3. [Những điều tuyệt đối tránh](#những-điều-tuyệt-đối-tránh)
4. [Tài liệu tham khảo](#tài-liệu-tham-khảo)

## Tư duy Thiết kế (Design Thinking)

Trước khi code, hãy hiểu rõ ngữ cảnh và cam kết theo một hướng thẩm mỹ **MẠNH MẼ (BOLD)**:
- **Mục đích**: Giao diện này giải quyết vấn đề gì? Ai là người dùng?
- **Tone & Mood**: Chọn một thái cực rõ ràng: brutalist tối giản, maximalist hỗn loạn, retro-futuristic, organic tự nhiên, sang trọng/tinh tế, vui nhộn như đồ chơi, phong cách tạp chí, art deco hình học, màu pastel mềm mại, công nghiệp... Có rất nhiều lựa chọn. Hãy chọn một hướng đi trung thành nhất với thẩm mỹ đó.
- **Ràng buộc**: Yêu cầu kỹ thuật (framework, hiệu năng, accessibility).
- **Sự khác biệt**: Điều gì làm thiết kế này **KHÔNG THỂ QUÊN (UNFORGETTABLE)**?

**QUAN TRỌNG**: Chọn một hướng đi khái niệm rõ ràng và thực hiện nó một cách chính xác. Sự tối giản tinh tế hay sự tối đa rực rỡ đều hiệu quả - chìa khóa là sự **CÓ Ý ĐỒ (INTENTIONALITY)**.

Sau đó triển khai code (HTML/CSS/JS, React, Vue, v.v.) đảm bảo:
- Chuẩn Production và đầy đủ chức năng.
- Gây ấn tượng thị giác mạnh mẽ.
- Nhất quán với một quan điểm thẩm mỹ rõ ràng.
- Tinh tế trong từng chi tiết nhỏ.

## Hướng dẫn Thẩm mỹ Frontend (Frontend Aesthetics Guidelines)

Tập trung vào:
- **Typography**: Chọn các font đẹp, độc đáo và thú vị. Tránh các font quá phổ biến như Arial hay Inter; hãy chọn những font có cá tính giúp nâng tầm thiết kế. Phối hợp các font display (hiển thị) đặc sắc với font body (nội dung) tinh tế.
- **Color & Theme**: Cam kết với một sự thẩm mỹ nhất quán. Sử dụng biến CSS để đảm bảo tính đồng bộ. Các màu sắc chủ đạo đi kèm với màu accent sắc nét sẽ hiệu quả hơn bảng màu dàn trải.
- **Motion**: Sử dụng animation cho các hiệu ứng và micro-interactions. Ưu tiên giải pháp thuần CSS cho HTML. Sử dụng thư viện Motion cho React khi có sẵn. Tập trung vào khoảnh khắc gây ấn tượng: một lần load trang được dàn dựng tốt với các hiệu ứng hiển thị xen kẽ (animation-delay) sẽ tạo cảm xúc tốt hơn nhiều các tương tác rải rác. Sử dụng scroll-triggering và hover states gây bất ngờ.
- **Bố cục không gian (Spatial Composition)**: Sử dụng các layout không ngờ tới. Bất đối xứng (Asymmetry). Chồng lớp (Overlap). Dòng chảy đường chéo. Các yếu tố phá vỡ lưới (Grid-breaking). Sử dụng không gian âm (Negative space) hào phóng HOẶC sự mật độ được kiểm soát.
- **Backgrounds & Visual Details**: Tạo ra không khí và chiều sâu thay vì chỉ dùng một màu phẳng. Thêm các hiệu ứng ngữ cảnh và texture phù hợp: gradient meshes, noise textures, pattern hình học, lớp trong suốt layer transparencies, bóng đổ kịch tính, border trang trí, custom cursor, và grain overlays.

## Những điều tuyệt đối tránh

KHÔNG BAO GIỜ sử dụng các thẩm mỹ AI thông thường:
- Các bộ font bị lạm dụng quá nhiều (Inter, Roboto, Arial, system fonts).
- Bảng màu sáo rỗng (đặc biệt là gradient tím trên nền trắng).
- Layout và component pattern dễ đoán, rập khuôn.
- Thiết kế "cookie-cutter" thiếu cá tính riêng cho từng ngữ cảnh.

**LƯU Ý**: Độ phức tạp của triển khai phải khớp với tầm nhìn thẩm mỹ. Thiết kế Maximalist cần code phức tạp với nhiều animation và hiệu ứng. Thiết kế Minimalist cần sự kìm nén, độ chính xác cao và sự chú ý đặc biệt đến khoảng cách, typography và các chi tiết tinh tế. Sự thanh lịch đến từ việc thực thi tốt tầm nhìn đã chọn.

## Tài liệu tham khảo
- Google Fonts & Adobe Fonts.
- Framer Motion / GSAP Documentation.
- UI Design Systems & Case Studies.
- Modern Web Design Trends (Awwwards, Behance).
