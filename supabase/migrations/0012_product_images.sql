-- 0012_product_images.sql
-- Asigna una imagen real y distinta a cada producto (via su variante base).
-- Las imagenes son URLs externas de Unsplash tematicas por categoria.

update public.product_variants v
set image_url = m.url
from public.products p
join (values
  ('POL-001', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop&q=80&fm=jpg'),
  ('POL-002', 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=600&h=600&fit=crop&q=80&fm=jpg'),
  ('POL-003', 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&h=600&fit=crop&q=80&fm=jpg'),
  ('POL-004', 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&h=600&fit=crop&q=80&fm=jpg'),
  ('CAM-001', 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&h=600&fit=crop&q=80&fm=jpg'),
  ('CAM-002', 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&h=600&fit=crop&q=80&fm=jpg'),
  ('CAM-003', 'https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=600&h=600&fit=crop&q=80&fm=jpg'),
  ('CAM-004', 'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=600&h=600&fit=crop&q=80&fm=jpg'),
  ('PAN-001', 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&h=600&fit=crop&q=80&fm=jpg'),
  ('PAN-002', 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&h=600&fit=crop&q=80&fm=jpg'),
  ('PAN-003', 'https://images.unsplash.com/photo-1584865288642-42078afe6942?w=600&h=600&fit=crop&q=80&fm=jpg'),
  ('PAN-004', 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=600&h=600&fit=crop&q=80&fm=jpg'),
  ('CAS-001', 'https://images.unsplash.com/photo-1543076447-215ad9ba6923?w=600&h=600&fit=crop&q=80&fm=jpg'),
  ('CAS-002', 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&h=600&fit=crop&q=80&fm=jpg'),
  ('CAS-003', 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=600&fit=crop&q=80&fm=jpg'),
  ('CAS-004', 'https://images.unsplash.com/photo-1544923246-77307dd654cb?w=600&h=600&fit=crop&q=80&fm=jpg'),
  ('ZAP-001', 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&h=600&fit=crop&q=80&fm=jpg'),
  ('ZAP-002', 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&h=600&fit=crop&q=80&fm=jpg'),
  ('ZAP-003', 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&h=600&fit=crop&q=80&fm=jpg'),
  ('ZAP-004', 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600&h=600&fit=crop&q=80&fm=jpg'),
  ('ACC-001', 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600&h=600&fit=crop&q=80&fm=jpg'),
  ('ACC-002', 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=600&h=600&fit=crop&q=80&fm=jpg'),
  ('ACC-003', 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=600&h=600&fit=crop&q=80&fm=jpg'),
  ('ACC-004', 'https://images.unsplash.com/photo-1434056886845-dac89ffe9b56?w=600&h=600&fit=crop&q=80&fm=jpg')
) as m(sku, url) on m.sku = p.sku
where v.product_id = p.id;
