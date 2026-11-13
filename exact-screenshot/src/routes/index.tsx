import { createFileRoute } from "@tanstack/react-router";
import { Landing } from "@/components/agromax/Landing";
import { translations } from "@/content/translations";
import { contacts } from "@/content/site";

const uz = translations.uz.meta;
const ru = translations.ru.meta;

const localBusiness = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "AgroMax",
  description: uz.description,
  telephone: contacts.phone,
  address: { "@type": "PostalAddress", addressRegion: "Toshkent viloyati", addressCountry: "UZ" },
  openingHours: "Mo-Sa 06:00-20:00",
  sameAs: [contacts.telegram, contacts.instagram],
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: uz.title },
      { name: "description", content: `${uz.description} | ${ru.description}` },
      { property: "og:title", content: uz.title },
      { property: "og:description", content: uz.description },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "uz_UZ" },
      { property: "og:locale:alternate", content: "ru_RU" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    scripts: [{ type: "application/ld+json", children: JSON.stringify(localBusiness) }],
  }),
  component: Landing,
});
