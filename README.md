# A2manos

Landing page para **A2manos** — Pedro Leal Sà.
Reformas integrales, carpintería de aluminio, cerramientos y servicio técnico.

## Stack

Sitio estático, sin build. HTML + CSS + JS vanilla.

- `index.html` — estructura y contenido
- `styles.css` — diseño (gris carbón + naranja, tipografía Archivo / Space Grotesk)
- `main.js` — smooth scroll (Lenis), reveals al scroll, contadores, marquee, botones magnéticos, menú móvil, formulario `mailto`

## Uso

Abre `index.html` en el navegador. No necesita servidor.

Fuentes (Google Fonts) y smooth-scroll (Lenis) se cargan por CDN; sin conexión cae a fuentes del sistema y scroll nativo.

## Personalizar

- **Fotos de proyectos:** sustituye el `background` de cada `.tile__img` en `styles.css` por `background-image:url(...)` con fotos reales.
- **Contacto:** teléfono, email y WhatsApp están en `index.html` (busca `623067554` / `lealsapedro@gmail.com`).
- **Envío del formulario:** ahora abre el correo del cliente (`mailto`). Para envío real, conectar a Formspree o un backend.

## Contacto

- Tel: 623 067 554
- Email: lealsapedro@gmail.com
