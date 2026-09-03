# KAMER CINÉ TALENTS MANAGER — Web

Portail web d'administration du programme de formation aux métiers du cinéma.

## Stack

- **React 19** + **Vite 8**
- **Tailwind CSS v4** (via `@tailwindcss/vite`)
- **React Router** (routing)
- **Axios** (client API centralisé)

## Structure — Package-by-feature

```
src/
├── App.tsx                    # Router racine
├── main.tsx                   # Point d'entrée
├── index.css                  # Tailwind + palette KCT
├── shared/
│   └── api/
│       └── apiClient.ts       # Instance axios centralisée (JWT, intercepteurs)
└── modules/
    ├── auth/                  # Module M1 — Authentification
    │   ├── components/        # Composants UI (LoginScreen)
    │   ├── hooks/             # Hooks React (useAuth)
    │   ├── services/          # Appels API (authService)
    │   └── types.ts           # Types TypeScript
    ├── territoire/            # Module M2 — Territoire
    │   ├── components/
    │   ├── hooks/
    │   ├── services/
    │   └── types.ts
    ├── formation/             # Module M3 — Formation
    │   ├── components/
    │   ├── hooks/
    │   ├── services/
    │   └── types.ts
    └── pilotage/              # Module M4 — Tableau de bord
        ├── components/
        ├── hooks/
        ├── services/
        └── types.ts
```

## Palette de couleurs

| Couleur | Hex       | Usage Tailwind       |
|---------|-----------|----------------------|
| Or      | `#B8860B` | `bg-kct-gold`        |
| Noir    | `#1A1A1A` | `text-kct-noir`      |
| Beige   | `#F5F0E1` | `bg-kct-beige`       |
| Vert    | `#3F9142` | `text-kct-green`     |
| Jaune   | `#C9A227` | `text-kct-yellow`    |
| Rouge   | `#C0392B` | `text-kct-red`       |

## Règles de structure

- **Jamais de logique métier dans un composant** : les composants ne font que de l'affichage.
- **Un service par module** : tous les appels API passent par `apiClient.ts`.
- **Un hook par préoccupation** : les hooks encapsulent l'état et les effets.
- **Types par module** : chaque module définit ses propres interfaces TypeScript.

## Démarrage

```bash
npm install
npm run dev
```
