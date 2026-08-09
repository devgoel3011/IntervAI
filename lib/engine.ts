import curriculum from "../data/curriculum.json";
import candidates from "../data/candidates.json";

export type Turn = {
  role: "assistant" | "candidate";
  content: string;
  day?: number;
};

export type InterviewFeedback = {
  summary: string;
  strengths: string[];
  gaps: string[];
  next: string[];
};

export type SessionState = {
  sessionId: string;
  candidate: any;
  turns: Turn[];
  askedDays: number[];
  questionCount: number;
  done: boolean;
  feedback?: InterviewFeedback;
};

/*
|--------------------------------------------------------------------------
| In-memory session store
|--------------------------------------------------------------------------
|
| This makes the application work locally without requiring Supabase.
| If Supabase credentials are configured, sessions are also persisted there.
|
*/

const memory = new Map<string, SessionState>();

/*
|--------------------------------------------------------------------------
| Candidate helpers
|--------------------------------------------------------------------------
*/

export function getCandidate(input: any) {
  if (!input) {
    return null;
  }

  /*
   * If the route already supplied a complete candidate object.
   */
  if (input.member) {
    return input;
  }

  /*
   * If only a candidate ID was supplied, find the candidate in the
   * candidates JSON.
   */
  if (input.id) {
    const candidateList =
      (candidates as any)?.candidates ?? [];

    return (
      candidateList.find(
        (candidate: any) =>
          candidate?.member?.id === input.id ||
          candidate?.id === input.id
      ) ?? input
    );
  }

  return input;
}

/*
|--------------------------------------------------------------------------
| Session helpers
|--------------------------------------------------------------------------
*/

export function getSession(id: string) {
  return memory.get(id);
}

export function setSession(session: SessionState) {
  memory.set(session.sessionId, session);
}

/*
|--------------------------------------------------------------------------
| Curriculum helpers
|--------------------------------------------------------------------------
*/

export function curriculumForCandidate(candidate: any) {
  const missions = Array.isArray(candidate?.missions)
    ? candidate.missions
    : [];

  const completed = new Set<number>();
  const skipped = new Set<number>();
  const failed = new Set<number>();

  for (const mission of missions) {
    const day = Number(mission?.day);

    if (!Number.isInteger(day)) {
      continue;
    }

    if (
      mission?.passed === true ||
      mission?.completed === true ||
      mission?.status === "completed" ||
      mission?.status === "passed"
    ) {
      completed.add(day);
    }

    if (
      mission?.skipped === true ||
      mission?.status === "skipped"
    ) {
      skipped.add(day);
    }

    if (
      mission?.passed === false ||
      mission?.status === "failed"
    ) {
      failed.add(day);
    }
  }

  const days = Array.isArray((curriculum as any)?.days)
    ? (curriculum as any).days
    : [];

  return days.map((day: any) => {
    const dayNumber = Number(day?.day);

    let status = "not_recorded";

    if (completed.has(dayNumber)) {
      status = "passed";
    } else if (failed.has(dayNumber)) {
      status = "failed";
    } else if (skipped.has(dayNumber)) {
      status = "skipped";
    }

    return {
      day: dayNumber,
      title: day?.title ?? "",
      objectives: day?.objectives ?? [],
      tools: day?.tools ?? [],
      status,
    };
  });
}

/*
|--------------------------------------------------------------------------
| Interview prompt
|--------------------------------------------------------------------------
*/

export function buildPrompt(session: SessionState) {
  const candidateProfile = {
    member: session.candidate?.member ?? {},
    missions: session.candidate?.missions ?? [],
    signals: session.candidate?.signals ?? [],
  };

  const profile = JSON.stringify(
    candidateProfile,
    null,
    2
  );

  const curriculumData = JSON.stringify(
    curriculumForCandidate(session.candidate),
    null,
    2
  );

  const conversation =
    session.turns.length > 0
      ? session.turns
          .map((turn, index) => {
            const role =
              turn.role === "assistant"
                ? "INTERVIEWER"
                : "CANDIDATE";

            const day =
              turn.day !== undefined
                ? ` [Curriculum Day ${turn.day}]`
                : "";

            return `${index + 1}. ${role}${day}: ${turn.content}`;
          })
          .join("\n")
      : "(No previous conversation.)";

  const askedDays =
    session.askedDays.length > 0
      ? session.askedDays.join(", ")
      : "None";

  return `
You are the AI Interview Agent for the IntervAI AI Cohort.

You are conducting a realistic enterprise AI engineering technical interview.

The candidate completed a 31-day AI Cohort covering topics such as:

- Retrieval-Augmented Generation
- Vector Databases
- Prompt Engineering
- Agentic AI
- Model Context Protocol
- AI Deployment
- Production AI Systems

Your interview must be based on the candidate's actual learning journey
and the supplied curriculum.

============================================================
CANDIDATE PROFILE
============================================================

${profile}

============================================================
CURRICULUM
============================================================

${curriculumData}

============================================================
CURRENT INTERVIEW STATE
============================================================

Question count:
${session.questionCount}

Curriculum days already assessed:
${askedDays}

Interview completed:
${session.done}

Minimum required questions:
8

Minimum required distinct curriculum days:
4

============================================================
PREVIOUS CONVERSATION
============================================================

${conversation}

============================================================
INTERVIEW BEHAVIOR
============================================================

You are a technical interviewer, not a quiz generator.

The interview should feel like a real engineering interview.

Ask ONE question at a time.

Use previous candidate answers to decide what to ask next.

When the candidate gives a weak or incomplete answer:
- Ask a focused follow-up.
- Ask them to explain the missing reasoning.
- Probe implementation details.
- Probe failure modes or tradeoffs.

When the candidate gives a strong answer:
- Increase the difficulty.
- Ask about architecture.
- Ask about production concerns.
- Ask about scalability.
- Ask about evaluation.
- Ask about observability.
- Ask about security.
- Ask about tradeoffs.
- Ask what they would change.

Do not blindly move from topic to topic.

Follow the candidate's reasoning naturally.

============================================================
CANDIDATE LEARNING SIGNALS
============================================================

Use the candidate profile intelligently.

Passed missions:
These are areas the candidate has worked on, but passing does NOT mean
they automatically have mastery.

Failed missions:
These may be useful areas to probe for deeper understanding.

Skipped missions:
Do NOT assume the candidate understands these topics.

============================================================
QUESTION DESIGN
============================================================

Prefer engineering questions such as:

- Why did you choose this architecture?
- What happens internally?
- What happens when retrieval fails?
- How would you evaluate this system?
- What tradeoff did you make?
- How would you debug this?
- What would break at scale?
- How would you deploy this?
- How would you monitor it?
- How would you make it reliable?
- What alternative would you consider?
- What would you change in production?
- How would you handle bad or adversarial input?

Avoid trivia and simple definition questions when possible.

Ask questions that reveal whether the candidate can actually explain
and defend the systems they built.

============================================================
MANDATORY INTERVIEW REQUIREMENTS
============================================================

You MUST ask at least 8 questions.

You MUST assess at least 4 different curriculum days.

If fewer than 8 questions have been asked:
action MUST be "ask".

If fewer than 4 distinct curriculum days have been assessed:
action MUST be "ask".

Do NOT finish early merely because the candidate answered well.

Once BOTH requirements have been satisfied, you may finish the interview
when the conversation provides enough evidence for meaningful feedback.

============================================================
FOLLOW-UP BEHAVIOR
============================================================

A follow-up should be based on what the candidate just said.

For example:

Candidate:
"I used a vector database because it makes semantic search easier."

Good follow-up:
"That's the motivation, but walk me through what happens from the user's
query to the final retrieved context. Where would you expect latency?"

Bad follow-up:
"What is a vector database?"

Do not repeat questions already asked.

============================================================
FINAL FEEDBACK
============================================================

When finishing, provide structured feedback containing:

summary:
A concise overall assessment.

strengths:
Specific technical strengths demonstrated during the interview.

gaps:
Specific technical weaknesses or areas where more depth is needed.

next:
Concrete actions the candidate should take to improve.

Feedback MUST be grounded in the conversation.

Do not invent achievements or weaknesses.

============================================================
OUTPUT RULES
============================================================

Return ONLY JSON matching the supplied response schema.

For an active interview:

action:
"ask"

reply:
Exactly one natural interview question.

day:
The curriculum day being assessed.

feedback:
Use an empty feedback object.

For the final response:

action:
"finish"

reply:
A short closing statement.

day:
Use 0.

feedback:
Provide the complete structured evaluation.

Do not use null anywhere in the output.

Do not finish before:
- 8 questions have been asked
- 4 distinct curriculum days have been assessed
`;
}

/*
|--------------------------------------------------------------------------
| Gemini response schema
|--------------------------------------------------------------------------
|
| IMPORTANT:
|
| We intentionally use only simple Gemini-compatible schema types here.
|
| In particular:
|
|   type: "integer"
|
| rather than:
|
|   type: ["integer", "null"]
|
| This avoids the exact protobuf error encountered in the application.
|
| Day 0 means "no curriculum day" when the interview is finished.
|
*/

const responseSchema = {
  type: "object",

  properties: {
    action: {
      type: "string",

      enum: [
        "ask",
        "finish",
      ],

      description:
        "Whether the interviewer should ask another question or finish.",
    },

    reply: {
      type: "string",

      description:
        "The interviewer's next question or final closing statement.",
    },

    day: {
      type: "integer",

      description:
        "Curriculum day being assessed. Use 0 when finishing.",
    },

    feedback: {
      type: "object",

      properties: {
        summary: {
          type: "string",

          description:
            "Overall assessment of the candidate.",
        },

        strengths: {
          type: "array",

          items: {
            type: "string",
          },

          description:
            "Specific technical strengths demonstrated by the candidate.",
        },

        gaps: {
          type: "array",

          items: {
            type: "string",
          },

          description:
            "Specific technical gaps demonstrated by the candidate.",
        },

        next: {
          type: "array",

          items: {
            type: "string",
          },

          description:
            "Concrete next steps for improvement.",
        },
      },

      required: [
        "summary",
        "strengths",
        "gaps",
        "next",
      ],
    },
  },

  required: [
    "action",
    "reply",
    "day",
    "feedback",
  ],
};

/*
|--------------------------------------------------------------------------
| Gemini API
|--------------------------------------------------------------------------
*/

export async function callModel(
  session: SessionState
) {
  const apiKey =
    process.env.GEMINI_API_KEY;

  const model =
    process.env.GEMINI_MODEL ||
    "gemini-2.5-flash";

  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not configured. Add your Gemini API key to .env.local."
    );
  }

  const prompt = buildPrompt(session);

  const endpoint =
    `https://generativelanguage.googleapis.com/v1beta/models/` +
    `${encodeURIComponent(model)}:generateContent`;

  let response: Response;

  try {
    response = await fetch(
      endpoint,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",

          "x-goog-api-key":
            apiKey,
        },

        body: JSON.stringify({
          contents: [
            {
              role: "user",

              parts: [
                {
                  text:
                    prompt +
                    "\n\nNow decide the next interview action.",
                },
              ],
            },
          ],

          generationConfig: {
            temperature: 0.2,

            responseMimeType:
              "application/json",

            responseSchema,
          },
        }),
      }
    );
  } catch (error: any) {
    throw new Error(
      `Could not connect to Gemini: ${
        error?.message ||
        "Unknown network error"
      }`
    );
  }

  if (!response.ok) {
    const details =
      await response.text();

    if (response.status === 400) {
      throw new Error(
        `Gemini rejected the request with HTTP 400. ` +
        `This usually indicates an invalid request or unsupported model/schema. ` +
        `Details: ${details}`
      );
    }

    if (response.status === 401) {
      throw new Error(
        `Gemini authentication failed. ` +
        `Check GEMINI_API_KEY in .env.local.`
      );
    }

    if (response.status === 403) {
      throw new Error(
        `Gemini access was denied. ` +
        `Check that the API key has Gemini API access and that the selected model is available. ` +
        `Details: ${details}`
      );
    }

    if (response.status === 429) {
      throw new Error(
        `Gemini free-tier rate limit reached. ` +
        `Please wait a little and try again. ` +
        `Details: ${details}`
      );
    }

    throw new Error(
      `Gemini API returned HTTP ${response.status}: ${details}`
    );
  }

  let data: any;

  try {
    data = await response.json();
  } catch {
    throw new Error(
      "Gemini returned an invalid HTTP response."
    );
  }

  /*
   * Extract the generated JSON.
   */

  const parts =
    data?.candidates?.[0]?.content?.parts;

  if (!Array.isArray(parts)) {
    const finishReason =
      data?.candidates?.[0]?.finishReason;

    throw new Error(
      `Gemini returned no usable content${
        finishReason
          ? ` (finish reason: ${finishReason})`
          : ""
      }.`
    );
  }

  const text = parts
    .map((part: any) =>
      typeof part?.text === "string"
        ? part.text
        : ""
    )
    .join("")
    .trim();

  if (!text) {
    throw new Error(
      "Gemini returned an empty response."
    );
  }

  /*
   * Parse structured JSON.
   */

  let result: any;

  try {
    result = JSON.parse(text);
  } catch {
    /*
     * Defensive fallback in case a model ever wraps the JSON in markdown.
     */

    const cleaned = text
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    try {
      result = JSON.parse(cleaned);
    } catch {
      throw new Error(
        `Gemini returned invalid JSON: ${text}`
      );
    }
  }

  /*
   * Validate application-level output.
   */

  if (
    result.action !== "ask" &&
    result.action !== "finish"
  ) {
    throw new Error(
      "Gemini returned an invalid interview action."
    );
  }

  if (
    typeof result.reply !== "string" ||
    result.reply.trim() === ""
  ) {
    throw new Error(
      "Gemini returned an empty interviewer reply."
    );
  }

  if (
    !Number.isInteger(result.day)
  ) {
    throw new Error(
      "Gemini returned an invalid curriculum day."
    );
  }

  /*
   * Make sure feedback always has the required structure.
   */

  if (
    !result.feedback ||
    typeof result.feedback !== "object"
  ) {
    result.feedback = {};
  }

  if (
    typeof result.feedback.summary !==
    "string"
  ) {
    result.feedback.summary = "";
  }

  if (
    !Array.isArray(
      result.feedback.strengths
    )
  ) {
    result.feedback.strengths = [];
  }

  if (
    !Array.isArray(
      result.feedback.gaps
    )
  ) {
    result.feedback.gaps = [];
  }

  if (
    !Array.isArray(
      result.feedback.next
    )
  ) {
    result.feedback.next = [];
  }

  /*
   * Remove any malformed feedback array values.
   */

  result.feedback.strengths =
    result.feedback.strengths.filter(
      (item: any) =>
        typeof item === "string"
    );

  result.feedback.gaps =
    result.feedback.gaps.filter(
      (item: any) =>
        typeof item === "string"
    );

  result.feedback.next =
    result.feedback.next.filter(
      (item: any) =>
        typeof item === "string"
    );

  return result;
}

/*
|--------------------------------------------------------------------------
| Session persistence
|--------------------------------------------------------------------------
*/

export async function loadSession(
  id: string
): Promise<
  SessionState | undefined
> {
  /*
   * Local memory first.
   */

  const local =
    memory.get(id);

  if (local) {
    return local;
  }

  /*
   * Supabase is optional.
   */

  const supabaseUrl =
    process.env.SUPABASE_URL;

  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (
    !supabaseUrl ||
    !serviceKey
  ) {
    return undefined;
  }

  const url =
    `${supabaseUrl}/rest/v1/interview_sessions` +
    `?session_id=eq.${encodeURIComponent(id)}` +
    `&select=state`;

  try {
    const response =
      await fetch(url, {
        method: "GET",

        headers: {
          apikey: serviceKey,

          Authorization:
            `Bearer ${serviceKey}`,
        },

        cache: "no-store",
      });

    if (!response.ok) {
      return undefined;
    }

    const rows =
      await response.json();

    if (
      !Array.isArray(rows) ||
      !rows[0]?.state
    ) {
      return undefined;
    }

    const session =
      rows[0].state as SessionState;

    memory.set(
      id,
      session
    );

    return session;
  } catch {
    /*
     * Supabase should never prevent the local application
     * from working.
     */

    return undefined;
  }
}

/*
|--------------------------------------------------------------------------
| Persist session
|--------------------------------------------------------------------------
*/

export async function persistSession(
  session: SessionState
) {
  /*
   * Always maintain local state.
   */

  memory.set(
    session.sessionId,
    session
  );

  /*
   * Supabase is optional.
   */

  const supabaseUrl =
    process.env.SUPABASE_URL;

  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (
    !supabaseUrl ||
    !serviceKey
  ) {
    return;
  }

  const url =
    `${supabaseUrl}/rest/v1/interview_sessions`;

  try {
    await fetch(url, {
      method: "POST",

      headers: {
        apikey: serviceKey,

        Authorization:
          `Bearer ${serviceKey}`,

        "Content-Type":
          "application/json",

        Prefer:
          "resolution=merge-duplicates",
      },

      body: JSON.stringify({
        session_id:
          session.sessionId,

        state:
          session,

        updated_at:
          new Date().toISOString(),
      }),
    });
  } catch {
    /*
     * Supabase persistence is best-effort.
     * The interview continues using local memory.
     */
  }
}