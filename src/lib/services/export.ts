/**
 * Export Service
 * Handles PDF, ICS (calendar), and shareable link generation
 */

import type { TripPlan, DayPlan } from '@/types/trip';

/**
 * Generate ICS (iCalendar) file for importing into calendar apps
 */
export function generateICS(plan: TripPlan): string {
  const icsEvents = plan.days.flatMap((day) => {
    return day.activities.map((activity) => {
      const startDate = new Date(`${day.date}T${activity.time}:00`);
      const endTime = calculateEndTime(activity.time, activity.duration);
      const endDate = new Date(`${day.date}T${endTime}:00`);

      return `BEGIN:VEVENT
UID:${generateUID(day.day, activity.title)}
DTSTAMP:${formatICSDate(new Date())}
DTSTART:${formatICSDate(startDate)}
DTEND:${formatICSDate(endDate)}
SUMMARY:${escapeICS(activity.title)}
DESCRIPTION:${escapeICS(activity.description)}
LOCATION:${escapeICS(activity.location)}
END:VEVENT`;
    });
  });

  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Tripplan Tromsø//AI Trip Planner//NO
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:Tromsø Trip
X-WR-TIMEZONE:Europe/Oslo
${icsEvents.join('\n')}
END:VCALENDAR`;

  return icsContent;
}

/**
 * Generate shareable link for a trip plan
 * Returns a short URL that can be shared
 */
export async function generateShareableLink(plan: TripPlan): Promise<string> {
  // TODO: Save plan to database and generate short ID
  // For MVP, encode plan in URL (limited by URL length)

  const planId = generatePlanId();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://tripplan.tromso.ai';

  // TODO: Save to database
  // await savePlanToDatabase(planId, plan);

  return `${baseUrl}/plans/${planId}`;
}

/**
 * Generate PDF of trip plan using jsPDF
 */
export async function generatePDF(plan: TripPlan): Promise<Blob> {
  const jsPDF = (await import('jspdf')).jsPDF;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - 2 * margin;
  let yPosition = margin;

  // Color scheme
  const primaryColor: [number, number, number] = [100, 150, 255]; // Blue
  const darkColor: [number, number, number] = [40, 40, 40]; // Dark gray
  const lightColor: [number, number, number] = [200, 200, 200]; // Light gray

  // Helper function to add text with wrapping
  const addText = (text: string, size: number, isBold = false, color: [number, number, number] = darkColor): number => {
    doc.setFontSize(size);
    doc.setFont('Helvetica', isBold ? 'bold' : 'normal');
    doc.setTextColor(color[0], color[1], color[2]);

    const lines = doc.splitTextToSize(text, contentWidth);
    doc.text(lines, margin, yPosition);

    const lineHeight = size * 0.35;
    return lines.length * lineHeight;
  };

  // Helper function to check if we need a new page
  const checkNewPage = (height: number) => {
    if (yPosition + height > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
    }
  };

  // Title
  checkNewPage(20);
  yPosition += addText('TROMSØ TRIPPLAN', 24, true, primaryColor);
  yPosition += 3;

  // Destination and dates
  checkNewPage(10);
  yPosition += addText(plan.summary, 12, false, darkColor);
  yPosition += 3;

  // Generated date
  checkNewPage(5);
  doc.setFontSize(9);
  doc.setTextColor(150, 150, 150);
  doc.text(`Generert: ${new Date().toLocaleDateString('no-NO')}`, margin, yPosition);
  yPosition += 5;

  // Separator
  doc.setDrawColor(lightColor[0], lightColor[1], lightColor[2]);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 5;

  // Days
  plan.days.forEach((day) => {
    checkNewPage(15);

    // Day header
    yPosition += addText(`DAG ${day.day} - ${day.theme}`, 14, true, primaryColor);
    yPosition += 1;

    // Date
    doc.setFontSize(10);
    doc.setFont('Helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(`${new Date(day.date).toLocaleDateString('no-NO')}`, margin, yPosition);
    yPosition += 5;

    // Activities
    day.activities.forEach((activity) => {
      checkNewPage(8);

      // Activity time and title
      doc.setFontSize(10);
      doc.setFont('Helvetica', 'bold');
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
      doc.text(`${activity.time} - ${activity.title}`, margin, yPosition);
      yPosition += 4;

      // Activity details
      doc.setFontSize(9);
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(80, 80, 80);

      const details = [
        `Sted: ${activity.location}`,
        `Varighet: ${activity.duration}`,
        `Kostnad: ${activity.cost} NOK`,
      ];

      details.forEach((detail) => {
        doc.text(detail, margin + 5, yPosition);
        yPosition += 3;
      });

      // Description
      const descLines = doc.splitTextToSize(activity.description, contentWidth - 5);
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(descLines, margin + 5, yPosition);
      yPosition += descLines.length * 2.5 + 2;
    });

    // Dining
    if (day.dining.lunch || day.dining.dinner) {
      checkNewPage(8);
      yPosition += addText('Målord', 11, true, darkColor);
      yPosition += 1;

      doc.setFontSize(9);
      if (day.dining.lunch) {
        doc.text(`Lunsj: ${day.dining.lunch}`, margin + 5, yPosition);
        yPosition += 4;
      }
      if (day.dining.dinner) {
        doc.text(`Middag: ${day.dining.dinner}`, margin + 5, yPosition);
        yPosition += 4;
      }
      yPosition += 2;
    }

    // Aurora info
    if (day.aurora) {
      checkNewPage(10);
      yPosition += addText('🌌 Nordlys Informasjon', 11, true, primaryColor);
      yPosition += 1;

      doc.setFontSize(9);
      const auroraDetails = [
        `Sannsynlighet: ${day.aurora.probability}%`,
        `Beste tid: ${day.aurora.bestTime}`,
        `Sted: ${day.aurora.location}`,
      ];

      auroraDetails.forEach((detail) => {
        doc.text(detail, margin + 5, yPosition);
        yPosition += 3;
      });
      yPosition += 3;
    }

    // Day separator
    doc.setDrawColor(lightColor[0], lightColor[1], lightColor[2]);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 5;
  });

  // Packing List
  checkNewPage(15);
  yPosition += addText('Pakkelist', 14, true, primaryColor);
  yPosition += 2;

  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);

  plan.packingList.forEach((item) => {
    if (yPosition + 3 > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
    }
    doc.text(`• ${item}`, margin + 5, yPosition);
    yPosition += 3;
  });

  yPosition += 3;

  // Safety Notes
  checkNewPage(15);
  yPosition += addText('Sikkerhetstips', 14, true, primaryColor);
  yPosition += 2;

  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);

  plan.safetyNotes.forEach((note) => {
    const noteLines = doc.splitTextToSize(`• ${note}`, contentWidth - 5);
    if (yPosition + noteLines.length * 3 > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
    }
    doc.text(noteLines, margin + 5, yPosition);
    yPosition += noteLines.length * 3 + 2;
  });

  // Footer
  yPosition += 5;
  checkNewPage(8);

  // Total cost
  doc.setFontSize(12);
  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(`Totalkostnad: ${plan.totalCost} NOK`, margin, yPosition);
  yPosition += 6;

  // Footer note
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.setFont('Helvetica', 'normal');
  doc.text('Tripplan generert av Tripplan Tromsø', margin, pageHeight - 10);

  // Get PDF as Blob
  const pdfBlob = doc.output('blob');
  return pdfBlob;
}

// Helper functions

function formatICSDate(date: Date): string {
  return date
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '');
}

function escapeICS(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

function generateUID(dayNumber: number, title: string): string {
  const hash = btoa(`${dayNumber}-${title}`).replace(/[^a-zA-Z0-9]/g, '');
  return `${hash}@tripplan.tromso.ai`;
}

function generatePlanId(): string {
  // Generate a short ID (e.g., "abc123")
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 8; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

function calculateEndTime(startTime: string, duration: string): string {
  // Parse duration (e.g., "2 timer", "1.5 timer")
  const hours = parseFloat(duration.match(/[\d.]+/)?.[0] || '1');

  // Parse start time (HH:MM)
  const [startHour, startMinute] = startTime.split(':').map(Number);

  // Calculate end time
  const totalMinutes = startHour * 60 + startMinute + hours * 60;
  const endHour = Math.floor(totalMinutes / 60) % 24;
  const endMinute = Math.floor(totalMinutes % 60);

  return `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
}

/**
 * Download helper for client-side file downloads
 */
export function downloadFile(content: string | Blob, filename: string, mimeType: string): void {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}
