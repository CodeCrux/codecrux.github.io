---
title: "Securing Agent-to-Agent Delegation: Mutual Authentication and Scoped Capability Tokens for Multi-Agent Systems"
description: >-
  Map the AI agent security architecture attack surface and defense layers, then implement mutual authentication and scoped capability tokens for safe agent-to-agent delegation.
image: /img/blogs/securing-agent-to-agent-delegation-mutual-authentication-and-scoped-capability-tokens-for-multi-agent-systems.webp
layout: post
permalink: /blog/:title/
author: Shyam Mohan
category: AIML
date: 2026-10-15T00:00:00.000Z
---

<!-- keywords: agent-to-agent delegation security, scoped capability tokens, mutual TLS agent authentication, delegated OAuth for AI agents, least privilege agent credentials, AI agent multi-step tool attacks, agent authorization policy boundary, agent audit evidence trail -->

> **Quick Answer (TL;DR)**
> Securing agent-to-agent delegation means treating every agent as a distinct, verifiable identity, binding each request to an exact resource with a scoped capability token, and enforcing an authorization boundary *before* any provider or tool is reached. Mutual authentication proves *who* the agent is; scoped tokens and just-in-time credentials limit *what* it can do; a policy gateway decides *whether* this specific action is allowed, denied, or needs human approval. Combined, they shrink the AI agent security architecture attack surface and defense gaps created by autonomous, multi-step tool use.

A single AI agent that calls a model, reads a file, and updates a record is already a security concern. A *team* of agents that delegate to one another is a different problem entirely. When Agent A asks Agent B to run a task, B inherits ambiguous authority, forwards credentials it should never hold, and executes multi-step tool chains that no human ever approved. This is where the ai agent security architecture attack surface and defense model must be designed deliberately, not patched afterward. This guide walks through the attack surface, a reference architecture, and working implementation patterns for mutual authentication and scoped capability tokens.

## What You Will Learn

- How to map the full AI agent attack surface across identity, prompts, memory, tools, connectors, credentials, data, and multi-step execution.
- Why mutual authentication plus scoped capability tokens beat shared API keys for agent-to-agent calls.
- How to place an authorization and policy boundary *before* provider access.
- Concrete code for minting, verifying, and revoking delegated, resource-bound grants.
- How to test, monitor, and produce audit evidence that satisfies governance and incident-response needs.

## Table of Contents

- [Why Agent-to-Agent Delegation Needs a Security Architecture](#why-agent-to-agent-delegation-needs-a-security-architecture)
- [Mapping the AI Agent Attack Surface](#mapping-the-ai-agent-attack-surface)
- [A Reference Architecture: Authorization Boundary Before Provider Access](#a-reference-architecture-authorization-boundary-before-provider-access)
- [Core Controls for Delegated Agent Authority](#core-controls-for-delegated-agent-authority)
- [Step-by-Step Implementation: Mutual Auth and Scoped Capability Tokens](#step-by-step-implementation-mutual-auth-and-scoped-capability-tokens)
- [Testing and Monitoring Delegated Agent Traffic](#testing-and-monitoring-delegated-agent-traffic)
- [Governance, Audit Evidence, and Incident Response](#governance-audit-evidence-and-incident-response)
- [Frequently Asked Questions](#frequently-asked-questions)
- [Further Reading](#further-reading)

## Why Agent-to-Agent Delegation Needs a Security Architecture

The search intent behind this topic is almost always the same: *"How do I let multiple agents collaborate without handing each one the keys to everything?"* Teams adopt multi-agent patterns for speed, then discover that the same flexibility that makes delegation powerful also makes authority invisible. A downstream agent rarely knows the original human requester, the purpose, or the limits that were supposed to apply. Intent is lost in translation.

Traditional service security assumes a human initiates an action, a session is scoped, and a token expires quickly. Agent-to-agent delegation breaks all three assumptions: agents act autonomously, chains are long, and a single logical task may touch a dozen resources. The result is over-privileged agents, silent privilege escalation across hops, and no clear owner when something goes wrong.

The fix is architectural, not cosmetic. You need identity, authorization, and evidence designed into the delegation path itself. Next, let's define exactly what that path exposes.

## Mapping the AI Agent Attack Surface

Before adding controls, enumerate what can be attacked. Each layer below can be a foothold, and any single weak layer can compromise the whole chain.

| Layer | What it holds | Primary risk | Objective |
| --- | --- | --- | --- |
| Identity | Agent IDs, trust relationships | Spoofing, impersonation | Strong mutual authentication |
| Prompts | Instructions, system context | Prompt injection, hijacking | Input/output isolation |
| Memory | Long-term and session state | Poisoning, data leakage | Scoped, attributable memory |
| Tools | Functions the agent can call | Tool abuse, confused deputy | Per-tool authorization |
| Connectors | MCP servers, APIs, SaaS | Over-broad capability exposure | Approved-capability allowlists |
| Credentials | API keys, OAuth tokens | Theft, replay, over-scope | Just-in-time, least privilege |
| Data | Records, files, embeddings | Exfiltration, cross-tenant leak | Resource-bound grants |
| Multi-step execution | Chained agent calls | Escalation across hops | End-to-end policy enforcement |

The `ai agent security multi step tool attacks` category deserves special attention: an attacker rarely needs one malicious call. They need a *chain* where each hop looks reasonable in isolation but collectively violates policy. If hop 1 can trigger hop 2 with broad credentials, the chain becomes an amplifier for privilege escalation.

Once you can see every layer, you can place a control that intercepts the chain rather than defending each hop blindly.

## A Reference Architecture: Authorization Boundary Before Provider Access

The single most important design decision is **where authorization happens**. If agents call providers, APIs, or MCP servers directly, every provider must re-implement policy, and a missed check is a silent breach. The safer pattern is a governed gateway: a policy boundary that sits in front of all provider access.

```text
Human requester
      |
      v
[Agent A] --(mutual auth)--> [Governed Gateway] --(policy)--> [Agent B]
                                      |
                                      +--> [Provider / API / MCP server]
                                      |
                                      +--> [Evidence + audit trail]
```

In this model, four things happen at the boundary on every request:

1. **Authenticate the calling agent** using mutual TLS or signed tokens, binding it to a distinct identity.
2. **Resolve the human on whose behalf the agent acts**, so authority is never anonymous.
3. **Evaluate policy** to allow, deny, or require scoped human approval.
4. **Mint short-lived, resource-bound credentials** just in time, keeping them outside the agent runtime.

This is the governed-gateway approach that CodeCrux implements — distinct agent identity bound to the requesting human, delegated OAuth authorization with exact resource-bound grants, policy decisions that allow, deny, or require scoped approval, and the ability to revoke delegated authority without redeploying the agent. The general principle matters more than any vendor: centralize authorization so it is consistent, auditable, and revocable.

With the boundary in place, the next question is which concrete controls enforce it.

## Core Controls for Delegated Agent Authority

Controls work best as layers. No single one is sufficient, but together they make multi-step delegation defensible.

- **Least privilege** – every grant names exactly the resources and actions needed, nothing more. Avoid wildcard scopes.
- **Delegated identity** – the agent acts as itself *and* carries the human it represents, so accountability never breaks.
- **Just-in-time (JIT) access** – credentials are issued at request time, used once, and expire in minutes, so stolen tokens decay fast.
- **Approval checkpoints** – high-impact actions pause for a scoped human approval rather than executing autonomously.
- **Input/output protection** – treat tool results and retrieved content as untrusted; validate and sanitize both directions.
- **Fail-closed behavior** – if policy, identity, or approval cannot be verified, the request is denied by default.

These controls answer three questions in order: *Who is asking? What exactly may they do? Did the business intent permit it right now?* The implementation below puts them into practice.

## Step-by-Step Implementation: Mutual Auth and Scoped Capability Tokens

The following is a pragmatic, provider-agnostic pattern. Adapt the specifics to your stack.

### Step 1: Give each agent a cryptographic identity

Each agent presents a certificate or signed key pair. Verify it on every call — never trust a self-declared name.

```yaml
# agent-identity.yaml
agent_id: researcher-agent-01
owner: team-research@example.com
public_key_ref: kms://agents/researcher-agent-01
allowed_audiences:
  - summarizer-agent
  - data-provider
max_delegation_depth: 2
```

### Step 2: Establish the channel with mutual authentication

Terminate the connection only after both sides prove identity.

```bash
# Agent A connects to the governed gateway using mutual TLS
curl --cert ./agent-a.crt \
     --key ./agent-a.key \
     --cacert ./gateway-ca.crt \
     https://gateway.internal/v1/delegate \
     -H "Content-Type: application/json" \
     -d '{"target":"summarizer-agent","task":"summarize:doc-4471"}'
```

### Step 3: Mint a scoped capability token bound to one resource

The gateway issues a token that encodes the exact resource, action, expiry, and the human it is delegated from. Keep the signing key outside the agent runtime.

```python
import time, uuid, jwt  # PyJWT

def mint_capability_token(caller, target, resource, action, human_sub, key):
    now = int(time.time())
    claims = {
        "iss": "governed-gateway",
        "sub": caller,                 # the requesting agent
        "aud": target,                 # the only agent this token is valid for
        "act": {"sub": human_sub},     # delegated human identity
        "scope": f"{action}:{resource}",
        "resource_bound": resource,
        "jti": str(uuid.uuid4()),      # unique id for replay tracking
        "iat": now,
        "exp": now + 120,              # 2-minute lifetime
    }
    return jwt.encode(claims, key, algorithm="ES256")
```

### Step 4: Verify and enforce at the boundary

Every downstream agent re-verifies the token; it never stores long-lived credentials.

```python
def authorize_request(token, expected_aud, required_scope, public_key):
    claims = jwt.decode(
        token,
        public_key,
        algorithms=["ES256"],
        audience=expected_aud,  # rejects tokens meant for other agents
    )
    if claims["scope"] != required_scope:
        raise PermissionError("scope mismatch")
    if claims["resource_bound"] != required_scope.split(":", 1)[1]:
        raise PermissionError("resource binding mismatch")
    return claims["act"]["sub"]  # the accountable human
```

### Step 5: Route high-impact actions to approval

For sensitive actions, the policy engine returns `require_approval` and the gateway pauses until a scoped human confirms.

```python
def policy_decision(claims, action):
    if action in {"delete_record", "transfer_funds", "send_external_email"}:
        return {"decision": "require_approval", "approver": claims["act"]["sub"]}
    if action in ALLOWED_READ_ACTIONS:
        return {"decision": "allow"}
    return {"decision": "deny"}  # fail closed
```

### Step 6: Revoke cleanly

Because tokens are short-lived and identity lives at the gateway, you can revoke delegated authority centrally — without redeploying any agent.

```bash
# Revoke all delegation for an agent or a human subject
codecrux-gateway revoke --agent researcher-agent-01 --reason "offboarding"
```

With identity, scoping, and approval in place, you can now observe whether the design actually holds under load and attack.

## Testing and Monitoring Delegated Agent Traffic

Security controls you cannot observe are controls you cannot trust. Build tests and telemetry around the delegation path.

- **Replay tests** – resend a captured token; it must fail on `jti` and `exp`.
- **Audience-confusion tests** – present a token minted for Agent B to Agent C; it must be rejected.
- **Scope-escalation tests** – request an action outside the token's `scope`; expect a deny.
- **Depth and loop tests** – trigger a delegation loop; `max_delegation_depth` must terminate it.
- **Approval-bypass tests** – attempt a high-impact action without approval; expect a block.

For monitoring, log the full decision chain: caller identity, delegated human, target, requested scope, policy outcome, and the resource actually touched. Alert on denials that repeat, tokens used near expiry, and any action that flips from `allow` to `require_approval`. This is your `ai agent security infrastructure` observability layer.

Good telemetry also becomes your governance evidence — which is exactly where we go next.

## Governance, Audit Evidence, and Incident Response

Governance for agent systems is mostly about *provability*. You need to show, after the fact, who authorized what, under which policy, and with which outcome.

- **Audit evidence** – retain signed decision records linking each action to an agent identity, a delegated human, a policy version, and a resource.
- **Access reviews** – periodically verify that each agent's allowed capabilities still match its purpose.
- **Incident response** – define a kill switch: revoke delegated authority, rotate signing keys, and replay the evidence trail to scope the blast radius.

For regulated industries, treat these controls as *inputs* to your compliance process rather than guarantees. Requirements differ by jurisdiction, framework, and regulator. Document what you enforce, keep primary sources current, and confirm specific obligations with your compliance and legal teams rather than assuming a control alone satisfies a regulation.

## Frequently Asked Questions

### What is the AI agent security architecture attack surface and defense model?

It is the full set of layers an autonomous agent touches — identity, prompts, memory, tools, connectors, credentials, data, and multi-step execution — plus the controls that defend each layer. Defense means proving identity, scoping authority, and enforcing policy before any provider is reached.

### Why use scoped capability tokens instead of shared API keys?

Shared keys grant blanket access, cannot be tied to a specific human, and are hard to revoke. Scoped capability tokens encode one exact resource and action, expire in minutes, and carry the delegated human identity, so a leak has a bounded blast radius.

### How does mutual authentication stop agent-to-agent spoofing?

Mutual authentication makes both parties prove their identity cryptographically on every connection. An attacker impersonating Agent B cannot complete the handshake, and audience-bound tokens prevent a valid token from being reused against a different agent.

### What is an AI agent multi-step tool attack?

It is an attack that abuses a *chain* of legitimate-looking agent calls to escalate privilege or exfiltrate data across hops. Because each step appears valid alone, defense requires end-to-end policy enforcement and delegation-depth limits rather than per-call checks.

### Can I revoke a delegated agent's access without redeploying it?

Yes, if authority is centralized at a policy boundary. Because agents hold only short-lived, resource-bound tokens and identity lives at the gateway, you can revoke delegated authority centrally and immediately.

<script type="application/ld+json">
{% raw %}
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is the AI agent security architecture attack surface and defense model?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "It is the full set of layers an autonomous agent touches - identity, prompts, memory, tools, connectors, credentials, data, and multi-step execution - plus the controls that defend each layer. Defense means proving identity, scoping authority, and enforcing policy before any provider is reached."
      }
    },
    {
      "@type": "Question",
      "name": "Why use scoped capability tokens instead of shared API keys?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Shared keys grant blanket access, cannot be tied to a specific human, and are hard to revoke. Scoped capability tokens encode one exact resource and action, expire in minutes, and carry the delegated human identity, so a leak has a bounded blast radius."
      }
    },
    {
      "@type": "Question",
      "name": "How does mutual authentication stop agent-to-agent spoofing?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Mutual authentication makes both parties prove their identity cryptographically on every connection. An attacker impersonating another agent cannot complete the handshake, and audience-bound tokens prevent reuse against a different agent."
      }
    },
    {
      "@type": "Question",
      "name": "What is an AI agent multi-step tool attack?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "It is an attack that abuses a chain of legitimate-looking agent calls to escalate privilege or exfiltrate data across hops. Defense requires end-to-end policy enforcement and delegation-depth limits rather than per-call checks."
      }
    },
    {
      "@type": "Question",
      "name": "Can I revoke a delegated agent's access without redeploying it?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, if authority is centralized at a policy boundary. Because agents hold only short-lived, resource-bound tokens and identity lives at the gateway, you can revoke delegated authority centrally and immediately."
      }
    }
  ]
}
{% endraw %}
</script>

## Conclusion

Securing agent-to-agent delegation comes down to three commitments: prove identity with mutual authentication, bound every action with scoped capability tokens, and make authorization decisions at a policy boundary before provider access. Together these reduce the ai agent security architecture attack surface and defense gaps that autonomous, multi-step tool use creates — while keeping authority visible, revocable, and auditable. Start with identity and scoping, add JIT credentials and approval checkpoints, and let telemetry prove the design holds.

## Further Reading

1. **OAuth 2.0 Token Exchange (RFC 8693)** — the standard mechanism for delegated, audience-bound tokens between services and agents.
2. **NIST SP 800-207, Zero Trust Architecture** — the policy-decision-before-access model that governs a well-designed agent gateway.
3. **The Model Context Protocol (MCP) specification** — the emerging boundary for exposing only approved capabilities to agents and connectors. Always check the current primary source, as this space evolves quickly.

---

Designing this for your own system? If you want to talk through your AI agent delegation and authorization architecture, [contact CodeCrux](https://codecrux.com/contact/).
