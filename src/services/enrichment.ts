import axios from "axios";
import * as cheerio from "cheerio";
import { EnrichedCompanyData } from "../types";

// Timeout for scraping requests in milliseconds
const SCRAPE_TIMEOUT = 8000;

export async function enrichCompanyData(
  website: string,
  companyName: string,
  providedIndustry?: string
): Promise<EnrichedCompanyData> {
  // Normalize website URL
  let targetUrl = website.trim();
  if (!/^https?:\/\//i.test(targetUrl)) {
    targetUrl = `https://${targetUrl}`;
  }

  const defaultData: EnrichedCompanyData = {
    companyName,
    website: targetUrl,
    industry: providedIndustry || "Technology & Services",
    title: `${companyName} | Premium Services`,
    description: `Professional services and business offerings from ${companyName}.`,
    h1s: [],
    services: ["Consulting", "Enterprise Solutions"],
    techStackHints: ["HTML5", "Modern CSS"],
    seoScore: 70,
    seoObservations: ["Standard metadata found.", "No major crawling issues detected."],
    uxObservations: ["Clear navigation header.", "Modern minimal layout structure."],
    aiAutomationOpportunities: [
      "Customer Support Chatbots for instant lead engagement.",
      "Automated email scheduling and CRM synchronization.",
      "Internal knowledge base generation using proprietary documents."
    ],
    growthSuggestions: [
      "Optimize landing page copy for local search engine authority.",
      "Implement lead capture magnets on high-traffic blog posts.",
      "Expand B2B outreach utilizing highly curated hyper-personalized campaigns."
    ],
    scrapingStatus: "FAILED",
  };

  try {
    console.log(`Enriching data for ${companyName} via website: ${targetUrl}`);
    const response = await axios.get(targetUrl, {
      timeout: SCRAPE_TIMEOUT,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
      validateStatus: () => true, // Allow redirect and non-200 responses to extract information if possible
    });

    if (response.status >= 400) {
      console.warn(`Scraping returned HTTP status ${response.status} for ${targetUrl}`);
      return { ...defaultData, scrapingStatus: "PARTIAL" };
    }

    const html = response.data;
    if (typeof html !== "string" || !html) {
      return { ...defaultData, scrapingStatus: "FAILED" };
    }

    const $ = cheerio.load(html);

    // Extract basic page elements
    const title = $("title").text().trim() || defaultData.title;
    const description =
      $('meta[name="description"]').attr("content")?.trim() ||
      $('meta[property="og:description"]').attr("content")?.trim() ||
      defaultData.description;

    const h1s: string[] = [];
    $("h1").each((_, el) => {
      const text = $(el).text().trim();
      if (text && h1s.length < 5) {
        h1s.push(text);
      }
    });

    // Detect Services / Keywords
    const services: string[] = [];
    $("nav a, footer a, main a").each((_, el) => {
      const text = $(el).text().trim().toLowerCase();
      const serviceKeywords = [
        "service",
        "product",
        "solution",
        "consulting",
        "pricing",
        "platform",
        "feature",
        "case study",
        "about us",
        "contact",
      ];
      if (text && serviceKeywords.some((keyword) => text.includes(keyword)) && services.length < 6) {
        const titleCase = text.replace(/\b\w/g, (c) => c.toUpperCase());
        if (!services.includes(titleCase)) {
          services.push(titleCase);
        }
      }
    });

    // Detect Industry based on tags/keywords
    let detectedIndustry = providedIndustry || "";
    if (!detectedIndustry) {
      const textContent = $("body").text().toLowerCase();
      const industryMap: Record<string, string[]> = {
        "SaaS & Software": ["saas", "software", "api", "platform", "cloud", "developer", "automation"],
        "Financial Services": ["finance", "bank", "invest", "crypto", "trading", "insurance", "wealth"],
        "Healthcare & Wellness": ["health", "medical", "clinic", "doctor", "wellness", "fitness", "patient"],
        "E-Commerce & Retail": ["shop", "store", "ecommerce", "retail", "buy", "cart", "product", "checkout"],
        "Consulting & Agency": ["consult", "agency", "marketing", "advisory", "partner", "design", "creative"],
        "Education & Learning": ["academy", "school", "course", "learn", "university", "education", "training"],
      };

      for (const [ind, keywords] of Object.entries(industryMap)) {
        if (keywords.some((kw) => textContent.includes(kw))) {
          detectedIndustry = ind;
          break;
        }
      }
    }
    if (!detectedIndustry) {
      detectedIndustry = defaultData.industry;
    }

    // Detect Tech Stack
    const techStackHints: string[] = [];
    const scriptSrcs: string[] = [];
    $("script").each((_, el) => {
      const src = $(el).attr("src") || "";
      if (src) scriptSrcs.push(src.toLowerCase());
    });

    const pageHtml = html.toLowerCase();
    
    // Tech detection rules
    if (pageHtml.includes("next/static") || pageHtml.includes("__next")) techStackHints.push("Next.js");
    if (pageHtml.includes("react") || scriptSrcs.some(s => s.includes("react"))) techStackHints.push("React");
    if (pageHtml.includes("vue") || scriptSrcs.some(s => s.includes("vue"))) techStackHints.push("Vue.js");
    if (pageHtml.includes("tailwind") || pageHtml.includes("tw-")) techStackHints.push("Tailwind CSS");
    if (pageHtml.includes("bootstrap")) techStackHints.push("Bootstrap");
    if (pageHtml.includes("google-analytics") || pageHtml.includes("googletagmanager")) techStackHints.push("Google Analytics");
    if (pageHtml.includes("hubspot")) techStackHints.push("HubSpot");
    if (pageHtml.includes("shopify")) techStackHints.push("Shopify");
    if (pageHtml.includes("wp-content") || pageHtml.includes("wordpress")) techStackHints.push("WordPress");
    if (pageHtml.includes("webflow")) techStackHints.push("Webflow");
    if (pageHtml.includes("framer") || pageHtml.includes("framer-motion")) techStackHints.push("Framer");
    if (pageHtml.includes("stripe")) techStackHints.push("Stripe");
    
    if (techStackHints.length === 0) {
      techStackHints.push("HTML5", "Modern Javascript", "Vanilla CSS");
    }

    // SEO Observations
    const seoObservations: string[] = [];
    let seoScore = 100;

    // Check title length
    if (title.length < 10) {
      seoObservations.push("Title tag is too short (less than 10 characters). Optimize for click-through rate.");
      seoScore -= 10;
    } else if (title.length > 70) {
      seoObservations.push("Title tag is too long (over 70 characters). It may be truncated in search results.");
      seoScore -= 5;
    } else {
      seoObservations.push("Good title tag length (10-70 characters) optimized for search engines.");
    }

    // Check description
    if (description === defaultData.description) {
      seoObservations.push("Missing or default Meta Description. Customize to attract high-intent organic traffic.");
      seoScore -= 15;
    } else if (description.length < 50) {
      seoObservations.push("Meta Description is very brief. Expand it to 120-160 characters for optimal results.");
      seoScore -= 10;
    } else {
      seoObservations.push("Meta description is properly configured, improving search visibility.");
    }

    // Check headings
    if (h1s.length === 0) {
      seoObservations.push("No H1 tags found. Search engines rely on H1s to understand core page topics.");
      seoScore -= 15;
    } else if (h1s.length > 1) {
      seoObservations.push(`Multiple H1 tags (${h1s.length}) detected. Keep one principal H1 tag per page.`);
      seoScore -= 5;
    } else {
      seoObservations.push("Optimal H1 heading structure: exactly one principal H1 tag detected.");
    }

    // Check images missing alt text
    let missingAlts = 0;
    $("img").each((_, el) => {
      if (!$(el).attr("alt")) missingAlts++;
    });
    if (missingAlts > 0) {
      seoObservations.push(`${missingAlts} images are missing alt attributes. Alt text is crucial for accessibility and image search.`);
      seoScore -= Math.min(15, missingAlts * 2);
    } else {
      seoObservations.push("All images have alt tags configured correctly.");
    }

    // UX Observations
    const uxObservations: string[] = [];
    
    // Simple heuristic UX analysis
    const hasNav = $("nav, header, [id*='menu'], [class*='menu']").length > 0;
    const hasFooter = $("footer, [id*='footer'], [class*='footer']").length > 0;
    const hasForms = $("form").length > 0;
    const linksCount = $("a").length;

    if (hasNav) {
      uxObservations.push("Standard website navigation structure present, allowing easy discoverability.");
    } else {
      uxObservations.push("Navigation menu not easily detectable. Ensure critical links are clearly visible.");
    }

    if (hasFooter) {
      uxObservations.push("Comprehensive footer structure present, housing contact, legal, and sitemap info.");
    } else {
      uxObservations.push("Footer section is missing or sparse. Standardize site layout with clear footer links.");
    }

    if (hasForms) {
      uxObservations.push("Interactive forms detected, enabling direct customer engagement.");
    } else {
      uxObservations.push("No interactive forms detected on landing page. Add a clear Call-To-Action (CTA) form.");
    }

    if (linksCount < 10) {
      uxObservations.push("Low relative linkage volume. Consider building internal links to guide user journey.");
    } else if (linksCount > 100) {
      uxObservations.push("High density of link tags may overwhelm mobile users. Streamline mobile interface.");
    } else {
      uxObservations.push("Balanced link density, optimizing page navigation and information flow.");
    }

    // AI Automation Opportunities based on website details
    const aiAutomationOpportunities: string[] = [];
    if (detectedIndustry.includes("SaaS") || detectedIndustry.includes("Software")) {
      aiAutomationOpportunities.push("AI-driven user onboarding flow to personalize customer setup guides.");
      aiAutomationOpportunities.push("Automated code documentation generation or AI feature walkthroughs.");
      aiAutomationOpportunities.push("Intelligent ticket triage and auto-reply systems to cut engineering support load.");
    } else if (detectedIndustry.includes("Consulting") || detectedIndustry.includes("Agency")) {
      aiAutomationOpportunities.push("Interactive AI audit generator (like this one) to automate inbound lead generation.");
      aiAutomationOpportunities.push("Automated market research synthesis and client brief creation workflows.");
      aiAutomationOpportunities.push("AI proposal generation pulling key data from standard team repositories.");
    } else if (detectedIndustry.includes("E-Commerce") || detectedIndustry.includes("Retail")) {
      aiAutomationOpportunities.push("Personalized AI product recommendation engine based on browsing patterns.");
      aiAutomationOpportunities.push("Intelligent return processing workflows and automated tracking updates.");
      aiAutomationOpportunities.push("AI generated product description optimizer to streamline listing launches.");
    } else {
      aiAutomationOpportunities.push("Intelligent Customer Support agent acting as a 24/7 front desk.");
      aiAutomationOpportunities.push("Automated lead qualifying and instant meeting schedulers.");
      aiAutomationOpportunities.push("Predictive analytics forecasting for demand spikes and marketing budgeting.");
    }

    // Growth Suggestions
    const growthSuggestions: string[] = [];
    if (seoScore < 80) {
      growthSuggestions.push("Audit meta tag structure to recapture organic keywords from high-intent local competitors.");
    }
    growthSuggestions.push(`Develop authority topics in the "${detectedIndustry}" niche to drive search impressions.`);
    growthSuggestions.push("Leverage conversational pop-ups and forms to convert passive web traffic into qualified leads.");
    growthSuggestions.push("Deploy cross-channel automated retargeting based on specific high-value product interactions.");

    return {
      companyName,
      website: targetUrl,
      industry: detectedIndustry,
      title,
      description,
      h1s,
      services: services.length > 0 ? services : defaultData.services,
      techStackHints,
      seoScore: Math.max(30, seoScore),
      seoObservations,
      uxObservations,
      aiAutomationOpportunities,
      growthSuggestions,
      scrapingStatus: "SUCCESS",
    };
  } catch (error) {
    console.error(`Scraping failed for ${targetUrl}:`, error);
    // Return mock fallback gracefully
    return {
      ...defaultData,
      scrapingStatus: "FAILED",
    };
  }
}
