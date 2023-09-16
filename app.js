document.addEventListener("DOMContentLoaded", () => {
    fetchData()
    if (localStorage.getItem('carrito')) {
        carrito = JSON.parse(localStorage.getItem('carrito'))
        pintarCarrito()
    }
})

const fetchData = async () => {
    try {
        const res = await fetch('api.json')
        const data = await res.json()
        pintarProductos(data)
        detectarBotones(data)
    } catch (error) {
    }
}

const contenedorProductos = document.querySelector("#contenedor-productos")
const pintarProductos = (data) => {
    const template = document.querySelector("#template-productos").content
    const fragment = document.createDocumentFragment()
    data.forEach(producto => {
        template.querySelector('img').setAttribute('src', producto.thumbnailUrl)
        template.querySelector('h5').textContent = producto.title
        template.querySelector('p span').textContent = producto.precio
        template.querySelector('button').dataset.id = producto.id

        const clone = template.cloneNode(true)
        fragment.appendChild(clone)

    })
    contenedorProductos.appendChild(fragment)
}

/* acá se usaron objetos en vez de un array porque el código es más corto y el resultado es el mismo*/

let carrito = {}

const detectarBotones = (data) => {
    const botones = document.querySelectorAll('.card button')

    botones.forEach(btn => {
        btn.addEventListener('click', () => {
            const producto = data.find(item => item.id === parseInt(btn.dataset.id))
            producto.cantidad = 1
            if (carrito.hasOwnProperty(producto.id)) {
                producto.cantidad = carrito[producto.id].cantidad + 1
            }

            carrito[producto.id] = { ...producto }
            pintarCarrito()
        })
    })

}

const items = document.querySelector('#items')

const pintarCarrito = () => {

    items.innerHTML = ''

    const template = document.querySelector('#template-carrito').content
    const fragment = document.createDocumentFragment()

    Object.values(carrito).forEach(producto => {
        template.querySelector('th').textContent = producto.id
        template.querySelectorAll('td')[0].textContent = producto.title
        template.querySelectorAll('td')[1].textContent = producto.cantidad
        template.querySelector('span').textContent = producto.precio * producto.cantidad

        /*botones*/
        template.querySelector('.btn-info').dataset.id = producto.id
        template.querySelector('.btn-danger').dataset.id = producto.id

        const clone = template.cloneNode(true)
        fragment.appendChild(clone)
    })

    items.appendChild(fragment)

    pintarFooter()
    accionBotones()

    localStorage.setItem('carrito', JSON.stringify(carrito))

}

const footer = document.querySelector('#footer')
const pintarFooter = () => {

    footer.innerHTML = ''

    if (Object.keys(carrito).length === 0) {
        footer.innerHTML = `
        <th scope="row" colspan="5">Carrito vacío</th>
        `
        return
    }

    const template = document.querySelector('#template-footer').content
    const fragment = document.createDocumentFragment()

    /*sumar cantidad y sumar totales*/
    const nCantidad = Object.values(carrito).reduce((acc, { cantidad }) => acc + cantidad, 0)
    const nPrecio = Object.values(carrito).reduce((acc, { cantidad, precio }) => acc + cantidad * precio, 0)

    template.querySelectorAll('td')[0].textContent = nCantidad
    template.querySelector('span').textContent = nPrecio

    const clone = template.cloneNode(true)
    fragment.appendChild(clone)

    footer.appendChild(fragment)

    const boton = document.querySelector('#vaciar-carrito')
    boton.addEventListener('click', () => {
        carrito = {}
        pintarCarrito()
    })

    const botonF = document.querySelector('#finalizar-compra')
    botonF.addEventListener('click', () => {
        carrito = {}
        pintarCarrito()
        Swal.fire(
            '¡Enhorabuena!',
            'haz comprado los mejores productos del mercado'
        )
    }) 
}


const accionBotones = () => {
    const botonesAgregar = document.querySelectorAll('#items .btn-info')
    const botonesEliminar = document.querySelectorAll('#items .btn-danger')

    botonesAgregar.forEach(btn => {
        btn.addEventListener('click', () => {
            const producto = carrito[btn.dataset.id]
            producto.cantidad++
            carrito[btn.dataset.id] = { ...producto }
            pintarCarrito()
        })
    })

    botonesEliminar.forEach(btn => {
        btn.addEventListener('click', () => {
            const producto = carrito[btn.dataset.id]
            producto.cantidad--
            if (producto.cantidad === 0) {
                delete carrito[btn.dataset.id]
                pintarCarrito()

            } else {
                carrito[btn.dataset.id] = { ...producto }
                pintarCarrito()
            }
        })
    })
}

/*Use SweetAlert para personalizar un modal donde el usuario pueda indica su nivel de fitness para ofrecerle o no, asesorias*/

let boton = document.getElementById("boton-especial");
boton.addEventListener("click", () => {

    const saludoPersonalizado = async () => {
        const inputOptions = new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    'te invitamos a asesorarte con nuestros especialistas': 'Bajo',
                    'Si gustas, tenemos especialistas a tu disposición': 'Medio',
                    'Seguro puedes manejarte solo, de igual forma nuestros especialistas están disponibles para ti': 'Alto'
                })
            }, 1000)
        })

        const { value: color } = await Swal.fire({
            title: 'Selecciona tu nivel fitness',
            input: 'radio',
            inputOptions: inputOptions,
            inputValidator: (value) => {
                if (!value) {
                    return 'Por favor, escoge una opción'
                }
            }
        })

        if (color) {
            Swal.fire({ html: `${color}` })
        }
    }
    saludoPersonalizado()
})