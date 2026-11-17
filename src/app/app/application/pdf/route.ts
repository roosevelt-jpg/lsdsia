import { NextResponse } from "next/server";
import { getAuthorizedUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getAuthorizedUser();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const packet = await prisma.applicationPacket.findUnique({ where: { userId: session.id } });
  if (!packet) {
    return NextResponse.json({ error: "No packet" }, { status: 404 });
  }

  const lines = [
    "Life Star Driving School — Instructor Application Preparation Packet",
    "NOT the official MN DPS PS36008-10 form. File the official form with DPS.",
    "References: Minnesota Statutes 171.33–171.41; Rules 7411.0100–7411.2000",
    "",
    "PART A — Identification",
    `Full name: ${packet.fullName ?? ""}`,
    `Birth date: ${packet.birthDate ?? ""}`,
    `Address: ${packet.address1 ?? ""} ${packet.address2 ?? ""}`,
    `City/State/ZIP: ${packet.city ?? ""}, ${packet.state ?? ""} ${packet.zip ?? ""}`,
    `DL number: ${packet.dlNumber ?? ""}`,
    `SSN last 4: ${packet.ssnLast4 ? `***-**-${packet.ssnLast4}` : ""}`,
    `Phone: ${packet.phone ?? ""}`,
    `Employing school: ${packet.employingSchoolName ?? ""}`,
    `School address: ${packet.employingSchoolAddress ?? ""}`,
    `Education provider: ${packet.educationProvider ?? ""} @ ${packet.educationLocation ?? ""}`,
    `Classroom competencies (7411.0630): ${packet.classroomCompetencyDate ?? ""}`,
    `Laboratory competencies (7411.0630): ${packet.laboratoryCompetencyDate ?? ""}`,
    "",
    "PART B — Certifications",
    `Applicant certified: ${packet.applicantCertified ? "Yes" : "No"}`,
    `Privacy acknowledged (M.S. 13.04): ${packet.privacyAcknowledged ? "Yes" : "No"}`,
    `Completeness: ${packet.completenessPercent}%`,
    "",
    `Exported for ${session.name} <${session.email}>`,
  ];

  const body = lines.join("\n");
  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": 'attachment; filename="lsds-application-packet.txt"',
    },
  });
}
