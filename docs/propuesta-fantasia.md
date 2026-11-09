# Propuesta: más fantasía en Gimme Gold

> Análisis de diseño hecho el 8 de noviembre de 2026 sobre la rama `v2`, mirando el código y la app
> en un viewport de móvil (375 px) en las cinco situaciones de Hoy (recarga, Poder 1, Manifestación,
> Poder 2, Mimos), más Plan y Aprender. Alex decide qué entra y en qué orden.
>
> **Estado (8 de noviembre de 2026):** implementado al completo en la PR #15, en el orden de la sección 5.
> En desarrollo, `?celebrar=1` en la URL fuerza todas las celebraciones.
>
> **Cambio del 9 de noviembre de 2026 (II):** una fiesta por fase, todas con la mecánica de la purpurina:
> estrellas y «z» que suben despacio en Recarga, rayos en Poder 1, purpurina en Manifestación, pepinos en
> Poder 2 y zarigüeyas haciéndose las muertas cayendo como hojas en Mimos. La pareja recibe una dosis menor.
>
> **Cambio del 9 de noviembre de 2026:** las usuarias echaban en falta un efecto al entrar en Poder 2 (el
> temblor del hero pasaba desapercibido). Ahora en Poder 2 saltan rodajas de pepino desde abajo de la
> pantalla, como las de Billy en el spa, con la misma mecánica que la purpurina.
>
> **Cambio del 8 de noviembre de 2026:** las usuarias pidieron los efectos en cada apertura de la app, no una
> vez al día. Las celebraciones se recuerdan en memoria mientras la app está abierta (así no se repiten al
> cambiar de pestaña) y vuelven a salir al abrirla de nuevo. El principio 2 queda así matizado.

---

## 1. Diagnóstico en una frase

La app tiene una identidad visual sólida y una voz (Billy) muy fuerte, pero **toda la emoción está
en el texto y en Billy; la interfaz no reacciona nunca**. El único movimiento de la app son los
loops de Billy en `Billy.css`. No hay ni una transición, ni una entrada, ni una celebración, ni un
cambio de estado animado en ningún otro archivo. La dirección visual pide «animaciones cortas y
celebraciones en los momentos clave» (`definicion-funcional.md`, sección 7) y eso está sin hacer.

## 2. Lo que ya funciona (no tocar)

- **Sistema de color por fase.** `data-phase` tiñe toda la pantalla con una variable y los cinco
  estados se reconocen al instante. La tarjeta hero amarilla de Manifestación ya «grita» sola.
- **Billy como voz.** Un avatar por fase, bocadillo con rabo que apunta a él, textos con remate.
  La jerarquía hero → bocadillo → dato serio → chips → lo que viene es correcta y se lee de arriba
  abajo sin esfuerzo.
- **Lenguaje de volumen.** Solo lo pulsable tiene borde grueso inferior y se hunde. Es una regla
  clara y está bien aplicada.
- **Salud nunca tapada.** «Dato serio» va en su propia caja, con su color, debajo del chiste.
  Cualquier efecto nuevo tiene que respetar esto (regla fija 1 del documento de humor).

## 3. Dónde falta fantasía (por orden de impacto)

### 3.1 La entrada en Hoy es plana

Abres la app y la pantalla aparece de golpe, igual el día 13 (tu mejor momento) que el día 24
(sofá). El momento de «¡Alerta de purpurina!» se lee, pero no se *ve*. Es la mayor oportunidad.

### 3.2 Los hitos del ciclo pasan sin ceremonia

- **Cambio de fase.** Un día la tarjeta es azul y al siguiente amarilla. Nada marca el salto.
- **Registrar la regla.** El sheet se titula «¡Ciclo nuevo!» y se cierra sin más. Es el único
  gesto activo que ella hace en la app y hoy se siente como guardar un formulario.
- **Fin de la regla.** Pasa de botón a una línea gris «Apuntado». Correcto, pero sin alma.

### 3.3 Billy no responde al tacto

Billy está animado en bucle pero no pasa nada si lo tocas. En una app con mascota, tocar a la
mascota es lo primero que hace cualquiera. Es un *easter egg* gratis.

### 3.4 Transiciones entre pestañas y sheets

Hoy → Plan → Aprender cambian a corte seco. El `Sheet` de la regla aparece sin deslizar (la
clase dice «slides up» pero no hay animación). Son detalles pequeños que, sumados, hacen que la
app se sienta «web» en vez de «app».

### 3.5 Pequeñas fricciones de jerarquía

- En Hoy, la tarjeta azul «Llévame en el bolsillo» pesa tanto como el botón principal
  «Me ha venido la regla» y queda pegada a él. Compite con la acción más importante.
- En Plan, hay que pasar título, botón, siete chips, leyenda y botón «Ver octubre» antes de ver
  el calendario. El calendario es el contenido; lo demás son controles.
- Los días 🔥 y ★ del calendario son el único «premio» visual de Plan y van en emoji; pierden
  fuerza al lado de un sistema tan dibujado.

## 4. Propuesta

Principios para todo lo que sigue:

1. **El efecto acompaña al contenido, nunca lo tapa.** Partículas detrás del texto o fuera de las
   cajas de salud, nunca encima de «Dato serio» ni de los avisos.
2. **Una vez por hito, no cada vez que abres.** Las celebraciones se disparan al entrar en una fase
   o al registrar algo, y se recuerdan en `localStorage` (clave `cycleStart + fase`), como ya hace
   `Instalar.tsx` con su cierre.
3. **Corto.** Entre 1,5 y 3 segundos. Si hay que esperar a que termine, sobra.
4. **`prefers-reduced-motion` lo apaga todo.** El proyecto ya lo hace con Billy; se extiende.
5. **Solo CSS y SVG, cero dependencias.** Encaja con el repo (nada de librerías de UI) y pesa cero.

### 4.1 Alerta de purpurina (Manifestación) · lo que pediste

**Qué:** al entrar en Hoy en fase Manifestación, lluvia de purpurina dorada a pantalla completa
durante ~2,5 s. Partículas pequeñas (cuadrados, rombos y estrellitas de 4 a 8 px) en tres tonos:
`--manifestacion` (#ffc800), su edge (#e0a800) y blanco, con un poco de giro y caída con `ease-in`.
Capa `position: fixed; pointer-events: none; z-index` por encima de todo, que se desmonta al
terminar. Densidad: 60–80 partículas; en móvil es suficiente y no cuesta frames.

**Cuándo:** la primera vez que abre la app cada día de Manifestación (no solo el primer día de la
fase: es su semana buena y merece la purpurina cada mañana). El resto de aperturas del mismo
día, nada. Con `prefers-reduced-motion`, nada.

**Remate con Billy:** en el hero, Billy bailando recibe un `scale(1.08)` de 300 ms al terminar la
lluvia, y el bocadillo entra 150 ms después que el hero (ver 4.3). Así la purpurina «presenta»
el texto en vez de competir con él.

**Variante para la pareja:** en `/pareja/:token`, el mismo día, una versión reducida (20
partículas, 1,5 s): él también tiene que enterarse de que «esto se anima».

### 4.2 Una celebración por fase, con el carácter de cada una

La purpurina solo tiene sentido en Manifestación. Si todas las fases brillaran, ninguna lo haría.
Cada fase tiene su propio efecto de entrada, discreto, de 1,5 a 2 s, el primer día de la fase:

| Fase | Efecto de entrada | Por qué |
|---|---|---|
| Recarga (regla) | La pantalla se atenúa un instante y vuelve, como bajar la luz; 3 «zzz» suben desde Billy meditando. | Modo recarga: calma, no fiesta. |
| Poder 1 | El hero azul entra con un rebote y Billy levanta las pesas una vez con fuerza (ya tiene la animación `billy-lift`). | Vuelve la energía. |
| Manifestación | Purpurina (4.1). | Alerta de purpurina. |
| Poder 2 | Un ligero temblor del hero (200 ms) y a Billy le cae la gota de sudor, una sola vez. | «Bajón a la vista». |
| Mimos | Billy se desploma: la silueta de «haciéndose el muerto» cae desde arriba con `ease-out` y rebota una vez; corazones pequeños suben. | Se hace el muerto, pero con cariño. |

Todo esto es CSS sobre lo que ya existe en `Billy.css`.

### 4.3 Entrada de la pantalla Hoy (siempre, no solo en hitos)

Aunque no toque celebración, la pantalla puede «llegar»: hero, bocadillo, dato serio y chips
entran escalonados (`translateY(8px)` + opacidad, 220 ms cada uno, 60 ms de retardo entre ellos).
Es la animación más barata y la que más sensación de app da. Un solo `@keyframes` y
`animation-delay` por orden.

### 4.4 «¡Ciclo nuevo!» cuando registra la regla

Al guardar «Me ha venido la regla»: el sheet se cierra y, en Hoy, el hero cambia a azul con un
barrido de color de izquierda a derecha (300 ms) en vez de aparecer ya azul. Billy pasa a
meditando con un pequeño fundido y aparece una línea efímera bajo el hero, 3 s, que se va sola:
«Apuntado. Ciclo nuevo, cuenta a cero.» Sin confeti aquí: la regla es recarga, no fiesta
(coherente con la decisión de que Billy medita y no llora).

### 4.5 Billy responde al tacto

Tocar a Billy en cualquier pantalla dispara un gesto corto según su estado:

- bailando: una vuelta completa (`rotate(360deg)`, 500 ms);
- pesas: dos levantamientos rápidos;
- meditando: el aura se expande y vuelve;
- spa: sube el vapor y guiña el ojo (cerrar un ojo 150 ms);
- muerto: la lengua y una pata se mueven un instante… y se vuelve a quedar quieto;
- `alerta` / `normal` (login, compartir): parpadeo.

Sin texto ni toast; es solo un guiño. En Android, `navigator.vibrate(10)` al tocarlo. En iOS no hay
vibración desde web, así que no se promete.

### 4.6 Transiciones de navegación y sheets

- Pestañas: el contenido de la pestaña nueva entra con opacidad 150 ms. Con `view-transition`
  (`document.startViewTransition`) donde exista, y sin nada donde no. Es una línea por cambio de
  ruta y no bloquea.
- `Sheet`: deslizar desde abajo 240 ms `ease-out` al abrir y 180 ms al cerrar; el fondo oscuro
  hace fundido. En escritorio, escala 0,96 → 1 en vez de deslizar.
- Botones `.btn`: ya se hunden al pulsar. Falta un `transition: transform 80ms` para que el hundido
  no sea un salto.

### 4.7 Plan: el calendario como protagonista

- El 🔥 y la ★ en emoji se sustituyen por los mismos iconos en SVG (una llama y una estrella de la
  familia de trazos gruesos de la app) para que no desentonen. La llama puede llevar la animación
  `billy-flame` que ya existe.
- Al pulsar un objetivo («¿Cuándo me conviene…?»), los días ★ aparecen con un pequeño
  `scale(0.6 → 1)` escalonado por fecha: se ve «dónde» caen sin tener que buscarlos.
- La respuesta del objetivo (`plan__answer`) entra deslizando desde arriba en vez de aparecer.

### 4.8 Detalles de app instalada

- `theme-color` dinámico según la fase del día: la barra del sistema (en Android) toma el color
  del hero. Un `meta` que se actualiza desde `CicloScreen`. En iOS afecta al borde superior en
  modo standalone.
- La pantalla «Despertando a Billy…» puede llevar a Billy haciéndose el muerto *y despertando*:
  un ojo que se abre a los 800 ms. Dos segundos de carga dejan de ser dos segundos muertos.

### 4.9 Jerarquía (sin animación, pero cuenta)

- La tarjeta «Llévame en el bolsillo» pasa a una fila compacta (icono + título + «Cómo») y se
  separa del botón principal con más aire, o baja debajo del botón. El botón de la regla debe ser
  lo último y lo más rotundo.
- En Plan, «¿Cómo estaré tal día?» y los chips de objetivo pueden ir en una sección plegable
  («Planificar algo») y el calendario sube al primer scroll.

## 5. Orden sugerido

Cada paso es una PR pequeña y se puede parar donde se quiera:

1. **Purpurina en Manifestación** (4.1) + utilidad «celebrar una vez por día y por hito»
   (localStorage) + respeto a `prefers-reduced-motion`. Es lo que pediste y la prueba de concepto
   del resto.
2. **Entrada escalonada de Hoy** (4.3) y **transiciones de Sheet y botones** (4.6). Lo que más
   cambia la sensación general por menos código.
3. **Billy responde al tacto** (4.5). Un `onClick` y seis animaciones cortas.
4. **Celebración por fase** (4.2) y **ciclo nuevo** (4.4).
5. **Plan** (4.7) y **jerarquía** (4.9).
6. **Detalles de app instalada** (4.8).

## 6. Lo que no haría

- **Sonido.** Una app de ciclo se abre en la oficina y en el metro. Si algún día entra, apagado
  por defecto y con ajuste explícito.
- **Confeti en todas partes.** Celebrar todo es no celebrar nada; la purpurina es de Manifestación.
- **Librerías de partículas o de animación.** El repo no tiene dependencias de UI y 80 partículas en
  CSS van sobradas.
- **Efectos sobre «Dato serio» o los avisos.** Nunca.
