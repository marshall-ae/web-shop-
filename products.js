const products = [
  {
    id: 1,
    name: "Základní bílé tričko",
    price: 399,
    description: "Klasické bavlněné tričko s kulatým výstřihem, perfektní pro potisk",
    sizes: ["S", "M", "L", "XL"],
    images: [
      "images/tshirt1-front.jpg",
      "images/tshirt1-back.jpg",
      "images/tshirt1-detail.jpg"
    ],
    color: "white"
  },
  {
    id: 2,
    name: "Prémiové černé tričko",
    price: 499,
    description: "Kvalitní tričko z organické bavlny",
    sizes: ["S", "M", "L", "XL"],
    images: [
      "images/tshirt2-front.jpg",
      "images/tshirt2-back.jpg",
      "images/tshirt2-detail.jpg"
    ],
    color: "black"
  },
  {
    id: 3,
    name: "Sportovní tričko",
    price: 449,
    description: "Funkční tričko z prodyšného materiálu",
    sizes: ["S", "M", "L", "XL"],
    images: [
      "images/tshirt3-front.jpg",
      "images/tshirt3-back.jpg",
      "images/tshirt3-detail.jpg"
    ],
    color: "blue"
  },
  {
    id: 4,
    name: "Mikina Fusion",
    price: 750,
    description: "Stylová mikina pro každodenní nošení",
    sizes: ["S", "M", "L", "XL"],
    images: [
      "images/hoodie1-front.jpg",
      "images/hoodie1-back.jpg",
      "images/hoodie1-detail.jpg"
    ],
    color: "gray"
  },
  {
    id: 5,
    name: "Kšiltovka Logo",
    price: 300,
    description: "Kšiltovka s logem pro fanoušky",
    sizes: ["Uni"],
    images: [
      "images/cap1-front.jpg",
      "images/cap1-back.jpg",
      "images/cap1-detail.jpg"
    ],
    color: "black"
  }
];

function getProductById(id) {
  return products.find(p => p.id === id);
}
