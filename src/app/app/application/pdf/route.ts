import { NextResponse } from "next/server";
import { getAuthorizedUser } from "@/lib/auth";
import { renderApplicationPdf } from "@/lib/application-pdf";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getAuthorizedUser();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const packet = await prisma.applicationPacket.findUnique({
    where: { userId: session.id },
    include: { documents: true },
  });
  if (!packet) {
    return NextResponse.json({ error: "No packet" }, { status: 404 });
  }

  const buffer = await renderApplicationPdf({
    lastName: packet.lastName,
    firstName: packet.firstName,
    middleName: packet.middleName,
    fullName: packet.fullName,
    birthDate: packet.birthDate,
    address1: packet.address1,
    address2: packet.address2,
    city: packet.city,
    state: packet.state,
    zip: packet.zip,
    dlNumber: packet.dlNumber,
    ssnLast4: packet.ssnLast4,
    phone: packet.phone,
    employingSchoolName: packet.employingSchoolName,
    employingSchoolAddress: packet.employingSchoolAddress,
    educationProvider: packet.educationProvider,
    educationLocation: packet.educationLocation,
    classroomCompetencyDate: packet.classroomCompetencyDate,
    laboratoryCompetencyDate: packet.laboratoryCompetencyDate,
    applicantCertified: packet.applicantCertified,
    privacyAcknowledged: packet.privacyAcknowledged,
    applicantSignature: packet.applicantSignature,
    applicantSignedAt: packet.applicantSignedAt,
    officialName: packet.officialName,
    officialSignature: packet.officialSignature,
    officialSignedAt: packet.officialSignedAt,
    status: packet.status,
    documents: packet.documents.map((d) => ({ kind: d.kind, fileName: d.fileName })),
    exportedFor: `${session.name} <${session.email}>`,
  });

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="lsds-instructor-application-prep.pdf"',
      "Cache-Control": "private, no-store",
    },
  });
}
