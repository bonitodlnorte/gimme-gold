# Textos de los avisos (notificaciones): primer borrador

> Borrador para que Alex calibre el tono (D7). Los textos viven en `src/content/avisos.ts`.
> Un aviso enseña una línea de título y dos de cuerpo en la pantalla de bloqueo: cuanto más corto, mejor.
> Los de la pareja no pueden insinuar fertilidad ni un retraso (D10).

## Cómo funcionan

- Cada mañana (a las 9:00 hora de Madrid en verano, 8:00 en invierno) un proceso calcula el **estado de hoy** de cada
  dispositivo apuntado y lo compara con el último que se le notificó. Si cambió, envía. Así nunca se repite un aviso y,
  si ella apunta la regla antes o después de lo previsto, la pareja se entera igual al día siguiente.
- Cuando ella apunta la regla en Hoy, el aviso sale al momento: la app pide al servidor que envíe ya lo que cambió para
  sus dispositivos y los de su pareja, con la misma lógica que el proceso de la mañana (que sigue cubriendo todo lo demás).
- Al activar los avisos se guarda el estado de ese día como «ya notificado»: nadie recibe un aviso de la fase en la que ya estaba.
- Para activarlos hay que tener la app en la pantalla de inicio (en iPhone, el navegador no manda avisos). En la web, Billy
  invita a «activar los avisos», que lleva a instalar; al abrir la app instalada por primera vez, Billy pide el permiso con un toque.
- «Ahora no» lo aplaza dos semanas. Siempre se pueden activar o quitar desde Ajustes (ella) o al pie de su página (la pareja).

## Para ella

| Cuándo | Título | Cuerpo |
|---|---|---|
| Primer día de Manifestación | Entras en Manifestación ✨ | Energía, labia y ganas de todo. Si tienes algo que pedir, negociar o presentar, esta es tu semana. |
| Primer día de Poder 2 | Entras en Poder 2 | Bajan las hormonas y sube el foco. Buena semana para cerrar cosas; menos buena para decidir a lo loco. |
| Primer día de Mimos | Empieza Mimos | Tu cuerpo pide calma, hidratos y agenda ligera. No es pereza, es progesterona. |
| Dos días antes de la regla prevista | La regla llega en unos dos días | Para que te organices: ibuprofeno, lo que necesites en el bolso y pocos planes. Yo ya me estoy haciendo el muerto. |

- No hay aviso de Poder 1: lo empieza ella al apuntar la regla.
- Si la regla se retrasa, no hay segundo aviso ni vuelve a anunciarse Mimos.

## Para la pareja

Uno por estado de su vista, con los mismos titulares que ya conoce.

| Cuándo | Título | Cuerpo |
|---|---|---|
| Días 1–2 | Día de recarga | Le ha venido la regla. Hoy: espacio, manta y cena hecha. Hazte el muerto, pero un muerto útil. |
| Desde el día 3 | Vuelve la energía | Se abre la ventana de las conversaciones pendientes. Es ahora o dentro de tres semanas. Yo que tú, ahora. |
| Manifestación | Está en su mejor momento | Reserva para cenar fuera. Y quítate el chándal, que te he visto. |
| Poder 2 | Bajón hormonal a la vista | Ni el tema del verano, ni el de tu madre, ni el de quién plancha. Yo he hecho testamento esta mañana. |
| Mimos | Semana de mimos | Calma, hidratos y llevarle la razón un poquito más. No es manipulación, es supervivencia. La tuya. |
| Últimos 3 días antes de la regla prevista | Código rojo | Faltan pocos días para la regla. Protocolo zarigüeya: manta, series y lo que ella elija. Chocolate en casa. |

- Si la regla se retrasa, la pareja se queda en Código rojo sin más avisos, igual que su página.

## Pantallas

**Invitación en la web (tarjeta de Billy, donde antes estaba la de instalar)**

- Ella: *Activa los avisos.* Te aviso cuando cambies de fase y dos días antes de la regla. Para eso tengo que vivir en tu pantalla de inicio: añádeme y, al abrirme, te lo pido.
- Pareja: *Que te avise yo.* Un aviso cuando cambie la cosa y otro antes del código rojo, para que no te pille desprevenido. Guárdame en la pantalla de inicio y, al abrirme, te lo pido.

**Primer arranque de la app instalada (hoja de Billy)**

- Ella: *¿Te aviso?* Te mando un aviso cuando cambies de fase y otro dos días antes de la regla, para que te organices. Nada más: ni recordatorios pesados ni mensajes a deshora. → **Sí, avísame** / Ahora no
- Pareja: *¿Te aviso yo?* Te mando un aviso cuando cambie la cosa: cuando vuelve la energía, cuando está en su mejor momento y cuando toca código rojo. Para que no te pille desprevenido. → **Sí, avísame** / Ahora no

## Puesta en marcha

1. Aplicar `supabase/migrations/0003_avisos.sql` y `0004_avisos_params.sql`.
2. Generar las claves VAPID (`npx web-push generate-vapid-keys`) y ponerlas en Vercel junto con `CRON_SECRET`, `VAPID_SUBJECT` y
   `SUPABASE_SERVICE_ROLE_KEY` (ver `.env.example`). La pública también como `VITE_VAPID_PUBLIC_KEY`.
3. Desplegar: el cron de `vercel.json` queda registrado solo.
4. Probar a mano: `curl -H "Authorization: Bearer $CRON_SECRET" https://<dominio>/api/avisos` devuelve cuántos envió.
