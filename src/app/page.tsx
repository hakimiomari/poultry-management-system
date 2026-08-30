import { getSession } from "@/lib/auth";
import { Landing } from "@/components/landing/Landing";

export const dynamic = "force-dynamic";

/** Public front page: product story, demo, links. Signed-in users get a direct "Open dashboard" CTA. */
export default async function Home() {
  const session = await getSession();
  return <Landing signedIn={!!session} repoUrl="https://github.com/hakimiomari/poultry-management-system" contactEmail={process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? ""} />;
}
