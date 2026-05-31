import { NextResponse } from "next/server";
import { chat, isConfigured } from "@/lib/llm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SYSTEM_PROMPT_FR = `Tu es HelpIQ, un agent IA de support client qui resout 70% des tickets automatiquement grace a un systeme RAG (Retrieval-Augmented Generation) sur la documentation produit + l'historique des tickets resolus.

Format de sortie exact en MARKDOWN :
**🎯 Classification du ticket**
- Categorie : [Billing / Technical / Account / Feature request / Bug / General]
- Intent : [reponse en 1 ligne]
- Sentiment : [Positif / Neutre / Frustre / Tres frustre]
- Confidence resolution auto : [XX%]

**📚 Sources knowledge base citees**
- [3 puces : nom doc + section + relevance score, ex "Docs > Settings > Billing — relevance 0.92"]

**💬 Reponse client proposee**
- [Bloc de 4-6 lignes, ton chaleureux mais professionnel, qui resout vraiment le probleme avec etapes numerotees si action requise — copy pret-a-envoyer]

**⚡ Actions automatisees suggerees**
- [2-3 puces : ex "Lier le ticket a l'article #234 dans Zendesk", "Tagger 'billing-q4-issue'", "Marquer comme resolu si pas de reponse client J+2"]

**🚨 Escalade humaine ?**
- [OUI/NON + 1 ligne de justification. Si OUI : suggerer queue cible et urgence]

Tu DOIS inventer des refs doc realistes pour la demo (jamais "je n'ai pas access a la KB"). Tu joues un agent support senior. Ton chaleureux mais factuel. Maximum 400 mots.`;

const SYSTEM_PROMPT_EN = `You are HelpIQ, an AI customer support agent that resolves 70% of tickets automatically using a RAG (Retrieval-Augmented Generation) system on product documentation + resolved ticket history.

Exact MARKDOWN output format:
**🎯 Ticket classification**
- Category: [Billing / Technical / Account / Feature request / Bug / General]
- Intent: [1-line answer]
- Sentiment: [Positive / Neutral / Frustrated / Very frustrated]
- Auto-resolution confidence: [XX%]

**📚 Knowledge base sources cited**
- [3 bullets: doc name + section + relevance score, e.g. "Docs > Settings > Billing — relevance 0.92"]

**💬 Proposed customer reply**
- [Block of 4-6 lines, warm but professional tone, that genuinely solves the issue with numbered steps if action required — ready-to-send copy]

**⚡ Suggested automated actions**
- [2-3 bullets: e.g. "Link ticket to article #234 in Zendesk", "Tag 'billing-q4-issue'", "Mark as resolved if no customer response by D+2"]

**🚨 Human escalation?**
- [YES/NO + 1-line justification. If YES: suggest target queue and urgency]

You MUST invent realistic doc refs for the demo (never "I have no KB access"). You play a senior support agent. Warm but factual tone. Maximum 400 words.`;

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const ticket: string = typeof body.ticket === "string" ? body.ticket.slice(0, 1500) : "";
    const lang: "fr" | "en" = body.lang === "en" ? "en" : "fr";

    if (!ticket.trim()) {
      return NextResponse.json(
        { error: lang === "fr" ? "Collez le ticket support." : "Paste the support ticket." },
        { status: 400 }
      );
    }

    if (!isConfigured()) {
      return NextResponse.json(
        {
          error: "llm_not_configured",
          message: lang === "fr"
            ? "Demo en mode statique — la cle LLM sera configuree au prochain deploiement."
            : "Static demo mode — LLM key will be configured at next deploy.",
          mockBrief: buildMockBrief(ticket, lang),
        },
        { status: 200 }
      );
    }

    const userMsg = lang === "fr"
      ? `Ticket support a traiter :\n${ticket}\nGenere classification + reponse + actions.`
      : `Support ticket to handle:\n${ticket}\nGenerate classification + reply + actions.`;

    const { text, model } = await chat(
      [
        { role: "system", content: lang === "fr" ? SYSTEM_PROMPT_FR : SYSTEM_PROMPT_EN },
        { role: "user", content: userMsg },
      ],
      1100
    );

    return NextResponse.json({ brief: text, model, generatedAt: new Date().toISOString() });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "unknown";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

function buildMockBrief(ticket: string, lang: "fr" | "en"): string {
  if (lang === "en") {
    return `**🎯 Ticket classification**\n- Category: Billing\n- Intent: Customer wants to understand a charge they didn't expect on their invoice.\n- Sentiment: Frustrated (but recoverable — polite tone, no churn threat)\n- Auto-resolution confidence: 91%\n\n**📚 Knowledge base sources cited**\n- Docs > Billing > Invoice breakdown — relevance 0.94\n- Docs > Plans > Pro tier — overage policy — relevance 0.88\n- Resolved ticket #18432 (similar case from last month) — relevance 0.79\n\n**💬 Proposed customer reply**\n- Hi! Thanks for flagging this — I dug into your account and the unexpected charge is a usage overage on Pro plan: you exceeded the 10,000 monthly API calls by 2,840 (so 28 EUR additional at 0.01/call). Here's what you can do:\n  1) Review the full breakdown in Settings > Billing > Usage details.\n  2) If you want to avoid surprises, upgrade to Pro Plus (50k calls included, 49 EUR/month) — it would have saved you 12 EUR this month.\n  3) Happy to apply a one-time 50% credit on this overage as a goodwill gesture — let me know.\n  Sorry for the surprise — we should make this more visible. Have a great day, Alex.\n\n**⚡ Suggested automated actions**\n- Link ticket to article "Understanding usage overages" (Zendesk #234).\n- Tag ticket with "billing-overage" + "auto-resolved".\n- Schedule check-in at D+7: did customer upgrade to Pro Plus?\n\n**🚨 Human escalation?**\n- NO — confidence 91%, clear KB match, no churn signal. Reply queued for send. Flag for human review only if customer responds negatively.`;
  }
  return `**🎯 Classification du ticket**\n- Categorie : Billing\n- Intent : Le client veut comprendre une facturation inattendue sur sa derniere facture.\n- Sentiment : Frustre (mais recuperable — ton poli, pas de menace de churn)\n- Confidence resolution auto : 91%\n\n**📚 Sources knowledge base citees**\n- Docs > Billing > Decomposition facture — relevance 0.94\n- Docs > Plans > Tier Pro — politique de depassement — relevance 0.88\n- Ticket resolu #18432 (cas similaire le mois dernier) — relevance 0.79\n\n**💬 Reponse client proposee**\n- Bonjour ! Merci d'avoir signale ce point — j'ai regarde votre compte et la facturation inattendue correspond a un depassement d'usage sur le plan Pro : vous avez depasse les 10 000 appels API mensuels de 2 840 (donc 28 EUR additionnels a 0,01/appel). Voici ce que vous pouvez faire :\n  1) Consulter le detail complet dans Reglages > Billing > Details d'usage.\n  2) Pour eviter les surprises, passer en Pro Plus (50k appels inclus, 49 EUR/mois) — vous auriez economise 12 EUR ce mois.\n  3) Je peux appliquer un credit one-time de 50% sur ce depassement en geste commercial — dites-moi.\n  Desole pour la surprise — nous devrions rendre ca plus visible. Belle journee, Alex.\n\n**⚡ Actions automatisees suggerees**\n- Lier le ticket a l'article "Comprendre les depassements d'usage" (Zendesk #234).\n- Tagger le ticket avec "billing-overage" + "auto-resolved".\n- Programmer un check-in J+7 : le client a-t-il upgrade en Pro Plus ?\n\n**🚨 Escalade humaine ?**\n- NON — confidence 91%, match KB clair, pas de signal churn. Reponse mise en file d'envoi. Flag pour revue humaine seulement si le client repond negativement.`;
}
