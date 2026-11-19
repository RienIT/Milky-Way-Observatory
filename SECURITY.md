# Security Policy / Chính Sách Bảo Mật

## Supported Versions / Phiên Bản Được Hỗ Trợ

| Version | Supported |
| :--- | :--- |
| `main` (latest) | :white_check_mark: Yes |
| Tagged releases `v1.x` | :white_check_mark: Yes |
| Older snapshots | :x: No |

## Reporting a Vulnerability / Báo Cáo Lỗ Hổng Bảo Mật

If you discover a security vulnerability in **Milky Way 1:1 Observatory** (such as API key exposure, XSS, unsafe dependency, or server-side route issue), **please do NOT open a public GitHub issue**.

Instead, report it confidentially to the repository maintainers:

- **DanGuangLT:** `phatmcpack@gmail.com`
- **LienThuan04:** `lienthuan2004@gmail.com`

### What to Include / Thông Tin Cần Cung Cấp
1. A clear description of the vulnerability and potential impact.
2. Step-by-step reproduction instructions or a minimal proof of concept.
3. Affected file paths, routes (e.g. `/api/*`), or dependency versions.
4. Any suggested remediation if known.

### Response Timeline / Thời Gian Phản Hồi
- **Acknowledgment:** Within 48 hours of receipt.
- **Triage & Assessment:** Within 5 business days.
- **Remediation & Disclosure:** Coordinated patch release and credit in `CHANGELOG.md` (unless you prefer anonymity).

## Security Best Practices in This Repository
- Server-side secrets (such as `GEMINI_API_KEY`) must **never** be committed to Git or prefixed with `NEXT_PUBLIC_`.
- Automated Static Application Security Testing runs via GitHub **CodeQL** (`.github/workflows/codeql.yml`).
- Dependency vulnerabilities are monitored continuously via **Dependabot** (`.github/dependabot.yml`).
