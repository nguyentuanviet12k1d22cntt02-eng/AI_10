# Lớp Học AI — Giáo Án & Slide Bài Giảng Trực Quan

Website học tập và bài giảng tương tác về Trí tuệ Nhân tạo (Gemini, ChatGPT, Claude AI, NotebookLM) được thiết kế theo phong cách Neobrutalism hiện đại.

## 📁 Cấu Trúc Dự Án

```text
AI_10/
├── index.html                   # Trang chủ / Lộ trình học AI
├── bai-1.html                   # Redirect thông minh sang lessons/bai-1.html
├── docs/                        # Giáo án & tài liệu tham khảo (.docx)
│   └── Giáo án dạy AI.docx
├── css/
│   ├── main.css                 # Style trang chủ & thành phần chung
│   └── slide-deck.css           # Engine giao diện slide bài giảng
├── js/
│   ├── main.js                  # Logic trang chủ (lộ trình, tiến độ)
│   └── slide-deck.js            # Engine điều khiển slide (phím mũi tên, cảm ứng, copy prompt)
├── assets/
│   ├── images/                  # Hình ảnh minh họa
│   └── logos/                   # Logo các thương hiệu AI (Gemini, ChatGPT, Claude, Google, NotebookLM)
└── lessons/
    ├── bai-1.html               # Bài 1: Gemini, ChatGPT & Claude AI
    └── template.html            # Mẫu bài giảng chuẩn để nhân bản cho các bài tiếp theo
```

## 🚀 Tính Năng Nổi Bật

- **Trang chủ trực quan**: Giới thiệu lộ trình, bài thực hành và công cụ AI.
- **Hệ thống Slide Deck tương tác**:
  - Chuyển slide bằng phím mũi tên bàn phím (`←`, `→`, `↑`, `↓`), nút bấm hoặc vuốt cảm ứng trên điện thoại.
  - Tự động sinh chấm tròn điều hướng (dot indicators) theo số lượng slide.
  - Tính năng sao chép Prompt một chạm (copy to clipboard).
- **Thiết kế Neobrutalism**: Đường viền đậm cá tính, bóng đổ cứng (hard shadow), màu pastel trẻ trung và bắt mắt.
- **Dễ dàng mở rộng**: Sử dụng `lessons/template.html` để tạo thêm các bài học mới nhanh chóng.

## 🛠️ Công Nghệ Sử Dụng

- HTML5 / CSS3 thuần (Zero inline code, CSS Custom Properties)
- JavaScript ES6+ (Modular, không phụ thuộc thư viện ngoài)
- Google Fonts (Inter, Nunito)
