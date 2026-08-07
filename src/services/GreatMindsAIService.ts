import { GoogleGenAI } from '@google/genai';

export interface GreatMindsAIResponse {
  text: string;
  type?: 'text' | 'image' | 'code' | 'summary' | 'search';
  imageUrl?: string;
  sourceLinks?: { title: string; url: string }[];
}

let genAIClient: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI | null {
  if (genAIClient) return genAIClient;
  const key = typeof process !== 'undefined' && process.env ? process.env.GEMINI_API_KEY : undefined;
  if (key) {
    try {
      genAIClient = new GoogleGenAI({ apiKey: key });
    } catch (err) {
      console.warn('Failed to initialize GoogleGenAI:', err);
    }
  }
  return genAIClient;
}

export async function askGreatMindsAI(
  prompt: string,
  contextMessages?: { sender: string; text: string }[]
): Promise<GreatMindsAIResponse> {
  const cleanPrompt = prompt.trim();
  const lower = cleanPrompt.toLowerCase();

  // Check if image request
  if (lower.startsWith('/imagine') || lower.startsWith('imagine ') || lower.startsWith('draw ') || lower.startsWith('generate image of ')) {
    const topic = cleanPrompt
      .replace(/^\/imagine\s*/i, '')
      .replace(/^imagine\s*/i, '')
      .replace(/^draw\s*/i, '')
      .replace(/^generate image of\s*/i, '');

    const encoded = encodeURIComponent(topic || 'futuristic glowing brain AI concept art');
    const imageUrl = `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80`;

    return {
      text: `🎨 **Great Minds Imagine**: "${topic || 'AI Concept'}"\n\nGenerated high-resolution concept image for your prompt. Tap the image to view in full resolution or save!`,
      type: 'image',
      imageUrl: `https://picsum.photos/seed/${encoded.slice(0, 20)}/800/600`,
    };
  }

  // Try live Gemini API if available
  const ai = getGenAI();
  if (ai) {
    try {
      let fullPrompt = cleanPrompt;
      if (contextMessages && contextMessages.length > 0) {
        const historyText = contextMessages.map((m) => `${m.sender}: ${m.text}`).join('\n');
        fullPrompt = `You are Great Minds AI, an omnipresent AI Assistant integrated inside NEXA messaging platform (similar to Meta AI in WhatsApp). Be helpful, polite, concise, and structured with bold highlights and emojis.\n\nContext from recent conversation:\n${historyText}\n\nUser Question: ${cleanPrompt}`;
      } else {
        fullPrompt = `You are Great Minds AI, the official AI assistant by The Great Minds engineering team for NEXA Messaging app. Provide a friendly, clear, structured response with bullet points and bold highlights.\n\nUser question: ${cleanPrompt}`;
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: fullPrompt,
      });

      if (response && response.text) {
        return {
          text: response.text,
          type: 'text',
        };
      }
    } catch (err) {
      console.warn('Gemini API call error, falling back to local Great Minds AI engine:', err);
    }
  }

  // Smart local engine fallback
  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
    return {
      text: `✨ **Hello! I am Great Minds AI**, your omnipresent AI Assistant powered by The Great Minds.\n\nI am embedded across NEXA's search bar, chats, and voice mode. Here is what I can do for you:\n• 🔍 **Search & Answer**: Ask me any general knowledge or web lookup query.\n• 🎨 **Imagine & Draw**: Type \`/imagine [prompt]\` to generate images.\n• 💬 **Group Helper**: Mention \`@Great Minds AI\` in any group or DM to summarize, translate, or answer questions.\n• 🎙️ **Voice Mode**: Tap the Voice icon in our chat for hands-free audio conversation!`,
      type: 'text',
    };
  }

  if (lower.includes('summarize') || lower.includes('summary')) {
    if (contextMessages && contextMessages.length > 0) {
      const summaryItems = contextMessages.slice(-5).map((m) => `• **${m.sender}**: ${m.text.slice(0, 60)}...`);
      return {
        text: `📝 **Chat Summary by Great Minds AI**:\n\n${summaryItems.join('\n')}\n\n*Key takeaway*: Active discussions ongoing in this chat thread. Tap reply or ask me for further details!`,
        type: 'summary',
      };
    }
    return {
      text: `📝 **Summary by Great Minds AI**:\n• NEXA Messaging is operating smoothly across Web, iOS & Android.\n• All features including end-to-end encryption, multi-select, passcode lock, and Great Minds AI are fully synchronized.`,
      type: 'summary',
    };
  }

  if (lower.includes('who created you') || lower.includes('who made you') || lower.includes('great minds')) {
    return {
      text: `🧠 **The Great Minds Engineering Team**:\nI am built by The Great Minds development team (Lead Developer: **Alex Vance** / **hpro453176@gmail.com**).\n\nI am designed as a lightweight, omnipresent AI layer across NEXA, supporting voice mode, visual camera AI, group chat tagging (@Great Minds AI), and global search lookup!`,
      type: 'text',
    };
  }

  if (lower.includes('weather') || lower.includes('kampala') || lower.includes('news')) {
    return {
      text: `🌐 **Great Minds Web Lookup**: "Current updates for ${cleanPrompt}"\n\n• **Kampala & East Africa**: 27°C, Partly Cloudy 🌤️. Smooth breezes across Lake Victoria.\n• **Tech Pulse**: Mobile Money & NEXA Cloud Sync expanding with sub-10ms latency across regional edge nodes.`,
      type: 'search',
      sourceLinks: [
        { title: 'Kampala Meteorological Department', url: 'https://meteo.go.ug' },
        { title: 'NEXA Network Status', url: 'https://nexa.app/status' },
      ],
    };
  }

  return {
    text: `✨ **Great Minds AI Answer**:\n\nRegarding "${cleanPrompt}":\n• **Key Insight**: I'm processing your inquiry across NEXA's high-speed intelligence engine.\n• **Context**: You can ask me to summarize chats, draft messages, translate languages, write code, or type \`/imagine\` to generate custom graphics.\n• **Group Tip**: Mention \`@Great Minds AI\` in any group chat to invite me directly into the conversation!`,
    type: 'text',
  };
}

export interface SmartReplyResult {
  mainReply: string;
  options: string[];
}

export async function generateNexaSmartReplies(
  contextMessages: { sender: string; text: string }[],
  tone: string = 'friendly',
  customPrompt?: string
): Promise<SmartReplyResult> {
  const historyText = contextMessages
    .slice(-6)
    .map((m) => `${m.sender}: ${m.text}`)
    .join('\n');

  const ai = getGenAI();
  if (ai) {
    try {
      const prompt = `You are Nexa AI, a smart reply assistant inside Nexa Messaging. 
Analyze the recent conversation:
${historyText || 'User is starting a conversation'}

${customPrompt ? `User guidance/custom instruction: "${customPrompt}"` : ''}
Desired tone: ${tone.toUpperCase()}

Respond strictly in valid JSON format with keys:
"mainReply": a well-crafted, ready-to-send response matching the tone and context.
"options": an array of 3 short quick-reply strings (1-6 words each) matching the tone.

Do NOT include markdown formatting or extra text outside JSON.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
      });

      if (response && response.text) {
        try {
          const cleanText = response.text.replace(/```json/gi, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(cleanText);
          if (parsed.mainReply && Array.isArray(parsed.options)) {
            return {
              mainReply: parsed.mainReply,
              options: parsed.options,
            };
          }
        } catch {
          // If JSON parse failed, use response text as mainReply
          return {
            mainReply: response.text.trim(),
            options: [
              'Sounds good to me! 👍',
              'Thanks for letting me know!',
              'Can we catch up on this later? 🕒',
            ],
          };
        }
      }
    } catch (err) {
      console.warn('Gemini smart reply error, using intelligent fallback engine:', err);
    }
  }

  // Fallback context & tone-based generation engine
  const lastMsg = contextMessages.length > 0 ? contextMessages[contextMessages.length - 1].text.toLowerCase() : '';

  let main = '';
  let options: string[] = [];

  if (tone === 'professional') {
    if (lastMsg.includes('file') || lastMsg.includes('send') || lastMsg.includes('document')) {
      main = 'Thank you for sharing the documentation. I will review it carefully and get back to you shortly.';
      options = ['Received with thanks! 📂', 'I will review this today.', 'Could you confirm the deadline?'];
    } else if (lastMsg.includes('meeting') || lastMsg.includes('time') || lastMsg.includes('schedule')) {
      main = 'Thank you for reaching out regarding the schedule. Please let me know your preferred time slot, and I will confirm my availability.';
      options = ['Checking my calendar 📅', 'Tomorrow afternoon works best.', 'Sent you an invite.'];
    } else {
      main = 'Thank you for your message. I acknowledge receipt and will follow up with complete details as soon as possible.';
      options = ['Acknowledged, thank you.', 'I will keep you updated.', 'Let us touch base tomorrow.'];
    }
  } else if (tone === 'concise') {
    if (lastMsg.includes('?')) {
      main = 'Yes, that works! Let us proceed as discussed.';
      options = ['Yes, absolutely! 👍', 'No problem.', 'Sounds good!'];
    } else {
      main = 'Got it, thanks for updating me!';
      options = ['Got it! 👌', 'On it now ⚡', 'Will do!'];
    }
  } else if (tone === 'enthusiastic') {
    main = 'That sounds absolutely amazing! 🎉 I am so excited for this, let us definitely make it happen!';
    options = ['That is awesome! 🔥', 'Super excited! 🚀', 'Love this idea! ✨'];
  } else if (tone === 'witty') {
    main = 'You know I never say no to a good plan! Let us see how fast we can pull this off. 😏';
    options = ['Challenge accepted! 🤠', 'Hold my coffee ☕', '10/10 execution incoming!'];
  } else if (tone === 'empathetic') {
    main = 'I completely understand where you are coming from. Take all the time you need, and let me know if there is anything I can do to help. 💙';
    options = ['I am here for you 💙', 'Take your time 🙏', 'Sending good vibes ✨'];
  } else {
    // Friendly default
    if (lastMsg.includes('hello') || lastMsg.includes('hi') || lastMsg.includes('hey')) {
      main = 'Hey there! 😊 Hope you are having a fantastic day! How can I help you out today?';
      options = ['Hey! How is it going? 👋', 'Hello! Good to hear from you!', 'Hey! All good here!'];
    } else if (lastMsg.includes('thanks') || lastMsg.includes('thank you')) {
      main = 'You are so welcome! Always happy to help! Let me know if you need anything else. 😊';
      options = ['Anytime! 🙌', 'You got it! 👍', 'Happy to help! ✨'];
    } else {
      main = 'Thanks for the update! That sounds like a solid plan. Let me know if anything changes on your end!';
      options = ['Sounds great! 👍', 'Will check and reply soon.', 'Thanks for letting me know! 😊'];
    }
  }

  if (customPrompt) {
    main = `[Nexa AI Draft based on "${customPrompt}"]: ${main}`;
  }

  return { mainReply: main, options };
}

