import { prisma } from "@/lib/prisma";
import { LEAVE_TYPE_LABELS } from "@/lib/constants";
import { extractTime, extractDayOfWeek } from "@/lib/timezone";

export async function checkProfessionalAvailability(
  professionalId: string,
  startDateTime: Date,
  endDateTime: Date
): Promise<{ available: boolean; reason?: string }> {
  // 1. Check for leaves overlapping with the requested range
  const leave = await prisma.leave.findFirst({
    where: {
      professionalId,
      startDate: { lte: endDateTime },
      endDate: { gte: startDateTime },
    },
  });

  if (leave) {
    const label = LEAVE_TYPE_LABELS[leave.type];
    return {
      available: false,
      reason: `El profesional tiene ausencia registrada: ${label}${leave.description ? ` - ${leave.description}` : ""}`,
    };
  }

  // 2. Check if the time falls within an availability block for that day
  const dayOfWeek = extractDayOfWeek(startDateTime);
  const startTime = extractTime(startDateTime);
  const endTime = extractTime(endDateTime);

  const availabilities = await prisma.availability.findMany({
    where: { professionalId, dayOfWeek },
  });

  if (availabilities.length === 0) {
    return {
      available: false,
      reason: "El profesional no tiene horario configurado para este día",
    };
  }

  // Check if the requested range falls within any availability block
  const withinBlock = availabilities.some(
    (block) => startTime >= block.startTime && endTime <= block.endTime
  );

  if (!withinBlock) {
    return {
      available: false,
      reason: "Fuera del horario de atención del profesional",
    };
  }

  return { available: true };
}
