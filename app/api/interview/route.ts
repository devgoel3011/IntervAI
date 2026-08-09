import { NextRequest, NextResponse } from "next/server";
import { getCandidate, loadSession, persistSession, callModel, type SessionState } from "../../../lib/engine";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const sessionId = body.sessionId;
    if (!sessionId) return NextResponse.json({error:"sessionId is required"},{status:400});
    let session = await loadSession(sessionId);

    if (!session) {
      const candidate = getCandidate(body.candidate);
      if (!candidate) return NextResponse.json({error:"candidate is required for the first request"},{status:400});
      session = {sessionId,candidate,turns:[],askedDays:[],questionCount:0,done:false};
      const opening = await callModel(session);
      session.turns.push({role:"assistant",content:opening.reply,day:opening.day ?? undefined});
      if (opening.day) session.askedDays.push(opening.day);
      session.questionCount = 1;
      await persistSession(session);
      return NextResponse.json({reply:opening.reply,done:false});
    }

    if (session.done) return NextResponse.json({reply:"Interview completed.",done:true,feedback:session.feedback});
    const message = body.message;
    if (typeof message !== "string" || !message.trim()) return NextResponse.json({error:"message is required"},{status:400});
    session.turns.push({role:"candidate",content:message.trim()});
    const action = await callModel(session);
    session.turns.push({role:"assistant",content:action.reply,day:action.day ?? undefined});
    if (action.day && !session.askedDays.includes(action.day)) session.askedDays.push(action.day);
    if (action.action === "finish" && session.questionCount >= 8 && session.askedDays.length >= 4) {
      session.done = true; session.feedback = action.feedback;
      await persistSession(session);
      return NextResponse.json({reply:action.reply || "Interview completed.",done:true,feedback:session.feedback});
    }
    session.questionCount += 1;
    await persistSession(session);
    return NextResponse.json({reply:action.reply,done:false});
  } catch (e:any) {
    return NextResponse.json({error:e?.message || "Interview agent error"},{status:500});
  }
}
