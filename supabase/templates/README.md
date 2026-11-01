# Plantillas de email (Supabase Auth)

Se pegan a mano en el panel de Supabase: *Authentication → Emails → Templates*.
Las imágenes de Billy se sirven desde `public/email/` en gimme-gold.vercel.app.

| Plantilla de Supabase | Archivo        | Asunto                    | Cuándo llega                    |
|-----------------------|----------------|---------------------------|---------------------------------|
| Confirm signup        | `alta.html`    | Tu código de Gimme Gold   | Primera vez que entra un email  |
| Magic Link            | `entrada.html` | Tu código de Gimme Gold   | Las siguientes veces            |

El asunto no menciona nada del ciclo: se ve en la pantalla de bloqueo.
El código caduca en una hora (valor por defecto de Supabase, `Email OTP Expiration` = 3600 s).
