import PDFDocument from "pdfkit";
import * as XLSX from "xlsx";
import { getClientById } from "../store/clientStore.js";
import { getGeneratedRoadmap } from "./transformation.service.js";
import { getMonthlyPlanByClient } from "./monthlyPlan.service.js";
import { getWeeklyPlanByClient } from "./weeklyPlan.service.js";
import { getReviews } from "../store/reviewStore.js";

const getReportData = async ({ clientId, month, week }) => {
  const client = getClientById(clientId);

  if (!client) {
    throw new Error("Client not found.");
  }

  const roadmap = await getGeneratedRoadmap(clientId);

  let monthlyPlan = null;
  let weeklyPlan = null;

  if (month) {
    monthlyPlan = await getMonthlyPlanByClient(clientId, Number(month));
  }

  if (month && week) {
    weeklyPlan = await getWeeklyPlanByClient(
      clientId,
      Number(month),
      Number(week)
    );
  }

  const reviews = getReviews({ clientId: String(clientId) });

  return {
    clientId: String(clientId),
    roadmap,
    monthlyPlan,
    weeklyPlan,
    reviews
  };
};

const addPdfSection = (doc, heading, content) => {
  doc.moveDown();
  doc.fontSize(15).font("Helvetica-Bold").text(heading);
  doc.moveDown(0.4);
  doc.fontSize(10).font("Helvetica").text(content || "Not available.");
};

export const createPdfReport = async (filters) => {
  const data = await getReportData(filters);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 45 });
    const chunks = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fontSize(20).font("Helvetica-Bold")
      .text("Transformation Journey Report");

    doc.moveDown();
    doc.fontSize(10).font("Helvetica")
      .text(`Client ID: ${data.clientId}`)
      .text(`Generated: ${new Date().toLocaleString()}`);

    if (data.roadmap) {
      const roadmap = data.roadmap.yearlyRoadmap || {};

      addPdfSection(
        doc,
        "Yearly Theme",
        roadmap.yearTheme
      );

      for (const phase of roadmap.phases || []) {
        addPdfSection(
          doc,
          phase.phaseName,
          phase.phaseOutcome
        );

        for (const month of phase.months || []) {
          doc.fontSize(10).font("Helvetica-Bold")
            .text(`Month ${month.month}: ${month.theme}`);

          doc.fontSize(9).font("Helvetica")
            .text((month.habits || []).map((habit) => `• ${habit}`).join("\n"));

          doc.text(`Reflection: ${month.reflectionPrompt || ""}`);
          doc.moveDown(0.5);
        }
      }
    }

    if (data.monthlyPlan) {
      addPdfSection(
        doc,
        `Monthly Plan - ${data.monthlyPlan.monthName || data.monthlyPlan.month}`,
        data.monthlyPlan.monthlyOverview
      );

      doc.fontSize(10).font("Helvetica-Bold").text("Monthly Focus");
      doc.fontSize(9).font("Helvetica")
        .text((data.monthlyPlan.monthlyFocus || [])
          .map((item) => `• ${item}`).join("\n"));

      doc.text("Milestones");
      doc.text((data.monthlyPlan.monthlyMilestones || [])
        .map((item) => `• ${item}`).join("\n"));
    }

    if (data.weeklyPlan) {
      addPdfSection(
        doc,
        `Weekly Plan - Week ${data.weeklyPlan.week}`,
        data.weeklyPlan.weeklyOverview
      );

      for (const day of data.weeklyPlan.dailyPlans || []) {
        doc.fontSize(10).font("Helvetica-Bold").text(day.day);
        doc.fontSize(9).font("Helvetica").text(day.focus);

        doc.text((day.suggestedHabits || [])
          .map((habit) => `• ${habit}`).join("\n"));

        doc.moveDown(0.3);
      }
    }

    addPdfSection(
      doc,
      "Coach Review History",
      data.reviews.length
        ? data.reviews.map((review) =>
            `${review.planType} | ${review.action} | ${review.notes || "No notes"}`
          ).join("\n")
        : "No coach reviews recorded."
    );

    doc.moveDown();
    doc.fontSize(8).text(
      "This report contains general planning information. It is not medical or professional health advice."
    );

    doc.end();
  });
};

export const createExcelReport = async (filters) => {
  const data = await getReportData(filters);
  const workbook = XLSX.utils.book_new();

  const roadmapRows = [];

  for (const phase of data.roadmap?.yearlyRoadmap?.phases || []) {
    for (const month of phase.months || []) {
      roadmapRows.push({
        Phase: phase.phaseName,
        Month: month.month,
        Theme: month.theme,
        Habits: (month.habits || []).join("; "),
        Reflection: month.reflectionPrompt
      });
    }
  }

  const reviewRows = data.reviews.map((review) => ({
    PlanType: review.planType,
    Month: review.month || "",
    Week: review.week || "",
    Version: review.version || "",
    Action: review.action,
    Notes: review.notes,
    ReviewedAt: review.reviewedAt
  }));

  const monthlyRows = (data.monthlyPlan?.weeklyPlans || []).map((item) => ({
    Month: data.monthlyPlan.month,
    Week: item.week,
    Focus: item.focus,
    SuggestedHabits: (item.suggestedHabits || []).join("; "),
    Reflection: item.reflectionQuestion
  }));

  const weeklyRows = (data.weeklyPlan?.dailyPlans || []).map((item) => ({
    Day: item.day,
    Focus: item.focus,
    SuggestedHabits: (item.suggestedHabits || []).join("; "),
    Reflection: item.reflectionPrompt
  }));

  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet(roadmapRows),
    "Yearly Roadmap"
  );

  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet(monthlyRows),
    "Monthly Plan"
  );

  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet(weeklyRows),
    "Weekly Plan"
  );

  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet(reviewRows),
    "Coach Reviews"
  );

  return XLSX.write(workbook, {
    type: "buffer",
    bookType: "xlsx"
  });
};
