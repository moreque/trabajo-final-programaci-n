// ==========================================
// 1. CLASE OBRA DE ARTE
// Representa cada obra exhibida en el museo con encapsulamiento
// ==========================================
class ObraArte {
    // Propiedades privadas (#) para proteger los datos
    #id;
    #titulo;
    #artista;
    #anio;
    #categoria;
    #precio;
    #cupo;
    #imagen;

    constructor(id, titulo, artista, anio, categoria, precio, cupo, imagen) {
        this.#id = id;
        this.titulo = titulo;       // Invoca al setter correspondiente
        this.artista = artista;
        this.anio = anio;
        this.categoria = categoria;
        this.precio = precio;
        this.cupo = cupo;
        this.imagen = imagen;
    }

    // Getters: permiten leer las propiedades privadas de forma controlada
    get id() { return this.#id; }
    get titulo() { return this.#titulo; }
    get artista() { return this.#artista; }
    get anio() { return this.#anio; }
    get categoria() { return this.#categoria; }
    get precio() { return this.#precio; }
    get cupo() { return this.#cupo; }
    get imagen() { return this.#imagen; }

    // Setters: validan los datos antes de asignarlos a las propiedades
    set titulo(valor) {
        if (!valor || valor.trim() === "") throw new Error("El título es obligatorio.");
        this.#titulo = valor.trim();
    }

    set artista(valor) {
        if (!valor || valor.trim() === "") throw new Error("El autor es obligatorio.");
        this.#artista = valor.trim();
    }

    set anio(valor) {
        this.#anio = valor ? valor.trim() : "S/F";
    }

    set categoria(valor) {
        this.#categoria = valor;
    }

    set precio(valor) {
        const num = Number(valor);
        if (isNaN(num) || num < 0) throw new Error("El precio no puede ser negativo.");
        this.#precio = num;
    }

    set cupo(valor) {
        const num = Number(valor);
        if (isNaN(num) || num < 0) throw new Error("El cupo debe ser 0 o mayor.");
        this.#cupo = num;
    }

    set imagen(valor) {
        this.#imagen = valor.trim();
    }

    // Descuenta entradas disponibles si hay cupo suficiente
    reducirCupo(cantidad) {
        if (cantidad > this.#cupo) return false;
        this.cupo = this.#cupo - cantidad;
        return true;
    }

    // Restaura entradas disponibles cuando se anula una reserva
    aumentarCupo(cantidad) {
        this.cupo = this.#cupo + cantidad;
    }

    // Serializa las propiedades privadas para poder guardar el objeto en localStorage
    toJSON() {
        return {
            id: this.#id,
            titulo: this.#titulo,
            artista: this.#artista,
            anio: this.#anio,
            categoria: this.#categoria,
            precio: this.#precio,
            cupo: this.#cupo,
            imagen: this.#imagen
        };
    }
}

// ==========================================
// 2. CLASE RESERVA
// Representa el comprobante emitido a un visitante
// ==========================================
class Reserva {
    #id;
    #visitante;
    #obraId;
    #obraTitulo;
    #precioUnitario;
    #cantidad;

    constructor(id, visitante, obraId, obraTitulo, precioUnitario, cantidad) {
        this.#id = id;
        this.visitante = visitante;
        this.#obraId = obraId;
        this.#obraTitulo = obraTitulo;
        this.#precioUnitario = Number(precioUnitario);
        this.cantidad = cantidad;
    }

    get id() { return this.#id; }
    get visitante() { return this.#visitante; }
    get obraId() { return this.#obraId; }
    get obraTitulo() { return this.#obraTitulo; }
    get cantidad() { return this.#cantidad; }

    set visitante(valor) {
        if (!valor || valor.trim() === "") throw new Error("Ingrese el nombre del visitante.");
        this.#visitante = valor.trim();
    }

    set cantidad(valor) {
        const num = Number(valor);
        if (num <= 0) throw new Error("Debe reservar al menos 1 entrada.");
        this.#cantidad = num;
    }

    // Calcula el costo total multiplicando el valor de la sala por las entradas reservadas
    calcularTotal() {
        return this.#precioUnitario * this.#cantidad;
    }

    toJSON() {
        return {
            id: this.#id,
            visitante: this.#visitante,
            obraId: this.#obraId,
            obraTitulo: this.#obraTitulo,
            precioUnitario: this.#precioUnitario,
            cantidad: this.#cantidad
        };
    }
}

// ==========================================
// 3. CLASE MUSEO
// Clase gestora: comunica ObraArte con Reserva y administra localStorage
// ==========================================
class Museo {
    constructor() {
        this.obras = [];
        this.reservas = [];
        this.cargarDatos();
    }

    // Recupera el catálogo y las reservas desde localStorage o inicializa las obras base
    cargarDatos() {
        const obrasGuardadas = JSON.parse(localStorage.getItem("moa_obras_v2"));
        const reservasGuardadas = JSON.parse(localStorage.getItem("moa_reservas_v2"));

        if (obrasGuardadas && obrasGuardadas.length > 0) {
            this.obras = obrasGuardadas.map(o => new ObraArte(
                o.id, o.titulo, o.artista, o.anio, o.categoria, o.precio, o.cupo, o.imagen
            ));
        } else {
            this.obras = [
                new ObraArte(1, "El jardín de las delicias", "El Bosco", "1490 - 1500", "Pintura", 3000, 12, "img/jardin.png"),
                new ObraArte(2, "Las meninas", "Diego Velázquez", "1656", "Pintura", 3500, 8, "img/meninas.png"),
                new ObraArte(3, "Orestes y Pílades", "Escuela de Pasíteles", "Siglo I a.C.", "Escultura", 2000, 15, "img/escultura.png")
            ];
            this.guardarDatos();
        }

        if (reservasGuardadas) {
            this.reservas = reservasGuardadas.map(r => new Reserva(
                r.id, r.visitante, r.obraId, r.obraTitulo, r.precioUnitario, r.cantidad
            ));
        }
    }

    // Persiste los arreglos de obras y reservas en el navegador
    guardarDatos() {
        localStorage.setItem("moa_obras_v2", JSON.stringify(this.obras));
        localStorage.setItem("moa_reservas_v2", JSON.stringify(this.reservas));
    }

    // Interacción entre clases: busca la ObraArte, descuenta su cupo y genera la Reserva
    crearReserva(visitante, obraId, cantidad) {
        const obra = this.obras.find(o => o.id === Number(obraId));
        if (!obra) throw new Error("Obra no encontrada.");

        if (!obra.reducirCupo(Number(cantidad))) {
            throw new Error(`Cupo insuficiente. Solo quedan ${obra.cupo} entradas.`);
        }

        const reserva = new Reserva(Date.now(), visitante, obra.id, obra.titulo, obra.precio, cantidad);
        this.reservas.push(reserva);
        this.guardarDatos();
    }

    // Elimina la reserva y devuelve los cupos correspondientes a la ObraArte
    cancelarReserva(reservaId) {
        const index = this.reservas.findIndex(r => r.id === reservaId);
        if (index !== -1) {
            const res = this.reservas[index];
            const obra = this.obras.find(o => o.id === res.obraId);
            if (obra) obra.aumentarCupo(res.cantidad);
            this.reservas.splice(index, 1);
            this.guardarDatos();
        }
    }
}

// ==========================================
// 4. CONTROL DE INTERFAZ Y EVENTOS DEL DOM
// ==========================================
const museo = new Museo();

// Actualiza todas las vistas de la pantalla
function renderizar() {
    renderizarGaleria();
    renderizarSelect();
    renderizarReservas();
}

// Dibuja los bloques de cada obra en la pantalla principal
function renderizarGaleria() {
    const galeria = document.getElementById("galeria-obras");
    galeria.innerHTML = "";

    museo.obras.forEach(obra => {
        const bloque = document.createElement("article");
        bloque.className = "obra-bloque-full";
        bloque.innerHTML = `
            <div class="obra-hero-banner">
                <img src="${obra.imagen}" alt="${obra.titulo}">
                <div class="obra-titulo-overlay">
                    <h2>${obra.titulo}</h2>
                </div>
            </div>
            <div class="obra-ficha-inferior">
                <div class="ficha-datos-principales">
                    <span class="obra-autor">${obra.artista}</span>
                    <h3 class="obra-titulo-secundario">${obra.titulo}</h3>
                    <p class="obra-meta">${obra.categoria} · ${obra.anio}</p>
                </div>
                <div class="ficha-datos-sala">
                    <div class="dato-caja">
                        <span>Entrada</span>
                        <strong>$${obra.precio}</strong>
                    </div>
                    <div class="dato-caja">
                        <span>Cupos en sala</span>
                        <strong>${obra.cupo}</strong>
                    </div>
                </div>
            </div>
        `;
        galeria.appendChild(bloque);
    });
}

// Carga las opciones disponibles en el selector del formulario
function renderizarSelect() {
    const select = document.getElementById("select-obra");
    select.innerHTML = "";
    museo.obras.forEach(obra => {
        const option = document.createElement("option");
        option.value = obra.id;
        option.textContent = `${obra.titulo} — $${obra.precio} (${obra.cupo} disp.)`;
        option.disabled = obra.cupo === 0;
        select.appendChild(option);
    });
}

// Muestra las tarjetas de reservas confirmadas y su costo total
function renderizarReservas() {
    const lista = document.getElementById("lista-reservas");
    lista.innerHTML = "";

    if (museo.reservas.length === 0) {
        lista.innerHTML = "<p>Aún no hay reservas emitidas en el sistema.</p>";
        return;
    }

    museo.reservas.forEach(res => {
        const div = document.createElement("div");
        div.className = "ticket-reserva";
        div.innerHTML = `
            <div>
                <strong>${res.visitante}</strong><br>
                <small>${res.obraTitulo} (${res.cantidad} entrada/s)</small>
                <span class="ticket-total">Total abonado: $${res.calcularTotal()}</span>
            </div>
            <button class="btn-cancelar" onclick="borrarReserva(${res.id})">ANULAR</button>
        `;
        lista.appendChild(div);
    });
}

// Controla la navegación entre las pestañas "Todas las obras" y "Entradas y Visitas"
document.querySelectorAll(".btn-tab").forEach(btn => {
    btn.addEventListener("click", (e) => {
        document.querySelector(".btn-tab.activo").classList.remove("activo");
        e.target.classList.add("activo");

        document.querySelectorAll(".vista-seccion").forEach(sec => sec.classList.add("oculto"));
        const vistaId = e.target.dataset.vista;
        document.getElementById(vistaId).classList.remove("oculto");
    });
});

// Captura el envío del formulario para crear una nueva reserva
document.getElementById("form-reserva").addEventListener("submit", (e) => {
    e.preventDefault();
    try {
        museo.crearReserva(
            document.getElementById("visitante").value,
            document.getElementById("select-obra").value,
            document.getElementById("cantidad").value
        );
        e.target.reset();
        renderizar();
    } catch (err) {
        alert(err.message);
    }
});

// Función expuesta globalmente para el botón "ANULAR" de cada ticket
window.borrarReserva = function(id) {
    museo.cancelarReserva(id);
    renderizar();
};

// Renderizado inicial al abrir la página
renderizar();