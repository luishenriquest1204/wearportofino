import { useMeta } from "../lib/meta";
import { Link } from "react-router";
import { tr } from "../i18n";
import { Monogram } from "../components/Marks";

export default function NotFound() {
  useMeta(tr("Lost at sea"));
  return (
    <div className="pt-header">
      <section className="grid min-h-[70vh] place-items-center px-4 py-24 text-center">
        <div>
          <Monogram className="mx-auto w-14 text-sand" />
          <p className="t-micro mt-10 text-mute">{tr("Error 404")}</p>
          <h1 className="t-display mt-4 text-[clamp(36px,4vw,72px)]">{tr("Lost at sea")}</h1>
          <p className="t-italic-thin mt-3 text-[16px]">{tr("The page you are looking for has sailed away.")}</p>
          <Link to="/" className="btn btn-dark mt-10">{tr("Back to the harbour")}</Link>
        </div>
      </section>
    </div>
  );
}
