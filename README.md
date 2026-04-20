# 🫒 Calixto — Origen & Sabor

Tienda de aceite de oliva gourmet construida con **Next.js 15**, **TypeScript**, **Tailwind CSS**, **Zustand** y **Firebase**.

---

## Stack

| Tecnología       | Uso                                    |
|------------------|----------------------------------------|
| Next.js 15       | Framework (App Router + Server Components) |
| TypeScript       | Tipado estático                        |
| Tailwind CSS     | Estilos utilitarios con tokens propios |
| Zustand          | Estado global del carrito y auth       |
| Firebase 11      | Firestore · Auth · Storage             |
| react-hot-toast  | Notificaciones                         |
| lucide-react     | Íconos                                 |

---

## Estructura del proyecto

```
src/
├── app/
│   ├── layout.tsx            # Layout raíz (Header, CartDrawer, Toaster)
│   ├── page.tsx              # Home / Landing
│   ├── globals.css           # Estilos globales + tokens
│   ├── checkout/
│   │   └── page.tsx          # Página de checkout
│   ├── orden-confirmada/
│   │   └── page.tsx          # Confirmación de orden
│   └── shop/
│       ├── productos/page.tsx # Listado con filtros por categoría
│       └── producto/[slug]/page.tsx  # Detalle de producto
│
├── components/
│   ├── layout/
│   │   ├── Header.tsx        # Sticky header con nav y carrito
│   │   ├── Footer.tsx        # Footer
│   │   └── AuthProvider.tsx  # Provider que inicia listener de Firebase Auth
│   ├── cart/
│   │   └── CartDrawer.tsx    # Panel lateral del carrito
│   └── product/
│       ├── ProductCard.tsx   # Card de producto
│       └── AddToCartButton.tsx  # Botón "agregar" para página de detalle
│
├── lib/
│   ├── firebase.ts           # Inicialización Firebase (app, db, auth, storage)
│   ├── firestore.ts          # CRUD: productos, órdenes
│   ├── auth.ts               # register, login, Google, signOut
│   └── utils.ts              # cn(), formatPrice(), slugify(), shipping utils
│
├── store/
│   ├── cartStore.ts          # Zustand: carrito persistido en localStorage
│   └── authStore.ts          # Zustand: usuario autenticado
│
├── hooks/
│   └── useAuth.ts            # Hook que sincroniza Firebase Auth con Zustand
│
└── types/
    └── index.ts              # Product, CartItem, Order, User, etc.
```

---

## Inicio rápido

### 1. Instalá dependencias

```bash
npm install
```

### 2. Configurá Firebase

1. Creá un proyecto en [console.firebase.google.com](https://console.firebase.google.com)
2. Habilitá **Firestore**, **Authentication** (Email/Password + Google) y **Storage**
3. Copiá las credenciales de tu app web

```bash
cp .env.local.example .env.local
# Completá los valores en .env.local
```

### 3. Reglas de Firestore recomendadas

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Productos: lectura pública, escritura solo admin
    match /products/{id} {
      allow read;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
    // Órdenes: solo el dueño puede ver/crear
    match /orders/{id} {
      allow create: if request.auth != null;
      allow read:   if request.auth != null && request.auth.uid == resource.data.userId;
    }
    // Usuarios: solo pueden leer/escribir su propio perfil
    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

### 4. Estructura de un documento `products` en Firestore

```json
{
  "name":        "Virgen Extra Mediterráneo",
  "slug":        "virgen-extra-mediterraneo",
  "category":    "aceites",
  "description": "Primera prensada en frío...",
  "shortDesc":   "Acidez 0,3% · 500ml",
  "price":       8500,
  "oldPrice":    null,
  "images":      ["https://firebasestorage.../imagen.jpg"],
  "badge":       "Más vendido",
  "stock":       50,
  "featured":    true,
  "volume":      "500ml",
  "origin":      "San Juan, Argentina",
  "acidity":     "0,3%",
  "tags":        ["virgen extra", "mediterraneo"],
  "createdAt":   "2024-01-01T00:00:00Z"
}
```

### 5. Corré el servidor de desarrollo

```bash
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000)

---

## Categorías de productos

| Slug        | Label             |
|-------------|-------------------|
| aceites     | Aceite de Oliva   |
| varietales  | Varietal          |
| acetos      | Aceto             |
| aceitunas   | Aceitunas         |
| especiales  | Especiales Gourmet|

---

## Rutas disponibles

| Ruta                       | Descripción                    |
|----------------------------|--------------------------------|
| `/`                        | Landing / Home                 |
| `/productos`               | Listado de productos           |
| `/productos?categoria=X`   | Filtrado por categoría         |
| `/producto/[slug]`         | Detalle de producto            |
| `/checkout`                | Formulario de checkout         |
| `/orden-confirmada`        | Confirmación de pedido         |
| `/login`                   | (próxima página a crear)       |
| `/cuenta`                  | (próxima página a crear)       |

---

## Próximos pasos sugeridos

- [ ] Página de login/registro
- [ ] Dashboard de cuenta del usuario con historial de órdenes
- [ ] Integración con MercadoPago
- [ ] Panel de admin para gestionar productos
- [ ] Búsqueda de productos
- [ ] Wishlist / favoritos
- [ ] Emails transaccionales con Resend
