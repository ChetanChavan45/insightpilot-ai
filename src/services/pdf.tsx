import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
} from "@react-pdf/renderer";
import { AuditReportData, EnrichedCompanyData } from "../types";
import path from "path";
import fs from "fs";

// Create PDF Styles
const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 9.5,
    lineHeight: 1.5,
    color: "#1E293B", // Deep Slate Blue
    backgroundColor: "#F8FAFC", // Premium off-white
    paddingBottom: 55,
    paddingTop: 40,
  },
  // Cover Page
  coverContainer: {
    flex: 1,
    justifyContent: "space-between",
    backgroundColor: "#0B132B", // Deep Navy
    padding: 60,
    color: "#FFFFFF",
  },
  coverHeader: {
    borderBottomWidth: 3,
    borderBottomColor: "#3B82F6", // Vivid blue
    paddingBottom: 25,
    marginTop: 50,
  },
  coverSubtitle: {
    fontSize: 12,
    color: "#10B981", // Emerald accent
    letterSpacing: 3,
    textTransform: "uppercase",
    fontFamily: "Helvetica-Bold",
    marginBottom: 12,
  },
  coverTitle: {
    fontSize: 32,
    fontFamily: "Helvetica-Bold",
    color: "#FFFFFF",
    lineHeight: 1.2,
  },
  coverMiddle: {
    marginTop: 80,
    maxWidth: 420,
  },
  coverTarget: {
    fontSize: 24,
    fontFamily: "Helvetica-Bold",
    color: "#3B82F6",
    marginBottom: 8,
  },
  coverURL: {
    fontSize: 11,
    color: "#94A3B8",
    fontFamily: "Helvetica-Oblique",
  },
  coverFooter: {
    borderTopWidth: 1,
    borderTopColor: "#1E293B",
    paddingTop: 25,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  coverMetaLabel: {
    fontSize: 8,
    color: "#64748B",
    textTransform: "uppercase",
    marginBottom: 6,
    letterSpacing: 1,
  },
  coverMetaValue: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#E2E8F0",
  },
  // Standard Header/Footer
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    paddingHorizontal: 45,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
  headerLeft: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#0F172A",
    textTransform: "uppercase",
  },
  headerRight: {
    fontSize: 7.5,
    color: "#64748B",
    fontFamily: "Helvetica-Oblique",
  },
  content: {
    paddingHorizontal: 45,
    marginTop: 20,
  },
  // Section layout
  sectionTitleContainer: {
    borderLeftWidth: 3,
    borderLeftColor: "#3B82F6",
    paddingLeft: 10,
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: "#0F172A",
  },
  paragraph: {
    fontSize: 9.5,
    marginBottom: 12,
    textAlign: "justify",
    color: "#334155",
    lineHeight: 1.5,
  },
  // Executive Summary callout box (McKinsey style)
  calloutBox: {
    backgroundColor: "#F1F5F9",
    borderLeftWidth: 3,
    borderLeftColor: "#0F172A",
    padding: 14,
    borderRadius: 4,
    marginBottom: 18,
  },
  calloutText: {
    fontSize: 9.5,
    fontFamily: "Helvetica-Oblique",
    color: "#1E293B",
    lineHeight: 1.5,
  },
  // Two column grid for highlights
  gridRow: {
    flexDirection: "row",
    gap: 15,
    marginBottom: 15,
  },
  gridCol: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 6,
    padding: 12,
  },
  gridColTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#0F172A",
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    paddingBottom: 4,
  },
  // Score Box
  scoreContainer: {
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: 6,
    padding: 14,
    marginVertical: 15,
    flexDirection: "row",
    alignItems: "center",
  },
  scoreCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#3B82F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  scoreNumber: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: "#FFFFFF",
  },
  scoreTextContainer: {
    flex: 1,
  },
  scoreTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#1E3A8A",
    marginBottom: 3,
  },
  scoreDesc: {
    fontSize: 8.5,
    color: "#1E40AF",
    lineHeight: 1.4,
  },
  // Roadmap horizontal nodes
  roadmapContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 12,
    gap: 10,
  },
  roadmapNode: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 6,
    padding: 10,
  },
  roadmapPhase: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#3B82F6",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  roadmapTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#0F172A",
    marginBottom: 4,
  },
  roadmapDesc: {
    fontSize: 8,
    color: "#64748B",
    lineHeight: 1.3,
  },
  // Footer
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 45,
    backgroundColor: "#FFFFFF",
  },
  footerText: {
    fontSize: 7.5,
    color: "#94A3B8",
  },
  footerPageNum: {
    fontSize: 8,
    color: "#64748B",
    fontFamily: "Helvetica-Bold",
  },
});

interface PDFReportProps {
  reportData: AuditReportData;
  enrichedData: EnrichedCompanyData;
  leadName: string;
  dateString: string;
}

// React PDF Document Component
const AuditPDFDocument: React.FC<PDFReportProps> = ({
  reportData,
  enrichedData,
  leadName,
  dateString,
}) => (
  <Document title={`${enrichedData.companyName} Business Audit Report`}>
    {/* COVER PAGE */}
    <Page size="A4" style={{ paddingBottom: 0 }}>
      <View style={styles.coverContainer}>
        <View style={styles.coverHeader}>
          <Text style={styles.coverSubtitle}>Digital Intelligence Audit</Text>
          <Text style={styles.coverTitle}>Automated Growth & AI Opportunity Report</Text>
        </View>

        <View style={styles.coverMiddle}>
          <Text style={styles.coverMetaLabel}>Prepared Exclusively For</Text>
          <Text style={styles.coverTarget}>{enrichedData.companyName}</Text>
          <Text style={styles.coverURL}>{enrichedData.website}</Text>
        </View>

        <View style={styles.coverFooter}>
          <View>
            <Text style={styles.coverMetaLabel}>Consulting Firm</Text>
            <Text style={styles.coverMetaValue}>InsightPilot AI Solutions</Text>
          </View>
          <View>
            <Text style={styles.coverMetaLabel}>Prepared For</Text>
            <Text style={styles.coverMetaValue}>{leadName}</Text>
          </View>
          <View>
            <Text style={styles.coverMetaLabel}>Date</Text>
            <Text style={styles.coverMetaValue}>{dateString}</Text>
          </View>
        </View>
      </View>
    </Page>

    {/* PAGE 2: EXECUTIVE SUMMARY & OVERVIEW */}
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.headerLeft}>INSIGHTPILOT BUSINESS AUDIT: {enrichedData.companyName}</Text>
        <Text style={styles.headerRight}>SECTION 1: STRATEGIC SYNOPSIS</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.sectionTitleContainer}>
          <Text style={styles.sectionTitle}>1. Executive Summary</Text>
        </View>
        <View style={styles.calloutBox}>
          <Text style={styles.calloutText}>{reportData.executiveSummary}</Text>
        </View>

        <View style={styles.gridRow}>
          <View style={styles.gridCol}>
            <Text style={styles.gridColTitle}>Company Overview</Text>
            <Text style={styles.paragraph}>{reportData.companyOverview}</Text>
          </View>
          <View style={styles.gridCol}>
            <Text style={styles.gridColTitle}>Core Niche Analysis</Text>
            <Text style={styles.paragraph}>{reportData.businessAnalysis}</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Confidential - InsightPilot AI Consulting Group</Text>
        <Text style={styles.footerPageNum}>Page 2</Text>
      </View>
    </Page>

    {/* PAGE 3: WEBSITE, UX & TECHNICAL SEO */}
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.headerLeft}>INSIGHTPILOT BUSINESS AUDIT: {enrichedData.companyName}</Text>
        <Text style={styles.headerRight}>SECTION 2: FRONTEND PERFORMANCE</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.sectionTitleContainer}>
          <Text style={styles.sectionTitle}>2. Website & Performance Analysis</Text>
        </View>
        <Text style={styles.paragraph}>{reportData.websiteAnalysis}</Text>

        <View style={styles.scoreContainer}>
          <View style={styles.scoreCircle}>
            <Text style={styles.scoreNumber}>{enrichedData.seoScore}</Text>
          </View>
          <View style={styles.scoreTextContainer}>
            <Text style={styles.scoreTitle}>SEO & UX Technical Health Rating</Text>
            <Text style={styles.scoreDesc}>
              Calculated on technical heading standards, mobile load responsiveness, alt-text parameters, and structural meta tags.
            </Text>
          </View>
        </View>

        <View style={styles.gridRow}>
          <View style={styles.gridCol}>
            <Text style={styles.gridColTitle}>UX Observations</Text>
            <Text style={styles.paragraph}>{reportData.uxObservations}</Text>
          </View>
          <View style={styles.gridCol}>
            <Text style={styles.gridColTitle}>Technical SEO Opportunities</Text>
            <Text style={styles.paragraph}>{reportData.seoObservations}</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Confidential - InsightPilot AI Consulting Group</Text>
        <Text style={styles.footerPageNum}>Page 3</Text>
      </View>
    </Page>

    {/* PAGE 4: AI OPPORTUNITIES, GROWTH & ROADMAP */}
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.headerLeft}>INSIGHTPILOT BUSINESS AUDIT: {enrichedData.companyName}</Text>
        <Text style={styles.headerRight}>SECTION 3: STRATEGIC ROADMAP</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.sectionTitleContainer}>
          <Text style={styles.sectionTitle}>3. AI Automation & Growth Strategy</Text>
        </View>
        <Text style={styles.paragraph}>{reportData.aiOpportunities}</Text>

        <View style={styles.gridRow}>
          <View style={styles.gridCol}>
            <Text style={styles.gridColTitle}>Acquisition & Growth Levers</Text>
            <Text style={styles.paragraph}>{reportData.growthSuggestions}</Text>
          </View>
        </View>

        <View style={styles.sectionTitleContainer}>
          <Text style={styles.sectionTitle}>4. 90-Day Implementation Strategic Timeline</Text>
        </View>
        
        <View style={styles.roadmapContainer}>
          <View style={styles.roadmapNode}>
            <Text style={styles.roadmapPhase}>Phase 1 (1-30 Days)</Text>
            <Text style={styles.roadmapTitle}>Foundation & SEO</Text>
            <Text style={styles.roadmapDesc}>Remediate alt-tags, meta tag issues, and heading hierarchy.</Text>
          </View>
          <View style={styles.roadmapNode}>
            <Text style={styles.roadmapPhase}>Phase 2 (31-60 Days)</Text>
            <Text style={styles.roadmapTitle}>UX & CTA Setup</Text>
            <Text style={styles.roadmapDesc}>Simplify user intake flows and add micro-interactions.</Text>
          </View>
          <View style={styles.roadmapNode}>
            <Text style={styles.roadmapPhase}>Phase 3 (61-90 Days)</Text>
            <Text style={styles.roadmapTitle}>AI Integration</Text>
            <Text style={styles.roadmapDesc}>Deploy inbound conversational bots and CRM enrichment.</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Confidential - InsightPilot AI Consulting Group</Text>
        <Text style={styles.footerPageNum}>Page 4</Text>
      </View>
    </Page>
  </Document>
);

// Function to compile React PDF component to Buffer and save to reports/ folder
export async function generatePdfReport(
  reportData: AuditReportData,
  enrichedData: EnrichedCompanyData,
  leadName: string
): Promise<{ pdfBuffer: Buffer; relativePath: string; absolutePath: string }> {
  const dateString = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  console.log(`Rendering PDF using @react-pdf/renderer for ${enrichedData.companyName}...`);
  
  // Render document to stream
  const docElement = React.createElement(AuditPDFDocument, {
    reportData,
    enrichedData,
    leadName,
    dateString,
  });

  const pdfStream = (await pdf(docElement as any).toBuffer()) as any;
  
  // Define storage path
  // Since we are running in workspace root, let's create a directory called 'public/reports'
  const reportsDir = path.join(process.cwd(), "public", "reports");
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  // Safe filename
  const cleanName = enrichedData.companyName.toLowerCase().replace(/[^a-z0-9]/g, "_");
  const fileName = `audit_${cleanName}_${Date.now()}.pdf`;
  const absolutePath = path.join(reportsDir, fileName);
  const relativePath = `/reports/${fileName}`;

  // Write file
  fs.writeFileSync(absolutePath, pdfStream);
  console.log(`PDF saved successfully to ${absolutePath}`);

  return {
    pdfBuffer: pdfStream,
    relativePath,
    absolutePath,
  };
}
