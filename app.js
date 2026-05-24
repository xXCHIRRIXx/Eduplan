// --- ESTADO Y PARÁMETROS GLOBALES ---
let asignaturas = JSON.parse(localStorage.getItem('eduplan_v4')) || [];
let excepcionesReprogramacion = JSON.parse(localStorage.getItem('eduplan_excepciones')) || [];
let repasosHechosRegistro = JSON.parse(localStorage.getItem('eduplan_hechos')) || [];
let temaColorGuardado = localStorage.getItem('eduplan_tema_color') || '#FAF7F2';

// PERSISTENCIA DE COLOR DE LETRA DEL HEADER
let claseLetraGuardada = localStorage.getItem('eduplan_clase_letra') || 'text-stone-800';
let colorBadgeGuardado = localStorage.getItem('eduplan_color_badge') || '#f43f5e';

// --- ESTADO DE PERFIL PERSONALIZADO POR DEFECTO ---
let perfilUsuario = JSON.parse(localStorage.getItem('eduplan_perfil')) || { nombre: "Usuario", avatar: "🌸" };

const DIAS_SEMANA = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

// --- SELECTORES DE INTERFAZ ---
const formMateria = document.getElementById('formMateria');
const listaMateriasDiv = document.getElementById('listaMaterias');
const gridCalendario = document.getElementById('gridCalendario');
const contenedorDiasCheck = document.getElementById('contenedorDiasCheck');
const inputEscalaMax = document.getElementById('escalaMax');
const inputNotaAprobatoria = document.getElementById('notaAprobatoria');
const cuerpoApp = document.getElementById('cuerpoApp');
const headerApp = document.getElementById('headerApp');
const badgeMarca = document.getElementById('badgeMarca');

// Elementos del menú hamburguesa lateral
const menuLateral = document.getElementById('menuLateral');
const cortinaMenu = document.getElementById('cortinaMenu');

const materiaIdEdicion = document.getElementById('materiaIdEdicion');
const tituloFormulario = document.getElementById('tituloFormulario');
const indicadorEdicion = document.getElementById('indicadorEdicion');
const btnCancelarEdicion = document.getElementById('btnCancelarEdicion');

// Selectores de Perfil
const avatarUsuario = document.getElementById('avatarUsuario');
//const nombreUsuarioDisplay = document.getElementById('nombreUsuarioDisplay');
const saludoTexto = document.getElementById('saludoTexto');
const modalPerfil = document.getElementById('modalPerfil');
const inputNombreUsuario = document.getElementById('inputNombreUsuario');

let emojiSeleccionadoTemporal = "🌸";

// --- ESCUCHADORES DE EVENTOS ---
inputEscalaMax.addEventListener('input', render);
inputNotaAprobatoria.addEventListener('input', render);
btnCancelarEdicion.addEventListener('click', salirModoEdicion);

// --- GESTIÓN DE CONTROL DE MENÚ LATERAL (HAMBURGUESA) ---
function toggleMenuLateral() {
    const estaCerrado = menuLateral.classList.contains('translate-x-full');
    if (estaCerrado) {
        menuLateral.classList.remove('translate-x-full');
        cortinaMenu.classList.remove('hidden');
    } else {
        menuLateral.classList.add('translate-x-full');
        cortinaMenu.classList.add('hidden');
    }
}

// --- GESTIÓN DE SALUDO ADAPTADO CON BIENVENIDA ---
function calcularSaludoCalido() {
    const hora = new Date().getHours();
    if (hora >= 5 && hora < 12) return "¡Buen día y bienvenido/a";
    if (hora >= 12 && hora < 18) return "¡Buena tarde y bienvenido/a";
    return "¡Buena noche y bienvenido/a";
}

function aplicarPerfilDOM() {
    nombreUsuarioDisplay.innerText = perfilUsuario.nombre;
    avatarUsuario.innerText = perfilUsuario.avatar;
    saludoTexto.innerText = calcularSaludoCalido();
    
    // Aplicar estilos de letra guardados al header
    headerApp.className = headerApp.className.replace(/text-\w+-\d+/g, '').replace('text-stone-800', '');
    headerApp.classList.add(claseLetraGuardada);
    badgeMarca.style.backgroundColor = colorBadgeGuardado;
}

function abrirModalPerfil() {
    inputNombreUsuario.value = perfilUsuario.nombre;
    seleccionarEmojiAvatar(perfilUsuario.avatar);
    modalPerfil.classList.remove('hidden');
}

function cerrarModalPerfil() {
    modalPerfil.classList.add('hidden');
}

function seleccionarEmojiAvatar(emoji) {
    emojiSeleccionadoTemporal = emoji;
    const botones = document.querySelectorAll('.btn-avatar');
    botones.forEach(btn => {
        if (btn.innerText === emoji) {
            btn.classList.add('bg-rose-100', 'border-rose-400', 'scale-105', 'font-bold');
        } else {
            btn.classList.remove('bg-rose-100', 'border-rose-400', 'scale-105', 'font-bold');
        }
    });
}

function guardarPerfil() {
    const nuevoNombre = inputNombreUsuario.value.trim();
    if (!nuevoNombre) return alert("Por favor ingresa un nombre para saludarte adecuadamente.");
    
    perfilUsuario.nombre = nuevoNombre;
    perfilUsuario.avatar = emojiSeleccionadoTemporal;
    
    localStorage.setItem('eduplan_perfil', JSON.stringify(perfilUsuario));
    aplicarPerfilDOM();
    cerrarModalPerfil();
}

// --- SELECCIÓN DE COLOR DE FONDO ---
function cambiarFondo(nombreTema, codigoHex) {
    cuerpoApp.style.backgroundColor = codigoHex;
    temaColorGuardado = codigoHex;
    localStorage.setItem('eduplan_tema_color', codigoHex);
}

// --- CAMBIAR DINÁMICAMENTE EL COLOR DE LETRA DEL HEADER ---
function cambiarColorLetra(claseTailwind, colorHexBadge) {
    claseLetraGuardada = claseTailwind;
    colorBadgeGuardado = colorHexBadge;
    
    localStorage.setItem('eduplan_clase_letra', claseTailwind);
    localStorage.setItem('eduplan_color_badge', colorHexBadge);
    
    aplicarPerfilDOM();
}

// --- CONSTRUCTOR DE CHECKBOXES ---
function inicializarCheckboxes() {
    contenedorDiasCheck.innerHTML = "";
    DIAS_SEMANA.forEach(dia => {
        contenedorDiasCheck.innerHTML += `
            <div class="p-2 bg-white rounded-lg border border-stone-100 space-y-2">
                <label class="inline-flex items-center text-xs text-stone-700 font-semibold cursor-pointer">
                    <input type="checkbox" value="${dia}" class="check-dia rounded text-rose-400 focus:ring-rose-300 mr-2" onchange="toggleInputHora('${dia}')">
                    ${dia}
                </label>
                <div id="div-hora-${dia}" class="hidden flex items-center gap-2 pl-2">
                    <div class="flex flex-col">
                        <span class="text-[9px] text-stone-400">De (12h):</span>
                        <input type="time" id="hora-inicio-${dia}" class="bg-stone-50 border border-stone-200 rounded-md p-1 text-[11px] text-stone-700">
                    </div>
                    <div class="flex flex-col">
                        <span class="text-[9px] text-stone-400">A (12h):</span>
                        <input type="time" id="hora-fin-${dia}" class="bg-stone-50 border border-stone-200 rounded-md p-1 text-[11px] text-stone-700">
                    </div>
                </div>
            </div>
        `;
    });
}

function toggleInputHora(dia) {
    const checkbox = document.querySelector(`.check-dia[value="${dia}"]`);
    const divHora = document.getElementById(`div-hora-${dia}`);
    const inputInicio = document.getElementById(`hora-inicio-${dia}`);
    const inputFin = document.getElementById(`hora-fin-${dia}`);

    if (checkbox.checked) {
        divHora.classList.remove('hidden');
        inputInicio.required = true;
        inputFin.required = true;
    } else {
        divHora.classList.add('hidden');
        inputInicio.required = false;
        inputFin.required = false;
        inputInicio.value = "";
        inputFin.value = "";
    }
}

// --- CREAR / EDITAR MATERIAS ---
formMateria.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const nombre = document.getElementById('nombreMat').value;
    const canvasNotas = document.getElementById('notasMat').value;
    const notaObjetivo = parseFloat(document.getElementById('notaObjetivo').value);
    
    const notas = canvasNotas.split(',').map(n => parseFloat(n.trim())).filter(n => !isNaN(n));
    if(notas.length === 0) return alert("Ingresa calificaciones numéricas válidas.");

    let horariosClase = [];
    let validacionExitosa = true;

    DIAS_SEMANA.forEach(dia => {
        const checkbox = document.querySelector(`.check-dia[value="${dia}"]`);
        if (checkbox && checkbox.checked) {
            const inicio = document.getElementById(`hora-inicio-${dia}`).value;
            const fin = document.getElementById(`hora-fin-${dia}`).value;

            if(!inicio || !fin) {
                alert(`Error: Digita las horas para el día ${dia}.`);
                validacionExitosa = false;
                return;
            }
            horariosClase.push({ dia, inicio, fin });
        }
    });

    if(!validacionExitosa) return;

    const idActual = materiaIdEdicion.value;

    if (idActual) {
        if(confirm("¿Guardar las modificaciones realizadas?")) {
            asignaturas = asignaturas.map(m => m.id === idActual ? {
                ...m, nombre, notas, notaObjetivo, horariosClase
            } : m);
            salirModoEdicion();
        } else {
            return;
        }
    } else {
        const nuevaMateria = {
            id: 'mat_' + Date.now(),
            nombre,
            notas,
            notaObjetivo,
            horariosClase,
            repasosCompletadosEstaSemana: 0
        };
        asignaturas.push(nuevaMateria);
    }

    actualizarApp();
    formMateria.reset();
    inicializarCheckboxes();
});

function activarEdicionMateria(id) {
    const mat = asignaturas.find(m => m.id === id);
    if (!mat) return;

    materiaIdEdicion.value = mat.id;
    document.getElementById('nombreMat').value = mat.nombre;
    document.getElementById('notasMat').value = mat.notas.join(', ');
    document.getElementById('notaObjetivo').value = mat.notaObjetivo;

    inicializarCheckboxes();

    mat.horariosClase.forEach(hc => {
        const checkbox = document.querySelector(`.check-dia[value="${hc.dia}"]`);
        if (checkbox) {
            checkbox.checked = true;
            toggleInputHora(hc.dia);
            document.getElementById(`hora-inicio-${hc.dia}`).value = hc.inicio;
            document.getElementById(`hora-fin-${hc.dia}`).value = hc.fin;
        }
    });

    tituloFormulario.innerText = "✏️ Editar Asignatura";
    indicadorEdicion.classList.remove('hidden');
    btnCancelarEdicion.classList.remove('hidden');
    document.getElementById('nombreMat').focus();
}

function salirModoEdicion() {
    materiaIdEdicion.value = "";
    tituloFormulario.innerText = "📘 Nueva Asignatura";
    indicadorEdicion.classList.add('hidden');
    btnCancelarEdicion.classList.add('hidden');
    formMateria.reset();
    inicializarCheckboxes();
}

function eliminarMateria(id) {
    if(confirm("🚨 ¿Deseas eliminar permanentemente esta asignatura?")) {
        asignaturas = asignaturas.filter(m => m.id !== id);
        excepcionesReprogramacion = excepcionesReprogramacion.filter(e => e.materiaId !== id);
        repasosHechosRegistro = repasosHechosRegistro.filter(key => !key.includes(id));
        actualizarApp();
    }
}

function alternarEstadoRepaso(bloqueUid, materiaId) {
    const index = repasosHechosRegistro.indexOf(bloqueUid);
    const mat = asignaturas.find(m => m.id === materiaId);

    if (index === -1) {
        repasosHechosRegistro.push(bloqueUid);
        if(mat) mat.repasosCompletadosEstaSemana += 1;
    } else {
        repasosHechosRegistro.splice(index, 1);
        if(mat) mat.repasosCompletadosEstaSemana = Math.max(0, mat.repasosCompletadosEstaSemana - 1);
    }
    actualizarApp();
}

function reprogramarRepaso(materiaId, diaFalla, tiempoMateria, bloqueUid) {
    if(!confirm(`¿Deseas reubicar este repaso individual del día ${diaFalla}?`)) return;

    let diaDestino = null;
    const indiceFalla = DIAS_SEMANA.indexOf(diaFalla);

    for (let i = indiceFalla + 1; i < DIAS_SEMANA.length; i++) {
        let diaEvaluar = DIAS_SEMANA[i];
        let minutosOcupados = calcularMinutosOcupadosEnDia(diaEvaluar);
        if ((minutosOcupados + tiempoMateria) <= 120) {
            diaDestino = diaEvaluar;
            break;
        }
    }

    if (!diaDestino) {
        for (let i = 0; i <= indiceFalla; i++) {
            let diaEvaluar = DIAS_SEMANA[i];
            let minutesOcupados = calcularMinutosOcupadosEnDia(diaEvaluar);
            if ((minutesOcupados + tiempoMateria) <= 120) {
                diaDestino = diaEvaluar;
                break;
            }
        }
    }

    if (diaDestino) {
        excepcionesReprogramacion = excepcionesReprogramacion.filter(ex => ex.bloqueUid !== bloqueUid);

        const idxHecho = repasosHechosRegistro.indexOf(bloqueUid);
        if(idxHecho !== -1) {
            repasosHechosRegistro.splice(idxHecho, 1);
            const mat = asignaturas.find(m => m.id === materiaId);
            if(mat) mat.repasosCompletadosEstaSemana = Math.max(0, mat.repasosCompletadosEstaSemana - 1);
        }

        excepcionesReprogramacion.push({
            bloqueUid,
            materiaId,
            diaOriginal: diaFalla,
            diaNuevo: diaDestino,
            tiempo: tiempoMateria,
            estado: 'REPROGRAMADO'
        });
        
        alert(`Bloque reubicado con éxito en: ${diaDestino} 🔁`);
        actualizarApp();
    } else {
        alert("¡No hay espacio de 2 horas en ningún día disponible!");
    }
}

function calcularMinutosOcupadosEnDia(dia) {
    const materiasProcesadas = procesarDatos();
    let minutos = 0;

    materiasProcesadas.forEach(m => {
        if (m.tiempoRepaso > 0) {
            let diasAsignados = 0;
            const maxDias = m.tiempoRepaso === 120 ? 3 : 2;
            for (let d of DIAS_SEMANA) {
                const fueRemovido = excepcionesReprogramacion.some(ex => ex.materiaId === m.id && ex.diaOriginal === d && ex.estado === 'REPROGRAMADO');
                if (diasAsignados < maxDias && !fueRemovido) {
                    if (d === dia) minutos += m.tiempoRepaso;
                    diasAsignados++;
                }
            }
        }
    });

    excepcionesReprogramacion.forEach(ex => {
        if (ex.diaNuevo === dia && ex.estado === 'REPROGRAMADO') {
            minutos += ex.tiempo;
        }
    });

    return minutos;
}

function formatearHora(minutosTotales) {
    const horas = Math.floor(minutosTotales / 60);
    const mins = minutosTotales % 60;
    const ampm = horas >= 12 ? 'PM' : 'AM';
    const horas12 = horas % 12 === 0 ? 12 : horas % 12;
    const minsFormateados = mins < 10 ? '0' + mins : mins;
    return `${horas12}:${minsFormateados} ${ampm}`;
}

function parsearHoraAMinutos(stringHora) {
    if(!stringHora) return 840; 
    const [h, m] = stringHora.split(':').map(Number);
    return (h * 60) + m;
}

function convertirStringA12Horas(stringHora) {
    if(!stringHora) return "";
    const minutos = parsearHoraAMinutos(stringHora);
    return formatearHora(minutos);
}

function actualizarApp() {
    localStorage.setItem('eduplan_v4', JSON.stringify(asignaturas));
    localStorage.setItem('eduplan_excepciones', JSON.stringify(excepcionesReprogramacion));
    localStorage.setItem('eduplan_hechos', JSON.stringify(repasosHechosRegistro));
    render();
}

function procesarDatos() {
    const notaAprobatoria = parseFloat(inputNotaAprobatoria.value) || 3.0;

    return asignaturas.map(m => {
        const promedio = m.notas.reduce((a, b) => a + b, 0) / m.notas.length;
        const brechaMeta = promedio - m.notaObjetivo; 
        
        let estado = "";
        let tiempoRepaso = 0;
        let colorCard = ""; 
        let badgeColor = "";

        if (promedio < notaAprobatoria) {
            estado = "REPROBANDO ASIGNATURA 🚨";
            tiempoRepaso = 120;
            colorCard = "border-rose-300 bg-rose-50/70 text-rose-950";
            badgeColor = "bg-rose-200 text-rose-900 border-rose-300";
        } else if (brechaMeta < 0) {
            estado = "BAJO TU META PERSONAL 🟡";
            tiempoRepaso = 60;
            colorCard = "border-amber-200 bg-amber-50 text-amber-950";
            badgeColor = "bg-amber-200 text-amber-900 border-amber-300";
        } else {
            estado = "META ALCANZADA ✨";
            tiempoRepaso = 0; 
            colorCard = "border-teal-200 bg-teal-50 text-teal-950";
            badgeColor = "bg-teal-200 text-teal-900 border-teal-300";
        }

        return {
            ...m,
            promedio: promedio.toFixed(2),
            brechaMeta: brechaMeta.toFixed(2),
            estado,
            tiempoRepaso,
            colorCard,
            badgeColor,
            estaReprobando: promedio < notaAprobatoria,
            necesitaRepaso: tiempoRepaso > 0
        };
    });
}

function generarCronograma(materiasProcesadas) {
    let cronograma = {};
    DIAS_SEMANA.forEach(d => {
        cronograma[d] = { clases: [], repasos: [], minutosTotalesRepaso: 0, ultimoMinutoOcupado: 840 }; 
    });

    materiasProcesadas.forEach(m => {
        m.horariosClase.forEach(hc => {
            if (cronograma[hc.dia]) {
                const rango12h = `${convertirStringA12Horas(hc.inicio)} - ${convertirStringA12Horas(hc.fin)}`;
                cronograma[hc.dia].clases.push({ nombre: m.nombre, rango: rango12h });
                
                const minsFin = parsearHoraAMinutos(hc.fin);
                if(minsFin > cronograma[hc.dia].ultimoMinutoOcupado) {
                    cronograma[hc.dia].ultimoMinutoOcupado = minsFin + 15; 
                }
            }
        });
    });

    excepcionesReprogramacion = excepcionesReprogramacion.filter(ex => {
        const mat = materiasProcesadas.find(m => m.id === ex.materiaId);
        return mat && mat.necesitaRepaso; 
    });

    materiasProcesadas
        .filter(m => m.necesitaRepaso) 
        .sort((a, b) => {
            if (a.estaReprobando && !b.estaReprobando) return -1;
            if (!a.estaReprobando && b.estaReprobando) return 1;
            return parseFloat(a.brechaMeta) - parseFloat(b.brechaMeta);
        })
        .forEach(materia => {
            let diasAsignados = 0;
            const maxDias = materia.tiempoRepaso === 120 ? 3 : 2;

            for (let dia of DIAS_SEMANA) {
                const diaActual = cronograma[dia];
                const fueCanceladoOMovido = excepcionesReprogramacion.some(ex => ex.materiaId === materia.id && ex.diaOriginal === dia);

                if (diaActual.repasos.length < 2 && (diaActual.minutosTotalesRepaso + materia.tiempoRepaso) <= 120 && diasAsignados < maxDias) {
                    if (!fueCanceladoOMovido) {
                        const bloqueUid = `rep_std_${materia.id}_${dia}_idx_${diasAsignados}`;
                        
                        const inicioBloque = diaActual.ultimoMinutoOcupado;
                        const finBloque = inicioBloque + materia.tiempoRepaso;
                        diaActual.ultimoMinutoOcupado = finBloque + 10; 

                        diaActual.repasos.push({
                            uid: bloqueUid,
                            id: materia.id,
                            nombre: materia.nombre,
                            tiempo: materia.tiempoRepaso,
                            reprogramado: false,
                            diaBase: dia,
                            rangoHorario: `${formatearHora(inicioBloque)} - ${formatearHora(finBloque)}`
                        });
                        diaActual.minutosTotalesRepaso += materia.tiempoRepaso;
                    }
                    diasAsignados++;
                }
            }
        });

    excepcionesReprogramacion.forEach(ex => {
        if (ex.estado === 'REPROGRAMADO' && cronograma[ex.diaNuevo]) {
            const matOrigen = materiasProcesadas.find(m => m.id === ex.materiaId);
            if (matOrigen && matOrigen.necesitaRepaso) { 
                const diaActual = cronograma[ex.diaNuevo];
                
                const inicioBloque = diaActual.ultimoMinutoOcupado;
                const finBloque = inicioBloque + ex.tiempo;
                diaActual.ultimoMinutoOcupado = finBloque + 10;

                diaActual.repasos.push({
                    uid: ex.bloqueUid,
                    id: ex.materiaId,
                    nombre: matOrigen.nombre,
                    tiempo: ex.tiempo,
                    reprogramado: true,
                    diaOrigenFalla: ex.diaOriginal,
                    diaBase: ex.diaNuevo,
                    rangoHorario: `${formatearHora(inicioBloque)} - ${formatearHora(finBloque)}`
                });
                diaActual.minutosTotalesRepaso += ex.tiempo;
            }
        }
    });

    return cronograma;
}

// --- RENDERIZADO GENERAL ---
function render() {
    cuerpoApp.style.backgroundColor = temaColorGuardado;
    aplicarPerfilDOM(); 
    const materiasProcesadas = procesarDatos();
    const notaAprobatoria = parseFloat(inputNotaAprobatoria.value) || 3.0;
    
    listaMateriasDiv.innerHTML = "";
    if(materiasProcesadas.length === 0) {
        listaMateriasDiv.innerHTML = `<p class="text-sm text-stone-400 col-span-2 italic">Ingresa asignaturas para desplegar el panel de control.</p>`;
    }
    
    materiasProcesadas.forEach(m => {
        const textoMeta = m.brechaMeta >= 0 ? `+${m.brechaMeta} por encima` : `${m.brechaMeta} para alcanzar tu meta`;
        listaMateriasDiv.innerHTML += `
            <div class="border-2 ${m.colorCard} p-5 rounded-2xl flex flex-col justify-between shadow-xs bg-white transition-all">
                <div>
                    <div class="flex justify-between items-start mb-2 gap-2">
                        <h3 class="font-bold text-stone-900 text-sm truncate max-w-[55%]">${m.nombre}</h3>
                        <span class="text-[9px] font-bold px-2 py-0.5 rounded-full border-2 ${m.badgeColor} shrink-0">${m.estado}</span>
                    </div>
                    <div class="space-y-0.5 text-xs text-stone-600 font-medium">
                        <p>Mínimo institucional: <span class="font-bold">${notaAprobatoria.toFixed(1)}</span></p>
                        <p>Tu Meta de Nota: <span class="font-bold text-indigo-600">${m.notaObjetivo.toFixed(1)}</span></p>
                        <p class="text-[11px] text-stone-500 italic mt-1 font-semibold">${textoMeta}</p>
                    </div>
                </div>
                <div class="mt-4 pt-3 border-t border-stone-100 flex justify-between items-center">
                    <div>
                        <span class="text-xs text-stone-400">Promedio: </span>
                        <span class="text-md font-extrabold text-stone-800">${m.promedio}</span>
                    </div>
                    <div class="flex gap-2">
                        <button onclick="activarEdicionMateria('${m.id}')" class="text-indigo-600 hover:text-indigo-700 font-semibold text-xs">✏️ Editar</button>
                        <button onclick="eliminarMateria('${m.id}')" class="text-stone-400 hover:text-rose-500 text-xs font-medium">Eliminar</button>
                    </div>
                </div>
            </div>
        `;
    });

    const cronograma = generarCronograma(materiasProcesadas);
    gridCalendario.innerHTML = "";

    let totalMinutosPlaneados = 0;
    let totalSesionesRealizadas = 0;

    Object.keys(cronograma).forEach(dia => {
        let bloquesHTML = "";
        const diaActual = cronograma[dia];
        totalMinutosPlaneados += diaActual.minutosTotalesRepaso;

        diaActual.clases.forEach(clase => {
            bloquesHTML += `
                <div class="p-2.5 rounded-xl bg-cyan-50 border-2 border-cyan-200 text-cyan-950 shadow-2xs">
                    <p class="text-[9px] font-bold tracking-wider uppercase text-cyan-600">🏫 Clase Fija</p>
                    <p class="text-xs font-bold truncate">${clase.nombre}</p>
                    <p class="text-[10px] text-cyan-800 font-semibold mt-0.5">⏱️ ${clase.rango}</p>
                </div>
            `;
        });

        diaActual.repasos.forEach(rep => {
            const estaCompletado = repasosHechosRegistro.includes(rep.uid);
            if(estaCompletado) totalSesionesRealizadas++;

            const badgeTexto = rep.reprogramado 
                ? `🔁 Movido de ${rep.diaOrigenFalla}`
                : `⚡ Bloque de Repaso`;

            const estiloFondo = estaCompletado 
                ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950 line-through opacity-75' 
                : (rep.reprogramado ? 'bg-indigo-50 border-indigo-200 text-indigo-950' : 'bg-orange-50 border-orange-200 text-orange-950');

            const colorBadgeTexto = estaCompletado 
                ? 'text-emerald-600' 
                : (rep.reprogramado ? 'text-indigo-600' : 'text-orange-700');

            bloquesHTML += `
                <div class="p-2.5 rounded-xl ${estiloFondo} border-2 shadow-2xs space-y-1 transition-all duration-300">
                    <div class="flex justify-between items-center">
                        <p class="text-[8px] font-extrabold uppercase tracking-widest ${colorBadgeTexto}">${badgeTexto}</p>
                    </div>
                    <p class="text-xs font-bold truncate">${rep.nombre}</p>
                    
                    <p class="text-[10px] font-semibold text-stone-700 flex items-center gap-1">
                        ⏰ <span class="bg-white/60 px-1 py-0.5 rounded border border-stone-200/50">${rep.rangoHorario}</span>
                    </p>
                    
                    <p class="text-[9px] text-stone-400 font-medium">Duración: ${rep.tiempo} min</p>
                    
                    <div class="pt-2 border-t border-stone-200/50 flex justify-between gap-1">
                        <button onclick="alternarEstadoRepaso('${rep.uid}', '${rep.id}')" class="${estaCompletado ? 'bg-stone-400 hover:bg-stone-500' : 'bg-emerald-500 hover:bg-emerald-600'} text-white font-bold text-[9px] px-2 py-0.5 rounded-md transition-all">
                            ${estaCompletado ? '↩ Deshacer' : '✓ Hecho'}
                        </button>
                        ${!estaCompletado ? `
                        <button onclick="reprogramarRepaso('${rep.id}', '${rep.diaBase}', ${rep.tiempo}, '${rep.uid}')" class="bg-amber-400 hover:bg-amber-500 text-amber-950 font-bold text-[9px] px-1.5 py-0.5 rounded-md transition-all">
                            🔁 Mover
                        </button>` : ''}
                    </div>
                </div>
            `;
        });

        if (diaActual.clases.length === 0 && diaActual.repasos.length === 0) {
            bloquesHTML = `<p class="text-[11px] text-stone-400 italic text-center py-6">Tarde libre ☕</p>`;
        }

        const porcentajeBarra = (diaActual.minutosTotalesRepaso / 120) * 100;

        gridCalendario.innerHTML += `
            <div class="bg-stone-50/40 border-2 border-stone-200/80 p-3 rounded-2xl flex flex-col gap-2 min-h-[260px]">
                <div class="flex justify-between items-center pb-1 border-b border-stone-100">
                    <h4 class="text-xs font-bold text-stone-600 uppercase">${dia}</h4>
                    <span class="text-[9px] font-bold text-stone-400">${diaActual.minutosTotalesRepaso}m repaso</span>
                </div>
                <div class="w-full bg-stone-100 h-1 rounded-full overflow-hidden">
                    <div class="bg-rose-300 h-full transition-all" style="width: ${porcentajeBarra}%"></div>
                </div>
                <div class="flex flex-col gap-2 flex-grow justify-start mt-1">
                    ${bloquesHTML}
                </div>
            </div>
        `;
    });

    actualizarMedidorAvance(totalMinutosPlaneados, totalSesionesRealizadas);
}

function actualizarMedidorAvance(minutosPlaneados, repasosHechos) {
    const horasTotales = (minutosPlaneados / 60).toFixed(1);
    const horasHechas = (repasosHechos * 1.0).toFixed(1);

    let porcentaje = 0;
    if (parseFloat(horasTotales) > 0) {
        porcentaje = Math.min(Math.round((parseFloat(horasHechas) / parseFloat(horasTotales)) * 100), 100);
    }

    document.getElementById('lblHorasHechas').innerText = `${horasHechas}h`;
    document.getElementById('lblHorasTotales').innerText = `${horasTotales}h`;
    document.getElementById('textoPorcentaje').innerText = `${porcentaje}%`;

    const arco = document.getElementById('arcoProgreso');
    const offset = 251 - (porcentaje / 100) * 251;
    arco.style.strokeDashoffset = offset;
}

function descargarOrganigrama() {
    const target = document.getElementById('organigramaContenedor');
    html2canvas(target, { backgroundColor: '#FFFFFF', scale: 2 }).then(canvas => {
        const link = document.createElement('a');
        link.download = `Eduplan_Calendario_Pro.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    });
}

// Iniciar aplicación
document.getElementById('btnDescargar').addEventListener('click', descargarOrganigrama);
if (document.getElementById('btnDescargarMovil')) {
    document.getElementById('btnDescargarMovil').addEventListener('click', descargarOrganigrama);
}

// --- FUNCIÓN DE LOGOUT / CERRAR SESIÓN ---
function cerrarSesionUsuario() {
    if (confirm("¿Estás seguro de que deseas cerrar sesión en Eduplan Pro?")) {
        // Lógica de limpieza de sesión si es necesario
        // localStorage.clear(); 
        window.location.href = "login.html";
    }
}

inicializarCheckboxes();
render();