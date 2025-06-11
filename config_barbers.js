// config_barbers.js

// A dizájn szerint ennyi kör látszik egyszerre a görgethető sávban alapból.
// Ha a ténylegesen megjelenítendő borbélyok száma ennél több,
// akkor aktiválódik a görgetés és a végtelenített loop.
const VISIBLE_BARBER_CIRCLES_DESIGN = 3;

const barberSetup = {
    // Meghatározza, hogy a 'barbers' tömbből maximum hány borbély adatait
    // vegyük figyelembe és jelenítsük meg az oldalon.
    profilesToDisplay: 6, // Visszaállítottam 6-ra, hogy mind látszódjon, de ezt kedvedre állíthatod

    // A borbélyok listája.
    barbers: [
        { 
            id: "b1", 
            name: "Klasszik Karesz", 
            imgSrc: "profiles/1.png", // Kép a kis körhöz és a nagy profilképhez
            text: "B1",               // Placeholder, ha nincs kép
            // ÚJ ADATOK A PROFILOLDALHOZ:
            bio: "Üdv! Karesz vagyok, a klasszikus és modern férfi hajvágások szakértője. Célom, hogy minden vendégem elégedetten és stílusosan távozzon.",
            referencePhotos: [
                "referenciak/david/ref_01.jpeg",
                "referenciak/david/ref_02.jpeg",
                "referenciak/david/ref_03.jpeg"
            ]
        },
        { 
            id: "b2", 
            name: "Modern Misi",    
            imgSrc: "profiles/2.png", 
            text: "B2",
            // ÚJ ADATOK A PROFILOLDALHOZ:
            bio: "Szia, Misi a nevem! Ha egy igazán trendi és egyedi frizurára vágysz, jó helyen jársz. Kövesd velem a divatot!",
            referencePhotos: [
                "referenciak/b2/misi_munka1.jpg",
                "referenciak/b2/misi_munka2.jpg"
            ]
        },
        { 
            id: "b3", 
            name: "Szakáll Szaki",  
            imgSrc: "profiles/3.png", 
            text: "B3",
            // ÚJ ADATOK A PROFILOLDALHOZ:
            bio: "A nevem mindent elárul! Legyen szó formázásról, ápolásról vagy egy teljesen új szakállstílusról, bízd rám magad!",
            referencePhotos: [
                "referenciak/b3/szaki_munka1.jpg"
            ]
        },
        { 
            id: "b4", 
            name: "Trendi Tomi",    
            imgSrc: "profiles/4.png", 
            text: "B4",
            // ÚJ ADATOK A PROFILOLDALHOZ:
            bio: "Tomi vagyok, mindig a legfrissebb nemzetközi trendeket hozom el nektek. Merj velem újítani!",
            referencePhotos: [] // Kezdetben lehet üres, ha még nincsenek képek
        },
        { 
            id: "b5", 
            name: "Fürge Frici",    
            imgSrc: "profiles/borbely_5.png", 
            text: "B5",
            // ÚJ ADATOK A PROFILOLDALHOZ:
            bio: "Precíz és gyors vágások mestere. Ha nincs sok időd, de tökéletes eredményt szeretnél, keress engem!",
            referencePhotos: [
                "referenciak/b5/frici_munka1.jpg",
                "referenciak/b5/frici_munka2.jpg",
                "referenciak/b5/frici_munka3.jpg",
                "referenciak/b5/frici_munka4.jpg"
            ]
        },
        { 
            id: "b6", 
            name: "Veterán Vili",   
            imgSrc: "profiles/borbely_6.png", 
            text: "B6",
            // ÚJ ADATOK A PROFILOLDALHOZ:
            bio: "Évtizedes tapasztalattal várom régi és új vendégeimet. A minőség és a hagyományok őrzője.",
            referencePhotos: [
                "referenciak/b6/vili_munka1.jpg"
            ]
        }
    ]
};