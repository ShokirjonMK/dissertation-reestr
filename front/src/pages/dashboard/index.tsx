import { useEffect, useState } from "react";

import StatCard from "@/components/StatCard";
import DashboardLayout from "@/layouts/DashboardLayout";
import { askAI, fetchDissertations } from "@/services/api";
import { getToken } from "@/store/auth";

export default function DashboardPage() {
  const [total, setTotal] = useState("0");
  const [approved, setApproved] = useState("0");
  const [pending, setPending] = useState("0");
  const [question, setQuestion] = useState("Dissertatsiyalarda uchraydigan asosiy huquqiy muammolar nimalar?");
  const [aiAnswer, setAiAnswer] = useState<string>("");

  useEffect(() => {
    if (!getToken()) {
      window.location.href = "/login";
      return;
    }

    fetchDissertations({})
      .then((items) => {
        setTotal(String(items.length));
        setApproved(String(items.filter((x) => x.status === "approved").length));
        setPending(String(items.filter((x) => x.status === "pending").length));
      })
      .catch(() => {
        setTotal("0");
      });
  }, []);

  const onAsk = async () => {
    const result = await askAI(question);
    setAiAnswer(result.answer);
  };

  return (
    <DashboardLayout title="Dashboard">
      <section className="stats-grid">
        <StatCard label="Jami dissertatsiyalar" value={total} />
        <StatCard label="Tasdiqlangan" value={approved} tone="success" />
        <StatCard label="Kutilmoqda" value={pending} tone="warning" />
      </section>

      <section className="card">
        <h2>AI savol-javob (RAG)</h2>
        <div className="row">
          <input value={question} onChange={(e) => setQuestion(e.target.value)} />
          <button className="btn" onClick={onAsk}>
            So'rash
          </button>
        </div>
        {aiAnswer && <pre className="ai-answer">{aiAnswer}</pre>}
      </section>
    </DashboardLayout>
  );
}
