import OpenAI from 'openai';
import { Project } from '../models/Project';
import { Chat } from '../models/Chat';
import { AiLog } from '../models/AiLog';
import { Activity } from '../models/Activity';

interface AgentContext {
  userId: string;
  projectId: string;
  message: string;
}

export const runAgent = async (context: AgentContext) => {
  const { userId, projectId, message } = context;
  const startTime = Date.now();
  
  const openai = new OpenAI({ 
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL || undefined,
  });

  try {
    // 1. Fetch Memory (Project Details & Chat History)
    const project = await Project.findById(projectId);
    if (!project) throw new Error('Project not found');

    let chat = await Chat.findOne({ project: projectId, user: userId });
    if (!chat) {
      chat = await Chat.create({ project: projectId, user: userId, messages: [] });
    }

    // 2. Planner & Tool Selection Strategy
    const documentContext = project.documents && project.documents.length > 0
      ? `
      Knowledge Base Documents (uploaded by the user — you can reference these by name in your responses):
      ${project.documents.map((doc: any, i: number) => `  ${i + 1}. ${doc.filename} (URL: ${doc.url})`).join('\n')}
      
      If the user asks about documents or their contents, refer to the above files by name. 
      You can guide the user on what each document likely contains based on its filename.
      `
      : `
      Knowledge Base: No documents uploaded yet. You can suggest the user upload relevant files (PDF, DOCX, etc.) to give you more context.
      `;

    const systemPrompt = `
      You are Nexus Agent, an autonomous AI assistant for a project workspace.
      Your goal is to help the user manage their project, generate content, and analyze data.
      
      Project Context:
      Title: ${project.title}
      Description: ${project.description}
      Status: ${project.status}
      ${documentContext}
      Available Tools you can use (you will recommend using them or perform tasks directly if it's text generation):
      - Document Analysis
      - Web Search Strategy
      - Content Generation
      
      Remember to be professional, proactive, and concise. Format your response in Markdown.
    `;

    // 3. Construct Chat History for LLM
    const history: any[] = chat.messages.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content,
    }));

    // Start Chat Session using OpenAI SDK
    const messages: any[] = [
      { role: "system", content: systemPrompt },
      ...history,
      { role: "user", content: message }
    ];

    // 4. Send Message to LLM
    // =================================================================
    // DUMMY AI TOGGLE: Change this to `false` to use the REAL OpenAI API
    // =================================================================
    const USE_DUMMY_AI = true; 
    let responseText = "";

    if (USE_DUMMY_AI) {
      // --- DUMMY AI BLOCK ---
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate AI typing delay
      
      const hasDocuments = project.documents && project.documents.length > 0;
      const docNames = hasDocuments
        ? project.documents.map((d: any) => `**${d.filename}**`).join(', ')
        : '';

      const dummyResponses = [
        "That's a great idea! Let me analyze that for you.",
        "I've noted this down. We can integrate this into the project plan.",
        "Based on the project context, I think we should focus on the core deliverables first.",
        "I'm currently running in 'Dummy Mode' (no API credits), but I'm here to help you test the UI!",
        "I understand. Let's make sure everything is perfectly aligned with the project goals.",
        "Could you provide a bit more detail on that? I want to make sure I get it exactly right.",
        "Great point! I'll update the project requirements accordingly.",
        "Let me know if you need help with any specific module.",
        "I can certainly help with that. What's the timeline for this feature?",
        "Interesting... this might affect our current architecture. I'll make a note of it.",
        "Got it! Your project data is saved and tracked successfully.",
        "Feel free to share more details so I can provide a better solution.",
        ...(hasDocuments ? [
          `I can see you've uploaded ${project.documents.length} document(s) to the Knowledge Base: ${docNames}. I can help you analyze or discuss the contents of these files!`,
          `I noticed you have ${docNames} in your Knowledge Base. Would you like me to summarize or discuss anything from these documents?`,
          `Based on the files in your Knowledge Base (${docNames}), I can help you extract key insights. What would you like to know?`,
        ] : [
          "Your Knowledge Base is empty. Upload some documents (PDF, DOCX, etc.) and I'll be able to help you analyze them!",
        ]),
      ];
      
      responseText = dummyResponses[Math.floor(Math.random() * dummyResponses.length)];
      // --- END DUMMY AI BLOCK ---
    } else {
      // --- ORIGINAL AI BLOCK ---
      const completion: any = await openai.chat.completions.create({
        model: "gpt-5.5",
        messages: messages,
      });
      
      responseText = completion?.choices?.[0]?.message?.content || '';
      // --- END ORIGINAL AI BLOCK ---
    }

    // 5. Save Interaction to Memory
    chat.messages.push({ role: 'user', content: message, timestamp: new Date() });
    chat.messages.push({ role: 'model', content: responseText, timestamp: new Date() });
    await chat.save();

    // 6. Log AI Usage & Activity
    const duration = Date.now() - startTime;
    await AiLog.create({
      user: userId,
      project: projectId,
      action: 'chat_interaction',
      durationMs: duration
    });
    
    await Activity.create({
      user: userId,
      project: projectId,
      action: 'interacted_with_ai',
      details: 'User sent a message to the agent'
    });

    return responseText;
  } catch (error: any) {
    console.error('Agent Error:', error);
    throw new Error('Failed to run agent');
  }
};

