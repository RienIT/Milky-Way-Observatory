# Contributing Guide

Thank you for contributing to **Milky Way 1:1 Observatory — NASA & Gaia DR3 Galactic Atlas**!  
This project is maintained by **DanGuangLT** (`phatmcpack@gmail.com`) and **LienThuan04** (`lienthuan2004@gmail.com`) under the [MIT License](./LICENSE).

---

## 1. Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](./CODE_OF_CONDUCT.md).

---

## 2. Local Development Setup

### Prerequisites
- **Node.js** `>= 20.x` (LTS recommended)
- **npm** `>= 10.x` (or `bun`)

### Install & Run
```bash
git clone <repository-url>
cd <repository-folder>
npm install
cp .env.example .env.local
npm run dev
```
Open `http://localhost:3000`. Note that the full Milky Way 3D simulation works out-of-the-box **without** any environment variables set.

---

## 3. Quality Checks Before Opening a PR

Every Pull Request is automatically validated by GitHub Actions (`.github/workflows/ci.yml`). Please run all checks locally before pushing:

```bash
# 1. ESLint code quality check
npm run lint

# 2. Next.js route types & TypeScript strict check
npx next typegen && npx tsc --noEmit

# 3. Deterministic physics & astronomy unit tests
npx --yes tsx --test lib/memory-logic.test.ts

# 4. Full Next.js production build
npm run build
```

---

## 4. Branching & Commit Conventions

- Create a feature or fix branch from `main`:
  - `feat/<short-topic>` (e.g. `feat/kuiper-belt-labels`)
  - `fix/<short-topic>` (e.g. `fix/gravitational-lensing-depth`)
  - `docs/<short-topic>` (e.g. `docs/update-readme`)
- Follow [Conventional Commits](https://www.conventionalcommits.org/):
  - `feat:` New astrophysical simulation feature or UI control
  - `fix:` Bug fix or rendering/shader correction
  - `perf:` GPU/WebGL or bundle performance improvement
  - `test:` Unit tests in `lib/*.test.ts`
  - `ci:` GitHub Actions workflow or automation change
  - `docs:` Documentation, licensing, or governance updates

---

## 5. Licensing & Developer Certificate of Origin (DCO)

By submitting a Pull Request to this repository, you certify that:
1. Your contribution is your own original work or properly licensed under a compatible open-source license.
2. You agree to license your contribution under the repository's [MIT License](./LICENSE) with copyright attribution maintained per [COPYRIGHT.md](./COPYRIGHT.md).

---

## 6. Review & Approval

All Pull Requests require review from one of the repository owners (`@DanGuangLT` or `@LienThuan04`, configured in `.github/CODEOWNERS`) and a passing CI pipeline.
