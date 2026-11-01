# Gimme Gold: definición funcional

> Documento vivo. Última actualización: 1 de noviembre de 2026.
> Estado: borrador. Las secciones marcadas **Pendiente** aún no están decididas.

## 1. Qué es

Gimme Gold es una app para entender el propio ciclo menstrual según las cuatro fases de la Dra. Mindy Pelz, y para saber qué conviene hacer en cada momento: comida, ayuno, ejercicio, trabajo y vida social.

Tiene dos públicos:

- **La usuaria**, que registra su ciclo y consulta en qué fase está y qué le viene.
- **Su pareja**, que recibe una vista de solo lectura para entender qué está pasando sin tener que preguntar.

Lo que la diferencia es el tono: **el humor es la base de la app**, no un adorno.

## 2. Decisiones tomadas

| # | Decisión | Implicación principal |
|---|---|---|
| D1 | **Se reconstruye desde cero.** La app actual fue un experimento. | Del código actual solo se reaprovecha el contenido sobre las fases, revisado. |
| D2 | **Primero web, después app nativa con Capacitor.** | Una sola base de código. La versión nativa añade notificaciones, Apple Health, Face ID y widgets. |
| D3 | **Los datos se guardan en servidor, con cuenta de usuaria.** | Exige registro, política de privacidad y cumplimiento del RGPD para datos de salud (ver §9). |
| D4 | **Las usuarias actuales conservan su histórico.** | Al registrarse, la app importa automáticamente lo que haya en el navegador, con su consentimiento (ver §10). |
| D5 | **El humor es la base**: memes y tono, tanto para la usuaria como, sobre todo, en la vista de la pareja. | Escribir el contenido es el trabajo más grande de la app (ver §7). |
| D6 | **Solo en español de España** en la v1. | Cada chiste se escribe una vez. Los textos se guardan aparte del código, por si algún día se añade otro idioma. |
| D7 | **Humor al límite, calibrado por Alex.** | Alex escribe y afina el tono. La única regla fija es que la información de salud nunca queda tapada (ver §7). |
| D8 | **Incluye información de fertilidad y anticoncepción.** | Siempre como estimación. La app no es un método anticonceptivo (ver §8). |
| D9 | ~~Tres pestañas: Ciclo · Registro · Aprender.~~ Sustituida por D16. | |
| D10 | **La pareja no ve la fertilidad.** Su vista sirve para entender cómo está ella y proponer planes que encajen. | El contenido de pareja se escribe como planes y situaciones de convivencia (ver §3). |
| D11 | **Las fases se anclan a la ovulación** estimada (L − 14). | Con 28 días coincide con Pelz; en otros ciclos, lo que cambia es la primera mitad (ver §5). |
| D12 | **Con anticonceptivos hormonales o ciclos irregulares, se muestran las fases con un aviso.** | Con la píldora no se muestra la ventana fértil (ver §8). |
| D13 | **Acceso con código de 6 dígitos por email, Apple y Google.** Sin enlace mágico. | El código funciona igual en la web, en la pantalla de inicio y en la app nativa (ver §9). |
| D14 | **La duración del ciclo es la mediana de los últimos 6 ciclos.** Si es nueva, la que ella indique, o 28 días. | Un ciclo raro no descoloca las fases (ver §5). |
| D15 | **En la v1 solo se registra la regla y una nota libre.** | Síntomas y ánimo quedan para más adelante. Registro pasa a ser solo el historial de reglas (ver §4). |
| D16 | **Dos pestañas: Ciclo · Aprender.** El historial de reglas se abre desde Ciclo. | Si más adelante se registran síntomas y ánimo, Registro puede volver como pestaña (ver §4). |
| D17 | **La mascota es Billy, una zarigüeya dramática.** Viene del chiste de que hay momentos del ciclo en los que lo mejor que puede hacer él es hacerse el muerto, como la zarigüeya. | Coach de supervivencia para él, cómplice para ella. Se combina con fotos reales de zarigüeyas (ver §7). |
| D18 | **Alta inicial en cuatro pasos:** cuenta, última regla, duración del ciclo y anticonceptivos. | Las usuarias actuales importan sus datos y se saltan dos pasos (ver §6). |
| D19 | **La v1 es para familia y amigos.** | Se pueden usar fotos sin licencia por ahora; antes de abrirla al público hay que resolverlo, igual que la revisión legal del RGPD. |
| D20 | **Dirección visual: Gominola**, a tope. | Estilo cercano a Duolingo: blanco, colores saturados, botones con volumen, Nunito en negrita. Lienzo: https://claude.ai/artifact/Gv2z4bavNRCh7KBjktVfqS |
| D21 | **Las fases se llaman Poder 1, Manifestación, Poder 2 y Mimos.** Cada una tiene su color: azul, amarillo, verde y rosa. | Mimos sustituye a *Nurture*. |

## 3. Usuarios

### Usuaria

- Quiere saber en qué fase está hoy y qué le conviene hacer.
- Quiere planificar: "¿cuándo me viene bien una cena importante, un entreno fuerte o un ayuno largo?"
- Quiere un historial que no se pierda.

### Pareja

- No tiene cuenta. Entra con un enlace que le comparte la usuaria.
- La usuaria puede revocar el enlace cuando quiera, y el enlace puede caducar.
- **Objetivo:** ayudar a quien convive con ella a entender cómo está según su ciclo hormonal, y facilitar la comunicación y la convivencia.
- **Qué ve:** cómo está ella hoy y planes concretos que encajan con su momento. Por ejemplo, "hoy es buen día para salir a cenar" o "hoy toca plan en casa con manta y series". También ve qué viene en los próximos días.
- **No ve la ventana fértil** ni ninguna información de fertilidad.

## 4. Arquitectura de información

**Pestañas (D16):**

1. **Ciclo.** Arriba, el día de hoy: fase, cómo te sientes probablemente y qué te conviene. Debajo, el ciclo proyectado hacia delante, mostrando la incertidumbre de la predicción. Desde aquí:
   - Se puede preguntar al revés: "¿cuándo me conviene hacer X?"
   - Hay un acceso directo para registrar la regla.
   - Se abre el **historial de reglas**. Es la única fuente de verdad: la fase actual se calcula a partir de él.
2. **Aprender.** Las fases explicadas en profundidad.

**Fuera de las pestañas:**

- Ajustes
- Vista de pareja, en su propia ruta y accesible mediante enlace
- Alta inicial, como un flujo de varios pasos


## 5. Modelo de ciclo

**Fuente:** episodio E256 de The Diary of a CEO (15 de junio de 2023), a partir del minuto 01:09:59. La investigación completa está en [`docs/research/mindy-pelz-doac-ciclo.md`](research/mindy-pelz-doac-ciclo.md).

**Lo que dice Pelz:** cuenta días fijos desde el primer día de regla, pensando en ciclos de 28 a 32 días.

| Fase | Días (ciclo de 28) | Resumen |
|---|---|---|
| Power 1 | 1–10 | El estrógeno sube. Los días 1–2 conviene darle espacio. Mejor momento para resolver conflictos (días 2–12). |
| Manifestation | 11–15 | Ovulación hacia el día 12–13. Libido y creatividad en su punto más alto. |
| Power 2 | 16–19 | Bajón hormonal pasado el día 15. Evitar conflictos los días 18–19. |
| Nurture | 20–28 | Semana antes de la regla: ni ayuno ni ejercicio intenso, más descanso, más hidratos. |

**Decisión: las fases se anclan a la ovulación.**

La ovulación se estima en el día **O = L − 14**, donde L es la duración del ciclo. A partir de ahí, las fases son:

| Fase | Días | L = 24 | L = 28 | L = 35 |
|---|---|---|---|---|
| Power 1 | 1 … O−4 | 1–6 | 1–10 | 1–17 |
| Manifestation | O−3 … O+1 | 7–11 | 11–15 | 18–22 |
| Power 2 | O+2 … O+5 | 12–15 | 16–19 | 23–26 |
| Nurture | O+6 … L | 16–24 | 20–28 | 27–35 |

- Con L = 28 sale exactamente el modelo de Pelz.
- La segunda mitad del ciclo dura lo mismo en todos los casos, y lo que cambia es la primera mitad. Así es como funciona la biología.
  - Con días fijos, en un ciclo de 35 días Nurture duraría 16 días, y en uno de 24 se quedaría en 5.
- La **ventana fértil** (O−5 … O+1) se calcula aparte de las fases. No coincide con Manifestation.
- Las predicciones se muestran siempre como estimación.

**Contenido a no repetir en la app:** Pelz dice que en España hay 3 días de baja menstrual sin preguntas. Es falso: la Ley Orgánica 1/2023 cubre la regla incapacitante con baja médica. La lista completa de afirmaciones dudosas está en la investigación.

**Decisión: cómo se calcula la duración del ciclo (D14).**

- **Usuaria nueva:** indica su duración habitual al darse de alta. Si no la sabe, se usan 28 días.
- **Con historial:** mediana de los últimos 6 ciclos. La mediana evita que un ciclo raro descoloque las fases.
- **Ciclos de menos de 21 días o más de 45:** antes de contarlos, la app pregunta si se olvidó registrar una regla.
- **Margen de error:** cuanto más varían sus ciclos, más ancho se muestra el margen en la predicción. Si la diferencia entre ciclos pasa de unos 7 a 9 días, se activa el aviso de ciclo irregular (D12).

**Pendiente:**

- **Texto del aviso** para anticonceptivos hormonales: se indica al darse de alta.
- **Diseño visual de la incertidumbre** en la proyección del ciclo.

## 6. Funcionalidades de la v1 (borrador)

| Funcionalidad | Estado |
|---|---|
| Registro y acceso: código por email, Apple y Google | Decidido |
| Alta inicial en cuatro pasos, con Billy presentándose (D18): 1) cuenta; 2) fecha de la última regla; 3) duración habitual del ciclo, o "No lo sé" (28 días); 4) si toma anticonceptivos hormonales. Si hay datos de la app actual, se importan tras el paso 1 y se saltan el 2 y el 3. | Decidido |
| Importar los datos del navegador de la app actual | Decidido |
| Registrar el inicio de la regla | Decidido |
| Ver la fase de hoy y sus recomendaciones | Decidido |
| Ver el ciclo proyectado | Decidido |
| Preguntar "¿cuándo me conviene X?" | Decidido |
| Ventana fértil estimada | Decidido (ver §8) |
| Contenido para aprender sobre las fases | Decidido |
| Vista de pareja con enlace revocable | Decidido |
| Exportar y borrar todos los datos | Obligatorio por el RGPD |
| Registrar inicio de la regla, fin opcional y una nota libre | Decidido (D15) |
| Registrar síntomas, ánimo, etc. | Fuera de la v1 |
| Notificaciones | **Pendiente**; probablemente solo en la versión nativa |
| Integración con Apple Health | **Pendiente**; fuera de la web |

## 7. Humor

**El tono lo calibra Alex.** Quién es el blanco del chiste y hasta dónde llega se decide caso por caso al escribir, no con reglas fijadas de antemano. Puede serlo también, a veces, la propia usuaria.

**Reglas fijas:**

1. **La información de salud nunca queda tapada.** El chiste acompaña al dato, no lo sustituye. Sobre todo en fertilidad.
2. **Memes propios.** No se usan plantillas ni imágenes con derechos de terceros. Hay que revisar el origen de las imágenes actuales `bomb-squad.jpeg` y `play-dead-animal.jpeg`.
3. **Español de España.** El humor es local y no tiene que funcionar en otros países.

**Pendiente:**

- ¿Hay que poder bajar el tono en momentos delicados, como dolor fuerte, una pérdida o la búsqueda de embarazo? ¿Lo ajusta la usuaria o la app?
- ¿Cuánto contenido distinto hace falta para que no se repita? Por ejemplo, N frases por fase y por día.

### Dirección visual

**Referencia: el look & feel de Duolingo.** Se toma como inspiración, no como copia: ni su búho, ni su verde, ni su tipografía.

Lo que se toma:

- Colores planos y saturados, con mucho contraste.
- Formas redondeadas y gruesas.
- Botones con volumen que se hunden al pulsarlos.
- Tipografía redondeada y en negrita. La de Duolingo, Feather, es propia; alternativas libres: Nunito, Fredoka, Baloo 2.
- Animaciones cortas y celebraciones en los momentos clave.
- Una mascota con personalidad que hace de voz de la app. Las notificaciones pasadas de rosca de Duolingo encajan con el humor al límite.

**Mascota: Billy, la zarigüeya (D17).** La zarigüeya se hace la muerta para que no se la coman, y hay momentos del ciclo en los que lo mejor que puede hacer él es eso mismo.

- **Personalidad:** dramática.
- **Papel:** coach de supervivencia para él y cómplice para ella.
- **Personaje ilustrado y fotos reales combinados.** Se mantiene `play-dead-animal.jpeg`, una zarigüeya de verdad haciéndose la muerta, y se añadirán más fotos reales.
  - Mientras la app sea solo para familia y amigos, se usan las fotos sin revisar la licencia. **Antes de abrirla al público, hay que sustituirlas o licenciarlas.**
- **Primeros textos:** [`docs/textos-billy.md`](textos-billy.md).
- **Idea por validar:** Billy cambia de estado según la fase. Por ejemplo, de fiesta en Manifestation, alerta en Power 2 y haciéndose el muerto en los días de riesgo.

## 8. Fertilidad y anticoncepción

- La app muestra la **ventana fértil estimada** y el día probable de ovulación.
- Lo presenta **siempre como estimación**. Nunca habla de "días seguros".
- Avisa de forma clara y visible de que **la app no es un método anticonceptivo**.
  - Una app que se presenta como anticonceptiva es un producto sanitario que necesita certificación CE, como Natural Cycles. Queda fuera de alcance.
- Con anticonceptivos hormonales no hay ovulación natural. La app muestra las fases igualmente, con un aviso visible de que en su caso no reflejan su biología (D12). La ventana fértil no se muestra.
- **Solo la ve la usuaria.** La vista de pareja no muestra información de fertilidad.
- La app actual marca como "no fértiles" las fases Power 1, Power 2 y Nurture. Es incorrecto y peligroso: en ciclos cortos, la ventana fértil puede empezar hacia el día 6–9. No se reutiliza.

## 9. Cuentas, datos y privacidad

- **Proveedor recomendado:** Supabase, con servidores en Frankfurt. Ofrece base de datos y autenticación, y los datos se alojan en la UE.
- **Acceso (D13):** código de un solo uso por email, Apple y Google.
  - Se usa código en lugar de enlace porque el enlace se abre en Safari. Si la usuaria usa la app desde la pantalla de inicio o la versión nativa, la sesión se iniciaría en el sitio equivocado.
  - Si se ofrece Google en iOS, Apple obliga a ofrecer también "Iniciar sesión con Apple".
- **RGPD:** los datos menstruales son datos de salud, una categoría especial (art. 9). Esto exige:
  - Consentimiento explícito
  - Política de privacidad
  - Contratos de encargo de tratamiento con los proveedores
  - Que la usuaria pueda exportar y borrar todos sus datos
- **Recomendación:** que lo revise un abogado antes del lanzamiento.
- **Pendiente:** si hay analítica de uso y, en ese caso, cuál. Tiene que respetar la privacidad.

## 10. Migración de usuarias actuales

- La app actual guarda los datos en el navegador de cada usuaria. Solo se pueden leer desde el mismo dominio, así que la app nueva **tiene que seguir en `gimme-gold.vercel.app`**.
- Al registrarse, la app detecta los datos antiguos, pide permiso y los importa a la cuenta.
- **Red de seguridad:** el banner de exportación ya está en producción. El formato del archivo exportado (`gimme-gold-export`, versión 1) también debe poder importarse.
- Las usuarias que usaban la app en inglés pasarán a verla en español.

## 11. Preguntas abiertas, por orden de importancia

1. Cómo se baja el tono en momentos delicados (§7).
2. Notificaciones.
3. Analítica y métricas de éxito: ¿cómo sabremos que la app funciona?

## 12. Fuera de alcance en la v1

- Otros idiomas
- Registro de síntomas y ánimo
- Uso como método anticonceptivo
- Diagnóstico médico de cualquier tipo
