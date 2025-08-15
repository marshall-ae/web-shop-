let currentProduct = null;
let selectedSize = null;

function openModal(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    currentProduct = product;
    const modal = document.getElementById('productModal');
    
    // Заповнюємо дані
    document.getElementById('modalImage').src = product.images[0];
    document.getElementById('modalTitle').textContent = product.name;
    document.getElementById('modalDescription').textContent = product.description;
    document.getElementById('modalPrice').textContent = `${product.price} Kč`;

    // Розміри
    const sizeOptions = document.getElementById('sizeOptions');
    sizeOptions.innerHTML = product.sizes.map(size => `
        <div class="size-option" onclick="selectSize('${size}')">${size}</div>
    `).join('');

    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    document.getElementById('productModal').style.display = 'none';
    document.body.style.overflow = '';
    currentProduct = null;
    selectedSize = null;
}

function selectSize(size) {
    selectedSize = size;
    document.querySelectorAll('.size-option').forEach(el => {
        el.classList.toggle('active', el.textContent === size);
    });
}

function addToCartFromModal() {
    if (!currentProduct || !selectedSize) {
        alert('Prosím vyberte velikost');
        return;
    }

    const productToAdd = {
        ...currentProduct,
        size: selectedSize
    };

    addToCart(productToAdd);
    closeModal();
}

// Закриття по кліку поза модальним вікном
document.getElementById('productModal').addEventListener('click', (e) => {
    if (e.target.classList.contains('product-modal')) {
        closeModal();
    }
});

// Закриття по Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.getElementById('productModal').style.display === 'block') {
        closeModal();
    }
});
