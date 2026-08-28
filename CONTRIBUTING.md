# 🤝 Contributing to Repro

Welcome to Repro! We are excited to build the open-source standard for deterministic production bug capture and local replay.

---

## 1. Code of Conduct

All contributors and participants are expected to adhere to our [Code of Conduct](./CODE_OF_CONDUCT.md) (Contributor Covenant v2.1).

---

## 2. Developer Certificate of Origin (DCO)

Repro uses the **Developer Certificate of Origin (DCO)** to manage contribution licenses ([ADR-013](./docs/030-Specs/Architecture/ADR-013-OSS-License-And-Contribution-Model.md)). All commits must be signed off using `git commit -s`.

By signing off a commit, you certify that:
1. You created the contribution in whole or in part.
2. The contribution is based upon appropriate open-source licenses.
3. The contribution is provided under the **Apache License, Version 2.0**.

---

## 3. Development Workflow

1. **Fork the Repository**: Create your own fork and create a branch from `main`.
2. **Setup Local Environment**:
   ```bash
   npm install
   npm test
   ```
3. **Branch Naming Conventions**:
   - `feat/<feature-name>`
   - `fix/<bug-name>`
   - `docs/<doc-name>`
4. **Commit Message Standard**:
   Follow standard Conventional Commits:
   ```text
   <type>(<scope>): <short summary>
   
   Signed-off-by: Your Name <your.email@example.com>
   ```

---

## 4. Quality Standards & Testing

- All code must include unit tests achieving $\ge 85\%$ coverage.
- Security-critical code (redaction, encryption, write blocking) must achieve $100\%$ branch coverage.
- Run test suites before submitting a PR:
  ```bash
  npm run test:security
  npm run test:e2e
  ```

---

## 5. Reporting Security Vulnerabilities

Please **DO NOT** open public GitHub issues for security vulnerabilities. Follow our responsible disclosure guidelines in [SECURITY.md](./SECURITY.md).
