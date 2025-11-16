"use client";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-2xl rounded-3xl border border-slate-800 bg-slate-900/80 p-10 shadow-2xl shadow-slate-900/50">
        <p className="uppercase tracking-[0.3em] text-xs text-slate-400 mb-4">
          Contact the Founders
        </p>
        <h1 className="text-4xl font-semibold mb-4">Request a Private Walkthrough</h1>
        <p className="text-slate-400 mb-8">
          Drop us a note and we’ll log it directly into our Airtable control board. Every
          request is reviewed by the founder team before any automation is triggered.
        </p>

        <div className="rounded-2xl overflow-hidden border border-slate-800">
          <iframe
            className="airtable-embed"
            src="https://airtable.com/embed/appHxpilmMRCVyzTV/pag6GBlX1TZY9J6P1/form"
            frameBorder="0"
            width="100%"
            height="650"
            style={{ background: "transparent", border: 0 }}
            title="Founder Contact Form"
          ></iframe>
        </div>
      </div>
    </div>
  );
}
