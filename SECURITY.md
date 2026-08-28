# 🛡️ Security Policy & Vulnerability Reporting

At Repro, the security of our in-process SDK and deterministic replay infrastructure is paramount. We take all security vulnerabilities seriously and appreciate the community's efforts to disclose them responsibly.

---

## 1. Supported Versions

We provide security updates and patches for the following versions:

| Version | Supported |
| :--- | :--- |
| `0.1.x` (LTS) | ✅ Active Security Support |
| `< 0.1.0` (Spike/Throwaway) | ❌ End of Life |

---

## 2. Reporting a Vulnerability

**DO NOT** report security vulnerabilities through public GitHub issues or discussions.

If you discover a security vulnerability in `@repro/node`, `@repro/cli`, or any Repro component, please report it privately:

1. **Email**: Send full details and a proof-of-concept (PoC) to `security@repro.dev`.
2. **PGP Encryption**: You may encrypt your email using our PGP Key:
   ```text
   Key ID: 0x4A8B9C1E2D3F4A5B
   Fingerprint: 8F31 AC29 2AB3 81C4 7731 E9D2 4A8B 9C1E 2D3F 4A5B
   ```
3. **Information to Include**:
   - Component and version affected.
   - Attack vector and vulnerability classification (e.g. Redaction bypass, Egress leak, Payload tampering).
   - Step-by-step reproduction steps or sample capsule.

---

## 3. SLA & Response Timeline

Our Security Response Team commits to the response SLA defined in [SLA-Security-Response.md](./docs/080-Operations/SLAs/SLA-Security-Response.md):

| Severity | Initial Response | Remediation & Advisory |
|---|:---:|:---:|
| 🔴 **P0 (Critical)** | $< 24$ hours | $< 72$ hours (Emergency Patch) |
| 🟠 **P1 (High)** | $< 48$ hours | $< 7$ days |
| 🟡 **P2 (Medium)** | $< 7$ days | $< 30$ days |
| 🟢 **P3 (Low)** | $< 14$ days | Next Release Cycle |

---

## 4. Responsible Disclosure & CVE Policy

- We adhere to a **90-day Coordinated Vulnerability Disclosure** window.
- Security advisories and CVE numbers are requested and published via GitHub Security Advisories upon patch release.
- Reporters acting in good faith will be credited in our Release Notes.
