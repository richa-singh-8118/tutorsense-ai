import openai
import google.generativeai as genai
import json
from typing import List, Dict, Any
from ..core.config import settings

# Clients initialization
openai_client = openai.OpenAI(api_key=settings.OPENAI_API_KEY) if settings.OPENAI_API_KEY else None

if settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)
    gemini_model = genai.GenerativeModel("gemini-1.5-flash")
else:
    gemini_model = None

# ── Ordered Interview Questions ───────────────────────────────────────────────
INTERVIEW_QUESTIONS = [
    {
        "id": "q1",
        "text": "Tell me a little about yourself — what draws you to teaching children?",
        "evaluationFocus": ["communication", "passion", "warmth"],
    },
    {
        "id": "q2",
        "text": "Imagine you need to explain fractions to a 9-year-old who has never heard of them. How would you do it?",
        "evaluationFocus": ["simplification", "creativity", "patience"],
    },
    {
        "id": "q3",
        "text": "A student has been stuck on the same concept for 20 minutes and is getting frustrated, saying 'I'll never get this.' What do you do?",
        "evaluationFocus": ["patience", "empathy", "emotional intelligence"],
    },
    {
        "id": "q4",
        "text": "How would you help a child who's convinced they're just 'not a math person'?",
        "evaluationFocus": ["empathy", "warmth", "encouragement"],
    },
    {
        "id": "q5",
        "text": "Tell me about a time you had to explain something complex in a very simple way. What did you do?",
        "evaluationFocus": ["storytelling", "communication", "adaptability"],
    },
    {
        "id": "q6",
        "text": "A parent messages you saying their child 'hates' your sessions and doesn't want to continue. How do you handle this?",
        "evaluationFocus": ["professionalism", "adaptability", "parent communication"],
    },
    {
        "id": "q7",
        "text": "In your own words — what makes a great tutor different from someone who simply knows the subject well?",
        "evaluationFocus": ["self-awareness", "teaching philosophy", "growth mindset"],
    }
]

TOTAL_QUESTIONS = len(INTERVIEW_QUESTIONS)

def _build_system_prompt(candidate_name: str, question_index: int) -> str:
    """
    Build a precise system prompt that tells Maya exactly which question
    she is on and allows her to ask a follow-up or move to the next topic.
    """
    q_num = question_index + 1
    has_more = question_index < TOTAL_QUESTIONS - 1

    if question_index >= TOTAL_QUESTIONS:
        return f"""You are Maya, a warm AI interviewer for TutorSense AI.
Candidate: {candidate_name}
All {TOTAL_QUESTIONS} questions covered. Thank {candidate_name} warmly and naturally end the conversation.
RESPOND IN JSON FORMAT:
{{"reply": "your text here", "should_advance_question": true}}"""

    current_q = INTERVIEW_QUESTIONS[question_index]["text"]
    next_q = INTERVIEW_QUESTIONS[question_index + 1]["text"] if has_more else None

    prompt = f"""You are Maya, a warm, professional, and highly perceptive AI interviewer for TutorSense AI — a premium hiring platform for Cuemath tutor candidates.

Candidate Name: {candidate_name}

=== YOUR PERSONALITY ===
- Warm, encouraging, and empathetic.
- Professional but approachable (like a senior mentor).
- You listen deeply. If a candidate says something interesting but brief, you dig deeper.

=== CURRENT TASK ===
You are currently on Question {q_num} of {TOTAL_QUESTIONS}.
Current topic: "{current_q}"

=== HOW TO RESPOND ===
1. Acknowledge the candidate's response with warmth and professional validation.
2. Evaluate the response:
   - If it was VAGUE, SURFACE-LEVEL, or BRIEF: Ask ONE natural follow-up question. (e.g., "That's a good start, but could you tell me exactly how you'd explain that to a child who's struggling?")
   - If they gave a generic answer: Ask for a real-world example or a specific scenario.
   - If the answer was DETAILED and CLEAR: Acknowledge it warmly and ask the NEXT QUESTION.
3. Keep your response concise (max 3-4 sentences) to keep the conversation flowing.

=== NEXT QUESTION (if moving on) ===
{next_q if has_more else "There are no more questions. If moving on, wrap up the interview warmly and tell them the team will be in touch."}

=== STRICT JSON FORMAT ===
You MUST respond in valid JSON with exactly two keys:
{{
  "reply": "Your verbal response to the candidate",
  "should_advance_question": true/false (true if moving to the next question or wrapping up, false if asking a follow-up)
}}"""

    return prompt


EVALUATION_PROMPT = """You are a Senior HR Evaluator and Pedagogical Expert for Cuemath. 
Your task is to analyze a tutor candidate's interview transcript and generate a deep, structured evaluation.

=== SCORING RUBRIC (1-10) ===
1. communicationClarity: How well do they structure thoughts? Is their explanation logical?
2. patience: How do they react to frustration? Do they keep a calm, supportive tone?
3. warmthEmpathy: Do they sound like they genuinely care about a child's progress?
4. abilityToSimplify: Can they take complex math/logic and make it accessible to a 9-year-old?
5. englishFluency: Vocabulary, grammar, and pronunciation clarity.
6. confidence: Do they sound like an authority in their subject while remaining humble?
7. teachingSuitability: Overall fit for a 1-on-1 tutoring environment.

=== TUTOR PERSONAS ===
Assign one of these personas based on their style:
- "The Patient Guide": Calm, steady, focuses on building confidence.
- "The Energetic Motivator": High energy, uses excitement to engage.
- "The Socratic Questioner": Leads the student to the answer via logic.
- "The Storyteller": Uses metaphors and real-world examples effectively.

=== RESPONSE FORMAT (STRICT JSON) ===
{
  "scores": {
    "communicationClarity": number,
    "patience": number,
    "warmthEmpathy": number,
    "abilityToSimplify": number,
    "englishFluency": number,
    "confidence": number,
    "teachingSuitability": number
  },
  "persona": "One of the personas above",
  "recommendation": "Strong Yes" | "Yes" | "Maybe" | "No",
  "strengths": ["list of 3-4 specific strengths"],
  "concerns": ["list of potential red flags or areas for improvement"],
  "supportingQuotes": [
    {
      "quote": "exact quote from candidate",
      "context": "what was being discussed",
      "insight": "why this quote matters"
    }
  ],
  "interviewerSummary": "A professional 3-paragraph summary of the candidate's performance and potential.",
  "biasCheck": "Brief note on ensuring this evaluation is based purely on merit and communication skills."
}"""


async def get_interview_reply(
    messages: List[Dict[str, str]],
    question_index: int,
    candidate_name: str
) -> Dict[str, Any]:
    """
    Returns Maya's reply and advances the question index based on AI decision.
    """
    # ── Demo mode (no API key) ────────────────────────────────────────────────
    if not openai_client and not gemini_model:
        demo_replies = [
            f"That's wonderful, {candidate_name}! Teaching children is such a meaningful path. Now, let's try a quick exercise — how would you explain fractions to a 9-year-old who has never heard of them?",
            "Great example! Using everyday objects like pizza really helps kids visualise it. Moving on — a student has been stuck on the same concept for 20 minutes and is getting frustrated. What do you do?",
            "That shows a lot of patience and empathy — exactly what young learners need. Next — how would you help a child who's convinced they're just 'not a math person'?",
            "Such an encouraging mindset! That belief really can change everything for a child. Tell me about a time you had to explain something complex in a very simple way.",
            "That's a great real-world example! Relating concepts to things kids already understand is key. How would you handle a parent who messages you saying their child 'hates' your sessions?",
            "Great approach — keeping that parent communication open is so important. Last question — what do you think makes a great tutor different from someone who simply knows the subject well?",
            f"That's a beautifully put answer, {candidate_name}. Thank you so much for sharing your thoughts with me today. You've shown real warmth and thoughtfulness — this concludes your interview. Best of luck!"
        ]
        reply_idx = min(question_index, len(demo_replies) - 1)
        next_index = question_index + 1
        return {
            "reply": demo_replies[reply_idx],
            "questionIndex": next_index,
            "isComplete": next_index >= TOTAL_QUESTIONS,
        }

    system_prompt = _build_system_prompt(candidate_name, question_index)

    # ── Live mode with Gemini (Preferred) ───────────────────────────────────
    if gemini_model:
        try:
            # Format history for Gemini
            chat = gemini_model.start_chat(history=[])
            # We send the system prompt as the first instruction
            prompt = f"{system_prompt}\n\nRecent conversation:\n"
            for m in messages[-8:]:
                prompt += f"{m['role']}: {m['content']}\n"
            
            response = chat.send_message(prompt)
            # Try to parse JSON from response (Gemini sometimes adds markdown blocks)
            text = response.text.strip()
            if "```json" in text:
                text = text.split("```json")[1].split("```")[0].strip()
            
            result = json.loads(text)
            reply = result.get("reply", "")
            should_advance = result.get("should_advance_question", True)
            
            next_index = question_index + 1 if should_advance else question_index
            return {
                "reply": reply,
                "questionIndex": next_index,
                "isComplete": next_index >= TOTAL_QUESTIONS,
            }
        except Exception as e:
            print(f"[Gemini Error] {e}")
            # Fallback to OpenAI if available, else error

    # ── Live mode with OpenAI ─────────────────────────────────────────────────
    if openai_client:
        try:
            response = openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_prompt},
                    *[{"role": m["role"], "content": m["content"]} for m in messages[-8:]]
                ],
                response_format={"type": "json_object"},
                max_tokens=250,
                temperature=0.65
            )
            result = json.loads(response.choices[0].message.content.strip())
            reply = result.get("reply", "")
            should_advance = result.get("should_advance_question", True)
            
            next_index = question_index + 1 if should_advance else question_index
            return {
                "reply": reply,
                "questionIndex": next_index,
                "isComplete": next_index >= TOTAL_QUESTIONS,
            }
        except Exception as e:
            print(f"[OpenAI Error] {e}")

    # Fallback if both fail
    reply = "Thank you for sharing that! Let's keep going — " + (
        INTERVIEW_QUESTIONS[question_index + 1]["text"] if question_index + 1 < TOTAL_QUESTIONS else
        f"that wraps up our conversation, {candidate_name}. Thank you so much!"
    )
    return {
        "reply": reply,
        "questionIndex": question_index + 1,
        "isComplete": question_index + 1 >= TOTAL_QUESTIONS,
    }


async def evaluate_interview(
    transcript: List[Dict[str, Any]],
    candidate_name: str
) -> Dict[str, Any]:
    """Generate structured evaluation from the interview transcript."""
    if not openai_client and not gemini_model:
        return {
            "scores": {
                "communicationClarity": 8.5,
                "patience": 9.0,
                "warmthEmpathy": 8.8,
                "abilityToSimplify": 8.2,
                "englishFluency": 9.0,
                "confidence": 8.5,
                "teachingSuitability": 8.7
            },
            "persona": "The Patient Guide",
            "recommendation": "Strong Yes",
            "strengths": ["Excellent patience and empathy", "Clear, structured communication", "Strong grasp of child psychology"],
            "concerns": [],
            "supportingQuotes": [
                {
                    "quote": "I would use everyday examples like pizza or chocolate bars", 
                    "context": "Explaining fractions to children",
                    "insight": "Shows strong ability to relate abstract concepts to a child's world."
                }
            ],
            "interviewerSummary": f"{candidate_name} demonstrated outstanding teaching temperament — warm, patient, and clear. A strong candidate for tutoring roles at Cuemath.",
            "biasCheck": "Evaluation focused solely on pedagogical skill and communication clarity."
        }

    transcript_text = "\n".join([
        f"{'Maya' if m['speaker'] == 'ai' else candidate_name}: {m['text']}"
        for m in transcript
    ])

    # ── Gemini Evaluation ──────────────────────────────────────────────────
    if gemini_model:
        try:
            prompt = f"{EVALUATION_PROMPT}\n\nCandidate: {candidate_name}\n\nTranscript:\n{transcript_text}"
            response = gemini_model.generate_content(prompt)
            text = response.text.strip()
            if "```json" in text:
                text = text.split("```json")[1].split("```")[0].strip()
            return json.loads(text)
        except Exception as e:
            print(f"[Gemini Eval Error] {e}")

    # ── OpenAI Evaluation ──────────────────────────────────────────────────
    if openai_client:
        response = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": EVALUATION_PROMPT},
                {"role": "user", "content": f"Candidate: {candidate_name}\n\nTranscript:\n{transcript_text}"}
            ],
            response_format={"type": "json_object"},
            temperature=0.3
        )
        return json.loads(response.choices[0].message.content)

    return {} # Should not happen with demo fallback above
