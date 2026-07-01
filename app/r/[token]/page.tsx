// Route répondant — server component : déballe le token puis délègue au formulaire client.
import { RespondForm } from "@/components/RespondForm";

export default async function RespondPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <RespondForm token={token} />;
}
