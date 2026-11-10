/* Каталог шаблона «Сирень и Соль». Магазин и цены вымышлены.
   ph — фото товара (файлы в папке img/). */
window.PLACEHOLDER = "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e3e8dc"/><stop offset="1" stop-color="#e9dff0"/></linearGradient></defs><rect width="300" height="400" fill="url(#g)"/><g fill="none" stroke="#66755b" stroke-width="2" opacity=".5"><path d="M150 330V170"/><path d="M150 250c-30-10-45-35-40-60 25 5 40 30 40 60zM150 220c30-10 45-35 40-60-25 5-40 30-40 60z"/><circle cx="150" cy="140" r="26"/><circle cx="150" cy="140" r="9"/></g></svg>');
const sz = (a, b, c) => [{ l: "S", p: a }, { l: "M", p: b }, ...(c ? [{ l: "L", p: c }] : [])];
window.ITEMS = [
  { id: "utro", c: "author", t: "Утренний сад", tag: "Хит", p: 3900, v: sz(3900, 5200, 6900), ph: ["img/utro.jpg"],
    d: "Нежные розы и гвоздики в пудровой крафтовой бумаге. Лёгкий букет на каждый день." },
  { id: "lavanda", c: "author", t: "Лавандовый вечер", p: 4200, v: sz(4200, 5600), ph: ["img/lavanda.jpg"],
    d: "Сиреневая альстромерия с зеленью в нежной упаковке. Стоит в вазе до двух недель." },
  { id: "oblako", c: "author", t: "Облако", p: 4800, v: sz(4800, 6400), ph: ["img/oblako.jpg"],
    d: "Белая гортензия, персиковые розы и оранжевые каллы. Подходит к любому поводу." },
  { id: "jam", c: "author", t: "Вишнёвый джем", tag: "Новинка", p: 3600, v: sz(3600, 4900, 6500), ph: ["img/jam.jpg"],
    d: "Алые розы, белые и розовые гвоздики. Яркий и праздничный букет." },
  { id: "pole", c: "author", t: "Полевой", p: 2700, v: sz(2700, 3600), ph: ["img/pole.jpg"],
    d: "Сезонные полевые цветы — как будто только что с летнего луга." },
  { id: "nezhnost", c: "author", t: "Нежность", p: 4500, v: sz(4500, 5900), ph: ["img/nezhnost.jpg"],
    d: "Пышные розовые пионы — самые нежные цветы сезона." },
  { id: "mondial", c: "mono", t: "Розы Мондиаль", p: 3400, v: [{ l: "9 шт", p: 3400 }, { l: "15 шт", p: 5300 }, { l: "25 шт", p: 8500 }], ph: ["img/mondial.jpg"],
    d: "Крупные белые розы из Эквадора с бутоном до 7 см." },
  { id: "pionroza", c: "mono", t: "Пионы", p: 3900, v: [{ l: "5 шт", p: 3900 }, { l: "9 шт", p: 6500 }, { l: "15 шт", p: 9900 }], ph: ["img/pionroza.jpg"],
    d: "Розовые и белые пионы. Привозим в бутонах — раскроются у вас дома за 1–2 дня." },
  { id: "tulips", c: "mono", t: "Ранункулюсы", p: 3600, v: [{ l: "9 шт", p: 3600 }, { l: "15 шт", p: 5600 }, { l: "25 шт", p: 8900 }], ph: ["img/tulips.jpg"],
    d: "Ранункулюсы — «маленькие розы» с десятками тонких лепестков." },
  { id: "gortenzia", c: "mono", t: "Гортензия", p: 3300, v: [{ l: "3 шт", p: 3300 }, { l: "5 шт", p: 5200 }, { l: "7 шт", p: 7200 }], ph: ["img/gortenzia.jpg"],
    d: "Пышные шапки гортензии. Голубая, белая или розовая — по наличию." },
  { id: "alstro", c: "mono", t: "Альстромерия", p: 2400, v: [{ l: "7 шт", p: 2400 }, { l: "11 шт", p: 3500 }], ph: ["img/alstro.jpg"],
    d: "Стойкая и яркая: стоит в вазе до двух недель." },
  { id: "pudra", c: "box", t: "Букет в вазе «Пудра»", p: 4900, v: sz(4900, 6900), ph: ["img/pudra.jpg"],
    d: "Розовые и сиреневые цветы в стеклянной вазе — ставить никуда не нужно, ваза в подарок." },
  { id: "provans", c: "box", t: "Пионы в вазе «Прованс»", p: 5900, ph: ["img/provans.jpg"],
    d: "Пионы в хрустальной вазе. Готовый подарок: просто поставить на стол." },
  { id: "sad", c: "box", t: "Алый сад", p: 4400, ph: ["img/sad.jpg"],
    d: "Красные розы и альстромерия — для тех, кто любит насыщенные цвета." },
  { id: "kompl", c: "mini", t: "Букет-комплимент", p: 1500, ph: ["img/kompl.jpg"],
    d: "Несколько веток белой эустомы, чтобы просто порадовать без повода." },
  { id: "privet", c: "mini", t: "Мини-букет «Привет»", p: 2200, ph: ["img/privet.jpg"],
    d: "Солнечные герберы в прозрачной упаковке с лентой." },
  { id: "sub-week", c: "sub", t: "Подписка: раз в неделю", p: 3200, v: sz(3200, 4500, 5900), ph: ["img/hero2.jpg"],
    d: "Цена за один букет. После оформления флорист свяжется, чтобы выбрать день доставки. Доставка бесплатно, ваза в подарок с первым букетом." },
  { id: "sub-2week", c: "sub", t: "Подписка: раз в две недели", p: 3500, v: sz(3500, 4800, 6300), ph: ["img/hero1.jpg"],
    d: "Цена за один букет. Флорист свяжется, чтобы выбрать день доставки. Доставка бесплатно." },
  { id: "sub-month", c: "sub", t: "Подписка: раз в месяц", p: 3900, v: sz(3900, 5200, 6900), ph: ["img/hero3.jpg"],
    d: "Цена за один букет. Флорист свяжется, чтобы выбрать день доставки. Доставка бесплатно." }
];
/* фото для декоративных блоков */
window.DECOR = { hero1: "img/hero1.jpg", hero2: "img/hero2.jpg", hero3: "img/hero3.jpg", how1: "img/how1.jpg", how2: "img/how2.jpg", how3: "img/how3.jpg" };
/* Фото с Wikimedia Commons, свободные лицензии; авторы указаны на сайте */
window.CREDITS = [{"k": "utro", "a": "Lizzie", "l": "CC0", "u": "https://commons.wikimedia.org/wiki/File:Paper-wrapped_bouquet_(Unsplash).jpg"}, {"k": "lavanda", "a": "Андреа Де Маттеис", "l": "CC BY 3.0", "u": "https://commons.wikimedia.org/wiki/File:Bouquet_(111782303).jpeg"}, {"k": "oblako", "a": "Jina Lee", "l": "CC BY-SA 3.0", "u": "https://commons.wikimedia.org/wiki/File:Rose_hydrangea_calla_wedding_bouquet.jpg"}, {"k": "jam", "a": "Suyash Dwivedi", "l": "CC BY-SA 4.0", "u": "https://commons.wikimedia.org/wiki/File:Rose_and_carnation_flower_bouquet_02.jpg"}, {"k": "pole", "a": "Øyvind Holmstad", "l": "CC BY-SA 4.0", "u": "https://commons.wikimedia.org/wiki/File:Bouquet_of_flowers_at_Grythengen.jpg"}, {"k": "nezhnost", "a": "Alexandra Seinet", "l": "CC0", "u": "https://commons.wikimedia.org/wiki/File:Peony_vase_(Unsplash).jpg"}, {"k": "mondial", "a": "Pittigrilli", "l": "CC BY-SA 4.0", "u": "https://commons.wikimedia.org/wiki/File:Bouquet_of_roses_in_front_of_painting.jpg"}, {"k": "pionroza", "a": "Kor!An (Андрей Корзун)", "l": "CC BY-SA 3.0", "u": "https://commons.wikimedia.org/wiki/File:Bouquet_of_peonies_11.JPG"}, {"k": "tulips", "a": "Cliomd1", "l": "CC BY-SA 4.0", "u": "https://commons.wikimedia.org/wiki/File:Ranunculus,_flower.jpg"}, {"k": "gortenzia", "a": "Jules Verne Times Two", "l": "CC BY-SA 4.0", "u": "https://commons.wikimedia.org/wiki/File:Vase_of_bigleaf_hydrangeas_(Hydrangea_macrophylla)(PPL3-Altered)_julesvernex2.jpg"}, {"k": "alstro", "a": "Lillimor", "l": "CC BY 4.0", "u": "https://commons.wikimedia.org/wiki/File:Alstroemeria_in_Tashkent.jpg"}, {"k": "pudra", "a": "DaisyMaysBouquets", "l": "CC BY-SA 4.0", "u": "https://commons.wikimedia.org/wiki/File:Romantic_Bouquet.JPG"}, {"k": "provans", "a": "Kor!An (Андрей Корзун)", "l": "CC BY-SA 3.0", "u": "https://commons.wikimedia.org/wiki/File:Bouquet_of_peonies_12.JPG"}, {"k": "sad", "a": "Pariycha", "l": "CC0", "u": "https://commons.wikimedia.org/wiki/File:Qizil_guldasta.jpg"}, {"k": "kompl", "a": "Downtowngal", "l": "CC BY-SA 4.0", "u": "https://commons.wikimedia.org/wiki/File:White_Lisianthus_in_vase.jpg"}, {"k": "privet", "a": "Missvain", "l": "CC BY 4.0", "u": "https://commons.wikimedia.org/wiki/File:Birthday_flower_bouquet_-_2021-08-26_-_Sarah_Stierch.jpg"}, {"k": "hero1", "a": "Kor!An (Андрей Корзун)", "l": "CC BY-SA 3.0", "u": "https://commons.wikimedia.org/wiki/File:Bouquet_of_peonies_02.JPG"}, {"k": "hero2", "a": "George Chernilevsky", "l": "Public domain", "u": "https://commons.wikimedia.org/wiki/File:Poppies_bouquet_2017_G1.jpg"}, {"k": "hero3", "a": "Ruth Hartnup from Vancouver, Canada", "l": "CC BY 2.0", "u": "https://commons.wikimedia.org/wiki/File:Bouquet_of_white_roses_(2486808368).jpg"}, {"k": "how1", "a": "Kürschner", "l": "CC BY 3.0", "u": "https://commons.wikimedia.org/wiki/File:Palastbl%C3%BChen,_Kunstpalast_D%C3%BCsseldorf,_Victoria_Bernds_f%C3%BCr_Blumenbinderei_Lehmann_(3).jpg"}, {"k": "how2", "a": "DaisyMaysBouquets", "l": "CC BY-SA 4.0", "u": "https://commons.wikimedia.org/wiki/File:Bouquet_and_boots.JPG"}, {"k": "how3", "a": "மாலதி. மு", "l": "CC BY-SA 4.0", "u": "https://commons.wikimedia.org/wiki/File:Roses_6.jpg"}];
