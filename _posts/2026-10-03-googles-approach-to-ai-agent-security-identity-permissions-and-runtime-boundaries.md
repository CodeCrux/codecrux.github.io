---
title: "Google's Approach to AI Agent Security: Identity, Permissions, and Runtime Boundaries"
description: >-
  An introduction to Google's approach to AI agent security: how identity, delegated permissions, and runtime boundaries contain agent risk in production.
image: /img/blogs/googles-approach-to-ai-agent-security-identity-permissions-and-runtime-boundaries.webp
layout: post
permalink: /blog/:title/
author: Shyam Mohan
category: AIML
date: 2026-10-03T00:00:00.000Z
---

<!-- keywords: ai agent security google, ai agent security architecture, ai agent security best practices, agent identity and delegated authorization, runtime boundaries for AI agents, MCP security controls, agent permission scoping, human-in-the-loop approval for agents -->

> **Quick Answer (TL;DR)**
> Google's published agent work treats an AI agent as a first-class, non-human principal: it gets its own cryptographic identity, authenticates at the HTTP transport layer rather than inside prompts, receives credentials out-of-band, and is authorized per request. On top of that identity model sit the boundaries that matter operationally: least-privilege scopes, resource-bound delegated grants, just-in-time credential use outside the agent runtime, human approval checkpoints for high-impact actions, and a fail-closed default. This post walks through that architecture with policy, code, and test patterns you can apply to any stack.

Most AI agent security writing starts with prompts. Google's starts with identity. That is the single most useful idea to carry away from **an introduction to Google's approach to AI agent security**: if you cannot say which principal made a tool call, you cannot authorize it, audit it, or revoke it, and no amount of prompt hardening will save you.

The reasoning is straightforward. A traditional service account has one job. An agent decides at runtime which of hundreds of capabilities to touch, based on untrusted input, across dozens of steps. Giving that loop a shared credential with broad scopes means one bad step inherits the authority of the whole system.

## What You Will Learn

- How to map the AI agent attack surface: identity, prompts, memory, tools, connectors, credentials, data, and multi-step execution.
- Why agent identity belongs at the transport layer, and how delegated user authorization differs from a shared service account.
- How to place an authorization and policy boundary in front of every provider, MCP server, and connector.
- How to implement least-privilege grants, just-in-time credential use, approval checkpoints, and fail-closed defaults.
- How to test, monitor, and produce audit evidence for agent actions, plus what to do during an incident.

## Table of Contents

1. [Why agent security is an identity problem](#an-introduction-to-googles-approach-to-ai-agent-security)
2. [Mapping the agent attack surface](#map-the-ai-agent-attack-surface)
3. [The reference architecture](#an-introduction-to-googles-approach-to-ai-agent-security-architecture)
4. [Identity, delegation, and just-in-time credentials](#identity-delegation-and-just-in-time-credentials)
5. [Permissions, approval checkpoints, fail-closed policy](#permissions-approval-checkpoints-and-fail-closed-policy)
6. [MCP, API, and connector boundaries](#mcp-api-and-connector-boundaries)
7. [Implementation steps](#implementation-steps)
8. [Testing and monitoring](#testing-and-monitoring)
9. [Governance, audit evidence, incident response](#governance-audit-evidence-and-incident-response)
10. [Where the published guidance stops](#where-googles-published-guidance-stops)
11. [Best practices checklist](#ai-agent-security-best-practices-checklist)
12. [FAQ](#faq) · [Further reading](#further-reading)

## An Introduction to Google's Approach to AI Agent Security

Google introduced the Agent2Agent (A2A) protocol in April 2025, later placing it under the Linux Foundation. The protocol's security posture is the clearest public statement of how Google thinks agent access should be controlled.

Documented facts from the A2A specification and related Google Cloud documentation:

- **Agents are enterprise applications.** Identity is handled at the HTTP transport layer, not inside message payloads. A credential in a prompt or a task body is not an authentication control.
- **Credentials are obtained out-of-band.** Agents acquire credentials through a process outside the protocol, and the spec explicitly says credentials must not be published in the Agent Card.
- **Agent Cards must be protected.** Card endpoints require access controls, and cards can be signed to give clients authenticity and integrity guarantees.
- **Agent identity exists as a distinct principal.** Google's agent identity documentation describes a strongly attested cryptographic identity per agent, based on the SPIFFE standard, with support for delegated end-user OAuth tokens.
- **Least privilege is explicit guidance.** Google Cloud recommends a separate agent or workload identity rather than reusing a human identity, granting only the minimum permissions necessary.
- **MCP and A2A are complementary.** MCP (originally from Anthropic) covers agent-to-tool and agent-to-data calls; A2A covers agent-to-agent delegation.

What Google does not claim is equally important: a protocol that says how to authenticate is not a policy engine that decides what an agent may do. That gap is where most real risk lives, and it is where the rest of this article focuses.

## Map the AI Agent Attack Surface

Before designing controls, enumerate what can be influenced. In practice, eight surfaces account for nearly every incident pattern.

| Surface | What goes wrong | Typical control |
|---|---|---|
| Identity | Shared service account across all users and agents | Per-agent principal bound to a human |
| Prompts | Indirect injection from retrieved docs, tickets, emails | Treat all input as untrusted; separate data from instructions |
| Memory | Poisoned state persists across sessions and users | Namespaced memory, TTL, provenance tags |
| Tools | Over-broad tool set; model picks the destructive one | Allowlisted capabilities per agent and per user |
| Connectors | OAuth tokens granted once and kept forever | Resource-bound, expiring, revocable grants |
| Credentials | Long-lived keys inside prompts, logs, or traces | Just-in-time issuance outside the runtime |
| Data | Sensitive output returned to the wrong requester | Field-level redaction and output validation |
| Multi-step execution | Small authorized steps compose into a harmful goal | Per-step re-authorization and budget limits |

Here is the anti-pattern this replaces. It looks reasonable in a tutorial and fails in production:

```python
# ANTI-PATTERN: one shared credential, all tools, no re-authorization.
import google.auth
from google.adk.tools import google_search

credentials, _ = google.auth.default(
    scopes=["https://www.googleapis.com/auth/cloud-platform"]
)
token = credentials.token  # long-lived, broad, sitting in process memory

def run_agent(user_prompt: str):
    return google_search(user_prompt)  # no scope check, no user binding
```

Three failures in twelve lines: the scope is effectively administrative, the token is not tied to a person, and nothing re-checks authority when the plan changes mid-run.

## An Introduction to Google's Approach to AI Agent Security Architecture

The pattern Google's model implies is a governed gateway between the agent runtime and any provider, with an explicit policy decision point before access is granted.

```text
                 ┌──────────────────────────────────────────┐
  Human user ───►│ Identity layer                             │
  (SSO/OIDC)     │  • user session + verified subject (sub)  │
                 │  • agent principal (SPIFFE/attested)      │
                 └────────────────────┬─────────────────────┘
                                      │  delegated grant (user + agent + resource)
                                      ▼
  ┌───────────────────────────────────────────────────────────────┐
  │ Policy decision point (pre-provider, fail-closed)             │
  │   evaluate(subject, agent, action, resource, risk) →          │
  │     ALLOW  |  DENY  |  REQUIRE_APPROVAL                      │
  │   • exact resource-bound scope                                 │
  │   • per-step re-authorization                                 │
  │   • step / spend budget                                        │
  └───────────────┬───────────────────────────────┬───────────────┘
                  │ ALLOW                          │ REQUIRE_APPROVAL
                  ▼                                ▼
        ┌──────────────────┐            ┌──────────────────────┐
        │ Credential broker │            │ Human approval queue  │
        │ JIT, TTL ~minutes │            │ scoped, time-boxed    │
        └────────┬─────────┘            └──────────┬───────────┘
                 │ scoped token (never persisted by agent)          │
                 ▼                                                  │
  ┌───────────────────────────────────────────────────────────────┐
  │ Boundary: MCP servers · APIs · connectors — approved only      │
  └───────────────────────────────┬───────────────────────────────┘
                                  ▼
                    Providers / SaaS / data stores
                                  │
                                  ▼
                 Evidence trail: decision + outcome, linked
```

Two properties matter more than the diagram. The policy decision happens **before** provider access, not after. And every decision and outcome is logged as linked evidence, so an investigator can reconstruct what the agent was allowed to do and what it actually did.

This gateway pattern is not unique to one vendor. Google's IAM and Cloud Identity provide building blocks (workload identity federation, service account impersonation, IAM Conditions), and the governed-gateway category implements the same shape. Axec, for example, describes a governed gateway for AI access built around a distinct agent identity bound to the requesting human, delegated OAuth grants bound to exact resources, allow/deny/require-approval policy outcomes, just-in-time credentials held outside the agent runtime, and revocation of delegated authority without redeploying the agent. Treat that as one implementation of the pattern, not the pattern itself.

## Identity, Delegation, and Just-in-Time Credentials

Four identity models are common in the wild. Know which one you have.

| Model | Blast radius of a compromise | Verdict |
|---|---|---|
| Shared service account across all agents | Everything the account can do | Avoid |
| One service account per agent, no user binding | That agent's full scope, across all users | Better, still weak |
| Workload identity federation per agent | Agent scope, rotated credentials | Good baseline |
| Delegated user grant, agent identity as caller | Only what *that user* allowed *this agent* to do | Strongest |

The delegated model has a practical payoff: authorization follows the human, so when a contractor leaves or a scope is misused, you revoke a grant rather than debugging a shared key.

Enforce the binding at the policy layer, not in prompt text:

```python
def authorize(request, decision_point) -> str:
    agent = request.agent_identity          # attested principal, not a string
    user = request.user_subject             # verified OIDC subject

    if not decision_point.is_registered(agent):
        return "DENY"                       # unknown agent fails closed

    grant = decision_point.grant_for(user.subject, agent.spiffe_id)
    if grant is None or grant.revoked:
        return "DENY"

    if not grant.allows(request.resource, request.action):
        return "DENY"                       # resource-bound, not tool-bound

    if decision_point.risk_score(request) >= decision_point.approval_threshold:
        return "REQUIRE_APPROVAL"

    if decision_point.budget_exceeded(agent):
        return "DENY"

    return "ALLOW"
```

Note the last two checks. Budget enforcement and risk scoring belong in the same function, because an agent that has exhausted its step budget should stop even when every individual step is technically authorized.

Policy belongs in versioned config, not code:

```yaml
policy_version: "2026-10-01"
default_decision: deny          # fail-closed
rules:
  - id: read-public-docs
    subject_scope: "group:employees@company.com"
    agents: ["spiffe://company.com/agent/research"]
    action: "docs.read"
    resource: "projects/*/documents/*"
    decision: allow
  - id: invoice-creation
    agents: ["spiffe://company.com/agent/finance"]
    action: "invoices.create"
    resource: "projects/*/invoices"
    conditions:
      max_amount: 5000
      require_approval_above: 500
    on_approval_timeout: deny
  - id: destructive-bulk-delete
    action: "*"
    resource: "*"
    decision: deny
```

`default_decision: deny` and `on_approval_timeout: deny` are the two lines most often missing. An approval request that nobody answers must fail closed, not wait, and never proceed.

## Permissions, Approval Checkpoints, and Fail-Closed Policy

Approval checkpoints work when they are narrow and short-lived. Broad, indefinite approvals ("approve this agent once") recreate the shared-credential problem with extra paperwork.

A workable checkpoint carries: the exact resource and action, the parameter values that triggered it, a human approver, an expiry measured in minutes, and a single-use nonce. The approval authorizes one call, not a session.

```bash
# Simulate an approval-gated action end to end.
# 1) Agent requests a gated action; PDP returns REQUIRE_APPROVAL.
curl -s -X POST "$GATEWAY/v1/authorize" \
  -H "Authorization: Bearer $AGENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
        "action": "invoices.create",
        "resource": "projects/acme/invoices",
        "parameters": {"amount": 4200, "currency": "USD"}
      }'
# → {"decision":"REQUIRE_APPROVAL","challenge_id":"chl_9f21","expires_in":300}

# 2) Approver reviews the exact parameters and returns a scoped grant.
curl -s -X POST "$GATEWAY/v1/challenges/chl_9f21/approve" \
  -H "Authorization: Bearer $APPROVER_TOKEN" \
  -d '{"grant_ttl_seconds": 120}' \
  -o /dev/null -w "%{http_code}\n"      # expect 200

# 3) Agent retries with the single-use grant; it expires in 2 minutes.
curl -s -X POST "$GATEWAY/v1/authorize" \
  -H "Authorization: Bearer $AGENT_TOKEN" \
  -H "X-Challenge-Grant: $GRANT" \
  -H "Content-Type: application/json" \
  -d '{"action":"invoices.create","resource":"projects/acme/invoices","parameters":{"amount":4200,"currency":"USD"}}'
# → {"decision":"ALLOW","scope":"invoices:create:projects/acme/invoices","expires_in":120}
```

Watch the returned `scope`. It names one action on one resource. That string is the contract, and the gateway should refuse to issue anything broader regardless of how the request is phrased.

## MCP, API, and Connector Boundaries

MCP servers are the newest way for an agent to reach a data plane, and the easiest place to over-grant. Treat each server as a capability surface with an explicit allowlist.

```yaml
mcp_gateways:
  - name: internal-knowledge
    transport: streamable-http
    endpoint: "https://mcp.internal.company.com"
    allowed_tools:
      - search_documents          # read-only, no tenant-wide export
    denied_tools:
      - list_all_documents
      - delete_document
    input_rules:
      max_query_chars: 500
      reject_patterns: ["(?i)ignore previous", "(?i)system prompt"]
    output_rules:
      redact_fields: ["author_email", "salary"]
      strip_markdown_links: true    # blocks exfil via injected URLs
      max_response_bytes: 200000

  - name: payment-provider
    tools: ["create_invoice", "get_invoice"]
    credential_mode: jit            # fetched at call time, never cached by agent
    require_human_approval_for: ["create_invoice"]
    default_decision: deny
```

Two practices pay for themselves quickly. First, treat tool output as untrusted input on the way back in: a tool response containing instructions is an injection vector, so parse it as data rather than feeding it straight to the model. Second, keep the secret material out of the agent process entirely; if the agent can read a token, a prompt injection can attempt to use it.

## Implementation Steps

A workable rollout order, weakest to strongest:

1. **Inventory agents.** Name every agent, its owner, the human users it serves, and every tool it can reach. You cannot scope what you have not written down.
2. **Kill shared credentials.** Replace one shared service account with one identity per agent, federated so keys never sit in config files.
3. **Separate agent identity from user authority.** Bind the agent to a verified human subject and grant only what that human could grant.
4. **Insert the policy boundary.** Route every outbound call through a decision point that returns ALLOW, DENY, or REQUIRE_APPROVAL, and default to DENY.
5. **Move credentials behind the boundary.** Issue short-lived, resource-scoped tokens at call time; the agent never holds a reusable secret.
6. **Add approval checkpoints for irreversible actions.** Deletion, external sends, payments, and permission changes.
7. **Enforce per-step budgets.** Cap steps, wall time, and spend so a loop cannot grind indefinitely.
8. **Write the evidence trail.** Log principal, agent, action, resource, decision, decision inputs, and outcome as linked records.

A compact pre-flight check that catches the most common misconfiguration:

```python
import jwt, sys

def check_scopes(agent_token: str, required_scope: str) -> None:
    claims = jwt.decode(agent_token, options={"verify_signature": False})
    scopes = set(claims.get("scope", "").split())

    if "https://www.googleapis.com/auth/cloud-platform" in scopes:
        sys.exit("BLOCKED: cloud-platform scope is far broader than any agent needs")

    if required_scope not in scopes:
        sys.exit(f"BLOCKED: missing required scope {required_scope}")

    if claims.get("sub") != claims.get("act", {}).get("sub"):
        sys.exit("WARNING: token is not bound to a delegated user; actions are unattributable")
```

## Testing and Monitoring

Security controls that are never exercised decay. Build these as CI checks, not one-off audits.

| Test | How to run it | Pass condition |
|---|---|---|
| Scope creep | Replay a recorded run with a widened grant | Gateway denies; alert fires |
| Cross-user data access | User A asks for data belonging to User B | DENY on resource mismatch |
| Injection through tool output | Seed a document with override instructions | No tool call follows the injected instruction |
| Approval abuse | Approve, then widen parameters | Second call denied; grant is single-use |
| Approval timeout | Never respond to a challenge | DENY after TTL |
| Agent spoofing | Call the gateway with a fabricated agent ID | DENY; identity not registered |
| Budget exhaustion | Loop a benign read task past the cap | Stops at cap, no further calls |

At runtime, watch for the signals that precede a breach: new tool combinations from a known agent, scope growth over time, actions outside a user's normal resource set, approval volume spikes, and repeated denials from the same principal.

```bash
# Flag calls whose requested resource fell outside the agent's grant.
jq -r 'select(.decision=="ALLOW")
       | select((.granted_scope // "") | contains(.resource) | not)
       | [.ts, .agent_spiffe_id, .user_sub, .action, .resource] | @tsv' \
  agent-audit.jsonl
```

Alert on that stream, and retain it. The audit log is not just for after the incident; it is the fastest way to detect scope drift while it is still cheap to fix.

## Governance, Audit Evidence, and Incident Response

Three governance capabilities matter most, and all three are architectural rather than policy statements.

**Attributable evidence.** For every action, retain who asked, which agent acted, what was authorized, what the policy inputs were, and what came back. Regulated buyers will ask how you demonstrate that a human was in the loop, and the honest answer must come from logs, not from a process document.

**Revocation without redeployment.** If delegated authority must be withdrawn in minutes, revocation has to live in the control plane rather than in a code change or a redeploy. Test this by revoking mid-task and confirming the next call fails closed.

**Blast-radius containment.** Segment agents so that one compromised agent cannot reach another agent's grants. Shared gateways should isolate authority per agent, not just authenticate per agent.

For healthcare, financial services, and public sector, the same controls map onto existing obligations around access review, data minimization, and records retention, but the mapping is your legal and compliance team's call, not this article's. Do not assume a control satisfies a specific regulatory requirement without confirming it against current primary sources and your own auditors.

Incident response for agents differs from classic application response in one way: **the agent is a confused deputy with valid credentials**. Assume any credential it touched is burned, revoke the grant rather than the key, preserve the conversation and tool-call trace, and check whether earlier steps in the same trace should be replayed with tighter policy.

## Where Google's Published Guidance Stops

Honesty about boundaries is part of the answer. Google's material is strongest on identity, transport-level authentication, credential handling, agent card protection, and least-privilege advice. It is least prescriptive on the policy and runtime layer: how to decide per action, how to model human approval, how to scope delegated grants across a fleet, and how to correlate decisions into evidence.

Independent analysis of these protocols reaches similar conclusions. Practitioners have flagged that a scan of roughly two thousand MCP servers found none enforcing authentication, and that A2A agent cards carry self-declared identities with no built-in attestation binding. Work on agent identity protocols, macaroon-style delegation tokens, and IETF drafts is active precisely because the gap is recognized.

Treat the specification as a solid foundation layer, not a finished security posture. Verify current behavior in the primary sources, since these interfaces move quickly.

## AI Agent Security Best Practices Checklist

- [ ] Every agent has its own attested identity, not a shared service account.
- [ ] Agent identity is bound to a verified human subject; actions are attributable.
- [ ] Credentials are issued just-in-time, scoped to one resource, and short-lived.
- [ ] No reusable secret is reachable from the agent runtime.
- [ ] All provider access passes through a policy decision point that defaults to deny.
- [ ] Authorization is re-evaluated per step, not once per session.
- [ ] Irreversible actions require scoped, single-use, expiring human approval.
- [ ] Approval timeouts deny.
- [ ] Tool and connector capabilities are allowlisted; denied tools are named explicitly.
- [ ] Tool output and retrieved documents are treated as untrusted input.
- [ ] Step, time, and spend budgets are enforced.
- [ ] Decisions and outcomes produce a linked, queryable evidence trail.
- [ ] Delegated authority is revocable without redeploying the agent.
- [ ] Injection, spoofing, and scope-creep tests run in CI on every release.

## FAQ

### What is Google's core approach to AI agent security?

Treating agents as first-class non-human identities. Identity lives at the HTTP transport layer, credentials are acquired out-of-band rather than embedded in messages, agent cards are access-controlled and can be signed, and each agent authenticates with its own attested identity rather than reusing a human or shared service account.

### How is agent security different from traditional API security?

An API endpoint exposes fixed operations, so scopes map cleanly to methods. An agent chooses operations at runtime from untrusted input, so authorization must be evaluated per step, bound to a human, capped by budgets, and re-checked as the plan changes. Identity alone is not enough.

### Should an agent use the user's credentials or its own?

Its own identity for authentication, plus a delegated grant that reflects what that specific user authorized. This keeps actions attributable, keeps the agent's standing permissions narrow, and lets you revoke one grant without rotating keys or redeploying.

### What is the role of a policy gateway for agents?

It is the enforcement point between the agent and any provider. It evaluates subject, agent, action, resource, and risk, then returns allow, deny, or require-approval, issues just-in-time scoped credentials, and logs the decision with its inputs so agent behavior can be audited and constrained.

### Where should teams start if they cannot do everything?

Give every agent its own identity and remove shared credentials first, then insert a fail-closed policy boundary before provider access, then add approval checkpoints for irreversible actions. Identity and boundary first; everything else builds on them.

## Further Reading

1. **Agent2Agent (A2A) protocol specification** — the primary source for transport-layer identity, credential handling, and agent card requirements: [a2a-protocol.org/latest/specification](https://a2a-protocol.org/latest/specification)
2. **Authenticate to Google Cloud MCP servers** — Google's guidance on user, workload, and agent identities, plus least-privilege recommendations: [docs.cloud.google.com/mcp/authenticate-mcp](https://docs.cloud.google.com/mcp/authenticate-mcp)
3. **Model Context Protocol authorization specification** — the tool-layer authorization model to pair with A2A: [modelcontextprotocol.io](https://modelcontextprotocol.io)

## Conclusion

**An introduction to Google's approach to AI agent security** ultimately reduces to a single architectural stance: the agent is a principal, not a process. Give it an identity, bind that identity to a human, hand it short-lived and resource-scoped credentials only at the moment of use, decide every action at a boundary that sits in front of the provider, and let the default answer be no. Prompt engineering still matters, but it is one control among many, and it is not the one that stops an agent from doing something irreversible.

If you are designing that boundary now and want to pressure-test the shape of it against your own environment, I am happy to walk through your architecture in a short working session. No pitch, just a design review: [book a 30-minute conversation](https://cal.id/axec/demo?duration=30).