import { Router, type IRouter } from "express";

const router: IRouter = Router();

const QUOTES = [
  { quote: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
  { quote: "Education is the most powerful weapon which you can use to change the world.", author: "Nelson Mandela" },
  { quote: "Africa's time is now.", author: "Akin S. Sokpah" },
  { quote: "Don't be afraid to give up the good to go for the great.", author: "John D. Rockefeller" },
  { quote: "What you do today can improve all your tomorrows.", author: "Ralph Marston" },
  { quote: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { quote: "A river cuts through rock, not because of its power, but because of its persistence.", author: "Jim Watkins" },
  { quote: "We must be the architects of our own destiny.", author: "Ellen Johnson Sirleaf" },
  { quote: "Push yourself, because no one else is going to do it for you.", author: "Anonymous" },
  { quote: "Talent is universal. Opportunity is not. Build the bridge.", author: "Akin S. Sokpah" },
];

const TIPS = [
  { title: "Use the Pomodoro Method", body: "Work in 25-minute focused blocks with 5-minute breaks. Your brain learns best in short sprints, not long marathons." },
  { title: "Teach what you learn", body: "If you can explain a concept in plain language, you understand it. Teach a friend or write it down." },
  { title: "Sleep is study time", body: "Memory consolidates while you sleep. A 7-hour night beats a 3-hour cram session almost every time." },
  { title: "Active recall over re-reading", body: "Close the book and write what you remember. The struggle to recall is what builds retention." },
  { title: "Spaced repetition wins", body: "Review the same material at increasing intervals. Apps like Anki turn this into a habit." },
  { title: "Single-task ruthlessly", body: "Notifications cost you more focus than you think. Put the phone in another room while you study." },
  { title: "Apply for ten scholarships", body: "Most students apply for one or two and give up. The students who win apply for ten or twenty." },
  { title: "Write the personal statement first", body: "Your story is your edge. Start with why you, then add the credentials around it." },
];

const PROMPTS = [
  { title: "Build my study plan", prompt: "Help me build a 7-day study plan for an upcoming exam. Ask me what subject and how many hours I have per day." },
  { title: "Edit my scholarship essay", prompt: "I'm applying for a scholarship. Ask me for my draft essay and the scholarship's mission, then give me edits that strengthen my voice." },
  { title: "Explain something simply", prompt: "Explain a complex topic to me as if I'm 12 years old, then again as if I'm a graduate student. Ask me what topic." },
  { title: "Pitch my big idea", prompt: "I have a startup idea. Ask me what problem it solves, then help me write a 60-second pitch that would impress an investor." },
  { title: "Plan my career move", prompt: "Help me think through a career decision. Ask me what I'm choosing between and what matters to me." },
  { title: "Practice an interview", prompt: "Run a mock interview with me. Ask me the role I'm preparing for, then ask one question at a time and give feedback after each answer." },
];

function pick<T>(arr: T[]): T {
  const day = Math.floor(Date.now() / 86400000);
  return arr[day % arr.length] as T;
}

function pickN<T>(arr: T[], n: number): T[] {
  const day = Math.floor(Date.now() / 86400000);
  const out: T[] = [];
  for (let i = 0; i < n; i++) {
    out.push(arr[(day + i) % arr.length] as T);
  }
  return out;
}

router.get("/inspire", (_req, res) => {
  res.json({
    quote: pick(QUOTES),
    tip: pick(TIPS),
    prompts: pickN(PROMPTS, 4),
  });
});

export default router;
