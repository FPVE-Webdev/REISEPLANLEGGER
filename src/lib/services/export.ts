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
 * Generate PDF of trip plan
 * This will be implemented using jsPDF or similar library
 */
export function generatePDF(plan: TripPlan): Blob {
  // TODO: Implement PDF generation with jsPDF
  // For now, return a placeholder

  const pdfContent = generatePDFContent(plan);

  // Create a simple text file as placeholder
  const blob = new Blob([pdfContent], { type: 'text/plain' });

  return blob;
}

/**
 * Generate PDF content as formatted text
 * TODO: Replace with actual PDF library (jsPDF)
 */
function generatePDFContent(plan: TripPlan): string {
  let content = `TROMSØ TRIP PLAN\n`;
  content += `Generated: ${new Date().toLocaleDateString('no-NO')}\n\n`;
  content += `${plan.summary}\n\n`;
  content += `Total Cost: ${plan.totalCost} NOK\n\n`;
  content += `---\n\n`;

  plan.days.forEach((day) => {
    content += `DAY ${day.day} - ${day.theme}\n`;
    content += `Date: ${new Date(day.date).toLocaleDateString('no-NO')}\n\n`;

    day.activities.forEach((activity) => {
      content += `${activity.time} - ${activity.title}\n`;
      content += `  Location: ${activity.location}\n`;
      content += `  Duration: ${activity.duration}\n`;
      content += `  Cost: ${activity.cost} NOK\n`;
      content += `  ${activity.description}\n\n`;
    });

    if (day.dining.lunch || day.dining.dinner) {
      content += `DINING:\n`;
      if (day.dining.lunch) content += `  Lunch: ${day.dining.lunch}\n`;
      if (day.dining.dinner) content += `  Dinner: ${day.dining.dinner}\n`;
      content += `\n`;
    }

    if (day.aurora) {
      content += `NORTHERN LIGHTS:\n`;
      content += `  Probability: ${day.aurora.probability}%\n`;
      content += `  Best time: ${day.aurora.bestTime}\n`;
      content += `  Location: ${day.aurora.location}\n\n`;
    }

    content += `---\n\n`;
  });

  content += `PACKING LIST:\n`;
  plan.packingList.forEach((item) => {
    content += `  - ${item}\n`;
  });

  content += `\nSAFETY NOTES:\n`;
  plan.safetyNotes.forEach((note) => {
    content += `  - ${note}\n`;
  });

  return content;
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
