// Privacy policy (GDPR arts. 13 and 9). Plain language, no legalese for its own sake.
// D19: v1 is for family and friends; a legal review is due before opening it to the public.

export const CONTACTO_PRIVACIDAD = 'privacidad@korokota.com'
export const ACTUALIZADA = '1 de noviembre de 2026'

export const SECCIONES: { titulo: string; parrafos: string[] }[] = [
  {
    titulo: 'Quién se ocupa de tus datos',
    parrafos: [
      `Gimme Gold es un proyecto personal de Alex Rios. Para cualquier cosa sobre tus datos, escribe a ${CONTACTO_PRIVACIDAD}.`,
    ],
  },
  {
    titulo: 'Qué datos guardamos',
    parrafos: [
      'Tu email, para que puedas entrar con un código.',
      'Tus datos de salud: las fechas de tus reglas, las notas que escribas, la duración habitual de tu ciclo y si tomas anticonceptivos hormonales.',
      'Si compartes un enlace con tu pareja, guardamos una huella cifrada del enlace (no el enlace en sí), cuándo se creó y cuándo caduca.',
      'Nada más: ni tu nombre, ni tu ubicación, ni analítica de uso, ni publicidad.',
    ],
  },
  {
    titulo: 'Para qué y con qué permiso',
    parrafos: [
      'Solo para calcular tu ciclo, tus fases y tus predicciones, y para enseñarle a tu pareja lo que tú decidas compartir.',
      'Los datos de salud son especialmente protegidos, así que los tratamos únicamente con tu consentimiento explícito, el que das al crear la cuenta. Puedes retirarlo cuando quieras borrando tu cuenta.',
    ],
  },
  {
    titulo: 'Dónde están y quién más los ve',
    parrafos: [
      'Tus datos se guardan en Supabase, en servidores de Frankfurt (Unión Europea). Cada usuaria solo puede leer y escribir los suyos.',
      'Los emails con el código los envía Resend desde la Unión Europea; solo conoce tu dirección de email.',
      'La web se sirve desde Vercel, que no guarda tus datos de salud.',
      'Tu pareja, si le compartes el enlace, solo ve tu fase de hoy, planes y los próximos días. Nunca ve tu ventana fértil, tus notas, tu historial ni si se te retrasa la regla.',
      'No vendemos ni cedemos tus datos a nadie.',
    ],
  },
  {
    titulo: 'Cuánto tiempo',
    parrafos: ['Mientras tengas la cuenta. Si la borras, se borran al momento tu cuenta, tus reglas, tus notas y los enlaces de pareja.'],
  },
  {
    titulo: 'Tus derechos',
    parrafos: [
      'Desde Ajustes puedes descargar todos tus datos, corregirlos en el historial y borrar tu cuenta con todo lo que contiene.',
      `Para cualquier otro derecho (acceso, rectificación, supresión, limitación, oposición o portabilidad), escribe a ${CONTACTO_PRIVACIDAD}. Si no te convence la respuesta, puedes reclamar ante la Agencia Española de Protección de Datos (aepd.es).`,
    ],
  },
  {
    titulo: 'En tu navegador',
    parrafos: [
      'No usamos cookies. El navegador guarda tu sesión para que no tengas que pedir un código cada vez; se borra al cerrar sesión.',
    ],
  },
  {
    titulo: 'Importante',
    parrafos: [
      'Gimme Gold no es un método anticonceptivo ni da diagnósticos médicos. Las fases y predicciones son estimaciones.',
    ],
  },
]
