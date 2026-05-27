# HelpIQAI — Support client intelligent par IA

> Résoudre 70% des tickets sans humain. Les agents humains traitent ce qui compte vraiment.

[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat&logo=next.js)](https://nextjs.org)
[![Groq](https://img.shields.io/badge/Groq-LLaMA_3.1_70B-FF6B35?style=flat)](https://groq.com)
[![FAISS](https://img.shields.io/badge/FAISS-1.8-blue?style=flat)](https://faiss.ai)

---

## Vue d'ensemble

HelpIQAI est un système de support client hybride IA/humain. Il utilise un pipeline RAG (FAISS + sentence-transformers + Groq LLM) pour répondre automatiquement aux tickets courants depuis la base de connaissances, achemine les tickets complexes vers les agents humains, et suggère des réponses pour accélérer la résolution manuelle.

**Domaine :** Customer Support / AI Automation  
**Port VM :** 3008 | **Sous-domaine :** helpiqai.wikolabs.com

---

## Stack technique

| Couche | Technologie | Rôle |
|--------|------------|------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS | Inbox agents, chat client, analytics |
| Backend | FastAPI (Python 3.11), Uvicorn | API tickets, routing, RAG pipeline |
| RAG | sentence-transformers (all-MiniLM-L6-v2) + FAISS | KB search + context retrieval |
| LLM | Groq (llama-3.1-70b-versatile) | Génération réponses automatiques |
| Reranker | cross-encoder/ms-marco-MiniLM-L-6-v2 | Re-ranking résultats RAG |
| Base de données | PostgreSQL 16 | Tickets, KB articles, conversations |
| Cache | Redis 7 | Session chat, cache embeddings |
| Infra | Docker Compose, Nginx | VM mono-repo (port 3008) |

### backend/requirements.txt
```
fastapi==0.111.0
uvicorn[standard]==0.29.0
groq==0.9.0
sentence-transformers==3.0.1
faiss-cpu==1.8.0
torch==2.3.0
asyncpg==0.29.0
sqlalchemy[asyncio]==2.0.30
redis==5.0.4
pydantic==2.7.1
numpy==1.26.4
```

---

## Architecture mono-repo

```
helpiqai/
├── frontend/
│   ├── src/app/
│   │   ├── page.tsx              # Inbox agents + KPIs support
│   │   ├── chat/                 # Interface chat client (widget)
│   │   ├── tickets/[id]/         # Détail ticket + historique
│   │   └── knowledge-base/       # Gestion articles KB
│   └── src/components/
│       ├── TicketInbox.tsx       # Liste tickets avec priority + status
│       ├── ChatWidget.tsx        # Widget chat client temps réel
│       ├── AiSuggestion.tsx      # Réponse suggérée par IA pour agent
│       ├── KbArticleEditor.tsx   # Éditeur articles base de connaissances
│       └── ResolutionMetrics.tsx # CSAT, FRT, FCR metrics
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── routers/
│   │   │   ├── tickets.py        # CRUD tickets + routing
│   │   │   ├── chat.py           # WebSocket chat
│   │   │   └── kb.py             # CRUD knowledge base
│   │   ├── services/
│   │   │   ├── rag_pipeline.py   # FAISS search + Groq completion
│   │   │   ├── embedder.py       # Sentence-transformers embeddings
│   │   │   ├── router.py         # AI vs human routing decision
│   │   │   └── classifier.py     # Intent classification
│   │   └── models/
│   │       ├── ticket.py
│   │       └── kb_article.py
│   ├── requirements.txt
│   └── Dockerfile
├── docker-compose.yml
└── .github/workflows/deploy.yml
```

---

## Diagrammes UML

### Architecture système

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'primaryColor': '#0f766e', 'primaryTextColor': '#fff', 'primaryBorderColor': '#0d9488', 'lineColor': '#374151', 'secondaryColor': '#f0fdfa'}}}%%
flowchart TB
    subgraph VM["🖥️ VM — Docker Compose (port 3008)"]
        NEXT["Next.js 14\nSupport Dashboard"]
        API["FastAPI + WebSocket"]

        subgraph RAG["🤖 RAG Pipeline"]
            EMB["Sentence-Transformers\nEmbeddings"]
            FAISS["FAISS Index\nKB Articles"]
            RERANK["Cross-Encoder\nReranking"]
            GROQ["Groq LLM\nResponse generation"]
        end

        PG[("PostgreSQL\nTickets + KB")]
        REDIS[("Redis\nSession + Cache")]
    end

    CLIENT["Client"] -- "WebSocket" --> API
    AGENT["Support Agent"] --> NEXT
    API --> RAG
    RAG --> PG
```

### Séquence — Traitement automatique d'un ticket

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'primaryColor': '#0f766e', 'primaryTextColor': '#fff', 'lineColor': '#374151'}}}%%
sequenceDiagram
    participant CLIENT as Client
    participant API as FastAPI
    participant CLASS as Classifier
    participant RAG as RAG Pipeline
    participant GROQ as Groq LLM
    participant AGENT as Human Agent

    CLIENT->>API: POST /tickets {subject: "Reset mot de passe", body: "..."}

    API->>CLASS: classify_intent(ticket)
    CLASS-->>API: intent=password_reset, confidence=0.94, auto_resolve=true

    API->>RAG: search_kb(query="reset mot de passe")
    RAG->>FAISS: similarity_search(embedding, k=5)
    FAISS-->>RAG: top_5_articles
    RAG->>RAG: rerank(query, articles)
    RAG-->>API: best_article={title: "Comment réinitialiser votre mot de passe", content: "..."}

    API->>GROQ: generate_response(ticket, context=article)
    GROQ-->>API: response="Bonjour {name}, pour réinitialiser votre mot de passe, cliquez sur..."

    alt auto_resolve=true AND confidence>0.90
        API-->>CLIENT: auto_response (ticket closed)
    else
        API->>AGENT: suggest_response(ticket, draft=response)
        AGENT->>CLIENT: edited_response (human approved)
    end
```

### Modèle de données (ER)

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'primaryColor': '#0f766e', 'primaryTextColor': '#fff', 'lineColor': '#374151'}}}%%
erDiagram
    TICKET {
        uuid id PK
        string subject
        text body
        string channel
        string intent
        float intent_confidence
        string status
        string resolution_type
        float csat_score
        int first_response_time_s
        timestamp created_at
        timestamp resolved_at
    }
    KB_ARTICLE {
        uuid id PK
        string title
        text content
        string category
        float[] embedding
        int usage_count
        float avg_helpfulness
        timestamp updated_at
    }
    CONVERSATION {
        uuid id PK
        uuid ticket_id FK
        string role
        text content
        boolean is_ai
        timestamp sent_at
    }

    TICKET ||--o{ CONVERSATION : "has"
    KB_ARTICLE }o--o{ TICKET : "resolves"
```

---

## PRD

### Problème
Les équipes support sont débordées par des questions répétitives (réinitialisation mot de passe, statut commande, facturation) qui représentent 60-70% des tickets. Le FRT (First Response Time) est trop long et les agents passent du temps sur des cas qui ne nécessitent pas d'expertise humaine.

### Solution
HelpIQAI résout automatiquement les tickets courants via RAG, et pour les cas complexes, suggère une réponse basée sur la KB pour accélérer l'agent humain. Le routage intelligent classe les tickets par urgence et compétence requise.

### Utilisateurs cibles
| Persona | Besoin |
|---------|--------|
| Support Agent | Réduire le temps de réponse, focus sur les vrais problèmes |
| Support Manager | Taux d'auto-résolution, CSAT, FRT, volume tickets |
| Client | Réponse instantanée 24/7 aux questions fréquentes |

### OKRs
- Taux d'auto-résolution AI > 65%
- FRT (First Response Time) < 2 min (vs 4h sans IA)
- CSAT > 4.2/5

---

## User Stories

```
US-01 [Agent] En tant qu'agent support,
      je veux voir une réponse suggérée par l'IA pour chaque ticket
      afin de répondre en 30 secondes au lieu de 5 minutes.

US-02 [Client] En tant que client,
      je veux obtenir une réponse immédiate à ma question sur le reset de mot de passe
      sans attendre un agent humain.

US-03 [Manager] En tant que manager support,
      je veux voir le taux d'auto-résolution par catégorie de ticket
      afin d'identifier quels types de questions enrichir dans la KB.

US-04 [Admin] En tant qu'admin KB,
      je veux ajouter un article dans la base de connaissances
      et que l'indexation FAISS soit automatique
      afin que le système réponde correctement dès la nuit suivante.

US-05 [Agent] En tant qu'agent,
      je veux voir le score de confiance de la réponse IA
      afin de décider si je la valide ou la réécris avant d'envoyer.
```

---

## Règles métier

| # | Règle | Description | Simulable UI |
|---|-------|-------------|-------------|
| R1 | Auto-resolve threshold | confidence > 0.90 ET intent mappé KB → résolution auto | ✅ Confidence slider |
| R2 | Escalation | confidence < 0.70 OU ticket.tier=Enterprise → human routing | ✅ Escalation toggle |
| R3 | SLA FRT | Tier Gold : 30 min, Silver : 2h, Bronze : 8h | ✅ SLA badge |
| R4 | CSAT survey | Auto-envoyé 1h après résolution ticket | ✅ Survey preview |
| R5 | KB indexation | Nouvel article → re-embedding FAISS < 10 min | ✅ Index status |
| R6 | Fallback | Si RAG ne trouve rien (score < 0.60) → forward human | ✅ Fallback demo |
| R7 | Channel routing | Email → async, Chat → real-time WebSocket | ✅ Channel badge |
| R8 | Tone adaptation | client_tier=Enterprise → tone plus formel | ✅ Tone preview |
| R9 | Multi-language | Détection langue → réponse même langue | ✅ Language toggle |
| R10 | Spam filter | Ticket flaggé spam → auto-close + block | ✅ Spam demo |

---

## Spécification API

**Base URL :** `http://helpiqai.wikolabs.com/api/v1`

### POST /tickets
```json
{"subject": "Impossible de me connecter", "body": "J'ai essayé 3 fois...", "channel": "email", "customer_email": "client@acme.fr"}
// Response: {"ticket_id": "tck_123", "intent": "login_issue", "confidence": 0.87, "auto_resolved": false, "suggested_response": "..."}
```

### POST /kb/articles
```json
{"title": "Réinitialiser son mot de passe", "content": "...", "category": "auth"}
// Response: {"article_id": "kb_xyz", "embedding_status": "indexed"}
```

### GET /metrics
```json
// Response: {"auto_resolution_rate": 0.68, "avg_frt_seconds": 94, "csat_avg": 4.3, "tickets_today": 147}
```

---

## Simulation UI

| Composant | Description |
|-----------|-------------|
| **Ticket Inbox** | Liste tickets avec priority badges, intent classifié, réponse IA disponible |
| **AI Suggestion Box** | Panneau latéral : réponse générée + score confiance + sources KB |
| **Chat Widget** | Demo chat client en temps réel avec réponse IA en streaming |
| **KB Manager** | CRUD articles avec statut indexation FAISS |
| **Resolution Metrics** | Recharts : auto-resolution rate trend, FRT distribution, CSAT |

---

## Déploiement

```yaml
version: "3.9"
services:
  postgres:
    image: postgres:16-alpine
    environment: {POSTGRES_DB: helpiqai, POSTGRES_USER: hi_user, POSTGRES_PASSWORD: "${POSTGRES_PASSWORD}"}
  redis:
    image: redis:7-alpine
  backend:
    build: ./backend
    environment:
      DATABASE_URL: postgresql+asyncpg://hi_user:${POSTGRES_PASSWORD}@postgres/helpiqai
      GROQ_API_KEY: "${GROQ_API_KEY}"
      REDIS_URL: redis://redis:6379
    depends_on: [postgres, redis]
    expose: ["8000"]
  frontend:
    build: ./frontend
    expose: ["3000"]
  nginx:
    image: nginx:alpine
    ports: ["3008:80"]
volumes:
  pg_data:
```

---

## Roadmap

### Phase 1 — MVP
- [ ] RAG pipeline (FAISS + Groq)
- [ ] Ticket inbox agents
- [ ] Intent classification

### Phase 2 — Automation
- [ ] Auto-resolution avec seuil configurable
- [ ] CSAT survey automatique
- [ ] Analytics taux résolution

### Phase 3 — Intelligence
- [ ] Fine-tuning sur conversations résolues
- [ ] Prédiction satisfaction (avant CSAT)
- [ ] Intégration TriageIQ (tickets critiques)

---

*Un produit [Wikolabs](https://wikolabs.com) — Intelligence artificielle appliquée aux métiers*
