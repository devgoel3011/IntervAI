"use client";

import { useEffect, useRef, useState } from "react";
import candidates from "../data/candidates.json";

type Message = {
  role: string;
  content: string;
};

type Feedback = {
  summary?: string;
  strengths?: string[];
  gaps?: string[];
  next?: string[];
};

export default function Home() {
  const [candidateId, setCandidateId] = useState("CAND-003");
  const [sessionId, setSessionId] = useState(
    () => `${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [done, setDone] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [loading, setLoading] = useState(false);
  const [panelWidth, setPanelWidth] = useState(330);
  const dragging = useRef(false);

  // Scroll-only enhancement: keeps the chat attached to the newest message
  // until the user manually scrolls away from the bottom.
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [isFollowing, setIsFollowing] = useState(true);
  const [showJumpButton, setShowJumpButton] = useState(false);

  const candidate = (candidates as any).candidates.find(
    (c: any) => c.member.id === candidateId
  );

  function reset() {
    setSessionId(
      `${Date.now()}-${Math.random().toString(36).slice(2)}`
    );
    setMessages([]);
    setDone(false);
    setFeedback(null);
    setInput("");
    setIsFollowing(true);
    setShowJumpButton(false);
  }

  async function send() {
    if (loading) return;

    const trimmed = input.trim();

    if (messages.length > 0 && !trimmed) return;

    setLoading(true);

    try {
      const payload =
        messages.length === 0
          ? {
              sessionId,
              candidate,
            }
          : {
              sessionId,
              message: trimmed,
            };

      const response = await fetch("/api/interview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Interview request failed.");
      }

      if (messages.length > 0) {
        setMessages((current) => [
          ...current,
          { role: "candidate", content: trimmed },
        ]);
      }

      setMessages((current) => [
        ...current,
        { role: "assistant", content: data.reply },
      ]);

      setInput("");
      setDone(Boolean(data.done));
      setFeedback(data.feedback || null);
    } catch (error: any) {
      setMessages((current) => [
        ...current,
        {
          role: "error",
          content: error?.message || "Something went wrong.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function startResize(event: React.PointerEvent<HTMLButtonElement>) {
    if (window.innerWidth <= 860) return;

    event.preventDefault();
    dragging.current = true;
    document.body.classList.add("is-resizing");
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function resize(event: React.PointerEvent<HTMLButtonElement>) {
    if (!dragging.current) return;

    const shell = event.currentTarget.closest(
      ".interview-shell"
    ) as HTMLElement | null;

    if (!shell) return;

    const rect = shell.getBoundingClientRect();
    const nextWidth = event.clientX - rect.left;

    setPanelWidth(Math.min(420, Math.max(270, nextWidth)));
  }

  function stopResize() {
    dragging.current = false;
    document.body.classList.remove("is-resizing");
  }

  const strengths = feedback?.strengths || [];
  const gaps = feedback?.gaps || [];
  const next = feedback?.next || [];

  // Scroll-only enhancement: detect whether the user is still near the bottom.
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const distanceFromBottom =
        container.scrollHeight -
        container.scrollTop -
        container.clientHeight;

      const nearBottom = distanceFromBottom < 80;

      setIsFollowing(nearBottom);
      setShowJumpButton(!nearBottom);
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Scroll-only enhancement: follow new messages while the user is at the bottom.
  useEffect(() => {
    if (!isFollowing || messages.length === 0) return;

    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    });
  }, [messages, isFollowing]);

  function jumpToLatest() {
    setIsFollowing(true);
    setShowJumpButton(false);

    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    });
  }

  return (
    <main className="portal">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <div className="ambient ambient-three" />
      <div className="ambient ambient-four" />

      <div className="word-art word-rag">RAG</div>
      <div className="word-art word-agents">AGENTS</div>
      <div className="word-art word-vector">VECTOR</div>
      <div className="word-art word-mcp">MCP</div>

      <div className="wave wave-one" />
      <div className="wave wave-two" />
      <div className="wave wave-three" />

      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">✦</span>
          <div>
            <strong>AI COHORT</strong>
            <span>FINAL TECHNICAL INTERVIEW</span>
          </div>
        </div>

        <div className="roadmap-pill">31 DAYS · 8 MODULES</div>
      </header>

      <section className="hero">
        <span className="hero-eyebrow">PERSONALIZED AI INTERVIEW AGENT</span>
        <h1>
          Personalised AI <em>INTERVIEWYER.</em>
        </h1>
        <p>
          Defend your engineering decisions across RAG, vector search,
          prompting, agents, MCP, deployment, and production AI.
        </p>
      </section>

      <section
        className="interview-shell"
        style={
          {
            "--panel-width": `${panelWidth}px`,
          } as React.CSSProperties
        }
      >
        <aside className="candidate-panel">
          <div className="candidate-avatar">
            {candidate?.member?.name
              ? candidate.member.name
                  .split(" ")
                  .map((part: string) => part[0])
                  .join("")
                  .slice(0, 2)
              : "AI"}
          </div>

          <h2>{candidate?.member?.name || "Candidate"}</h2>
          <p className="candidate-role">
            {candidate?.member?.jobRole || "Technical Candidate"}
          </p>

          <div className="stats">
            <span>9y exp</span>
            <span>30 missions</span>
          </div>

          <label htmlFor="candidate">CANDIDATE</label>

          <select
            id="candidate"
            value={candidateId}
            onChange={(event) => {
              setCandidateId(event.target.value);
              reset();
            }}
          >
            {(candidates as any).candidates.map((item: any) => (
              <option key={item.member.id} value={item.member.id}>
                {item.member.id} — {item.member.name}
              </option>
            ))}
          </select>

          <div className="chips">
            <span className="chip chip-purple">Adaptive</span>
            <span className="chip chip-violet">8+ questions</span>
            <span className="chip chip-cyan">4+ days</span>
          </div>

          <div className="mode-block">
            <label>INTERVIEW MODE</label>
            <p>Adaptive · context-aware follow-ups</p>
          </div>

          <button className="new-interview" onClick={reset}>
            <span>＋</span>
            New interview
          </button>

          <p className="resize-hint">Drag the divider to resize</p>
        </aside>

        <button
          type="button"
          className="resize-handle"
          aria-label="Resize candidate panel"
          onPointerDown={startResize}
          onPointerMove={resize}
          onPointerUp={stopResize}
          onPointerCancel={stopResize}
        >
          <span />
          <span />
          <span />
        </button>

        <div className="chat-panel">
          <div className="chat-header">
            <div>
              <h3>AI Interviewer</h3>
              <p>Technical conversation · follow-ups enabled</p>
            </div>
            <span className={`live-badge ${done ? "complete" : ""}`}>
              {done ? "DONE" : "LIVE"}
            </span>
          </div>

          <div ref={messagesContainerRef} className="messages">
            {messages.length === 0 ? (
              <div className="empty-state">
                <div className="empty-orb">✦</div>
                <span>READY WHEN YOU ARE</span>
                <h2>Show how you think.</h2>
                <p>
                  Start a candidate-specific technical interview grounded in
                  the supplied curriculum and profile.
                </p>
                <button onClick={send} disabled={loading}>
                  {loading ? "Preparing interview…" : "Start interview"}
                  <span>→</span>
                </button>
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={`message ${message.role}`}
                >
                  <span className="message-label">
                    {message.role === "assistant"
                      ? "AI INTERVIEWER"
                      : message.role === "candidate"
                        ? "YOU"
                        : "SYSTEM"}
                  </span>
                  <p>{message.content}</p>
                </div>
              ))
            )}
            <div ref={bottomRef} />
          </div>

          {showJumpButton && (
            <button
              type="button"
              className="jump-to-latest"
              onClick={jumpToLatest}
            >
              <span>↓</span>
              Jump to latest
            </button>
          )}

          {feedback && (
            <div className="feedback">
              <div className="feedback-heading">
                <div>
                  <span>POST-INTERVIEW ANALYSIS</span>
                  <h2>Interview feedback</h2>
                </div>
              </div>

              {feedback.summary && <p className="feedback-summary">{feedback.summary}</p>}

              <div className="feedback-grid">
                <div>
                  <b>Strengths</b>
                  {strengths.map((item) => (
                    <div key={item}>✓ {item}</div>
                  ))}
                </div>
                <div>
                  <b>Gaps</b>
                  {gaps.map((item) => (
                    <div key={item}>• {item}</div>
                  ))}
                </div>
                <div>
                  <b>Next</b>
                  {next.map((item) => (
                    <div key={item}>→ {item}</div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {!done && messages.length > 0 && (
            <form
              className="composer"
              onSubmit={(event) => {
                event.preventDefault();
                send();
              }}
            >
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Explain your approach…"
                disabled={loading}
                aria-label="Interview answer"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                aria-label="Send answer"
              >
                {loading ? "…" : "➤"}
              </button>
            </form>
          )}
        </div>
      </section>

      <footer>
        Built for the AI Cohort · Source of truth: supplied curriculum +
        candidate profiles · Server-side AI
      </footer>
    </main>
  );
}
