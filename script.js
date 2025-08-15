// =======================
// Cart logic (localStorage)
// =======================

let cart = JSON.parse(localStorage.getItem("cart")) || [];

function getProductById(id) {
  const products = [
    { id: 1, name: "Tričko Classic", price: 500, size: "M", img: "images/tshirt1.jpg" },
    { id: 2, name: "Mikina Fusion", price: 750, size: "L", img: "images/hoodie1.jpg" },
    { id: 3, name: "Kšiltovka Logo", price: 300, size: "Uni", img: "images/cap1.jpg" }
  ];
  return products.find(p => p.id === id);
}

function showTempMessage(message) {
    const tempMessage = document.createElement('div');
    tempMessage.classList.add('temp-message');
    tempMessage.textContent = message;
    document.body.appendChild(tempMessage);

    // Show the message
    tempMessage.classList.add('show');

    // Hide the message after 3 seconds
    setTimeout(() => {
        tempMessage.classList.remove('show');
        // Remove the message from the DOM after the transition
        setTimeout(() => {
            document.body.removeChild(tempMessage);
        }, 500);
    }, 3000);
}

function addToCart(product) {
    if (!product.size || product.size === "") {
        showTempMessage("Vyberte prosím velikost");
        return;
    }

    let cartItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        size: product.size,
        image: product.image,
        quantity: 1 // Додаємо кількість
    };

    if (product.type === 'custom') {
        cartItem.name = 'Vlastní potisk trička';
    }

    let cart = JSON.parse(localStorage.getItem('cart') || '[]');

    // Перевіряємо, чи товар з таким же ID і розміром вже є в кошику
    const existingItemIndex = cart.findIndex(item => item.id === cartItem.id && item.size === cartItem.size);
    if (existingItemIndex !== -1) {
        // Якщо товар вже є в кошику, збільшуємо кількість
        cart[existingItemIndex].quantity += 1;
        localStorage.setItem('cart', JSON.stringify(cart));
        showTempMessage("Množství zboží bylo zvýšeno!");
    } else {
        // Якщо товару немає в кошику, додаємо його
        cart.push(cartItem);
        localStorage.setItem('cart', JSON.stringify(cart));
        showTempMessage("Přidáno do košíku!");
    }

    updateCartCount();
    renderCartItems();
}

function renderCartItems() {
    const container = document.getElementById('cart-items') || document.getElementById('orderItems');
    if (!container) return;

    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    let total = 0;

    if (cart.length === 0) {
        container.innerHTML = '<p class="empty-cart">Ваш кошик порожній</p>';
        return;
    }

    container.innerHTML = cart.map((item, index) => `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.name}">
            <div class="cart-details">
                <h3>${item.name}</h3>
                <p>Розмір: ${item.size}</p>
                <p class="price">${item.price} Kč</p>
            </div>
            <button onclick="removeFromCart(${index})" class="btn remove-btn">Видалити</button>
        </div>
    `).join('');

    total = cart.reduce((sum, item) => sum + item.price, 0);
    const totalEl = document.getElementById('totalPrice');
    if (totalEl) {
        totalEl.textContent = `${total} Kč`;
    }
}

function updateCartCount() {
    const countEl = document.getElementById("cart-count");
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (countEl) countEl.textContent = cart.length;
}

function removeFromCart(index) {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (index >= 0 && index < cart.length) {
        cart.splice(index, 1);
        localStorage.setItem('cart', JSON.stringify(cart));
        renderCartItems();
        updateCartCount();
        if (document.querySelector('.checkout-container')) {
            renderOrderSummary(); // Оновлюємо вміст кошика на сторінці оформлення замовлення
        }
        if (document.getElementById('cartItems')) {
            updateCart(); // Оновлюємо вміст кошика на сторінці кошика
        }
        showTempMessage("Товар видалено з кошика!");
    } else {
        console.error("Невірний індекс для видалення");
    }
}

// =======================
// Order submission
// =======================
const form = document.getElementById("order-form");
if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const address = document.getElementById('address').value.trim();
    const note = document.getElementById('note').value.trim();
    const delivery = document.querySelector('input[name="delivery"]:checked');

    if (!delivery) {
      alert('Vyberte prosím způsob dopravy');
      return;
    }

    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (cart.length === 0) {
      alert('Váš košík je prázdný');
      return;
    }

    const orderData = {
      name: name,
      email: email,
      phone: phone,
      address: address,
      note: note,
      delivery: delivery.value,
      products: JSON.stringify(cart)
    };

    fetch('submit_order.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(orderData)
    })
    .then(response => response.text())
    .then(result => {
      if (result === 'OK') {
        localStorage.removeItem('cart');
        alert('Objednávka byla úspěšně odeslána! 🎉');
        window.location.href = "index.html";
      } else {
        alert('Došlo k chybě při zpracování objednávky. Zkuste to prosím znovu.');
      }
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Došlo k chybě při zpracování objednávky. Zkuste to prosím znovu.');
    });
  });
}

// =======================
// Print designer (canvas upload)
// =======================
const upload = document.getElementById("upload");
const canvas = document.getElementById("shirtCanvas");

if (upload && canvas) {
  const ctx = canvas.getContext("2d");
  const shirtImg = new Image();
  shirtImg.src = "images/shirt_black.png"; // Базовий макет футболки

  shirtImg.onload = () => ctx.drawImage(shirtImg, 0, 0, canvas.width, canvas.height);

  upload.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (evt) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(shirtImg, 0, 0, canvas.width, canvas.height); // малюємо футболку
        ctx.drawImage(img, 75, 120, 150, 150); // малюємо принт
      };
      img.src = evt.target.result;
    };
    reader.readAsDataURL(file);
  });
}

// =======================
// Init on all pages
// =======================
document.addEventListener("DOMContentLoaded", () => {
    renderCartItems();
    updateCartCount();
});

// =======================
// Fixing T-shirt color and side switching
// =======================
// Initialize variables for constructor
let currentView = 'front';
let currentColor = 'white';
let printIdCounter = 0;
let selectedPrintId = null;
const BASE_PRICE = 550;

// Get DOM elements
const tshirtPreview = document.getElementById('tshirtPreview');
const tshirtFrontWhite = document.getElementById('tshirtFrontWhite');
const tshirtFrontBlack = document.getElementById('tshirtFrontBlack');
const tshirtBackWhite = document.getElementById('tshirtBackWhite');
const tshirtBackBlack = document.getElementById('tshirtBackBlack');
const printContainerFront = document.getElementById('printContainerFront');
const printContainerBack = document.getElementById('printContainerBack');
const btnFront = document.getElementById('btnFront');
const btnBack = document.getElementById('btnBack');
const colorWhite = document.getElementById('colorWhite');
const colorBlack = document.getElementById('colorBlack');
const uploadImage = document.getElementById('uploadImage');
const priceElement = document.querySelector('.price');

// Set initial price
if (priceElement) {
    priceElement.textContent = `${BASE_PRICE} Kč`;
}

// Event listeners for buttons
btnFront?.addEventListener('click', () => setView('front'));
btnBack?.addEventListener('click', () => setView('back'));
colorWhite?.addEventListener('click', () => setColor('white'));
colorBlack?.addEventListener('click', () => setColor('black'));

// Function to change view (front/back)
function setView(view) {
    currentView = view;
    
    btnFront.classList.toggle('active', view === 'front');
    btnBack.classList.toggle('active', view === 'back');
    
    tshirtFrontWhite.classList.toggle('hidden', !(view === 'front' && currentColor === 'white'));
    tshirtFrontBlack.classList.toggle('hidden', !(view === 'front' && currentColor === 'black'));
    tshirtBackWhite.classList.toggle('hidden', !(view === 'back' && currentColor === 'white'));
    tshirtBackBlack.classList.toggle('hidden', !(view === 'back' && currentColor === 'black'));
    
    printContainerFront.classList.toggle('hidden', view !== 'front');
    printContainerBack.classList.toggle('hidden', view !== 'back');
}

// Function to change color
function setColor(color) {
    currentColor = color;
    
    colorWhite.classList.toggle('active', color === 'white');
    colorBlack.classList.toggle('active', color === 'black');
    
    if (currentView === 'front') {
        tshirtFrontWhite.classList.toggle('hidden', color !== 'white');
        tshirtFrontBlack.classList.toggle('hidden', color !== 'black');
    } else {
        tshirtBackWhite.classList.toggle('hidden', color !== 'white');
        tshirtBackBlack.classList.toggle('hidden', color !== 'black');
    }
}

// =======================
// Fixing image upload for custom print
// =======================
// Function to handle image upload
uploadImage?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
        alert('Prosím nahrajte pouze obrázky');
        return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        alert('Obrázek je příliš velký. Maximální velikost je 5MB');
        return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
        createPrint(event.target.result);
    };
    reader.onerror = () => {
        alert('Chyba při nahrávání obrázku');
    };
    reader.readAsDataURL(file);
});

// Function to create print
function createPrint(imageUrl) {
    const printId = `print-${printIdCounter++}`;
    const container = currentView === 'front' ? printContainerFront : printContainerBack;
    
    const printImg = document.createElement('img');
    printImg.id = printId;
    printImg.src = imageUrl;
    printImg.className = `print-${currentView}`;
    printImg.draggable = false;
    printImg.style.position = 'absolute';
    printImg.style.width = '100px';
    printImg.style.height = '100px';
    printImg.style.left = '50%';
    printImg.style.top = '50%';
    printImg.style.transform = 'translate(-50%, -50%)';
    
    container.appendChild(printImg);
    makePrintDraggable(printImg);
    
    // Показуємо контроль розміру
    document.getElementById('printSizeControl').classList.remove('hidden');
    
    // Встановлюємо поточний принт як вибраний
    selectedPrintId = printId;
    
    updatePrice();
}

// Додаємо обробник зміни розміру
const printSizeSlider = document.getElementById('printSize');
const printSizeValue = document.getElementById('printSizeValue');

printSizeSlider?.addEventListener('input', (e) => {
    const size = e.target.value;
    printSizeValue.textContent = `${size}px`;
    
    if (selectedPrintId) {
        const printImg = document.getElementById(selectedPrintId);
        if (printImg) {
            printImg.style.width = `${size}px`;
            printImg.style.height = `${size}px`;
        }
    }
});

// Додаємо вибір активного принта при кліку
function makePrintDraggable(element) {
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;

    element.addEventListener('mousedown', dragStart);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', dragEnd);

    function dragStart(e) {
        initialX = e.clientX - xOffset;
        initialY = e.clientY - yOffset;
        if (e.target === element) {
            isDragging = true;
        }
    }

    function drag(e) {
        if (isDragging) {
            e.preventDefault();
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;
            xOffset = currentX;
            yOffset = currentY;
            element.style.transform = `translate(${currentX}px, ${currentY}px)`;
        }
    }

    function dragEnd() {
        initialX = currentX;
        initialY = currentY;
        isDragging = false;
    }

    element.addEventListener('click', () => {
        selectedPrintId = element.id;
        const size = parseInt(element.style.width);
        printSizeSlider.value = size;
        printSizeValue.textContent = `${size}px`;
        document.getElementById('printSizeControl').classList.remove('hidden');
    });
}

// Function to update price
function updatePrice() {
    const prints = document.querySelectorAll('.print-front, .print-back');
    const printCount = prints.length;
    const totalPrice = BASE_PRICE + (printCount * 100); // 100 Kč за каждый принт
    if (priceElement) {
        priceElement.textContent = `${totalPrice} Kč`;
    }
}

// =======================
// Fixing Add to Cart functionality
// =======================
document.getElementById('addToCartBtn')?.addEventListener('click', () => {
    const size = document.getElementById('size')?.value;
    if (!size) {
        alert('Prosím vyberte velikost');
        return;
    }

    const prints = [];
    const frontPrints = Array.from(printContainerFront?.querySelectorAll('img') || []);
    const backPrints = Array.from(printContainerBack?.querySelectorAll('img') || []);
    
    if (frontPrints.length === 0 && backPrints.length === 0) {
        alert('Prosím přidejte alespoň jeden potisk');
        return;
    }

    [...frontPrints, ...backPrints].forEach(print => {
        prints.push({
            src: print.src,
            position: print.style.transform,
            size: print.style.width,
            side: print.closest('#printContainerFront') ? 'front' : 'back'
        });
    });

    const price = parseInt(priceElement.textContent);
   
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    cart.push(customProduct);
    localStorage.setItem('cart', JSON.stringify(cart));

    alert('Produkt byl přidán do košíku!');
});


// Функція для оновлення кошика
function updateCart() {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const cartItems = document.getElementById('cartItems');
    
    if (cartItems) {
        if (cart.length === 0) {
            cartItems.innerHTML = '<p class="empty-cart">Váš košík je prázdný</p>';
            return;
        }

        cartItems.innerHTML = cart.map((item, index) => `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-details">
                    <p><strong>${item.name}</strong></p>
                    ${item.size ? `<p>Velikost: ${item.size}</p>` : ''}
                    ${item.color ? `<p>Barva: ${item.color}</p>` : ''}
                    <p>Cena: ${item.price} Kč</p>
                </div>
                <div class="cart-actions">
                    <button onclick="removeFromCart(${index})">Odstranit</button>
                </div>
            </div>
        `).join('');

        // Оновлюємо загальну суму
        const total = cart.reduce((sum, item) => sum + item.price, 0);
        const totalEl = document.getElementById('totalPrice');
        if (totalEl) {
            totalEl.textContent = `Celkem: ${total} Kč`;
        }
    }
}

// Функція видалення з кошика
function removeFromCart(index) {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (index >= 0 && index < cart.length) {
        cart.splice(index, 1);
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCart();
        renderCartItems();
        updateCartCount();
        if (document.querySelector('.checkout-container')) {
            renderOrderSummary(); // Оновлюємо вміст кошика на сторінці оформлення замовлення
        }
        if (document.getElementById('cartItems')) {
            updateCart(); // Оновлюємо вміст кошика на сторінці кошика
        }
        showTempMessage("Товар видалено з кошика!");
    } else {
        console.error("Невірний індекс для видалення");
    }
}

// Ініціалізація при завантаженні сторінки
document.addEventListener('DOMContentLoaded', () => {
    updateCart();
});

// =======================
// Checkout page functionality
// =======================
// Function to render cart items on checkout page
function renderCheckoutItems() {
    const cartItems = document.getElementById('cartItems');
    const totalPrice = document.getElementById('totalPrice');
    
    if (!cartItems || !totalPrice) return;
    
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    let total = 0;
    
    cartItems.innerHTML = '';
    cart.forEach(item => {
        const itemEl = document.createElement('div');
        itemEl.className = 'cart-item';
        itemEl.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <div class="cart-details">
                <h3>${item.name}</h3>
                <p>Velikost: ${item.size || '-'}</p>
                <p>Cena: ${item.price} Kč</p>
            </div>
        `;
        cartItems.appendChild(itemEl);
        total += item.price;
    });
    
    totalPrice.textContent = `${total} Kč`;
}

// Function to handle order submission
function confirmOrder(event) {
    event.preventDefault();
    
    const name = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const address = document.getElementById('address').value.trim();
    const note = document.getElementById('note').value.trim();
    
    // Form validation
    if (!name || !phone || !address) {
        alert('Prosím vyplňte všechna povinná pole');
        return false;
    }
    
    // Phone validation
    const phoneRegex = /^(\+420|00420)?\s*[1-9][0-9]{2}\s*[0-9]{3}\s*[0-9]{3}$/;
    if (!phoneRegex.test(phone)) {
        alert('Prosím zadejte platné telefonní číslo');
        return false;
    }

    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (cart.length === 0) {
        alert('Váš košík je prázdný');
        return false;
    }
    
    const orderData = {
        name: name,
        phone: phone,
        address: address,
        note: note,
        products: JSON.stringify(cart)
    };
    
    fetch('submit_order.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(orderData)
    })
    .then(response => response.text())
    .then(result => {
        if (result === 'OK') {
            localStorage.removeItem('cart');
            document.getElementById('checkoutForm').style.display = 'none';
            document.getElementById('cartSummary').style.display = 'none';
            document.getElementById('orderSuccess').classList.remove('hidden');
        } else {
            alert('Došlo k chybě při zpracování objednávky. Zkuste to prosím znovu.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Došlo k chybě při zpracování objednávky. Zkuste to prosím znovu.');
    });
    
    return false;
}

// Initialize checkout page if we're on it
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.checkout')) {
        renderCheckoutItems();
    }
});

// =======================
// Render cart functionality
// =======================
function renderCart() {
  const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
  const container = document.getElementById('cartItems');
  const checkoutBtn = document.getElementById('checkoutBtn');
  let total = 0;

  if (cartItems.length === 0) {
    container.innerHTML = `
      <div class="empty-cart">
        <h2>Váš košík je prázdný</h2>
        <p>Přidejte nějaké produkty do košíku</p>
      </div>
    `;
    checkoutBtn.style.display = 'none';
    return;
  }

  container.innerHTML = cartItems.map((item, index) => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.name}">
      <div class="cart-details">
        <p><strong>${item.name}</strong></p>
        ${item.size ? `<p>Velikost: ${item.size}</p>` : ''}
        ${item.color ? `<p>Barva: ${item.color}</p>` : ''}
        <p>Cena: ${item.price} Kč</p>
      </div>
      <div class="cart-actions">
        <button onclick="removeFromCart(${index})">Odstranit</button>
      </div>
    </div>
  `).join('');

  total = cartItems.reduce((sum, item) => sum + item.price, 0);
  document.getElementById('totalPrice').textContent = `Celkem: ${total} Kč`;
  checkoutBtn.style.display = 'block';
}

function removeFromCart(index) {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  cart.splice(index, 1);
  localStorage.setItem('cart', JSON.stringify(cart));
  renderCart();
}

// =======================
// Delivery and Order Submission
// =======================
function selectDelivery(element, price) {
  document.querySelectorAll('.delivery-option').forEach(opt => {
    opt.classList.remove('selected');
  });
  element.classList.add('selected');
  updateTotal(price);
}

function updateTotal(shippingPrice) {
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = subtotal + shippingPrice;
  
  document.getElementById('subtotal').textContent = `${subtotal} Kč`;
  document.getElementById('shipping').textContent = `${shippingPrice} Kč`;
  document.getElementById('totalPrice').textContent = `${total} Kč`;
}

function submitOrder(event) {
  event.preventDefault();
  
  savePrintImage();

  const delivery = document.querySelector('input[name="delivery"]:checked');
    if (!delivery) {
        showTempMessage('Vyberte prosím způsob dopravy');
        return false;
    }

  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const orderData = {
    name: document.getElementById('name').value,
    email: document.getElementById('email').value,
    phone: document.getElementById('phone').value,
    address: document.getElementById('address').value,
    note: document.getElementById('note').value,
    items: JSON.stringify(cart), // Ensure items are sent as JSON
    total: document.getElementById('totalPrice').textContent,
    delivery: delivery.value,
    print_image: sessionStorage.getItem('printImage'),
    preview_image: sessionStorage.getItem('previewImage')
  };

  fetch('submit_order.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(orderData)
    })
    .then(response => response.text())
    .then(result => {
        if (result === 'OK') {
            localStorage.removeItem('cart');
            sessionStorage.removeItem('printImage');
            sessionStorage.removeItem('previewImage');
            document.getElementById('checkoutForm').style.display = 'none';
            document.getElementById('cartSummary').style.display = 'none';
            document.getElementById('orderSuccess').classList.remove('hidden');
        } else {
            alert('Došlo k chybě při zpracování objednávky. Zkuste to prosím znovu.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Došlo k chybě při zpracování objednávky. Zkuste to prosím znovu.');
    });
  
  return false;
}

// =======================
// Product modal functionality
// =======================
// Product Modal Functionality
const productModal = document.getElementById('productModal');
const modalClose = document.querySelector('.modal-close');
const modalMainImage = document.getElementById('modalMainImage');
let currentProduct = null;

function openProductModal(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;
  
  currentProduct = product;
  
  // Update modal content
  document.querySelector('.modal-title').textContent = product.name;
  document.querySelector('.modal-desc').textContent = product.description;
  document.querySelector('.modal-price').textContent = `${product.price} Kč`;
  
  // Set main image
  modalMainImage.src = product.images[0];
  
  // Generate thumbnails
  const thumbsContainer = document.querySelector('.gallery-thumbs');
  thumbsContainer.innerHTML = product.images.map((img, index) => `
    <img src="${img}" 
         class="gallery-thumb ${index === 0 ? 'active' : ''}" 
         onclick="changeModalImage('${img}', this)"
         alt="${product.name}"
    >
  `).join('');
  
  // Reset size selection
  document.querySelectorAll('.size-options button').forEach(btn => {
    btn.classList.remove('active');
  });
  
  // Show modal
  productModal.style.display = 'block';
  document.body.style.overflow = 'hidden';
}

function closeProductModal() {
  productModal.style.display = 'none';
  document.body.style.overflow = '';
  currentProduct = null;
}

function changeModalImage(src, thumbEl) {
  modalMainImage.src = src;
  document.querySelectorAll('.gallery-thumb').forEach(thumb => {
    thumb.classList.remove('active');
  });
  thumbEl.classList.add('active');
}

// Size selection
document.querySelectorAll('.size-options button').forEach(btn => {
  btn.addEventListener('click', (e) => {
    document.querySelectorAll('.size-options button').forEach(b => {
      b.classList.remove('active');
    });
    e.target.classList.add('active');
  });
});

// Add to cart from modal
document.querySelector('.add-to-cart-btn').addEventListener('click', () => {
  if (!currentProduct) return;
  
  const selectedSize = document.querySelector('.size-options button.active');
  if (!selectedSize) {
    alert('Prosím vyberte velikost');
    return;
  }
  
  const productToAdd = {
    ...currentProduct,
    size: selectedSize.dataset.size
  };
  
  addToCart(productToAdd);
  closeProductModal();
});

// Close modal on click outside
productModal.addEventListener('click', (e) => {
  if (e.target === productModal) {
    closeProductModal();
  }
});

modalClose.addEventListener('click', closeProductModal);

// Close on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && productModal.style.display === 'block') {
        closeProductModal();
    }
});

// =======================
// Custom print image handling
// =======================
document.addEventListener("DOMContentLoaded", function () {
    console.log('DOM fully loaded and parsed.');
    savePrintImage();
});

function savePrintImage() {
    console.log('Checking for #canvas-wrapper...');
    const wrapper = document.getElementById("canvas-wrapper");
    if (!wrapper) {
        console.error("Element #canvas-wrapper not found. It may not exist yet.");
        return null;
    }
    console.log('Found #canvas-wrapper');

    const canvas = wrapper.querySelector("canvas");
    if (!canvas) {
        console.error("Canvas not found inside #canvas-wrapper");
        return null;
    }

    console.log('Canvas found, saving...');
    const imageData = canvas.toDataURL("image/png");
    console.log('Image data:', imageData);
    return imageData;
}

// =======================
// Order Summary Rendering
// =======================
function renderOrderSummary() {
    const orderItems = document.getElementById('orderItems');
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    let subtotal = 0;

    if (cart.length === 0) {
        orderItems.innerHTML = '<p class="empty-cart">Кошик порожній</p>';
        return;
    }

    orderItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.name}">
            <div class="cart-item-details">
                <h4>${item.name}</h4>
                <p>Розмір: ${item.size || '-'}</p>
                <p>Ціна: ${item.price} Kč</p>
            </div>
        </div>
    `).join('');

    subtotal = cart.reduce((sum, item) => sum + item.price, 0);
    document.getElementById('subtotal').textContent = `${subtotal} Kč`;
    updateOrderTotal();
}

function updateOrderTotal() {
  const subtotal = parseInt(document.getElementById('subtotal').textContent);
  const shipping = parseInt(document.getElementById('shipping').textContent);
  document.getElementById('totalPrice').textContent = `${subtotal + shipping} Kč`;
}

// Оновлюємо вартість доставки при виборі способу
document.querySelectorAll('input[name="delivery"]').forEach(input => {
  input.addEventListener('change', (e) => {
    const shippingCost = e.target.value === 'nova_poshta' ? 129 : 149;
    document.getElementById('shipping').textContent = `${shippingCost} Kč`;
    updateOrderTotal();
  });
});

// Ініціалізуємо сторінку замовлення
if (document.querySelector('.checkout-container')) {
  renderOrderSummary();
}

// =======================
// Safety check for canvas-wrapper
// =======================
document.addEventListener("DOMContentLoaded", () => {
    const canvasWrapper = document.getElementById("canvas-wrapper");
    if (!canvasWrapper) {
        console.error('Element with id "canvas-wrapper" not found.');
        return;
    }

    // Виклик savePrintImage() або інших функцій, які залежать від canvas-wrapper
});