export const SITE = {
  name: "Shree Collections 999",
  tagline: "Elegant Sarees, Beautifully Curated.",
  shipping: "One-Day Shipping Across Andhra Pradesh & Telangana",
  area: "Andhra Pradesh & Telangana",
  whatsappDisplay: "+91 63034 10455",
  whatsappNumber: "916303410455", // country code + number, digits only
};

export function formatPrice(price: number) {
  return "₹" + price.toLocaleString("en-IN");
}

export function whatsappLink(message: string) {
  return `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export function orderLink(name: string, price: number) {
  return whatsappLink(
    `Hi ${SITE.name}! I'm interested in this saree.\n\nSaree: ${name}\nPrice: ${formatPrice(price)}\n\nPlease confirm availability and ordering details.`
  );
}

export const contactLink = whatsappLink(`Hi ${SITE.name}! I'd like to order a saree.`);
