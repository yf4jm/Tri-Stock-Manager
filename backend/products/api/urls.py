from django.urls import path
from .views import CategoryTreeAPIView, ProductByCategoryAPIView,ProductSearchAPIView, CreateOrderView,OrderListView, ProductListView,ProductFavoriteToggleAPIView,UserProductStatsAPIView
from .views import (
    AddToBasketAPIView,
    BasketAPIView,
    ConfirmOrderAPIView,
    ConfirmedOrdersAPIView,
    DeleteFromBasketAPIView,
    UpdateBasketItemAPIView,
    update_quantity,
    OrderDetailView,
    delete_order
)
urlpatterns = [
    path('categories/', CategoryTreeAPIView.as_view(), name='category-list'),
    path('categories/<int:category_id>/products/', ProductByCategoryAPIView.as_view(), name='products-by-category'),
    path('products/search/', ProductSearchAPIView.as_view(), name='product-search'),
    path('orders/add/', CreateOrderView.as_view(), name='order-create'),
    path('orders/', OrderListView.as_view(), name='order-list'),
    path('products/', ProductListView.as_view(), name='product-list'),
    path('products/<int:product_id>/toggle_favorite/', ProductFavoriteToggleAPIView.as_view(), name='toggle_favorite'),
    path('user/products/', UserProductStatsAPIView.as_view(), name='user-product-stats'),


    path('orders/add-to-basket/', AddToBasketAPIView.as_view(), name='add-to-basket'),
    path('orders/basket/', BasketAPIView.as_view(), name='basket'),
    path('orders/confirm-order/', ConfirmOrderAPIView.as_view(), name='confirm-order'),
    path('orders/confirmed-orders/', ConfirmedOrdersAPIView.as_view(), name='confirmed-orders'),
    path('orders/delete-from-basket/', DeleteFromBasketAPIView.as_view(), name='delete-from-basket'),
    path('orders/update-basket-item/', UpdateBasketItemAPIView.as_view(), name='update-basket-item'),
    path('products/<int:pk>/update_quantity/', update_quantity),
    path('orders/<int:pk>/', OrderDetailView.as_view(), name='order-detail'),
    path('orders/<int:pk>/delete/', delete_order, name='order-delete'),
]