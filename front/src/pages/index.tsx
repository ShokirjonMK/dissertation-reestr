import Head from "next/head";
import Link from "next/link";

export default function LandingPage() {
  return (
    <>
      <Head>
        <title>Dissertation Registry</title>
      </Head>
      <div className="landing-bg">
        <div className="landing-card">
          <h1>Dissertation Problems and Proposals Registry</h1>
          <p>
            Markazlashgan elektron reestr: dissertatsiyalardagi muammolar, takliflar, xulosalar va amaliyotga tatbiq
            imkoniyatlari.
          </p>
          <ul>
            <li>Doctorant submissions</li>
            <li>Moderator approval workflow</li>
            <li>ElasticSearch + AI assisted analysis</li>
          </ul>
          <div className="landing-actions">
            <Link className="btn" href="/login">
              Kirish
            </Link>
          </div>
          <p className="muted">Aloqa: support@registry.local</p>
        </div>
      </div>
    </>
  );
}
