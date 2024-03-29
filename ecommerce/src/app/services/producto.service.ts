import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Producto } from '../models/producto';
import { CartItem } from '../models/cartItem';


@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private cart: CartItem[] = [];
  url= 'http://localhost:4000/api/productos/'

  constructor(private http:  HttpClient) { }
  getProductos(page: number, itemsPerPage: number): Observable<any> {
    const url = `${this.url}?page=${page}&itemsPerPage=${itemsPerPage}`;
    return this.http.get(url);
    
  }
  getProductDetails(productId: string) {
    return this.http.get(`http://localhost:4000/api/productos/${productId}`);

  }
  addToCart(product: Producto): void {
    const cartItem: CartItem = {
      product: product,
      quantity: 1,
      size: product.tallas,
      price: product.precio,
      imagen: product.imagen
    };
  
    this.cart.push(cartItem);
  
    // Guardar el carrito actualizado en el almacenamiento local
    localStorage.setItem('cart', JSON.stringify(this.cart));
    console.log('Carrito actualizado:', this.cart);
  }

  getCartItems(): Observable<CartItem[]> {
    console.log('Elementos del carrito en el servicio:', this.cart);
    return of(this.cart);
  }
  updateCart(cart: CartItem[]): void {
    this.cart = cart;
}
  
}





