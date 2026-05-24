// --- ESTADO Y PERSISTENCIA ---
let asignaturas = JSON.parse(localStorage.getItem('asignaturas')) || [];

// --- SELECTORES ---
const formMateria = document.getElementById('formMateria');
const listaMateriasDiv = document.getElementById('listaMaterias');
const gridCalendario = document.getElementById('gridCalendario');
const btnDescargar = document.getElementById('btnDescargar');
const inputEscalaMax = document.getElementById('escalaMax');
const inputNotaAprobatoria = document.getElementById('notaAprobatoria');

// --- EVENT LISTENERS ---
formMateria.addEventListener('submit', registrarAsignatura);
inputEscalaMax.addEventListener('input', render);
inputNotaAprobatoria.addEventListener('input', render);
btnDescargar.addEventListener('click', descargarOrganigrama);

// --- FUNCIONES CORE ---

function registrarAsignatura(e) {
    e.preventDefault();
    const nombre = document.getElementById('nombreMat').value;
    const notasRaw = document.getElementById('notasMat').value;
    const horario = document.getElementById('horarioMat').value || 'No definido';
    
    const notas = notasRaw.split(',').map(n => parseFloat(n.trim())).filter(n => !isNaN(n));

    if(notas.length === 0) return alert("Ingresa notas válidas.");

    const nuevaMateria = {
        id: 'mat_' + Date.now(),
        nombre,
        notas,
        horario
    };

    asignaturas.push(nuevaMateria);
    actualizarApp();
    formMateria.reset();
}

function eliminarMateria(id) {
    asignaturas = asignaturas.filter(m => m.id !== id);
    actualizarApp();
}

function actualizarApp() {
    localStorage.setItem('asignaturas', JSON.stringify(asignaturas));
    render();
}

// 4. Procesamiento de Datos con Estética Pastel
function procesarDatos() {
    const escalaMax = parseFloat(inputEscalaMax.value) || 5.0;
    const notaAprobatoria = parseFloat(inputNotaAprobatoria.value) || 3.0;
    const umbralExcelente = notaAprobatoria + ((escalaMax - notaAprobatoria) * 0.5); 

    return asignaturas.map(m => {
        const promedio = m.notas.reduce((a, b) => a + b, 0) / m.notas.length;
        let estado = "";
        let tiempoRepaso = 0;
        let colorClase = ""; // Estilo de la tarjeta
        let badgeColor = ""; // Estilo de la etiqueta interna

        if (promedio >= umbralExcelente) {
            estado = "Materia al día ✨";
            tiempoRepaso = 0;
            colorClase = "border-emerald-200 bg-emerald-50/40 text-emerald-900";
            badgeColor = "bg-emerald-100 text-emerald-800 border-emerald-200";
        } else if (promedio >= notaAprobatoria && promedio < umbralExcelente) {
            estado = "Repaso moderado 🟡";
            tiempoRepaso = 60; // 1 hora
            colorClase = "border-amber-200 bg-amber-50/50 text-amber-900";
            badgeColor = "bg-amber-100 text-amber-800 border-amber-200";
        } else {
            estado = "Reforzar urgente 🌸";
            tiempoRepaso = 120; // 2 horas completas
            colorClase = "border-rose-200 bg-rose-50/60 text-rose-900";
            badgeColor = "bg-rose-100 text-rose-800 border-rose-200";
        }

        return {
            ...m,
            promedio: promedio.toFixed(2),
            estado,
            tiempoRepaso,
            colorClase,
            badgeColor
        };
    });
}

// 5. NUEVO ALGORITMO: Scheduler con doble restricción (Máx 2 materias Y Máx 120 minutos por día)
function generarCronograma(materiasProcesadas) {
    const dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
    
    // Cada día guarda un array de materias y un contador de minutos totales acumulados
    let cronograma = {
        Lunes: { materias: [], minutosTotales: 0 },
        Martes: { materias: [], minutosTotales: 0 },
        Miércoles: { materias: [], minutosTotales: 0 },
        Jueves: { materias: [], minutosTotales: 0 },
        Viernes: { materias: [], minutosTotales: 0 }
    };

    // Ordenar: Peor promedio primero para darle prioridad en la semana
    let materiasParaAsignar = materiasProcesadas
        .filter(m => m.tiempoRepaso > 0)
        .sort((a, b) => parseFloat(a.promedio) - parseFloat(b.promedio));

    materiasParaAsignar.forEach(materia => {
        let diasAsignados = 0;
        // Las críticas van 3 días, las alertas moderadas van 2 días a la semana
        const maxDiasSemanales = materia.tiempoRepaso === 120 ? 3 : 2; 

        for (let dia of dias) {
            const diaActual = cronograma[dia];

            // VALIDACIONES DE RESTRICCIÓN:
            // 1. Que el día no tenga ya 2 materias asignadas
            // 2. Que sumando el tiempo de esta materia, no se superen los 120 minutos diarios (2 horas)
            // 3. Que la materia no se haya asignado ya demasiadas veces esta semana
            if (
                diaActual.materias.length < 2 && 
                (diaActual.minutosTotales + materia.tiempoRepaso) <= 120 && 
                diasAsignados < maxDiasSemanales
            ) {
                diaActual.materias.push({
                    nombre: materia.nombre,
                    tiempo: materia.tiempoRepaso,
                    badgeColor: materia.badgeColor
                });
                
                // Sumamos los minutos al acumulador del día
                diaActual.minutosTotales += materia.tiempoRepaso;
                diasAsignados++;
            }
        }
    });

    return cronograma;
}

// --- RENDERING VISUAL ---
function render() {
    const materiasProcesadas = procesarDatos();
    
    // Render de Tarjetas de Materias
    listaMateriasDiv.innerHTML = "";
    if(materiasProcesadas.length === 0) {
        listaMateriasDiv.innerHTML = `<p class="text-sm text-stone-400 col-span-2 italic">Aún no has añadido materias.</p>`;
    }
    
    materiasProcesadas.forEach(m => {
        listaMateriasDiv.innerHTML += `
            <div class="border ${m.colorClase} p-5 rounded-2xl flex flex-col justify-between transition-all hover:shadow-sm bg-white">
                <div>
                    <div class="flex justify-between items-start mb-2 gap-2">
                        <h3 class="font-bold text-stone-800 text-sm truncate max-w-[65%]">${m.nombre}</h3>
                        <span class="text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${m.badgeColor} shrink-0">${m.estado}</span>
                    </div>
                    <p class="text-xs text-stone-500 mb-1">📅 Clase: ${m.horario}</p>
                    <p class="text-xs text-stone-400">Historial: ${m.notas.join('  •  ')}</p>
                </div>
                <div class="mt-4 pt-3 border-t border-stone-100 flex justify-between items-center">
                    <div>
                        <span class="text-xs text-stone-400">Promedio: </span>
                        <span class="text-base font-bold text-stone-800">${m.promedio}</span>
                    </div>
                    <button onclick="eliminarMateria('${m.id}')" class="text-stone-400 hover:text-rose-500 text-xs font-medium transition-all">Eliminar</button>
                </div>
            </div>
        `;
    });

    // Render del Organigrama Semanal
    const cronograma = generarCronograma(materiasProcesadas);
    gridCalendario.innerHTML = "";

    Object.keys(cronograma).forEach(dia => {
        let bloquesHTML = "";
        const diaActual = cronograma[dia];
        
        if (diaActual.materias.length === 0) {
            bloquesHTML = `
                <div class="flex flex-col items-center justify-center py-6 text-center">
                    <span class="text-lg">☕</span>
                    <p class="text-[11px] text-stone-400 italic mt-1">¡Tiempo libre completo!</p>
                </div>
            `;
        } else {
            diaActual.materias.forEach(bloque => {
                // Formatear minutos a horas si es necesario para la UI
                const tiempoTexto = bloque.tiempo >= 60 ? `${bloque.tiempo / 60} h` : `${bloque.tiempo} min`;
                
                bloquesHTML += `
                    <div class="p-3 rounded-xl bg-stone-50/80 border border-stone-200/60 space-y-1 shadow-2xs">
                        <p class="text-xs font-semibold text-stone-800 truncate">${bloque.nombre}</p>
                        <span class="text-[10px] inline-block font-medium px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-100">
                            ⏱️ ${tiempoTexto}
                        </span>
                    </div>
                `;
            });
        }

        // Mostrar barra sutil de tiempo total usado por día
        const porcentajeTiempo = (diaActual.minutosTotales / 120) * 100;

        gridCalendario.innerHTML += `
            <div class="bg-white border border-stone-200 p-3 rounded-2xl flex flex-col gap-2 min-h-[180px] shadow-2xs">
                <div class="flex justify-between items-center pb-1 border-b border-stone-100">
                    <h4 class="text-xs font-bold text-stone-500 uppercase tracking-wider">${dia}</h4>
                    <span class="text-[9px] text-stone-400 font-medium">${diaActual.minutosTotales} / 120 m</span>
                </div>
                
                <div class="w-full bg-stone-100 h-1 rounded-full overflow-hidden">
                    <div class="bg-rose-300 h-full transition-all" style="width: ${porcentajeTiempo}%"></div>
                </div>

                <div class="flex flex-col gap-2 flex-grow justify-start mt-2">
                    ${bloquesHTML}
                </div>
            </div>
        `;
    });
}

// 6. Exportación limpia con fondo claro pastel
function descargarOrganigrama() {
    const target = document.getElementById('organigramaContenedor');
    
    html2canvas(target, {
        backgroundColor: '#FFFFFF', // Fondo blanco limpio para la impresión/imagen
        scale: 2 
    }).then(canvas => {
        const link = document.createElement('a');
        link.download = `Mi_Plan_De_Estudio_${new Date().toISOString().slice(0,10)}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    });
}

// Carga Inicial
render();