import './style.css';

interface Image {
  thumbnail: string;
  mobile: string;
  tablet: string;
  desktop: string;
}

interface Dessert {
  image: Image;
  name: string;
  category: string;
  price: number;
}

interface CartItem extends Dessert {
  quantity: number;
}

const menu = document.getElementById('menu') as HTMLDivElement;
const cart = document.getElementById('cart') as HTMLDivElement;
const cartItems = document.getElementById('cart-items') as HTMLUListElement;
const cartCount = document.getElementById('cartCount') as HTMLSpanElement;
const totalPrice = document.getElementById('total-price') as HTMLSpanElement;
const confirmOrder = document.getElementById('confirm-order') as HTMLButtonElement;
const confirmationPopup = document.getElementById('confirmationPopup') as HTMLDivElement;
const popupItems = document.getElementById('popupItems') as HTMLUListElement;
const popupTotal = document.getElementById('popupTotal') as HTMLSpanElement;
const newOrder = document.getElementById('newOrder') as HTMLButtonElement;

let cartData: CartItem[] = [];

fetch('/desserts.json')
  .then(response => {
    if (!response.ok) {
      throw new Error('Failed to fetch desserts.json');
    }
    return response.json();
  })
  .then((data: Dessert[]) => {
    data.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = 'dessert-card';
      card.innerHTML = `
        <img src="${item.image.desktop}" alt="${item.name}" data-mobile="${item.image.mobile}" data-tablet="${item.image.tablet}" data-desktop="${item.image.desktop}">
        <div class="info">
        <button data-id="${index}"><img src="./assets/images/icon-add-to-cart.svg" alt="cart">Add to Cart</button>
          <h3>${item.name}</h3>
          <p>$${item.price.toFixed(2)}</p>
          
        </div>
      `;
      menu.appendChild(card);

      const addButton = card.querySelector('button') as HTMLButtonElement;
      addButton.addEventListener('click', () => {
        const id = parseInt(addButton.getAttribute('data-id')!);
        const cartItem = cartData.find(c => c.name === data[id].name);
        if (cartItem) {
          cartItem.quantity++;
        } else {
          cartData.push({ ...data[id], quantity: 1 });
        }
        updateCart();
      });
    });

    const updateImages = () => {
      const items = document.querySelectorAll('.dessert-card img') as NodeListOf<HTMLImageElement>;
      items.forEach((img) => {
        const width = window.innerWidth;
        let newSrc: string;
        if (width <= 768) {
          newSrc = img.dataset.mobile || img.src;
        } else if (width <= 1200) {
          newSrc = img.dataset.tablet || img.src;
        } else {
          newSrc = img.dataset.desktop || img.src;
        }
        console.log(`Setting image for ${img.alt}: ${newSrc}`);
        if (newSrc) {
          img.src = newSrc;
        }
        img.onerror = () => {
          console.error(`Failed to load image: ${img.src}`);
        };
      });
    };

    window.addEventListener('resize', updateImages);
    updateImages();
  })
  .catch(error => {
    console.error('Error fetching desserts:', error);
  });

function updateCart() {
  cartItems.innerHTML = '';
  const emptyCartImage = cart.querySelector('.cart-image') as HTMLImageElement;
  const emptyCartText = emptyCartImage.nextElementSibling as HTMLParagraphElement;

  if (cartData.length === 0) {
    emptyCartImage.style.display = 'block';
    emptyCartText.style.display = 'block';
  } else {
    emptyCartImage.style.display = 'none';
    emptyCartText.style.display = 'none';
    cartData.forEach(item => {
      const li = document.createElement('li');
      li.textContent = `${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`;
      cartItems.appendChild(li);
    });
  }

  cartCount.textContent = cartData.length.toString();
  const total = cartData.reduce((sum, item) => sum + item.price * item.quantity, 0);
  totalPrice.textContent = total.toFixed(2);
}

confirmOrder.addEventListener('click', () => {
  if (cartData.length > 0) {
    popupItems.innerHTML = cartData.map(item => `<li>${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}</li>`).join('');
    popupTotal.textContent = totalPrice.textContent;
    confirmationPopup.style.display = 'block';
  }
});

newOrder.addEventListener('click', () => {
  cartData = [];
  updateCart();
  confirmationPopup.style.display = 'none';
});