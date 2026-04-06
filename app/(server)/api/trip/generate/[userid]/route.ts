import { response } from "@/lib/helperFunctions";
import { apiError } from \"@/lib/apiResponse\";
import { NextRequest, NextResponse } from \"next/server\";
import { GoogleGenerativeAI } from \"@google/generative-ai\";
import { Trip } from \"@/models/Trip\";
import { dbConnect } from \"@/lib/db\";
import { sanitizeAiPrompt } from \"@/lib/sanitization\";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVEAI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export async function POST(
  req: NextRequest,
  params: { params: { userid: string } }
) {
  try {
    const { userid } = await params.params;
    const tripDetails = await req.json();

    // Validate and sanitize input to prevent injection attacks
    if (!userid) {
      return apiError(\"User id not found\", 400);
    }
    
    const sanitized = sanitizeAiPrompt(tripDetails);
    
    if (!sanitized.destinations || sanitized.destinations.length === 0) {
      return apiError(\"Please enter at least one destination\", 400);
    }
    if (!sanitized.duration || sanitized.duration < 1 || sanitized.duration > 30) {
      return apiError(\"Duration must be between 1 and 30 days\", 400);
    }
    if (!sanitized.budget || sanitized.budget <= 0) {
      return apiError(\"Budget must be a positive number\", 400);
    }

    const prompt = `
    Following are Trip Details: 
    Destinations: ${JSON.stringify(sanitized.destinations)}
    Duration: ${sanitized.duration} days
    Budget: PKR ${sanitized.budget}
    Trip Type: ${sanitized.tripType}
    Interests: ${JSON.stringify(sanitized.interests)}

    For Every day suggest 3 activities:
    - Morning Activity
    - Afternoon Activity
    - Evening Activity

    For each activity of a day, provide:
      - Title
      - Budget (e.g., "$50-100")
      - Description

    Output should be in this format:
    Morning Activity:
      Title: [Title]
      Budget: [Budget]
      Description: [Description]
    Afternoon Activity:
      Title: [Title]
      Budget: [Budget]
      Description: [Description]
    Evening Activity:
      Title: [Title]
      Budget: [Budget]
      Description: [Description]

    🚨 IMPORTANT RULES 🚨
    - DO NOT add empty lines between activities.
    - DO NOT skip or group days.
    - Provide long, detailed descriptions and include transportation.
    - Suggest specific hotels, restaurants, or attractions (with names/addresses).
    - If concerts/events unavailable, suggest alternate entertainment options.
    - Ensure activities fit within budget & preferences.
    - The Budget provided is in PKR not dollars
    - Stick to The Exact destinations provided do not suggest any other destinations to visit.
    `;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    if (!result.response)
      return response(
        false,
        400,
        "Failed to generate itinerary. Something went wrong"
      );

    // Log removed for production safety

    // storing whole raw response in variable
    const rawText = result.response.text();
    if (!rawText || rawText.trim().length === 0) {
      return response(
        false,
        500,
        "Failed to generate itinerary. Something went wrong"
      );
    }
    // remove markdown from text (*)  and trim
    const cleanText = rawText.replace(/\*/g, "").trim();

    // Extract Notes if they exist
    let notes = "";
    let mainText = cleanText;

    const notesMatch = cleanText.match(
      /(?:Notes:|Important Considerations:)([\s\S]*)/i
    );
    if (notesMatch) {
      notes = notesMatch[1].trim();
      mainText = cleanText
        .replace(/(?:Notes:|Important Considerations:)([\s\S]*)/i, "")
        .trim();
    }

    // capturing all Day blocks (including title) from main text which is cleaned trimmed and notes/important consideration are removed like day1 and its activities
    const dayRegex = /Day\s+\d+:[\s\S]*?(?=Day\s+\d+:|$)/gi;
    const dayMatches = mainText.match(dayRegex) || [];
    if (dayMatches.length === 0) {
      return response(
        false,
        400,
        "Failed to generate itinerary. Something went wrong"
      );
    }
    let aiSuggestions: any[] = [];

    dayMatches.forEach((dayText) => {
      // Extract full day title (keep everything before the first newline)
      const titleMatch = dayText.match(/^(Day\s+\d+:\s*[^\n]*)/i);
      const dayTitle = titleMatch ? titleMatch[1].trim() : "Unknown Day";

      const activities: any[] = [];

      // Extract Morning, Afternoon, and Evening blocks
      ["Morning Activity", "Afternoon Activity", "Evening Activity"].forEach(
        (timeOfDay) => {
          const regex = new RegExp(
            `${timeOfDay}:([\\s\\S]*?)(?=Morning Activity:|Afternoon Activity:|Evening Activity:|$)`,
            "i"
          );
          const match = dayText.match(regex);

          if (match) {
            const textBlock = match[1].trim();
            const titleMatch = textBlock.match(/Title:\s*(.*)/i);
            const budgetMatch = textBlock.match(/Budget:\s*(.*)/i);
            const descriptionMatch = textBlock.match(
              /Description:\s*([\s\S]*)/i
            );

            activities.push({
              timeOfDay,
              title: titleMatch?.[1]?.trim() || "",
              budget: budgetMatch?.[1]?.trim() || "",
              description: descriptionMatch?.[1]?.trim() || "",
            });
          }
        }
      );

      if (activities.length > 0) {
        aiSuggestions.push({
          day: dayTitle, // full title like "Day 1: 2025-11-05 (Arrival in Swat)"
          activities,
        });
      }
    });

    const trip = new Trip({
      userId: userid,
      name: sanitized.name,
      destinations: sanitized.destinations,
      startDate: sanitized.startDate,
      endDate: sanitized.endDate,
      duration: sanitized.duration,
      budget: sanitized.budget,
      tripType: sanitized.tripType,
      transportation: sanitized.transportation,
      accommodation: sanitized.accommodation,
      tripPace: sanitized.tripPace,
      specialOccasion: sanitized.specialOccasion,
      interests: sanitized.interests,
      diningPreferences: sanitized.diningPreferences,
      aiSuggestions,
      aiSuggestedNotes: notes,
    });

    await dbConnect();

    await trip.save();

    return response(true, 201, "Itinerary generated successfully", trip);
  } catch (error) {
    return apiError(\"Failed to generate itinerary\", 500);
  }
}
