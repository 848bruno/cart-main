
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
const cartItems = document.getElementById('cartItems') as HTMLUListElement;
const cartCount = document.getElementById('cartCount') as HTMLSpanElement;
const cartTotal = document.getElementById('cartTotal') as HTMLSpanElement;
const confirmOrder = document.getElementById('confirmOrder') as HTMLButtonElement;
const confirmationPopup = document.getElementById('confirmationPopup') as HTMLDivElement;
const popupItems = document.getElementById('popupItems') as HTMLUListElement;
const popupTotal = document.getElementById('popupTotal') as HTMLSpanElement;
const newOrder = document.getElementById('newOrder') as HTMLButtonElement;

let cart: CartItem[] = [];

fetch('/desserts.json')
  .then(response => response.json())
  .then((data: Dessert[]) => {
    data.forEach((item, index) => {
      const div = document.createElement('div');
      div.className = 'menu-item';
      div.innerHTML = `
        <img src="${item.image.thumbnail}" alt="${item.name}" data-mobile="${item.image.mobile}" data-tablet="${item.image.tablet}" data-desktop="${item.image.desktop}">
        <p>${item.name} - $${item.price.toFixed(2)}</p>
        <button data-id="${index}">Add to Cart</button>
      `;
      menu.appendChild(div);
    });

    // image switching based on screen size
    const updateImages = () => {
      const items = document.querySelectorAll('.menu-item img') as NodeListOf<HTMLImageElement>;
      items.forEach((img) => {
        const width = window.innerWidth;
        if (width <= 768) {
          img.src = img.dataset.mobile!;
        } else if (width <= 1200) {
          img.src = img.dataset.tablet!;
        } else {
          img.src = img.dataset.desktop!;
        }
      });
    };

    window.addEventListener('resize', updateImages);
    updateImages();

    document.querySelectorAll('.menu-item button').forEach(button => {
      button.addEventListener('click', () => {
        const id = parseInt(button.getAttribute('data-id')!);
        const item = data[id];
        const cartItem = cart.find(c => c.name === item.name);
        if (cartItem) {
          cartItem.quantity++;
        } else {
          cart.push({ ...item, quantity: 1 });
        }
        updateCart();
      });
    });
  });

function updateCart() {
  cartItems.innerHTML = '';
  let total = 0;
  cart.forEach(item => {
    const li = document.createElement('li');
    li.textContent = `${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`;
    cartItems.appendChild(li);
    total += item.price * item.quantity;
  });
  cartCount.textContent = cart.length.toString();
  cartTotal.textContent = total.toFixed(2);
}

confirmOrder.addEventListener('click', () => {
  if (cart.length > 0) {
    popupItems.innerHTML = cart.map(item => `<li>${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}</li>`).join('');
    popupTotal.textContent = cartTotal.textContent;
    confirmationPopup.style.display = 'block';
  }
});

newOrder.addEventListener('click', () => {
  cart = [];
  updateCart();
  confirmationPopup.style.display = 'none';
});
