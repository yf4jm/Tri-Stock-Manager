from rest_framework import status, generics, viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.generics import ListAPIView
from django.db.models import Q,F
from products.models import Category, Product, Order, OrderItem, UserProductStats
from products.api.serializers import OrderSerializer
from .serializers import CategorySerializer, ProductSerializer, UserProductStatsSerializer
from rest_framework.decorators import api_view

class CategoryTreeAPIView(APIView):
    def get(self, request):
        root_categories = Category.objects.filter(parent=None)
        serializer = CategorySerializer(root_categories, many=True)
        return Response(serializer.data)


class ProductByCategoryAPIView(ListAPIView):
    serializer_class = UserProductStatsSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        category_id = self.kwargs.get('category_id')
        user = self.request.user

        try:
            category = Category.objects.get(id=category_id)
        except Category.DoesNotExist:
            return UserProductStats.objects.none()

        def get_all_descendants(cat):
            descendants = []
            for child in cat.children.all():
                descendants.append(child)
                descendants.extend(get_all_descendants(child))
            return descendants

        subcategories = get_all_descendants(category)
        categories = [category] + subcategories

        return UserProductStats.objects.filter(
            user=user,
            product__category__in=categories
        ).distinct()


class ProductSearchAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        query = request.GET.get("q", "").strip()
        if not query:
            return Response({"error": "Missing search query (?q=)"}, status=status.HTTP_400_BAD_REQUEST)

        user = request.user
        products = UserProductStats.objects.filter(
            Q(product__name__icontains=query) |
            Q(product__label__icontains=query) |
            Q(product__slug__icontains=query),
            user=user,
        )

        serializer = UserProductStatsSerializer(products, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class CreateOrderView(generics.CreateAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        items_data = request.data.get('items', [])
        if not items_data:
            return Response({'detail': 'No items provided'}, status=status.HTTP_400_BAD_REQUEST)

        total_price = 0.0
        order = Order.objects.create(customer=request.user)

        for item in items_data:
            product_id = item.get('product_id')
            quantity = item.get('quantity', 1)
            price_at_purchase = item.get('price_at_purchase', 0)

            try:
                product = Product.objects.get(pk=product_id)
            except Product.DoesNotExist:
                return Response({'detail': f'Product {product_id} not found'}, status=status.HTTP_404_NOT_FOUND)

            total_price += price_at_purchase * quantity

            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=quantity,
                price_at_purchase=price_at_purchase
            )

        order.total_price = total_price
        order.save()

        serializer = OrderSerializer(order)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class OrderListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        orders = Order.objects.filter(customer=request.user).order_by('-created_at')
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ProductListView(ListAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer


class ProductFavoriteToggleAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, product_id):
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response({"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND)

        user_product_stats, _ = UserProductStats.objects.get_or_create(user=request.user, product=product)
        user_product_stats.is_favorite = not user_product_stats.is_favorite
        user_product_stats.save()

        return Response({"is_favorite": user_product_stats.is_favorite}, status=status.HTTP_200_OK)


class UserProductStatsAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        stats = UserProductStats.objects.filter(user=request.user)
        serializer = UserProductStatsSerializer(stats, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class AddToBasketAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        product_id = request.data.get('product_id')
        quantity = int(request.data.get('quantity', 1))
        price = float(request.data.get('price_at_purchase', 0))

        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

        # Get or create unconfirmed order
        order, created = Order.objects.get_or_create(customer=user, is_confirmed=False)
        if OrderItem.objects.filter(order=order, product=product).exists():
            OrderItem.objects.filter(order=order, product=product).update(quantity=F('quantity') + 1)
        else:
            OrderItem.objects.create(
            order=order,
            product=product,
            quantity=quantity,
            price_at_purchase=price
                )

        return Response({'message': 'Item added to basket.'}, status=status.HTTP_200_OK)
    

class ConfirmOrderAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            order = Order.objects.get(customer=request.user, is_confirmed=False)
        except Order.DoesNotExist:
            return Response({'error': 'No unconfirmed order found.'}, status=status.HTTP_404_NOT_FOUND)

        total_price = 0

        for item in order.items.all():
            total_price += item.quantity * item.price_at_purchase

            # Update or create UserProductStats for this user and product
            user_product_stat, created = UserProductStats.objects.get_or_create(
                user=request.user,
                product=item.product,
                defaults={'quantity': 0}
            )
            user_product_stat.quantity += item.quantity
            user_product_stat.save()

        order.total_price = total_price
        order.is_confirmed = True
        order.save()

        return Response({'message': 'Order confirmed successfully.'}, status=status.HTTP_200_OK)
    
class BasketAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            order = Order.objects.get(customer=request.user, is_confirmed=False)
        except Order.DoesNotExist:
            return Response({'items': []})

        items = order.items.all()
        data = [{
            'id': item.id,
            'product': item.product.name,
            'quantity': item.quantity,
            'price_at_purchase': item.price_at_purchase
        } for item in items]

        return Response({'items': data, 'order_id': order.id})
    
class ConfirmedOrdersAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        orders = Order.objects.filter(customer=request.user, is_confirmed=True).order_by('-created_at')
        data = [{
            'id': order.id,
            'created_at': order.created_at.strftime('%d/%m/%Y'),
            'total_price': order.total_price
        } for order in orders]

        return Response(data)
class DeleteFromBasketAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        order_item_id = request.data.get('order_item_id')
        try:
            print(order_item_id)
            item = OrderItem.objects.get(id=order_item_id, order__customer=request.user, order__is_confirmed=False)
        except OrderItem.DoesNotExist:
            return Response({'error': 'Item not found in your unconfirmed basket.'}, status=status.HTTP_404_NOT_FOUND)

        item.delete()
        return Response({'message': 'Item removed from basket.'}, status=status.HTTP_200_OK)

class UpdateBasketItemAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        order_item_id = request.data.get('order_item_id')
        quantity = request.data.get('quantity')
        price = float(request.data.get('price'))

        try:
            item = OrderItem.objects.get(id=order_item_id, order__customer=request.user, order__is_confirmed=False)
        except OrderItem.DoesNotExist:
            return Response({'error': 'Item not found in your unconfirmed basket.'}, status=status.HTTP_404_NOT_FOUND)

        if quantity is not None:
            item.quantity = quantity

        if price is not None:
            item.price_at_purchase = price

        item.save()
        return Response({'message': 'Item updated successfully.'}, status=status.HTTP_200_OK)

@api_view(['PATCH'])
def update_quantity(request, pk):
    try:
        product = UserProductStats.objects.filter(product__id=pk).first()
        new_qty = request.data.get('quantity')
        if new_qty is not None and new_qty >= 0:
            product.quantity = new_qty
            product.save()
            return Response({'status': 'updated'}, status=200)
        return Response({'error': 'quantity not provided'}, status=400)
    except Product.DoesNotExist:
        return Response({'error': 'Product not found'}, status=404)
    
class OrderDetailView(generics.RetrieveAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(customer=self.request.user)
    
@api_view(['DELETE'])
def delete_order(request, pk):
    try:
        order = Order.objects.get(id=pk, customer=request.user)
        order.delete()
        return Response({"detail": "Order deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
    except Order.DoesNotExist:
        return Response({"error": "Order not found."}, status=status.HTTP_404_NOT_FOUND)