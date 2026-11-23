USE delivery_app_db;

-- 1. ROLES
INSERT INTO roles (nombre) VALUES
('CLIENTE'),
('ADMIN'),
('REPARTIDOR'),
('OPERADOR'),
('SUPERVISOR');

-- 2. USUARIOS
-- Reemplazar HASH_BCRYPT_GENERADO por el hash obtenido con bcrypt.
INSERT INTO usuarios (rol_id, email, password) VALUES
(1, 'cliente1@delivery.com', 'HASH_BCRYPT_GENERADO'),
(1, 'cliente2@delivery.com', 'HASH_BCRYPT_GENERADO'),
(1, 'cliente3@delivery.com', 'HASH_BCRYPT_GENERADO'),
(1, 'cliente4@delivery.com', 'HASH_BCRYPT_GENERADO'),
(1, 'cliente5@delivery.com', 'HASH_BCRYPT_GENERADO');

-- 3. CLIENTES
INSERT INTO clientes (usuario_id, nombre, telefono, direccion) VALUES
(1, 'Ana Pérez', '3815550001', 'Av. Aconquija 100'),
(2, 'Juan Gómez', '3815550002', 'San Martín 250'),
(3, 'Lucía Torres', '3815550003', '25 de Mayo 300'),
(4, 'Pedro Díaz', '3815550004', 'Maipú 450'),
(5, 'Sofía Ruiz', '3815550005', 'Santiago 550');

-- 4. CATEGORIAS
INSERT INTO categorias (nombre) VALUES
('Pizzas'),
('Hamburguesas'),
('Empanadas'),
('Bebidas'),
('Postres');

-- 5. PRODUCTOS
INSERT INTO productos (categoria_id, nombre, precio, stock) VALUES
(1, 'Pizza muzzarella', 8500.00, 20),
(2, 'Hamburguesa completa', 7200.00, 15),
(3, 'Docena de empanadas', 9000.00, 25),
(4, 'Gaseosa 1.5 litros', 2500.00, 40),
(5, 'Flan casero', 1800.00, 12);

-- 6. CUPONES
INSERT INTO cupones (codigo, descuento, activo) VALUES
('BIENVENIDA10', 10.00, TRUE),
('DESCUENTO15', 15.00, TRUE),
('PROMO20', 20.00, TRUE),
('ENVIO5', 5.00, TRUE),
('INACTIVO10', 10.00, FALSE);

-- 7. PEDIDOS
INSERT INTO pedidos (cliente_id, cupon_id, estado, fecha) VALUES
(1, 1, 'PENDIENTE', NOW()),
(2, 2, 'CONFIRMADO', NOW()),
(3, 3, 'EN_PREPARACION', NOW()),
(4, 4, 'EN_CAMINO', NOW()),
(5, 5, 'ENTREGADO', NOW());

-- 8. PEDIDO_PRODUCTOS
INSERT INTO pedido_productos
(pedido_id, producto_id, cantidad, precio_unitario) VALUES
(1, 1, 1, 8500.00),
(2, 2, 2, 7200.00),
(3, 3, 1, 9000.00),
(4, 4, 2, 2500.00),
(5, 5, 1, 1800.00);
