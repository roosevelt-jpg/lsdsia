export {
  EMAIL_BRAND,
  appOrigin,
  absoluteUrl,
  emailFromAddress,
  isResendConfigured,
} from "@/lib/email/brand";
export { sendEmail } from "@/lib/email/send";
export {
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendLicenseReviewEmail,
  sendPracticumConfirmedEmail,
  sendCertificateIssuedEmail,
} from "@/lib/email/messages";
