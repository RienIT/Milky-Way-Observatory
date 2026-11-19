# Milky Way 1:1 Observatory — NASA & Gaia DR3 Galactic Atlas

[![CI](https://img.shields.io/badge/CI-GitHub%20Actions-2088FF?logo=githubactions&logoColor=white)](./.github/workflows/ci.yml)
[![CodeQL](https://img.shields.io/badge/Security-CodeQL-2ea44f?logo=github&logoColor=white)](./.github/workflows/codeql.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![Next.js 15](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org)
[![Three.js WebGL2](https://img.shields.io/badge/Three.js-WebGL2%20GLSL-049EF4?logo=threedotjs)](https://threejs.org)

Mô phỏng 3D **Dải Ngân Hà (Milky Way)** chuẩn dữ liệu công bố của **NASA / JPL** & **ESA Gaia DR3** ở tỷ lệ vật lý thực **1:1**, tích hợp hố đen siêu khối lượng **Sagittarius A\*** với hiệu ứng **thấu kính hấp dẫn (Gravitational Lensing)** thời gian thực theo thuyết tương đối rộng, điều khiển bay tự do 6 bậc tự do (**WASD**), giao diện quan sát lấy cảm hứng từ **Astryx**, và bộ tự động nhận diện phần cứng để đề xuất cấu hình đồ họa tối ưu.

---

## Key Features / Tính Năng Chính

- **Zero-Config Default NASA Milky Way Simulation**: Hoạt động đầy đủ ngay khi khởi chạy mà không cần thiết lập bất kỳ biến môi trường nào.
- **Real-Time Schwarzschild Gravitational Lensing**:
  - Tích phân trắc địa **Velocity-Verlet bậc 2** cho tia sáng quanh chân trời sự kiện **Sagittarius A\*** ($r_s$, photon sphere, vòng cung Einstein).
  - Chụp nền không gian 3D theo thời gian thực để bẻ cong ánh sáng, cánh tay xoắn ốc Ngân Hà, tinh vân và thiên thể phía sau khi thay đổi góc nhìn.
  - Tính toán chiều sâu logarit chính xác từng điểm ảnh (`gl_FragDepth`) giúp hành tinh đứng giữa camera và hố đen che khuất hoàn toàn hố đen và quầng thấu kính phía sau.
- **True 1:1 Physical Scaling & Unlimited Zoom**:
  - Mô phỏng tỷ lệ kích thước thực tế giữa hố đen trung tâm, các ngôi sao, Hệ Mặt Trời (nhánh Orion), hành tinh, hành tinh lùn, vành đai tiểu hành tinh & Kuiper.
  - Phóng to không giới hạn từ toàn cảnh 100.000 năm ánh sáng xuống cận cảnh bề mặt từng hành tinh.
- **6-DOF WASD Galactic Navigation**:
  - `W / A / S / D`: Bay tiến / lùi / ngang theo hướng nhìn.
  - `Q / E`: Bay lên / xuống trục thẳng đứng.
  - `Shift`: Tăng tốc hành trình (3.2x).
  - Chuột trái kéo để xoay quỹ đạo, chuột phải để trượt ngang, cuộn chuột để thu phóng.
- **Auto Hardware Profiler & Custom Graphics Settings**:
  - Tự động đọc thông số GPU/WebGL2, CPU cores, RAM, mật độ điểm ảnh để gợi ý cấu hình tối ưu cho máy yếu đến máy mạnh, đồng thời cho phép tùy chỉnh chi tiết độ phân giải render (`0.5x – 2.0x`), mật độ sao và chất lượng shader.
- **5-Language Observatory UI**: Hỗ trợ đầy đủ Tiếng Việt (`vi`), English (`en`), 日本語 (`ja`), 中文 (`zh`), và 한국어 (`ko`).

---

## Tech Stack / Công Nghệ Sử Dụng

- **Framework**: Next.js 15 (App Router) + React 19 + TypeScript 5
- **3D & Shaders**: Three.js (WebGL2, custom GLSL volumetric raymarching & lensing shaders, logarithmic depth buffer)
- **Styling & Motion**: Tailwind CSS v4, Lucide React, Motion
- **Testing & CI/CD**: Node built-in `node:test` (`tsx`), ESLint 9, GitHub Actions CI/CD, CodeQL, Dependabot

---

## Quick Start / Khởi Chạy Cục Bộ

```bash
# 1. Cài đặt thư viện
npm install

# 2. (Tùy chọn) Sao chép biến môi trường nếu muốn bật tính năng tóm tắt AI server-side
cp .env.example .env.local

# 3. Chạy môi trường phát triển tại http://localhost:3000
npm run dev
```

### Scripts & Verification

```bash
npm run lint                                    # Kiểm tra ESLint
npx next typegen && npx tsc --noEmit            # Kiểm tra kiểu TypeScript
npx --yes tsx --test lib/memory-logic.test.ts   # Chạy 11 bộ test vật lý & thiên văn
npm run build                                   # Biên dịch bản production
```

---

## CI/CD & Repository Governance / Quy Trình CI/CD & Hồ Sơ Pháp Lý

| File / Workflow | Mô tả |
| :--- | :--- |
| [`.github/workflows/ci.yml`](./.github/workflows/ci.yml) | Tự động kiểm tra Lint, TypeScript, Unit Tests & Production Build trên mọi Push / PR |
| [`.github/workflows/codeql.yml`](./.github/workflows/codeql.yml) | Quét lỗ hổng bảo mật tĩnh (SAST) CodeQL định kỳ & trên PR |
| [`.github/workflows/release.yml`](./.github/workflows/release.yml) | Tự động kiểm thử, đóng gói, tạo SHA-256 checksum & phát hành GitHub Release theo tag `v*.*.*` |
| [`.github/dependabot.yml`](./.github/dependabot.yml) | Tự động cập nhật bản vá bảo mật cho `npm` và GitHub Actions hàng tuần |
| [`.github/CODEOWNERS`](./.github/CODEOWNERS) | Quy định quyền sở hữu & duyệt mã nguồn bởi `@DanGuangLT` và `@LienThuan04` |
| [`LICENSE`](./LICENSE) | Giấy phép mã nguồn mở **MIT License** |
| [`COPYRIGHT.md`](./COPYRIGHT.md) | Tuyên bố **Bản quyền Số & Sở hữu Trí tuệ** (song ngữ Việt / Anh) |
| [`NOTICE`](./NOTICE) | Ghi nhận bản quyền bên thứ ba & nguồn dữ liệu khoa học NASA / ESA Gaia DR3 |
| [`AUTHORS.md`](./AUTHORS.md) | Danh sách tác giả, đồng sáng lập & ghi nhận hỗ trợ phát triển |
| [`SECURITY.md`](./SECURITY.md) | Chính sách bảo mật & quy trình báo cáo lỗ hổng có trách nhiệm |
| [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md) | Quy tắc ứng xử cộng đồng (Contributor Covenant v2.1) |
| [`CONTRIBUTING.md`](./CONTRIBUTING.md) | Hướng dẫn đóng góp mã nguồn, nhánh Git & quy ước commit |
| [`CHANGELOG.md`](./CHANGELOG.md) | Nhật ký thay đổi theo chuẩn Keep a Changelog |

---

## Authors & Digital Copyright / Tác Giả & Bản Quyền Số

Copyright © 2026 **DanGuangLT** (`phatmcpack@gmail.com`) & **LienThuan04** (`lienthuan2004@gmail.com`).

Dự án được đồng xây dựng và sở hữu bản quyền bởi **DanGuangLT** và **LienThuan04**, phát triển cùng sự hỗ trợ của công cụ kỹ thuật phần mềm AI, và được phát hành rộng rãi theo giấy phép [MIT License](./LICENSE).
