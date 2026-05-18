import OpenAI from "openai";
import { EnrichedCompanyData, AuditReportData } from "../types";

export async function generateAiAuditReport(
  enrichedData: EnrichedCompanyData,
  leadName: string
): Promise<AuditReportData> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (apiKey && apiKey.trim() !== "" && apiKey !== "your-openai-api-key") {
    try {
      console.log(`Generating AI Audit Report via OpenAI for ${enrichedData.companyName}...`);
      const openai = new OpenAI({ apiKey });

      const prompt = `
You are an elite, premium digital transformation and automation consulting director at a top-tier global agency.
You have been hired to perform a comprehensive, professional, and hyper-personalized digital, UX, SEO, and AI automation audit for "${enrichedData.companyName}" (Website: ${enrichedData.website}).
The lead was submitted by ${leadName}.

Below is the highly detailed research data gathered from their digital presence:
- Company Name: ${enrichedData.companyName}
- Website: ${enrichedData.website}
- Detected/Selected Industry: ${enrichedData.industry}
- Homepage Title: ${enrichedData.title}
- Homepage Meta Description: ${enrichedData.description}
- Principal Heading Tags (H1): ${enrichedData.h1s.join(", ") || "None detected"}
- Services/Offerings Identified: ${enrichedData.services.join(", ")}
- Detected Tech Stack: ${enrichedData.techStackHints.join(", ")}
- SEO Health Score: ${enrichedData.seoScore}/100
- Initial SEO Observations:
${enrichedData.seoObservations.map((obs) => `  * ${obs}`).join("\n")}
- Initial UX Observations:
${enrichedData.uxObservations.map((obs) => `  * ${obs}`).join("\n")}
- AI Automation Opportunities Detected:
${enrichedData.aiAutomationOpportunities.map((op) => `  * ${op}`).join("\n")}
- Growth Suggestions:
${enrichedData.growthSuggestions.map((sug) => `  * ${sug}`).join("\n")}

YOUR MISSION:
Generate a premium, comprehensive, professional audit report tailored explicitly for them.
Write in a sophisticated, authoritative, yet highly encouraging tone (consulting style).
You must return the audit structured into exactly the following 9 sections in a JSON format.
Make sure the content in each section is deep, highly personalized, actionable, and comprehensive (approx. 100-200 words per section). Do not use generic advice. Address the company specifically by name.

Format the response strictly as a JSON object with these keys (keep JSON keys exactly as named):
{
  "executiveSummary": "Deep, high-level business vision and value proposition summary.",
  "companyOverview": "Detailed understanding of the company's place in the market and current value proposition.",
  "businessAnalysis": "Strategic review of their products, services, and how they differentiate in their niche.",
  "websiteAnalysis": "A professional analysis of their online storefront, technical frontend design, and responsive behaviors.",
  "uxObservations": "Deep behavioral observations regarding navigation, user experience bottlenecks, and conversion optimization opportunities.",
  "seoObservations": "Technical SEO breakdown, structural metadata notes, heading hierarchy, and ranking opportunities.",
  "aiOpportunities": "Detailed concrete blueprint of AI automation solutions that can optimize their operations or sales by 30% or more.",
  "growthSuggestions": "Actionable customer acquisition and business development growth levers specific to their industry.",
  "strategicSuggestions": "A clear, actionable step-by-step roadmap for implementation over the next 90 days."
}

Do not include any markdown formatting wrappers (like \`\`\`json) in your raw response. Just return the valid JSON string.
`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a senior digital growth and AI integration consultant. You generate comprehensive, ultra-professional, and highly tailored audit reports in structured JSON.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
      });

      const rawContent = response.choices[0]?.message?.content || "";
      // Clean JSON in case markdown block wraps it
      const cleanJson = rawContent
        .replace(/^```json/i, "")
        .replace(/```$/, "")
        .trim();

      const parsedReport: AuditReportData = JSON.parse(cleanJson);
      return parsedReport;
    } catch (error) {
      console.error("OpenAI Audit Generation failed. Falling back to elite template generator...", error);
    }
  }

  // Fallback / Mock Audit Report Generator
  console.log(`Generating personalized mock audit report for ${enrichedData.companyName}...`);
  return generateMockAuditReport(enrichedData, leadName);
}

function generateMockAuditReport(
  data: EnrichedCompanyData,
  leadName: string
): AuditReportData {
  return {
    executiveSummary: `For ${data.companyName}, the digital frontier represents an extraordinary opportunity to capture premium market share. By aligning modern user experiences, high-performance SEO architectures, and automated customer success funnels, the brand can establish unquestioned authority in the ${data.industry} space. This audit highlights a clear pathway to unlocking $150k+ in optimized efficiencies and increased customer lifetime value over the next 12 months.`,
    
    companyOverview: `Based on our comprehensive audit of ${data.companyName}'s digital footprint, the brand positions itself as a specialized partner in the ${data.industry} sector. With a core focus on service areas including ${data.services.slice(0, 3).join(", ")}, the company has built a recognizable foundation. Moving forward, the strategic focus must transition from a static digital billboard to an interactive, high-converting growth ecosystem.`,
    
    businessAnalysis: `Operating in the highly competitive ${data.industry} landscape requires unmatched clarity in value delivery. ${data.companyName} possesses strong industry indicators with modern technological hints like ${data.techStackHints.slice(0, 3).join(", ")}. To outperform competitors, ${data.companyName} must aggressively differentiate its offerings, shifting towards clear outcome-based messaging and high-margin productized packages.`,
    
    websiteAnalysis: `The digital storefront of ${data.companyName} leverages ${data.techStackHints.join(", ")} to deliver a functional user interface. However, technical analysis indicates performance overhead and asset delivery bottlenecks. Optimizing images, leveraging modern edge caching, and reducing JavaScript bloat will lower bounce rates and elevate standard visitor session durations by up to 25%.`,
    
    uxObservations: `Our analysis of ${data.companyName}'s customer-facing experience shows standard visual layouts. Key conversion bottlenecks include: 1) A lack of interactive validation prompts which leaves users uncertain of next steps, and 2) High cognitive load in standard page structures. Introducing micro-animations, clear typography contrast, and simplified multi-step intake flows will dramatically lift lead conversion ratios.`,
    
    seoObservations: `With a detected SEO health score of ${data.seoScore}/100, the technical foundation of ${data.website} has notable strengths but major room for optimization. Our observations indicate: ${data.seoObservations.slice(0, 2).join(" Also, ")} Resolving these structural deficits while targeting high-intent long-tail keywords will drive a dramatic surge in organic search impressions.`,
    
    aiOpportunities: `We have identified three immediate AI automation vectors for ${data.companyName}:
1. **Intelligent Inbound Nurturing**: Deploying a domain-trained AI concierge capable of answering complex inquiries, scheduling demos, and routing leads immediately.
2. **AI-Driven Customer Success**: Automating onboarding and technical documentation walkthroughs using generative AI search indices.
3. **Operations Automation**: ${data.aiAutomationOpportunities[1] || "AI-powered CRM workflows and sales intelligence summarizers."}`,
    
    growthSuggestions: `To accelerate acquisition, ${data.companyName} should:
1. Establish a high-frequency, authority-focused content hub centered around ${data.industry} pain points.
2. Deploy the custom recommendations and suggestions found in this audit as interactive landing pages to captivate cold B2B traffic.
3. Integrate automated, multi-channel retargeting pixels to recapture interested website visitors who exit without submitting.`,
    
    strategicSuggestions: `Our recommended 90-Day strategic roadmap for ${data.companyName} is structured as follows:
- **Days 1-30 (Technical Optimization)**: Fix core SEO heading structures, alt tags, and accelerate mobile loading speeds.
- **Days 31-60 (Conversion Framework)**: Deploy high-converting, single-purpose CTA capture tools and simplify visitor navigation paths.
- **Days 61-90 (AI & Scale)**: Launch automated lead qualifying systems and activate targeted outreach sequences to scale inbound pipelines by 40%.`,
  };
}
