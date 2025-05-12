import { PolicyContent } from "../components/policy-content"

const content = `At msFoods, we are committed to safeguarding your personal information. We use your data only to process orders and enhance your shopping experience. We never share your information with third parties without your consent, except where required by law.

We collect only the information necessary to fulfill your orders and provide you with a seamless online experience. This includes your name, contact information, delivery address, and payment details. All data is collected through secure, encrypted channels.

Your personal data is stored securely and is accessible only by authorized personnel. We implement a variety of security measures to maintain the safety of your information and ensure it is protected against unauthorized access, disclosure, or misuse.

We use cookies and similar technologies to enhance your browsing experience, remember your preferences, and analyze site traffic. You can choose to disable cookies through your browser settings; however, this may affect the functionality of our website.

Your email address may be used to send you order confirmations, shipping updates, and occasional newsletters or promotional offers. You can unsubscribe from marketing emails at any time by clicking the link at the bottom of our emails.

We do not sell, trade, or rent your personal identification information to others. We may share limited data with trusted partners who help us operate our website, conduct business, or service you, as long as those parties agree to keep this information confidential.

Our website may contain links to third-party websites. Please note that we are not responsible for the privacy practices of these external sites. We encourage you to review the privacy policies of any third-party sites you visit.

If you create an account on our website, you are responsible for maintaining the confidentiality of your account information and password. Please notify us immediately of any unauthorized use of your account or suspected breach of security.

We may update this Privacy Policy from time to time to reflect changes in our practices or for legal and regulatory reasons. All updates will be posted on this page, and your continued use of our services constitutes your acceptance of those changes.

If you have any questions or concerns about our privacy practices or the information we hold about you, please feel free to contact us at msfoodscontact@gmail.com or call us at +92 321 4729048.`

export default function PrivacyPolicyPage() {
    return <PolicyContent title="Privacy Policy" content={content} />
}
