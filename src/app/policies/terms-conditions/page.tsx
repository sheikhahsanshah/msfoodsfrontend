import { PolicyContent } from "../components/policy-content"

const content = `By accessing and using the msFoods website, you agree to comply with and be bound by the following terms and conditions. These terms apply to all visitors, customers, and users of our site and services.

When placing an order on our website, you agree to provide accurate, complete, and up-to-date information. This includes your name, address, contact details, and payment information. Failure to do so may result in delays or cancellation of your order.

You are responsible for ensuring that your login credentials and account information remain confidential. Any actions taken through your account are your responsibility. Please notify us immediately if you suspect unauthorized use of your account.

All prices listed on our website are in Pakistani Rupees (PKR) and include applicable taxes unless stated otherwise. We reserve the right to change product prices, availability, or descriptions at any time without prior notice.

Payments must be made in full at the time of order. We accept secure online payments through approved payment gateways. Orders will not be shipped until payment has been successfully processed and verified.

msFoods reserves the right to cancel or refuse any order if we suspect fraud, unauthorized activity, or violation of our terms. In such cases, you will be notified and refunded promptly if any payment has been made.

All content on our website—including text, images, product names, and branding—is the property of msFoods and may not be used or reproduced without prior written permission. Unauthorized use may result in legal action.

We strive for accuracy in all aspects of our website, but we do not guarantee that all content will be free of typographical errors, inaccuracies, or omissions. We reserve the right to correct any errors without liability.

By using our website, you agree to use it only for lawful purposes. Any use of our services for harmful, abusive, fraudulent, or illegal activities is strictly prohibited and may lead to suspension or legal action.

These Terms & Conditions may be updated periodically to reflect changes in our business operations or legal requirements. We encourage you to review them regularly. Continued use of our website constitutes acceptance of any revisions.`

export default function TermsConditionsPage() {
    return <PolicyContent title="Terms & Conditions" content={content} />
}
