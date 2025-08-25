import { PolicyContent } from "../components/policy-content"

const content = `At msFoods, we are committed to ensuring that your order reaches you in a timely, safe, and efficient manner. We currently offer shipping services across Pakistan to make our premium products accessible to customers nationwide.

All orders placed on our website are typically processed within 1–2 business days. This includes order verification, packaging, and preparation for dispatch. Orders placed on weekends or public holidays will be processed the following working day.

Delivery times vary depending on your location. Most orders are delivered within 3–5 business days after processing. However, deliveries to remote or less accessible areas may take slightly longer.

Once your order has been dispatched, you will receive a shipping confirmation via email or SMS. This message will include your tracking number and a link to the courier's tracking page so you can monitor your delivery in real time.

We work with reliable and reputable courier partners to ensure that your products are handled with care and delivered safely to your doorstep. In case of any delays from the courier's side, we will do our best to assist and follow up.

Shipping charges, if applicable, will be calculated and displayed at checkout before you confirm your order. We may offer free shipping promotions from time to time, which will be clearly communicated on our website or via email.

Customers are requested to ensure that all shipping details provided at checkout are accurate and complete. msFoods is not responsible for orders delivered to incorrect addresses due to customer error.

In the rare event that your package is lost in transit or delivered to the wrong address, please contact our support team as soon as possible. We will coordinate with the courier to resolve the issue and ensure you are compensated appropriately.

While we strive for punctuality, delivery timelines are estimates and may be affected by factors beyond our control such as weather conditions, strikes, or public holidays. We appreciate your understanding and patience in such cases.

For any shipping-related questions or issues, you can reach our customer support team at contact@msfoods.pk or call +92 321 4729048 during business hours. We're always here to assist you.`

export default function ShippingPolicyPage() {
    return <PolicyContent title="Shipping/Service Policy" content={content} />
}
