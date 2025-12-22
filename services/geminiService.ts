import { GoogleGenAI } from "@google/genai";
import { ExplanationRequest } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateRejectionExplanation = async (data: ExplanationRequest): Promise<string> => {
  const modelId = "gemini-3-flash-preview";
  
  const prompt = `
    You are a Career Intelligence AI for the 'WhyNot' platform.
    Your goal is to explain a placement rejection to a student in a constructive, factual, and data-driven way.
    
    Context:
    Student: ${data.studentName}
    Major/CGPA: ${data.studentCgpa}
    Student Skills: ${data.studentSkills.join(', ')}
    
    Target Opportunity:
    Role: ${data.jobRole} at ${data.jobCompany}
    Required Skills: ${data.jobRequiredSkills.join(', ')}
    Minimum CGPA: ${data.jobMinCgpa}
    
    Task:
    Compare the Student's profile against the Target Opportunity requirements.
    Identify the specific gap (e.g., missing specific skills like SQL, or low CGPA).
    Generate a 3-4 sentence explanation.
    
    Sentiment & Tone Guidelines:
    - Maintain a Constructive and Encouraging sentiment.
    - Be factual about the gaps (honesty is key), but frame the rejection as a "path to improvement" rather than a failure.
    - Use a futuristic, professional, yet supportive tone.
    - Avoid harsh or discouraging language. Focus on growth potential.
    
    Ending: Provide one specific recommended action (e.g., "Complete the Advanced SQL certification").
    
    Format: Plain text.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 }, // Minimize latency for UI responsiveness
      }
    });

    return response.text || "Unable to generate analysis at this moment.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Our intelligence systems are currently recalibrating. Please try again later.";
  }
};