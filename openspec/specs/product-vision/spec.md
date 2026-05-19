# Product Vision — Cluster AI

> *Networking is not a discovery problem. It is a trust routing problem.*

---

## The Problem

Most people don't need more connections on LinkedIn. What they need is the right person — at the right time — with minimal social friction.

Networking breaks down along four constraints:

| Constraint | What it means |
|---|---|
| **Cognitive** | Our brains did not evolve to track extended networks of contacts |
| **Reputation** | Warm introductions always cost social capital |
| **Trust** | Cold outreach has low response rates — if someone doesn't know you, why would they respond? |
| **Time** | In high-urgency situations like job searching, every day matters |

Existing platforms push the hardest parts of networking back onto the user:
- They assume you already know exactly who to contact
- They force you to manage social context manually
- They encourage cold messaging at scale

The result: a lot of messages sent, low response rates, and real risk of damaging your personal brand.

---

## The Core Insight

Users are not lacking data about people. They are missing a **trusted mediator** that can facilitate warm introductions.

What they need is a system where they can express intent and receive a small number of high-confidence introductions to the right person — sourced from within their existing network.

It should feel like your best friend making a thoughtful introduction and giving you context on how to approach a person.

---

## The Solution

An **agentic system built on a GraphRAG model** that traverses a user's network, extracts context from people's relationships, and generates recommendations.

Instead of search-and-spam, this becomes a **decision problem**: which route to take, which intros to ask for. The system:
1. Explores the user's network on their behalf
2. Identifies credible relationship paths
3. Explains why each path is trustworthy and how to approach it

---

## The Initial Wedge

**Job referrals** — urgency and trust are both high in this use case. The same mechanism generalises to deal-making, hiring, sourcing specialists, and other reference-driven decisions.

---

## The Long-Term Vision

The system earns enough trust that users are willing to grant it permission to make warm introductions on their behalf. At that point, Cluster AI becomes **infrastructure for trust-mediated networking** — a LinkedIn 2.0.

---

## Product Design Principles

These principles are derived directly from the vision above. Every feature proposal and design decision should be checked against them.

**1. Reduce cognitive load, never increase it.**
The system should do the traversal and synthesis. The user expresses intent; the app produces a small, curated set of options. Never present a wall of contacts and expect the user to figure it out.

**2. Protect social capital.**
Never encourage cold outreach at scale. Every recommendation must come with a credible relationship path and a reason to trust it. A bad recommendation damages the user's reputation — treat that risk seriously.

**3. Warm > cold, always.**
Features that help the user initiate contact should only do so through warm paths. The product's value proposition is reducing friction on warm introductions, not automating cold ones.

**4. Small numbers, high confidence.**
Fewer, better recommendations beat more, noisier ones. The system's job is to filter aggressively and explain its reasoning, not to surface everything and let the user decide.

**5. Context is the product.**
Knowing who to contact is table stakes. Knowing *how* to approach them — shared connections, relevant context, the right framing — is what makes the introduction succeed. Every recommendation must carry this context.

**6. Trust is earned incrementally.**
The long-term vision (agentic introductions on the user's behalf) only becomes possible if the system first earns trust through accurate, respectful recommendations. Never optimise for engagement at the cost of trust.
