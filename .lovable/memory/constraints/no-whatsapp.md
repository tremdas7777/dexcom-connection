---
name: Sem WhatsApp no site
description: Botão e link de WhatsApp devem permanecer ocultos no site por padrão; ativação só via admin se explicitamente solicitada.
type: constraint
---
**Proibido:** exibir botão, link ou número de WhatsApp no Footer, Contato ou outras páginas sem autorização explícita do usuário.

**Por que:** o usuário solicitou remoção do botão de WhatsApp da loja.

**Como aplicar:**
- `site_settings.whatsapp_enabled` deve ter default `false`.
- Fallbacks em `Footer.tsx` e `contato.tsx` devem ser `?? false`.
- O toggle no `/admin` pode permanecer, mas desligado por padrão.
