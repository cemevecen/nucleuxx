#!/usr/bin/env node
/**
 * Periyodik kontrol için paneller (tarayıcıya yapıştır).
 * Çalıştır: npm run ops:dashboards
 */

const links = [
  {
    title: "Google Cloud — API ve kimlik bilgileri (OAuth istemcisi)",
    url: "https://console.cloud.google.com/apis/credentials",
  },
  {
    title: "Google Cloud — OAuth izin ekranı",
    url: "https://console.cloud.google.com/apis/credentials/consent",
  },
  {
    title: "Google Cloud — etkin API'ler (yanlışlıkla açılan ücretli API'yi kapat)",
    url: "https://console.cloud.google.com/apis/dashboard",
  },
  {
    title: "Google Cloud — faturalandırma (hesapta fatura açık mı)",
    url: "https://console.cloud.google.com/billing",
  },
  {
    title: "X Developer — uygulama ve plan (Basic/Pro ücret)",
    url: "https://developer.x.com/en/portal/dashboard",
  },
  {
    title: "GitHub — repo (Actions kullanırsan dakika kotası)",
    url: "https://github.com/cemevecen/nucleuxx",
  },
  {
    title: "Vercel — dashboard (deploy ediyorsan bant / Image Optimization)",
    url: "https://vercel.com/dashboard",
  },
];

console.log("nucleuxx — periyodik kontrol linkleri\n");
for (const row of links) {
  console.log(`• ${row.title}`);
  console.log(`  ${row.url}\n`);
}
console.log("Yerel maliyet koruması: .env içinde AUTH_DISABLE_OAUTH=true\n");
