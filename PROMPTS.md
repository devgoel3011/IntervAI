# IntervAI — Hackathon Build Prompt

## Role

You are an expert full-stack AI engineer, product designer, and UI engineer.

You are working on **IntervAI**, an AI-powered technical interview platform.

Repository:
https://github.com/devgoel3011/IntervAI

Figma design:
https://www.figma.com/design/pzJQ0MEv9oTu10ROBCj7VW/IntervAI

Your job is to understand the existing application first and then improve it without breaking its working functionality.

---

# 1. Product Overview

IntervAI is an adaptive AI technical interview platform designed around a candidate's learning journey.

The application simulates a real technical interview.

The interviewer should:

- select a candidate
- understand the candidate's background and learning journey
- ask technically relevant questions
- adapt follow-up questions based on previous answers
- cover multiple curriculum days/modules
- evaluate the candidate
- provide structured feedback at the end

The system should feel like a real technical interviewer rather than a generic chatbot.

---

# 2. Most Important Rule

DO NOT blindly rebuild the application.

First inspect the entire repository.

Understand:

- framework
- routing
- components
- API routes
- Gemini integration
- interview engine
- state management
- candidate data
- curriculum data
- environment variables
- existing styling
- existing UI
- build configuration

The current application already contains working interview functionality.

Preserve that functionality.

The primary goal is to improve the frontend and overall product presentation while keeping the existing AI behavior reliable.

---

# 3. Figma Is the Visual Source of Truth

Use the provided Figma file as the primary visual reference:

https://www.figma.com/design/pzJQ0MEv9oTu10ROBCj7VW/IntervAI

Before implementing the redesign:

1. Inspect the Figma file.
2. Identify the main desktop interview screen.
3. Identify typography.
4. Identify spacing.
5. Identify colors.
6. Identify gradients.
7. Identify cards.
8. Identify buttons.
9. Identify borders and shadows.
10. Identify responsive behavior if available.
11. Identify reusable components.
12. Reproduce the design system in code.

Do not create a completely unrelated design.

The implementation should visually communicate the same product language as the Figma design.

---

# 4. Design Direction

IntervAI should feel like a premium AI product.

Visual direction:

- dark-first interface
- sophisticated gradients
- deep navy/black backgrounds
- subtle purple and blue accents
- modern glass/soft-card surfaces
- large confident typography
- generous whitespace
- subtle borders
- restrained shadows
- rounded cards
- polished interaction states
- premium SaaS/AI aesthetic

Avoid:

- generic bootstrap styling
- overly colorful dashboards
- excessive gradients
- excessive glassmorphism
- childish UI
- unnecessary animations
- clutter
- dense forms
- excessive rounded elements
- default browser controls

The UI should look appropriate for a serious AI engineering hackathon project.

---

# 5. Core Experience

The main experience should communicate:

"Show what you built."

The user should immediately understand that this is an AI technical interview.

The primary screen should contain:

## Header

Include:

- IntervAI branding
- AI Cohort / technical interview context
- interview status
- optional curriculum progress

Keep the header minimal.

---

# 6. Candidate Panel

The candidate panel should clearly communicate who is being interviewed.

Include:

- candidate initials/avatar
- candidate name
- role
- experience
- relevant metadata
- candidate selector
- interview mode/status
- curriculum progress

Example:

Sarah Johnson

Senior Data Engineer

9y experience

Adaptive interview

8+ questions

4+ curriculum days

The actual values must come from the application's existing candidate data.

Do not hard-code fake data when real data already exists.

---

# 7. Interview Panel

The interview panel is the most important part of the application.

It should visually resemble a real technical interview.

Clearly distinguish:

### Interviewer messages

From:

AI Interviewer

### Candidate messages

From:

You

Use different visual treatments for the two.

Candidate answers should feel interactive and prominent.

The interview should support:

- question
- candidate response
- loading state
- follow-up question
- continued conversation
- interview completion

---

# 8. Interview Controls

Make controls obvious but unobtrusive.

Depending on what the existing application supports, include:

- text input
- send button
- loading state
- new interview
- finish interview
- interview status

Do not add controls that are not supported by the existing backend.

---

# 9. Progress Visualization

The interview is based on a multi-day learning journey.

Expose this concept visually.

Possible presentation:

31 DAYS · 8 MODULES

and/or:

Day 21
Agents

Day 22
Multi-Agent Systems

etc.

Use the application's actual curriculum information.

The user should understand that the interview is evaluating knowledge across a learning journey rather than asking random questions.

---

# 10. Interview State

The interface must clearly support these states:

### Initial

Candidate selected.

Show:

"Ready to start"

and a clear:

"Start Interview"

or existing equivalent.

### Active

Show:

LIVE

or an equivalent active indicator.

### Thinking

Show a polished loading state.

Do not freeze the entire page.

### Error

Display a friendly error message.

Never expose raw API errors directly to the user unless useful for development.

### Complete

Show:

"Interview complete"

and structured feedback.

---

# 11. Feedback Screen

The final feedback screen should be one of the strongest parts of the product.

It should feel like a professional interview evaluation.

Include:

## Overall evaluation

A concise summary.

## Strengths

Display strengths as visually distinct items.

## Gaps

Display areas that need improvement.

## Next steps

Display actionable recommendations.

If scores exist in the existing engine, visualize them.

Do not invent scoring logic if the backend does not provide scores.

---

# 12. AI Architecture Must NOT Be Broken

The existing AI engine is more important than visual changes.

Preserve the current architecture.

The application currently uses Gemini.

Do not replace Gemini with OpenAI.

Do not add paid APIs.

The project should remain compatible with free/low-cost development.

Respect:

```env
AI_PROVIDER=gemini
