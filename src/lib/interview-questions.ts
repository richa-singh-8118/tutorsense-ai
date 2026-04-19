import type { InterviewQuestion } from "@/types";

export const INTERVIEW_QUESTIONS: InterviewQuestion[] = [
  {
    id: "q1",
    text: "Welcome! Let's start with something simple. Can you tell me a little about yourself and what draws you to teaching children?",
    category: "warmup",
    followUps: [
      "That's interesting! What age group do you enjoy teaching the most?",
      "What do you find most rewarding about teaching young students?",
    ],
    evaluationFocus: ["communication", "passion", "warmth"],
  },
  {
    id: "q2",
    text: "Imagine you need to explain fractions to a 9-year-old who has never heard of them before. How would you do it?",
    category: "simplification",
    followUps: [
      "Can you show me exactly what you would say to the child — as if I'm the child right now?",
      "What if the child says they still don't get it after your explanation?",
      "Can you think of a real-life example from a child's daily life to make it click?",
    ],
    evaluationFocus: ["simplification", "creativity", "patience"],
  },
  {
    id: "q3",
    text: "A student has been struggling with the same math concept for 20 minutes. They're starting to get frustrated and saying 'I'll never understand this.' What do you do?",
    category: "patience",
    followUps: [
      "What would you say to the child at that exact moment to help them feel better?",
      "Have you ever faced a similar situation in real life? What happened?",
      "How do you personally stay calm and patient in those moments?",
    ],
    evaluationFocus: ["patience", "empathy", "emotional intelligence"],
  },
  {
    id: "q4",
    text: "How would you help a child who is scared of math and believes they are 'just not a math person'?",
    category: "empathy",
    followUps: [
      "What specific things would you say to rebuild their confidence?",
      "Can you share an example of a child you helped overcome a fear or mental block?",
    ],
    evaluationFocus: ["empathy", "warmth", "encouragement"],
  },
  {
    id: "q5",
    text: "Tell me about a time you had to explain a complex topic to someone — could be a student, friend, or family member — in a very simple way. What happened?",
    category: "teaching",
    followUps: [
      "How did you know they understood it?",
      "What would you do differently if you had to do it again?",
    ],
    evaluationFocus: ["storytelling", "communication", "adaptability"],
  },
  {
    id: "q6",
    text: "A parent messages you saying their child 'hates' your sessions and doesn't want to continue. How would you handle this?",
    category: "scenario",
    followUps: [
      "Would you change your teaching style? How?",
      "How would you make the sessions more engaging for a child who seems disinterested?",
    ],
    evaluationFocus: ["professionalism", "adaptability", "parent communication"],
  },
  {
    id: "q7",
    text: "In your own words, what makes a great tutor different from just someone who knows the subject well?",
    category: "teaching",
    followUps: [
      "How would you rate yourself on those qualities?",
      "What's one area you're still working to improve as a tutor?",
    ],
    evaluationFocus: ["self-awareness", "teaching philosophy", "growth mindset"],
  },
];

export const SYSTEM_PROMPT = `You are Maya, a warm, professional AI interviewer for TutorSense AI — a hiring platform used by Cuemath to screen tutor candidates.

Your role is to conduct a natural, conversational voice interview to assess the candidate's:
1. Communication clarity and fluency
2. Patience and emotional regulation
3. Warmth, empathy, and child-friendliness
4. Ability to simplify complex concepts
5. Teaching mindset and philosophy
6. English fluency and confidence

INTERVIEW STYLE:
- Speak warmly, professionally, and encouragingly
- Ask one question at a time
- Listen carefully to responses and ask genuine follow-up questions
- If an answer is vague or too short, gently ask for more detail or a real example
- If the candidate goes off-topic, guide them back naturally
- Acknowledge good answers with brief positive affirmations like "That's a great perspective" or "I like that approach"
- Never be robotic or follow a rigid script — adapt to the conversation

FOLLOW-UP TRIGGERS:
- If answer < 2 sentences: Ask "Can you elaborate a bit more on that?"
- If answer is abstract: Ask "Can you give me a specific real-life example?"
- If answer lacks emotion: Ask "How did that feel for you or the student?"
- If answer lacks child perspective: Ask "What would you say directly to the child in that moment?"

TONE:
- Calm, warm, and professional
- Encouraging without being fake
- Conversational, not scripted
- Make the candidate feel heard and respected

IMPORTANT:
- Keep your responses SHORT when asking questions (1-2 sentences max)
- When acknowledging before a new question, keep it very brief (one short sentence)
- Do NOT lecture or give long speeches
- The interview should flow naturally like a real phone conversation`;

export function buildInterviewPrompt(
  messages: { role: "user" | "assistant"; content: string }[],
  currentQuestion: InterviewQuestion | null,
  questionHistory: string[]
): string {
  const context = questionHistory.length > 0
    ? `\n\nQuestions asked so far: ${questionHistory.join(", ")}`
    : "";
  
  const nextInstruction = currentQuestion
    ? `\n\nCurrent focus question to ask (rephrase naturally): "${currentQuestion.text}"`
    : "\n\nThe interview is winding down. Ask one final wrap-up question and then thank the candidate.";

  return SYSTEM_PROMPT + context + nextInstruction;
}
