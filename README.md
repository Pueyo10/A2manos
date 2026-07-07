# A2manos

Landing page para **A2manos** — Pedro Leal Sà.
Reformas integrales, carpintería de aluminio, cerramientos y servicio técnico.

## Stack

Sitio estático, sin build. HTML + CSS + JS vanilla.

- `index.html` — estructura y contenido
- `legal.html` — aviso legal, política de privacidad y cookies
- `styles.css` — diseño (gris carbón + naranja, tipografía Archivo / Space Grotesk)
- `main.js` — smooth scroll (Lenis), reveals al scroll, contadores, marquee, botones magnéticos, menú móvil, formulario con envío real
- `fonts/` + `fonts.css` + `lenis.min.js` — fuentes y scripts auto-alojados (sin CDNs de terceros, sin cookies)

## Uso

Abre `index.html` en el navegador. No necesita servidor.

## Formulario

Envía de verdad vía [FormSubmit](https://formsubmit.co) (AJAX) a `a2manospedrosa@gmail.com`; requiere activación única desde el correo de FormSubmit. Si el envío falla, cae a `mailto` como respaldo. Incluye honeypot anti-spam y casilla de consentimiento RGPD.

## Personalizar

- **Fotos de proyectos:** sustituye el `background` de cada `.tile__img` en `styles.css` por `background-image:url(...)` con fotos reales.
- **Contacto:** teléfono, email y WhatsApp están en `index.html` (busca `623067554` / `a2manospedrosa@gmail.com`).
- **Aviso legal:** completar NIF y domicilio en `legal.html` (marcados como pendientes).

## Contacto

- Tel: 623 067 554
- Email: a2manospedrosa@gmail.com
