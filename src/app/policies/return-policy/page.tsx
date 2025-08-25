import { PolicyContent } from "../components/policy-content"

const content = `At msFoods, customer satisfaction is at the heart of everything we do. We understand that sometimes issues may arise, and we are here to make the refund process as smooth and transparent as possible.

Refunds are issued only in cases where the product delivered is defective, damaged, or incorrect. We do not offer refunds for opened or used products due to food safety regulations.

To be eligible for a refund, you must notify us within 48 hours of delivery. Please contact us by email or phone and include your order number, a description of the issue, and clear photographs of the affected product(s).

Photographic evidence is essential for validating the claim and helps us maintain our product quality standards. Without supporting photos, we may not be able to process the refund request.

Once your claim is received and reviewed, we will notify you of the outcome. If your refund is approved, it will be processed within 7 business days using the original payment method used at checkout.

Refunds may take additional time to appear in your account depending on your bank or payment provider. We are not responsible for delays caused by third-party payment processors.

Please note that we do not issue refunds for minor packaging imperfections that do not affect product quality, nor do we offer refunds based on taste preferences or changes of mind.

If a refund is not possible due to product unavailability or other circumstances, we may offer store credit or a replacement as an alternative solution based on your preference.

All refund requests are handled on a case-by-case basis. Our goal is to treat every customer fairly while upholding the quality and safety of our food products.

For assistance with refund requests or questions about this policy, please contact us at contact@msfoods.pk or call +92 321 4729048 during business hours. We are here to help.`

export default function RefundPolicyPage() {
    return <PolicyContent title="Refund Policy" content={content} />
}
