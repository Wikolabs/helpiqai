"""HelpIQ demo backend — production-ready POC.

In production: this service would also embed and index a customer-provided
knowledge base, retrieve top-k chunks for RAG, and dispatch ticket actions
to Zendesk/Intercom. For the demo: it only invokes the LLM and returns the brief.
"""
from datetime import datetime, timezone
from typing import Literal

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .llm import chat, is_configured

app = FastAPI(
    title="HelpIQ Demo Backend",
    description="POC backend — Groq/Gemini LLM. No third-party connections.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────────────────────────────────────
# Prompts
# ─────────────────────────────────────────────────────────────────────────────
SYSTEM_PROMPT_FR = """Tu es HelpIQ, un agent IA de support client qui resout 70% des tickets automatiquement grace a un systeme RAG (Retrieval-Augmented Generation) sur la documentation produit + l'historique des tickets resolus.

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

Tu DOIS inventer des refs doc realistes pour la demo (jamais "je n'ai pas access a la KB"). Tu joues un agent support senior. Ton chaleureux mais factuel. Maximum 400 mots."""

SYSTEM_PROMPT_EN = """You are HelpIQ, an AI customer support agent that resolves 70% of tickets automatically using a RAG (Retrieval-Augmented Generation) system on product documentation + resolved ticket history.

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

You MUST invent realistic doc refs for the demo (never "I have no KB access"). You play a senior support agent. Warm but factual tone. Maximum 400 words."""


# ─────────────────────────────────────────────────────────────────────────────
# Models
# ─────────────────────────────────────────────────────────────────────────────
class GenerateRequest(BaseModel):
    ticket: str
    lang: Literal["fr", "en"] = "fr"


class GenerateResponse(BaseModel):
    brief: str
    model: str
    generated_at: str
    static_mode: bool = False


# ─────────────────────────────────────────────────────────────────────────────
# Routes
# ─────────────────────────────────────────────────────────────────────────────
@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "helpiqai-backend",
        "llm_configured": is_configured(),
    }


@app.post("/process", response_model=GenerateResponse)
async def process(req: GenerateRequest) -> GenerateResponse:
    ticket = (req.ticket or "").strip()[:1500]
    if not ticket:
        raise HTTPException(status_code=400, detail="empty_ticket")

    now_iso = datetime.now(timezone.utc).isoformat()
    user_msg = (
        f"Ticket support a traiter :\n{ticket}\nGenere classification + reponse + actions."
        if req.lang == "fr"
        else f"Support ticket to handle:\n{ticket}\nGenerate classification + reply + actions."
    )

    if not is_configured():
        return GenerateResponse(
            brief=_build_mock_brief(ticket, req.lang),
            model="static-mock",
            generated_at=now_iso,
            static_mode=True,
        )

    try:
        text, model = await chat(
            [
                {"role": "system", "content": SYSTEM_PROMPT_FR if req.lang == "fr" else SYSTEM_PROMPT_EN},
                {"role": "user", "content": user_msg},
            ],
            max_tokens=1100,
        )
    except Exception:
        return GenerateResponse(
            brief=_build_mock_brief(ticket, req.lang),
            model="static-mock",
            generated_at=now_iso,
            static_mode=True,
        )

    return GenerateResponse(brief=text, model=model, generated_at=now_iso)


# ─────────────────────────────────────────────────────────────────────────────
# Mock brief (used when no LLM key configured or LLM fails)
# ─────────────────────────────────────────────────────────────────────────────
def _build_mock_brief(ticket: str, lang: str) -> str:
    if lang == "en":
        return (
            f"**🎯 Ticket classification**\n"
            f"- Category: Billing\n"
            f"- Intent: Customer wants to understand a charge they didn't expect on their invoice.\n"
            f"- Sentiment: Frustrated (but recoverable — polite tone, no churn threat)\n"
            f"- Auto-resolution confidence: 91%\n\n"
            f"**📚 Knowledge base sources cited**\n"
            f"- Docs > Billing > Invoice breakdown — relevance 0.94\n"
            f"- Docs > Plans > Pro tier — overage policy — relevance 0.88\n"
            f"- Resolved ticket #18432 (similar case from last month) — relevance 0.79\n\n"
            f"**💬 Proposed customer reply**\n"
            f"- Hi! Thanks for flagging this — I dug into your account and the unexpected charge is a usage overage on Pro plan: you exceeded the 10,000 monthly API calls by 2,840 (so 28 EUR additional at 0.01/call). Here's what you can do:\n"
            f"  1) Review the full breakdown in Settings > Billing > Usage details.\n"
            f"  2) If you want to avoid surprises, upgrade to Pro Plus (50k calls included, 49 EUR/month) — it would have saved you 12 EUR this month.\n"
            f"  3) Happy to apply a one-time 50% credit on this overage as a goodwill gesture — let me know.\n"
            f"  Sorry for the surprise — we should make this more visible. Have a great day, Alex.\n\n"
            f"**⚡ Suggested automated actions**\n"
            f"- Link ticket to article \"Understanding usage overages\" (Zendesk #234).\n"
            f"- Tag ticket with \"billing-overage\" + \"auto-resolved\".\n"
            f"- Schedule check-in at D+7: did customer upgrade to Pro Plus?\n\n"
            f"**🚨 Human escalation?**\n"
            f"- NO — confidence 91%, clear KB match, no churn signal. Reply queued for send. Flag for human review only if customer responds negatively."
        )
    return (
        f"**🎯 Classification du ticket**\n"
        f"- Categorie : Billing\n"
        f"- Intent : Le client veut comprendre une facturation inattendue sur sa derniere facture.\n"
        f"- Sentiment : Frustre (mais recuperable — ton poli, pas de menace de churn)\n"
        f"- Confidence resolution auto : 91%\n\n"
        f"**📚 Sources knowledge base citees**\n"
        f"- Docs > Billing > Decomposition facture — relevance 0.94\n"
        f"- Docs > Plans > Tier Pro — politique de depassement — relevance 0.88\n"
        f"- Ticket resolu #18432 (cas similaire le mois dernier) — relevance 0.79\n\n"
        f"**💬 Reponse client proposee**\n"
        f"- Bonjour ! Merci d'avoir signale ce point — j'ai regarde votre compte et la facturation inattendue correspond a un depassement d'usage sur le plan Pro : vous avez depasse les 10 000 appels API mensuels de 2 840 (donc 28 EUR additionnels a 0,01/appel). Voici ce que vous pouvez faire :\n"
        f"  1) Consulter le detail complet dans Reglages > Billing > Details d'usage.\n"
        f"  2) Pour eviter les surprises, passer en Pro Plus (50k appels inclus, 49 EUR/mois) — vous auriez economise 12 EUR ce mois.\n"
        f"  3) Je peux appliquer un credit one-time de 50% sur ce depassement en geste commercial — dites-moi.\n"
        f"  Desole pour la surprise — nous devrions rendre ca plus visible. Belle journee, Alex.\n\n"
        f"**⚡ Actions automatisees suggerees**\n"
        f"- Lier le ticket a l'article \"Comprendre les depassements d'usage\" (Zendesk #234).\n"
        f"- Tagger le ticket avec \"billing-overage\" + \"auto-resolved\".\n"
        f"- Programmer un check-in J+7 : le client a-t-il upgrade en Pro Plus ?\n\n"
        f"**🚨 Escalade humaine ?**\n"
        f"- NON — confidence 91%, match KB clair, pas de signal churn. Reponse mise en file d'envoi. Flag pour revue humaine seulement si le client repond negativement."
    )
