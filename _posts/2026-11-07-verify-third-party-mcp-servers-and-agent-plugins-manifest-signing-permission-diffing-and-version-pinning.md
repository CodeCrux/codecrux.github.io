---
title: "Verify Third-Party MCP Servers and Agent Plugins: Manifest Signing, Permission Diffing, and Version Pinning"
description: >-
  Learn how ai agent security tools verify third-party MCP servers and plugins with manifest signing, permission diffing, and version pinning before install.
image: /img/blogs/verify-third-party-mcp-servers-and-agent-plugins-manifest-signing-permission-diffing-and-version-pinning.webp
layout: post
permalink: /blog/:title/
author: Shyam Mohan
category: AIML
date: 2026-11-07T00:00:00.000Z
---

<!-- keywords: verify mcp server signature, mcp manifest signing, ai agent permission diff, pin mcp server version, ai agent plugin supply chain security, mcp server allowlist, agent tool permission review -->

> **Quick Answer / TL;DR**
> Treat every third-party MCP server or agent plugin as untrusted code with credentials. Verify the publisher's signature, diff the permissions it requests against what you already approved, and pin the exact artifact digest. Run all three checks automatically in CI so a version bump cannot silently expand what an agent can read, write, or call.

Third-party MCP servers and agent plugins have become the fastest way to give an AI agent real capabilities, which is why **ai agent security tools** now treat installation as a security event rather than a convenience. This guide targets a specific search intent: *how do I verify an agent plugin before it touches production data?* It walks through manifest signing, permission diffing, and version pinning with working code you can adapt to your own review pipeline.

## What You Will Learn

- How to map the attack surface that a third-party MCP server or plugin introduces.
- How to verify a signed manifest and reject artifacts with no trusted provenance.
- How to diff requested permissions between versions and fail closed on escalation.
- How to pin versions by digest and enforce those pins in CI.
- How to produce audit evidence your security and compliance teams can review.

## In This Guide

- [Why AI Agent Security Tools Must Start With Supply Chain Trust](#why-ai-agent-security-tools-must-start-with-supply-chain-trust)
- [Map the Agent Attack Surface Before You Install Anything](#map-the-agent-attack-surface-before-you-install-anything)
- [Reference Architecture: A Policy Boundary Before Provider Access](#reference-architecture-a-policy-boundary-before-provider-access)
- [The Controls That Actually Reduce Risk](#the-controls-that-actually-reduce-risk)
- [Step-by-Step: Verify a Third-Party MCP Server](#step-by-step-verify-a-third-party-mcp-server)
- [How AI Agent Security Tools Implement Permission Diffing](#how-ai-agent-security-tools-implement-permission-diffing)
- [Version Pinning: The Control AI Agent Security Tools Depend On](#version-pinning-the-control-ai-agent-security-tools-depend-on)
- [Testing and Monitoring the Verification Pipeline](#testing-and-monitoring-the-verification-pipeline)
- [Governance, Audit Evidence, and Incident Response](#governance-audit-evidence-and-incident-response)
- [Frequently Asked Questions](#frequently-asked-questions)
- [Further Reading](#further-reading)

## Why AI Agent Security Tools Must Start With Supply Chain Trust

A traditional library dependency usually runs inside your process with your build-time permissions. An MCP server is different. It receives a live token, talks to a SaaS provider on the agent's behalf, and often returns content that the model will treat as instructions. A malicious or compromised plugin does not need to exploit a memory-safety bug; it only needs to request broad scopes and then behave within them.

The practical problem is that installation instructions rarely describe what the server will actually do. A README says "connect your CRM." The manifest may request read access to contacts, write access to deals, and network egress to an unrelated host. Nobody notices because the demo works.

The selected search intent here is verification, not threat modeling theory. The goal is a repeatable gate: *can this artifact be trusted, does its permission set match what we approved, and is it the exact version we tested?* The next section maps what that gate must protect.

## Map the Agent Attack Surface Before You Install Anything

Before writing policy, enumerate what an agent can reach. The table below is a practical checklist for a third-party MCP server review.

| Surface | Question to answer | Typical failure |
|---|---|---|
| **Identity** | Which human does this agent act for? | Shared service accounts hide accountability |
| **Prompts** | Can tool output inject instructions? | A fetched web page says "ignore previous rules" |
| **Memory** | What persists across sessions? | Poisoned notes influence future tasks |
| **Tools** | Which tools are exposed, and with what scope? | A "read" tool also writes |
| **Connectors** | Which external systems are reachable? | Egress goes beyond the declared provider |
| **Credentials** | Where do tokens live and how long? | Long-lived secrets in the agent runtime |
| **Data** | What can be read, and where is it echoed? | Sensitive records appear in logs or prompts |
| **Multi-step execution** | Can small actions combine into harm? | Read secrets, then send an email |

Two conclusions follow. First, permission review must cover data flow, not just API scopes. Second, the agent runtime should never be the place where broad credentials are stored. That leads directly to putting a boundary in front of provider access.

## Reference Architecture: A Policy Boundary Before Provider Access

A governed gateway sits between the agent and every external provider. The agent requests a capability; the gateway decides whether that specific request, for that identity, against that resource, is allowed, denied, or needs human approval. Only then does it obtain a short-lived credential and make the call.

The flow looks like this:

1. The agent runs with a distinct identity bound to the requesting human.
2. It requests a tool call through the gateway rather than calling the provider directly.
3. The gateway evaluates policy against the tool, resource, and requested action.
4. If approval is required, a scoped human checkpoint is created and the request waits.
5. On approval, a just-in-time credential is minted outside the agent runtime.
6. The result returns through the gateway, which logs the decision and outcome.

This is the model Axec describes for governed AI access, and it is a useful reference even if you build the boundary yourself. The principle is vendor-neutral: *authorization happens before credentials exist*. An agent that never holds a broad token cannot leak one.

With the architecture set, the remaining work is concrete controls and verification steps.

## The Controls That Actually Reduce Risk

- **Least privilege by default.** Expose only the tools a use case needs, and deny everything else explicitly.
- **Delegated identity.** Each agent run maps to a human or workload identity, never a shared admin account.
- **Just-in-time access.** Request credentials per task, with short lifetimes and narrow resource binding.
- **Approval checkpoints.** Require scoped human approval for writes, deletes, payments, and data exports.
- **Input and output protection.** Treat retrieved content as untrusted; strip or quarantine instruction-like patterns.
- **Fail-closed behavior.** If signature verification, policy lookup, or approval times out, deny the call.
- **Revocable authority.** Removing a grant should not require redeploying the agent.

These controls only hold if the artifact itself is trustworthy. That is where the three verification steps come in.

## Step-by-Step: Verify a Third-Party MCP Server

### Step 1: Verify the Manifest Signature

Start by confirming who published the artifact. Sigstore's `cosign` is a common choice because it supports keyless signing through CI identity.

```bash
# Download the artifact and its provenance
cosign verify-blob \
  --signature acme-crm-mcp.sig \
  --certificate acme-crm-mcp.pem \
  --certificate-identity "https://github.com/acme/mcp-server/.github/workflows/release.yml@refs/tags/v1.4.2" \
  --certificate-oidc-issuer "https://token.actions.githubusercontent.com" \
  manifest.json

# Fail closed if verification does not succeed
if [ $? -ne 0 ]; then
  echo "Signature verification failed" >&2
  exit 1
fi
```

The important detail is pinning the expected identity and issuer. Verifying that *some* signature exists is not enough; you must verify that it came from the release workflow you trust for that repository.

### Step 2: Inspect the Manifest

A manifest should declare tools, permissions, egress, and data handling. A minimal example:

```json
{
  "name": "acme-crm-mcp",
  "version": "1.4.2",
  "publisher": "acme",
  "tools": ["contacts.read", "deals.read", "deals.update"],
  "permissions": {
    "network": { "egress": ["api.acme.example:443"] },
    "secrets": ["ACME_OAUTH_TOKEN"],
    "filesystem": { "read": false, "write": false }
  }
}
```

If a server requests filesystem access or broad egress and your use case does not need it, that is a review blocker, not a configuration detail.

### Step 3: Compare Against Your Approved Baseline

Never approve a permission set in isolation. Compare it to what you already signed off on.

## How AI Agent Security Tools Implement Permission Diffing

Permission diffing turns a manifest into a set of flat capability strings and compares versions. Added capabilities fail the build unless a reviewer explicitly approves them.

```python
import json
from pathlib import Path

def load(path):
    return json.loads(Path(path).read_text())

def flatten(perms, prefix=""):
    out = set()
    for key, value in perms.items():
        name = f"{prefix}{key}"
        if isinstance(value, dict):
            out |= flatten(value, f"{name}.")
        elif isinstance(value, list):
            out |= {f"{name}:{item}" for item in value}
        elif value is True:
            out.add(name)
    return out

approved = flatten(load("approved/manifest.v1.4.1.json")["permissions"])
incoming = flatten(load("incoming/manifest.v1.4.2.json")["permissions"])

added = sorted(incoming - approved)
removed = sorted(approved - incoming)

print("ADDED CAPABILITIES:")
for item in added:
    print(f"  + {item}")

print("REMOVED CAPABILITIES:")
for item in removed:
    print(f"  - {item}")

# Fail closed: any new capability needs explicit review
raise SystemExit(1 if added else 0)
```

Real-world use case: a vendor ships a patch that adds `deals.update` to what was previously a read-only connector. The diff flags a write capability, policy review rejects the upgrade, and the agent keeps running on the approved version. Without the diff, that change ships silently.

## Version Pinning: The Control AI Agent Security Tools Depend On

Tags move. Branches change. A pinned tag is not a pin. Pin by artifact digest so the bytes you tested are the bytes that run.

```yaml
# mcp-servers/acme-crm.yaml
mcp_servers:
  acme-crm:
    source: "ghcr.io/acme/mcp-server@sha256:6b1f0c2e9a4d7f8e3c5a1b0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f"
    version: "1.4.2"
    signature_identity: "https://github.com/acme/mcp-server/.github/workflows/release.yml@refs/tags/v1.4.2"
    allowed_tools:
      - contacts.read
      - deals.read
    denied_tools:
      - deals.update
      - filesystem.write
    network:
      egress: ["api.acme.example:443"]
```

Enforce the pin in CI so a pull request cannot swap the digest without review:

```yaml
name: verify-mcp-server
on: pull_request

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: sigstore/cosign-installer@v3
      - run: ./scripts/verify-manifest.sh mcp-servers/acme-crm.yaml
      - run: python scripts/permission_diff.py approved/ incoming/
      - run: python scripts/check_pins.py mcp-servers/acme-crm.yaml
```

A small `check_pins.py` can resolve the configured digest, compare it to a signed allowlist, and exit non-zero on mismatch. The exact implementation matters less than the rule: unsigned, unpinned, or escalated artifacts never reach the agent runtime.

## Testing and Monitoring the Verification Pipeline

Verification is code, so test it like code.

- **Negative tests.** Feed a manifest with a valid signature but a wrong identity; confirm the pipeline rejects it.
- **Escalation tests.** Add a permission in a fixture and confirm CI fails.
- **Pin-tamper tests.** Change one character in a digest and confirm the build blocks.
- **Rollback tests.** Prove you can revert to a previously approved digest without redeploying the agent.

In production, monitor for drift and behavior, not just build success. Log every tool call with its identity, resource, decision, and outcome. Alert on new egress destinations, unusual tool sequences, and repeated policy denials. Those signals catch a compromised plugin that passed initial review.

## Governance, Audit Evidence, and Incident Response

Governance is where verification becomes defensible. Maintain a register of approved servers, their digests, their permission sets, and the reviewer who approved each change. Keep the signed manifest, the verification output, and the diff result as evidence. Many **ai agent security vendors** now emphasize this evidence trail because auditors increasingly ask not just *what* an agent did but *who authorized it*.

For incident response, assume a plugin can be revoked mid-flight. Document how to disable a server, revoke delegated grants, and invalidate cached credentials without redeploying the agent. Replay the evidence trail to scope exposure: which human identities, which resources, which time window.

Regulated industries add obligations around data residency, retention, and access review. This guide does not claim any specific compliance certification. Confirm requirements with your own counsel and control owners, and check current primary sources for the frameworks you rely on.

## Conclusion

Verification is not a one-time checkbox. Manifest signing answers *who published this*, permission diffing answers *what changed*, and version pinning answers *is this the artifact we approved*. Together they give **ai agent security tools** a concrete gate that fails closed. Add a policy boundary before provider access, keep credentials outside the agent runtime, and preserve an evidence trail for every decision. Teams reviewing an **ai agent security GitHub** project or evaluating commercial platforms should ask the same three questions of any candidate.

If you are designing this architecture, we are happy to compare notes on your agent identity model, approval checkpoints, and verification pipeline.

## Frequently Asked Questions

**What is manifest signing for an MCP server?**
Manifest signing attaches a cryptographic signature to the artifact and its metadata, tied to a verifiable publisher identity such as a CI workflow. It lets you confirm the server came from the expected source and was not altered after release.

**How does permission diffing prevent privilege escalation?**
It converts each manifest's requested capabilities into a comparable set and flags additions. Because added capabilities fail the pipeline by default, a plugin cannot quietly gain write access, new egress, or secret access during an upgrade.

**Why pin an MCP server by digest instead of a version tag?**
Tags can be moved and artifacts can be rebuilt. A digest pins the exact bytes you tested, so the running server matches the one that passed signature and permission review.

**Which ai agent security github repositories should I review?**
Prioritize repositories that publish signed releases, document their permission manifests, and provide reproducible build provenance. Treat stars as popularity, not assurance, and verify signatures rather than trusting the README.

**Can I verify third-party plugins without a commercial platform?**
Yes. Signature verification, manifest diffing, and digest pinning can all run in CI with open tooling. A governed gateway becomes valuable when you need delegated identity, just-in-time credentials, and approval checkpoints enforced at runtime.

## Further Reading

- **Model Context Protocol specification** — the official documentation for MCP architecture, transports, and security considerations.
- **Sigstore and cosign documentation** — keyless signing, verification, and provenance for release artifacts.
- **SLSA framework** — supply chain levels and provenance guidance you can map onto agent plugin approvals.

<script type="application/ld+json">
{% raw %}
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is manifest signing for an MCP server?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Manifest signing attaches a cryptographic signature to the artifact and its metadata, tied to a verifiable publisher identity such as a CI workflow. It lets you confirm the server came from the expected source and was not altered after release."
      }
    },
    {
      "@type": "Question",
      "name": "How does permission diffing prevent privilege escalation?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "It converts each manifest's requested capabilities into a comparable set and flags additions. Because added capabilities fail the pipeline by default, a plugin cannot quietly gain write access, new egress, or secret access during an upgrade."
      }
    },
    {
      "@type": "Question",
      "name": "Why pin an MCP server by digest instead of a version tag?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Tags can be moved and artifacts can be rebuilt. A digest pins the exact bytes you tested, so the running server matches the one that passed signature and permission review."
      }
    },
    {
      "@type": "Question",
      "name": "Which ai agent security github repositories should I review?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Prioritize repositories that publish signed releases, document their permission manifests, and provide reproducible build provenance. Treat stars as popularity, not assurance, and verify signatures rather than trusting the README."
      }
    },
    {
      "@type": "Question",
      "name": "Can I verify third-party plugins without a commercial platform?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. Signature verification, manifest diffing, and digest pinning can all run in CI with open tooling. A governed gateway becomes valuable when you need delegated identity, just-in-time credentials, and approval checkpoints enforced at runtime."
      }
    }
  ]
}
{% endraw %}
</script>

---

Have a specific architecture question about agent identity, approval checkpoints, or plugin verification? [Book a 30-minute architecture discussion with AXEC.dev](https://cal.id/axec/demo?duration=30) and we will walk through your setup.