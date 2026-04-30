export interface Product {
  id: string;
  name: string;
  price: string;
  image: string;
  category: string;
  isNew?: boolean;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface BlogItem {
  id: string;
  title: string;
  date: string;
  image: string;
  excerpt: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  image: string;
  rating: number;
}

export interface ShowcaseItem {
  id: string;
  image: string;
  title?: string;
  description?: string;
  createdAt?: string;
}
