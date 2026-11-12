export interface Producto {
  id: string;
  nombre: string;
  precio: number;
  imagen: string;
  ingredientes: string[];
  elaboracion: string;
  categoriaId: string;
  activo: boolean;
}
