import { Newsletter } from "./Home";
import { useContent } from "../store/content";

export default function NewsletterPage() {
  const c = useContent((s) => s.content.newsletter);
  return (
    <div className="pt-header">
      <Newsletter c={c} />
    </div>
  );
}
