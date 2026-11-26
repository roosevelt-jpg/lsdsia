import React from "react";
import { Document, Page, Text, View, StyleSheet, renderToBuffer } from "@react-pdf/renderer";
import { APPLICATION_DOC_KINDS } from "@/lib/application";

const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 40,
    paddingHorizontal: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#0B1F33",
  },
  title: { fontSize: 14, fontFamily: "Helvetica-Bold", marginBottom: 4 },
  subtitle: { fontSize: 9, color: "#475569", marginBottom: 12 },
  section: { fontSize: 11, fontFamily: "Helvetica-Bold", marginTop: 14, marginBottom: 6 },
  row: { flexDirection: "row", marginBottom: 4 },
  label: { width: 160, color: "#64748b" },
  value: { flex: 1 },
  box: {
    marginTop: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 4,
  },
  fine: { fontSize: 8, color: "#64748b", marginTop: 10, lineHeight: 1.4 },
  checklist: { marginTop: 4, marginBottom: 2 },
});

export type ApplicationPdfData = {
  lastName: string | null;
  firstName: string | null;
  middleName: string | null;
  fullName: string | null;
  birthDate: string | null;
  address1: string | null;
  address2: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  dlNumber: string | null;
  ssnLast4: string | null;
  phone: string | null;
  employingSchoolName: string | null;
  employingSchoolAddress: string | null;
  educationProvider: string | null;
  educationLocation: string | null;
  classroomCompetencyDate: string | null;
  laboratoryCompetencyDate: string | null;
  applicantCertified: boolean;
  privacyAcknowledged: boolean;
  applicantSignature: string | null;
  applicantSignedAt: string | null;
  officialName: string | null;
  officialSignature: string | null;
  officialSignedAt: string | null;
  status: string;
  documents: { kind: string; fileName: string }[];
  exportedFor: string;
};

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value?.trim() ? value : "—"}</Text>
    </View>
  );
}

function ApplicationPdfDoc({ data }: { data: ApplicationPdfData }) {
  const docsByKind = Object.fromEntries(data.documents.map((d) => [d.kind, d.fileName]));
  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <Text style={styles.title}>Application for Driver Training Instructor&apos;s License</Text>
        <Text style={styles.subtitle}>
          Life Star preparation packet modeled on MN DPS PS36008-10. Not the official state form — file the official
          form with Driver and Vehicle Services. Statutes 171.33–171.41; Rules 7411.0100–7411.2000. Fees non-refundable
          if disapproved. Status: {data.status}.
        </Text>

        <Text style={styles.section}>Part A — Identification data</Text>
        <Field label="Last name" value={data.lastName} />
        <Field label="First name" value={data.firstName} />
        <Field label="Middle name" value={data.middleName} />
        <Field label="Full name" value={data.fullName} />
        <Field label="Birth date" value={data.birthDate} />
        <Field label="Street address" value={[data.address1, data.address2].filter(Boolean).join(", ")} />
        <Field label="City / State / ZIP" value={`${data.city ?? ""}, ${data.state ?? ""} ${data.zip ?? ""}`} />
        <Field label="Driver’s license no." value={data.dlNumber} />
        <Field label="SSN (last 4)" value={data.ssnLast4 ? `***-**-${data.ssnLast4}` : null} />
        <Field label="Home telephone" value={data.phone} />
        <Field label="Employing school" value={data.employingSchoolName} />
        <Field label="School address" value={data.employingSchoolAddress} />
        <Field label="Training provider" value={data.educationProvider} />
        <Field label="Provider location" value={data.educationLocation} />
        <Field label="Classroom 7411.0630 date" value={data.classroomCompetencyDate} />
        <Field label="Laboratory 7411.0630 date" value={data.laboratoryCompetencyDate} />

        <Text style={styles.section}>Required attachments</Text>
        {APPLICATION_DOC_KINDS.map((k) => (
          <Text key={k.kind} style={styles.checklist}>
            [{docsByKind[k.kind] ? "X" : " "}] {k.label}
            {docsByKind[k.kind] ? ` — ${docsByKind[k.kind]}` : ""}
          </Text>
        ))}

        <Text style={styles.section}>Part B — Certifications</Text>
        <View style={styles.box}>
          <Text style={{ fontFamily: "Helvetica-Bold", marginBottom: 4 }}>Authorized school official</Text>
          <Text>
            I certify that the applicant has completed classroom and laboratory competencies in Minnesota Rules, Part
            7411.0630, and is or will be employed as an instructor at this school.
          </Text>
          <Field label="Official name" value={data.officialName} />
          <Field label="Signature" value={data.officialSignature} />
          <Field label="Date" value={data.officialSignedAt} />
        </View>
        <View style={styles.box}>
          <Text style={{ fontFamily: "Helvetica-Bold", marginBottom: 4 }}>Applicant</Text>
          <Text>
            I certify the information is true and that I meet qualifications in Minnesota Rules 7411.0620 and driving
            history requirements in Rule 7411.0645. Privacy notice acknowledged (M.S. 13.04, subd. 2).
          </Text>
          <Field label="Certified" value={data.applicantCertified ? "Yes" : "No"} />
          <Field label="Privacy acknowledged" value={data.privacyAcknowledged ? "Yes" : "No"} />
          <Field label="Signature" value={data.applicantSignature} />
          <Field label="Date" value={data.applicantSignedAt} />
        </View>

        <Text style={styles.fine}>
          Important facts about information on this application (M.S. 13.04, subd. 2): data is collected to process an
          instructor license; providing it is mandatory for processing; access is limited to DPS and authorized parties;
          much of the data becomes public when a license is issued (with exceptions for medical/complaint data).
        </Text>
        <Text style={styles.fine}>Exported for {data.exportedFor}. Form reference: PS36008-10 (prep packet).</Text>
      </Page>
    </Document>
  );
}

export async function renderApplicationPdf(data: ApplicationPdfData) {
  return renderToBuffer(<ApplicationPdfDoc data={data} />);
}
