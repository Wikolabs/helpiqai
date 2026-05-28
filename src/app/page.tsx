export default function Home() {
  return (
    <main style={{ color: "#134e4a" }}>
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-4 bg-white shadow-sm">
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.4rem", color: "#0d9488" }}>
          HelpiqAI
        </span>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <a
            href="https://calendly.com/wikolabs"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-lg text-white text-sm font-semibold"
            style={{ background: "#0d9488" }}
          >
            📅 Réserver un créneau →
          </a>
          <a
            href="https://wa.me/261386626100?text=Bonjour%2C%20je%20souhaite%20discuter%20de%20HelpiqAI%20avec%20Wikolabs."
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-lg text-white text-sm font-semibold"
            style={{ background: "#25d366", borderColor: "#25d366" }}
          >
            💬 WhatsApp →
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-12 text-center">
        <div className="inline-block px-3 py-1 rounded-full text-sm font-semibold mb-4" style={{ background: "#ccfbf1", color: "#0f766e" }}>
          Agent RAG E-commerce
        </div>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(2rem,5vw,3.5rem)", lineHeight: 1.15, color: "#0d9488" }} className="mb-4">
          Votre SAV e-commerce,<br />résolu en 30 secondes.
        </h1>
        <p className="text-lg text-teal-700 max-w-2xl mx-auto mb-8">
          HelpiqAI connecte vos données produits, commandes et politiques pour répondre à chaque client instantanément — 24h/24, 7j/7, sans agent humain.
        </p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <a
            href="https://calendly.com/wikolabs"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-8 py-4 rounded-xl text-white text-lg font-bold shadow-lg"
            style={{ background: "linear-gradient(135deg, #0d9488, #0891b2)" }}
          >
            📅 Réserver un créneau →
          </a>
          <a
            href="https://wa.me/261386626100?text=Bonjour%2C%20je%20souhaite%20discuter%20de%20HelpiqAI%20avec%20Wikolabs."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-8 py-4 rounded-xl text-white text-lg font-bold shadow-lg"
            style={{ background: "#25d366", borderColor: "#25d366" }}
          >
            💬 WhatsApp →
          </a>
        </div>
      </section>

      {/* Chat Mockup */}
      <section className="max-w-lg mx-auto px-6 pb-16">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-teal-100">
          <div className="flex items-center gap-2 px-4 py-3" style={{ background: "#0d9488" }}>
            <div className="w-3 h-3 rounded-full bg-white opacity-60" />
            <span className="text-white text-sm font-semibold">Support HelpiqAI</span>
            <span className="ml-auto text-xs text-teal-200">En ligne</span>
          </div>
          <div className="p-4 space-y-3 text-sm">
            <div className="flex gap-2">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: "#0d9488" }}>C</div>
              <div className="bg-gray-100 rounded-xl rounded-tl-none px-3 py-2 max-w-xs">
                Où est ma commande #FR-8821 ?
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <div className="rounded-xl rounded-tr-none px-3 py-2 max-w-xs text-white" style={{ background: "#0d9488" }}>
                Votre commande #FR-8821 est en transit chez Colissimo. Livraison prévue demain avant 18h. 📦
              </div>
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: "#ccfbf1", color: "#0d9488" }}>AI</div>
            </div>
            <div className="flex gap-2">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: "#0d9488" }}>C</div>
              <div className="bg-gray-100 rounded-xl rounded-tl-none px-3 py-2 max-w-xs">
                Et si je veux faire un retour ?
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <div className="rounded-xl rounded-tr-none px-3 py-2 max-w-xs text-white" style={{ background: "#0d9488" }}>
                Retours gratuits sous 30 jours. Je génère votre étiquette maintenant — email dans 2 min.
              </div>
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: "#ccfbf1", color: "#0d9488" }}>AI</div>
            </div>
          </div>
          <div className="px-4 pb-4">
            <div className="flex items-center gap-2 border rounded-lg px-3 py-2 border-teal-200">
              <span className="text-gray-400 text-sm flex-1">Écrivez votre question...</span>
              <div className="w-6 h-6 rounded-md flex items-center justify-center text-white text-xs" style={{ background: "#0d9488" }}>→</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 pb-16">
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.8rem", color: "#0d9488" }} className="text-center mb-10">
          Tout ce dont votre SAV a besoin
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: "🔍", title: "RAG sur catalogue", desc: "Indexation automatique de vos fiches produits, FAQ et politiques. L'agent répond avec précision sur n'importe quel SKU." },
            { icon: "🔗", title: "Intégration Shopify / WooCommerce", desc: "Connexion en 10 minutes. Accès en temps réel aux commandes, stocks et statuts de livraison." },
            { icon: "🎯", title: "Escalade intelligente", desc: "Détection de frustration et transfert vers un agent humain avec tout le contexte de la conversation." },
          ].map((f) => (
            <div key={f.title} className="bg-white rounded-xl p-6 shadow-sm border border-teal-100">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.1rem", color: "#0d9488" }} className="mb-2">{f.title}</h3>
              <p className="text-sm text-teal-800 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Process */}
      <section className="max-w-3xl mx-auto px-6 pb-16">
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.8rem", color: "#0d9488" }} className="text-center mb-10">
          Opérationnel en 3 étapes
        </h2>
        <div className="space-y-4">
          {[
            { step: "01", title: "Connectez vos sources", desc: "Shopify, WooCommerce, Google Sheets ou CSV — l'agent ingère tout en moins d'une heure." },
            { step: "02", title: "Configurez vos règles", desc: "Ton de marque, sujets couverts, escalades — tout paramétrable sans code." },
            { step: "03", title: "Déployez sur tous vos canaux", desc: "Widget web, email, WhatsApp Business — un seul agent, partout." },
          ].map((s) => (
            <div key={s.step} className="flex gap-4 bg-white rounded-xl p-5 shadow-sm border border-teal-100">
              <div className="text-2xl font-black flex-shrink-0" style={{ fontFamily: "var(--font-display)", color: "#99f6e4" }}>{s.step}</div>
              <div>
                <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "#0d9488" }} className="mb-1">{s.title}</h3>
                <p className="text-sm text-teal-800">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 text-center" style={{ background: "linear-gradient(135deg, #0d9488, #0891b2)" }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "2rem", color: "white" }} className="mb-4">
          Prêt à automatiser votre SAV ?
        </h2>
        <p className="text-teal-100 mb-8">Démo personnalisée en 30 min. Mise en production en 1 semaine.</p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <a
            href="https://calendly.com/wikolabs"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-8 py-4 rounded-xl font-bold text-lg shadow-lg"
            style={{ background: "white", color: "#0d9488" }}
          >
            📅 Réserver un créneau →
          </a>
          <a
            href="https://wa.me/261386626100?text=Bonjour%2C%20je%20souhaite%20discuter%20de%20HelpiqAI%20avec%20Wikolabs."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-8 py-4 rounded-xl font-bold text-lg shadow-lg"
            style={{ background: "white", color: "#0d9488", borderColor: "#25d366" }}
          >
            💬 WhatsApp →
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-6 text-sm text-teal-600">
        <p>&copy; 2025 HelpiqAI &mdash; Un produit Wikolabs</p>
        <div className="flex flex-wrap justify-center gap-4 mt-2 text-xs text-teal-500">
          <a href="mailto:team@wikolabs.com" className="hover:text-teal-800 transition-colors">team@wikolabs.com</a>
          <span>·</span>
          <a href="tel:+261386626100" className="hover:text-teal-800 transition-colors">+261 38 66 261 00</a>
          <span>·</span>
          <a href="https://calendly.com/wikolabs" target="_blank" rel="noopener noreferrer" className="hover:text-teal-800 transition-colors">Prendre RDV</a>
        </div>
      </footer>
    </main>
  );
}
