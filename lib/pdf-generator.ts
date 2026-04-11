/**
 * PDF Certificate generator
 * Used for: generating certificates on 100% course completion
 * Using PDFKit (100% free)
 */

import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export async function generateCertificate(
  studentName: string,
  courseTitle: string,
  certificateId: string
) {
  try {
    // Ensure public/certificates directory exists
    const certificateDir = path.join(process.cwd(), "public", "certificates");
    if (!fs.existsSync(certificateDir)) {
      fs.mkdirSync(certificateDir, { recursive: true });
    }

    const fileName = `${certificateId}.pdf`;
    const filePath = path.join(certificateDir, fileName);

    // Create PDF document
    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
    });

    // Pipe to file
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Add content
    doc.fontSize(25).text("Certificate of Completion", { align: "center" });
    doc.moveDown(2);

    doc.fontSize(16).text("This is to certify that", { align: "center" });
    doc.moveDown(1);

    doc.fontSize(20).font("Helvetica-Bold").text(studentName, { align: "center" });
    doc.moveDown(1);

    doc.fontSize(16).font("Helvetica").text("has successfully completed the course", {
      align: "center",
    });
    doc.moveDown(1);

    doc.fontSize(18).font("Helvetica-Bold").text(courseTitle, { align: "center" });
    doc.moveDown(3);

    doc
      .fontSize(12)
      .text(`Date: ${new Date().toLocaleDateString()}`, { align: "center" });

    // Finalize PDF
    doc.end();

    // Return file path when complete
    return new Promise<string>((resolve, reject) => {
      stream.on("finish", () => {
        resolve(`/certificates/${fileName}`);
      });
      stream.on("error", reject);
    });
  } catch (error) {
    console.error("Failed to generate certificate:", error);
    throw error;
  }
}
