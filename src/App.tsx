import { useEffect, useMemo, useState } from "react";

type Product = {
  id: string;
  name: string;
  description: string;
  image: string;
  accent: string;
};

const products: Product[] = [
  {
    id: "oreo",
    name: "Oreo",
    description: "Budín de vainilla con trozos generosos de galletitas Oreo.",
    image: "/assets/budin-oreo.jpeg",
    accent: "El más pedido",
  },
  {
    id: "pepitos",
    name: "Pepitos",
    description: "Budín de vainilla con chips y el toque crocante de Pepitos.",
    image: "/assets/budin-pepitos.jpeg",
    accent: "Extra chocolate",
  },
  {
    id: "chips",
    name: "Chips de chocolate",
    description: "Masa de vainilla suave y esponjosa, con chips de chocolate.",
    image: "/assets/budin-chips.jpeg",
    accent: "Favorito de todos",
  },
  {
    id: "chocolinas",
    name: "Chocolinas",
    description:
      "Budín de vainilla con trozos de Chocolinas, intenso y crocante.",
    image: "/assets/budin-pepitos.jpeg",
    accent: "Bien chocolatoso",
  },
  {
    id: "vainilla",
    name: "Vainilla solo",
    description: "El clásico de vainilla: suave, esponjoso y con sabor casero.",
    image:
      "https://images.unsplash.com/photo-1605466237764-3d8d802c8a8d?auto=format&fit=crop&w=900&q=85",
    accent: "El clásico",
  },
];

const UNIT_PRICE = 5000;
const WHOLESALE_PRICE = 3500;
const WHOLESALE_MIN = 6;
const SHIPPING_PRICE = 1000;
const cakeFlavors = [
  "Vainilla",
  "Naranja",
  "Limón",
  "Combinado (naranja y limón)",
] as const;
const locations = {
  mendoza: {
    name: "Mendoza",
    detail: "El Challao, Las Heras",
    whatsapp: "5492616921356",
    shipping: "Envíos hasta 10 km desde El Challao",
  },
  sarmiento: {
    name: "Capitán Sarmiento",
    detail: "Buenos Aires",
    whatsapp: "5493876155924",
    shipping: "Envíos a todo el pueblo",
  },
} as const;

type LocationId = keyof typeof locations;

const money = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

function Icon({
  name,
  size = 20,
}: {
  name: "bag" | "minus" | "plus" | "truck" | "heart" | "arrow" | "check";
  size?: number;
}) {
  const paths = {
    bag: (
      <>
        <path d="M6 8h12l1 13H5L6 8Z" />
        <path d="M9 9V6a3 3 0 0 1 6 0v3" />
      </>
    ),
    minus: <path d="M5 12h14" />,
    plus: <path d="M12 5v14M5 12h14" />,
    truck: (
      <>
        <path d="M3 6h11v11H3zM14 10h4l3 3v4h-7z" />
        <circle cx="7" cy="19" r="2" />
        <circle cx="18" cy="19" r="2" />
      </>
    ),
    heart: (
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />
    ),
    arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
    check: <path d="m5 12 4 4L19 6" />,
  };

  return (
    <svg
      aria-hidden="true"
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
    >
      {paths[name]}
    </svg>
  );
}

export default function App() {
  useEffect(() => {
    document.title = "Flor de azucar  | Pasteleria Artezanal";
  }, []);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [shipping, setShipping] = useState(true);
  const [cartOpen, setCartOpen] = useState(false);
  const [cakeFlavor, setCakeFlavor] =
    useState<(typeof cakeFlavors)[number]>("Vainilla");
  const [customerName, setCustomerName] = useState("");
  const [address, setAddress] = useState("");
  const [locationId, setLocationId] = useState<LocationId>("mendoza");
  const selectedLocation = locations[locationId];

  const totalItems = Object.values(quantities).reduce(
    (sum, value) => sum + value,
    0,
  );
  const hasWholesale = totalItems >= WHOLESALE_MIN;
  const itemPrice = hasWholesale ? WHOLESALE_PRICE : UNIT_PRICE;
  const productsTotal = totalItems * itemPrice;
  const total = productsTotal + (shipping && totalItems ? SHIPPING_PRICE : 0);
  const remaining = Math.max(WHOLESALE_MIN - totalItems, 0);
  const savings = hasWholesale
    ? totalItems * (UNIT_PRICE - WHOLESALE_PRICE)
    : 0;
  const canConfirm = !shipping || address.trim().length >= 5;

  const orderMessage = useMemo(() => {
    const items = products
      .filter((product) => quantities[product.id])
      .map((product) => `• ${product.name}: ${quantities[product.id]}`)
      .join("\n");
    return encodeURIComponent(
      `¡Hola Flor de Azúcar! Quiero confirmar este pedido por encargo:\n\n${items}\n\nSabor de la masa: ${cakeFlavor}\nCantidad total: ${totalItems}\nPrecio por budín: ${money.format(itemPrice)}${hasWholesale ? " (precio mayorista aplicado)" : ""}\nSucursal: ${selectedLocation.name}\nEntrega: ${shipping ? `Envío a ${address.trim()}` : "Retiro a coordinar"}\nCosto de envío: ${shipping ? money.format(SHIPPING_PRICE) : "$0"}\nTotal: ${money.format(total)}${customerName.trim() ? `\n\nNombre: ${customerName.trim()}` : ""}\n\nQuedo a la espera de la confirmación. ¡Gracias!`,
    );
  }, [
    address,
    cakeFlavor,
    customerName,
    hasWholesale,
    itemPrice,
    selectedLocation.name,
    quantities,
    shipping,
    total,
    totalItems,
  ]);

  function changeQuantity(id: string, amount: number) {
    setQuantities((current) => ({
      ...current,
      [id]: Math.max(0, (current[id] || 0) + amount),
    }));
  }

  function scrollToProducts() {
    document
      .querySelector("#productos")
      ?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#fffaf8] text-[#36181e]">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-[#e9d5d7]/80 bg-[#fffaf8]/95 backdrop-blur-md">
        <div className="mx-auto flex h-[74px] max-w-[1240px] items-center justify-between px-5 lg:px-8">
          <a
            className="flex items-center gap-3"
            href="#"
            aria-label="Flor de Azúcar, inicio"
          >
            <img
              src="/assets/flor-de-azucar-logo.png"
              alt="Flor de Azúcar"
              className="h-14 w-14 rounded-full object-cover object-left shadow-sm"
            />
            <div className="hidden sm:block">
              <p className="font-display text-[23px] leading-none">
                Flor de Azúcar
              </p>
              <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.22em] text-[#9a6570]">
                Pastelería artesanal
              </p>
            </div>
          </a>
          <nav
            className="hidden items-center gap-8 text-sm font-medium md:flex"
            aria-label="Principal"
          >
            <a className="nav-link" href="#productos">
              Budines
            </a>
            <a className="nav-link" href="#precios">
              Precios
            </a>
            <a className="nav-link" href="#nosotros">
              Nosotros
            </a>
            <a
              className="nav-link"
              href="https://www.instagram.com/flordeazucar_95"
              target="_blank"
              rel="noreferrer"
            >
              Instagram
            </a>
          </nav>
          <button
            className="cart-button"
            onClick={() => setCartOpen((open) => !open)}
            aria-expanded={cartOpen}
            aria-controls="cart-panel"
          >
            <Icon name="bag" size={19} />
            <span className="hidden sm:inline">Mi pedido</span>
            <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-white px-1 text-xs font-bold text-[#a83055]">
              {totalItems}
            </span>
          </button>
        </div>
      </header>

      <section className="relative min-h-[750px] pt-[74px] lg:min-h-[790px]">
        <div className="absolute inset-0 top-[74px]">
          <img
            src="/assets/budin-oreo.jpeg"
            alt="Budín artesanal de Oreo de Flor de Azúcar"
            className="h-full w-full object-cover object-center"
          />
          <div className="hero-overlay absolute inset-0" />
        </div>
        <div className="relative mx-auto flex min-h-[676px] max-w-[1240px] items-center px-5 py-20 lg:px-8">
          <div className="max-w-[650px]">
            <p className="mb-7 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.28em] text-[#a83055]">
              <span className="h-px w-8 bg-[#d6537a]" />
              Hechos a mano, como en casa
            </p>
            <h1 className="font-display max-w-[620px] text-[clamp(3.1rem,6.2vw,5.7rem)] leading-[0.9] tracking-[-0.045em] text-[#3b1620]">
              Que cada bocado te recuerde a
              <span className="ml-[0.16em] italic text-[#c93f6a]">
                Flor de Azúcar.
              </span>
            </h1>
            <p className="mt-8 max-w-[510px] text-base leading-7 text-[#6c4c53] sm:text-lg">
              Budines esponjosos, recién horneados y con tus variedades
              favoritas. La masa es de vainilla por defecto, o podés pedirla de
              naranja, limón o combinada.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <button className="primary-button" onClick={scrollToProducts}>
                Armar mi pedido <Icon name="arrow" size={19} />
              </button>
              <div className="flex items-center gap-3 text-sm font-semibold">
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#dcbfc4] bg-white/70 text-[#bd3f64]">
                  <Icon name="truck" size={19} />
                </span>
                Pedidos por encargo · Envíos $1.000
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-1/2 hidden w-[calc(100%-40px)] max-w-[1180px] -translate-x-1/2 translate-y-1/2 grid-cols-3 overflow-hidden rounded-2xl border border-[#ead7d8] bg-[#fffaf8] shadow-[0_18px_60px_rgba(90,34,48,0.12)] md:grid">
          <div className="price-promise">
            <span className="promise-number">01</span>
            <div>
              <strong>Receta artesanal</strong>
              <small>Horneados por encargo</small>
            </div>
          </div>
          <div className="price-promise border-x border-[#ead7d8]">
            <span className="promise-number">02</span>
            <div>
              <strong>Precio mayorista</strong>
              <small>Automático desde 6 unidades</small>
            </div>
          </div>
          <div className="price-promise">
            <span className="promise-number">03</span>
            <div>
              <strong>Envíos accesibles</strong>
              <small>Mendoza y Capitán Sarmiento</small>
            </div>
          </div>
        </div>
      </section>

      <section
        id="productos"
        className="mx-auto max-w-[1240px] scroll-mt-24 px-5 pb-24 pt-28 lg:px-8 lg:pt-36"
      >
        <div className="mb-12 flex flex-col justify-between gap-7 md:flex-row md:items-end">
          <div>
            <p className="eyebrow">Nuestra selección</p>
            <h2 className="section-title">Elegí tus budines</h2>
          </div>
          <div className="max-w-[430px] rounded-xl border border-[#ecd7db] bg-[#fff1f3] px-5 py-4 text-sm leading-6 text-[#734c55]">
            <strong className="text-[#a83055]">
              Todos son de vainilla por defecto.
            </strong>{" "}
            Podés combinar Oreo, chips, Chocolinas, Pepitos o vainilla solo.
          </div>
        </div>

        <div className="mb-9 rounded-2xl border border-[#ead9dc] bg-white p-5 shadow-[0_10px_35px_rgba(70,27,38,0.05)] sm:p-7">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
            <div>
              <p className="eyebrow !mb-1">Sabor de la masa</p>
              <h3 className="font-display text-2xl sm:text-3xl">
                ¿Cómo querés la masa?
              </h3>
              <p className="mt-2 text-sm text-[#80636a]">
                Si no cambiás la opción, todos tus budines serán de vainilla.
              </p>
            </div>
            <div
              className="grid grid-cols-2 gap-2 sm:grid-cols-4"
              role="radiogroup"
              aria-label="Sabor del budín"
            >
              {cakeFlavors.map((flavor) => (
                <button
                  className={`flavor-button ${cakeFlavor === flavor ? "flavor-button-active" : ""}`}
                  key={flavor}
                  onClick={() => setCakeFlavor(flavor)}
                  role="radio"
                  aria-checked={cakeFlavor === flavor}
                >
                  {flavor}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product, index) => {
            const quantity = quantities[product.id] || 0;
            return (
              <article className="product-card" key={product.id}>
                <div className="relative h-[270px] overflow-hidden">
                  <img
                    src={product.image}
                    alt={`Budín de ${product.name}`}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                  <span className="absolute left-4 top-4 rounded-full bg-[#fffaf8]/90 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#9f3655] backdrop-blur">
                    {product.accent}
                  </span>
                  <span className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#c54068]">
                    <Icon name="heart" size={17} />
                  </span>
                  <span className="absolute bottom-3 left-4 font-display text-5xl text-white/80">
                    0{index + 1}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-display text-[29px] leading-tight">
                    {product.name}
                  </h3>
                  <p className="mt-2 min-h-[48px] text-sm leading-6 text-[#80636a]">
                    {product.description}
                  </p>
                  <div className="mt-5 flex items-end justify-between border-t border-[#ecdfe0] pt-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#a28289]">
                        Por unidad
                      </p>
                      <p className="mt-1 text-lg font-bold">
                        {money.format(
                          hasWholesale ? WHOLESALE_PRICE : UNIT_PRICE,
                        )}
                      </p>
                    </div>
                    {quantity === 0 ? (
                      <button
                        className="add-button"
                        onClick={() => changeQuantity(product.id, 1)}
                        aria-label={`Agregar budín ${product.name}`}
                      >
                        <Icon name="plus" />
                      </button>
                    ) : (
                      <div
                        className="quantity-control"
                        aria-label={`Cantidad de ${product.name}`}
                      >
                        <button
                          onClick={() => changeQuantity(product.id, -1)}
                          aria-label="Quitar uno"
                        >
                          <Icon name="minus" size={16} />
                        </button>
                        <span>{quantity}</span>
                        <button
                          onClick={() => changeQuantity(product.id, 1)}
                          aria-label="Agregar uno"
                        >
                          <Icon name="plus" size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section
        id="precios"
        className="scroll-mt-24 bg-[#391820] px-5 py-24 text-white lg:px-8"
      >
        <div className="mx-auto grid max-w-[1180px] gap-12 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <div>
            <p className="eyebrow !text-[#f49ab3]">Más budines, más dulzura</p>
            <h2 className="font-display text-[clamp(3rem,6vw,5rem)] leading-[0.95] tracking-[-0.035em]">
              Un precio especial para compartir.
            </h2>
            <p className="mt-6 max-w-xl text-base leading-7 text-[#d8c3c8]">
              Combiná todas las variedades que quieras. El descuento se aplica
              automáticamente cuando tu pedido supera las 5 unidades.
            </p>
            <div className="mt-10 grid max-w-xl grid-cols-2 gap-px overflow-hidden rounded-2xl bg-white/15">
              <div className="bg-[#4b202b] p-6 sm:p-8">
                <small className="text-xs uppercase tracking-[0.15em] text-[#d6b8c0]">
                  1 a 5 budines
                </small>
                <strong className="mt-2 block text-3xl sm:text-4xl">
                  $5.000
                </strong>
                <span className="mt-1 block text-xs text-[#d6b8c0]">
                  cada uno
                </span>
              </div>
              <div className="bg-[#d34a72] p-6 sm:p-8">
                <small className="text-xs uppercase tracking-[0.15em] text-white/80">
                  6 o más
                </small>
                <strong className="mt-2 block text-3xl sm:text-4xl">
                  $3.500
                </strong>
                <span className="mt-1 block text-xs text-white/80">
                  cada uno
                </span>
              </div>
            </div>
          </div>
          <div
            id="nosotros"
            className="rounded-3xl bg-[#fff5f4] p-7 text-[#35171e] sm:p-10"
          >
            <p className="font-display text-3xl italic text-[#b4385e]">
              El detalle importa
            </p>
            <ul className="mt-7 space-y-5">
              {[
                "Elaboración artesanal en tandas pequeñas",
                "Ingredientes seleccionados y mucho amor",
                "Sabores que podés combinar libremente",
                "Pedidos preparados especialmente para vos",
              ].map((item) => (
                <li
                  className="flex items-center gap-4 text-sm font-semibold"
                  key={item}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f4d7df] text-[#b9395f]">
                    <Icon name="check" size={17} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <footer className="bg-[#261015] px-5 py-10 text-[#d7bec4] lg:px-8">
        <div className="mx-auto flex max-w-[1180px] flex-col justify-between gap-6 text-sm sm:flex-row sm:items-center">
          <div>
            <p className="font-display text-2xl text-white">Flor de Azúcar</p>
            <p className="mt-1">Pastelería artesanal · Hecho con amor</p>
            <a
              className="mt-3 inline-block font-bold text-[#f0a1b7] transition hover:text-white"
              href="https://www.instagram.com/flordeazucar_95"
              target="_blank"
              rel="noreferrer"
            >
              Instagram · @flordeazucar_95
            </a>
          </div>
          <button
            className="flex items-center gap-2 font-bold text-white"
            onClick={scrollToProducts}
          >
            Elegir mis budines <Icon name="arrow" />
          </button>
        </div>
      </footer>

      {totalItems > 0 && (
        <aside
          id="cart-panel"
          className={`cart-panel ${cartOpen ? "cart-panel-open" : ""}`}
          aria-label="Resumen del pedido"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="eyebrow !mb-1">Tu pedido</p>
              <h2 className="font-display text-3xl">
                {totalItems} {totalItems === 1 ? "budín" : "budines"}
              </h2>
            </div>
            <button
              className="text-sm font-bold text-[#a83055] lg:hidden"
              onClick={() => setCartOpen(false)}
            >
              Cerrar
            </button>
          </div>

          {!hasWholesale ? (
            <div className="mt-5 rounded-xl bg-[#fff0f3] p-4">
              <div className="flex items-center justify-between text-xs font-bold">
                <span>Te faltan {remaining}</span>
                <span>Precio mayorista</span>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#eed5dc]">
                <div
                  className="h-full rounded-full bg-[#cf456d] transition-all"
                  style={{ width: `${(totalItems / WHOLESALE_MIN) * 100}%` }}
                />
              </div>
              <p className="mt-3 text-xs leading-5 text-[#7d5b63]">
                Agregá {remaining} más y todos bajan a $3.500 c/u.
              </p>
            </div>
          ) : (
            <div className="mt-5 flex items-center gap-3 rounded-xl bg-[#ecf5ee] p-4 text-sm font-bold text-[#2d6b3c]">
              <Icon name="check" /> ¡Precio mayorista aplicado! Ahorrás{" "}
              {money.format(savings)}.
            </div>
          )}

          <div className="my-5 max-h-40 space-y-2 overflow-y-auto pr-1">
            {products
              .filter((product) => quantities[product.id])
              .map((product) => (
                <div className="flex justify-between text-sm" key={product.id}>
                  <span>
                    {product.name}{" "}
                    <span className="text-[#9a7e84]">
                      × {quantities[product.id]}
                    </span>
                  </span>
                  <strong>
                    {money.format(quantities[product.id] * itemPrice)}
                  </strong>
                </div>
              ))}
          </div>

          <div className="mb-4 rounded-xl border border-[#ead9dc] bg-[#fff9f8] p-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#a28289]">
              Sabor de la masa
            </p>
            <p className="mt-1 text-sm font-bold text-[#a83055]">
              {cakeFlavor}
            </p>
          </div>

          <fieldset className="mb-4">
            <legend className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#a28289]">
              ¿Dónde hacés tu pedido?
            </legend>
            <div className="grid grid-cols-2 gap-2">
              {(
                Object.entries(locations) as [
                  LocationId,
                  (typeof locations)[LocationId],
                ][]
              ).map(([id, location]) => (
                <button
                  className={`location-button ${locationId === id ? "location-button-active" : ""}`}
                  key={id}
                  type="button"
                  onClick={() => {
                    setLocationId(id);
                    setAddress("");
                  }}
                >
                  <strong>{location.name}</strong>
                  <small>{location.detail}</small>
                </button>
              ))}
            </div>
          </fieldset>

          <button
            className="shipping-toggle"
            onClick={() => setShipping((value) => !value)}
          >
            <span className="flex items-center gap-3">
              <Icon name="truck" />
              <span className="text-left">
                <strong className="block text-sm">Quiero envío</strong>
                <small className="text-[#8b7077]">
                  {selectedLocation.shipping} · $1.000
                </small>
              </span>
            </span>
            <span className={`toggle ${shipping ? "toggle-on" : ""}`}>
              <span />
            </span>
          </button>

          <div className="mt-4 grid gap-3">
            <label className="checkout-field">
              <span>Tu nombre</span>
              <input
                type="text"
                value={customerName}
                onChange={(event) => setCustomerName(event.target.value)}
                placeholder="¿A nombre de quién?"
              />
            </label>
            {shipping && (
              <label className="checkout-field">
                <span>Dirección de entrega *</span>
                <input
                  type="text"
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  placeholder={
                    locationId === "mendoza"
                      ? "Dirección cerca de El Challao"
                      : "Calle y número en Capitán Sarmiento"
                  }
                  required
                />
                {!canConfirm && (
                  <small>Completá la dirección para confirmar el pedido.</small>
                )}
              </label>
            )}
          </div>

          <div className="mt-5 flex items-end justify-between border-t border-[#ecdfe1] pt-5">
            <span className="text-sm text-[#7c6268]">Total</span>
            <strong className="text-2xl">{money.format(total)}</strong>
          </div>
          <a
            className={`mt-4 flex w-full items-center justify-center gap-2 rounded-xl px-5 py-4 text-sm font-bold text-white transition ${
              canConfirm
                ? "bg-[#bd3d62] hover:bg-[#9f2c4e]"
                : "pointer-events-none bg-[#c8afb6]"
            }`}
            href={
              canConfirm
                ? `https://wa.me/${selectedLocation.whatsapp}?text=${orderMessage}`
                : undefined
            }
            target="_blank"
            rel="noreferrer"
            aria-disabled={!canConfirm}
          >
            Confirmar pedido por WhatsApp <Icon name="arrow" />
          </a>
        </aside>
      )}

      {totalItems > 0 && !cartOpen && (
        <button
          className="mobile-cart-bar lg:hidden"
          onClick={() => setCartOpen(true)}
        >
          <span className="flex items-center gap-2">
            <Icon name="bag" /> Ver mi pedido ({totalItems})
          </span>
          <strong>{money.format(total)}</strong>
        </button>
      )}
    </main>
  );
}
