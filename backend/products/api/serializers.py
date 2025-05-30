from rest_framework import serializers
from products.models import Category, Product, Order, OrderItem, UserProductStats



class CategorySerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'children']

    def get_children(self, obj):
        return CategorySerializer(obj.children.all(), many=True).data
class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'
class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_id', 'quantity', 'price_at_purchase']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)
    customer = serializers.HiddenField(default=serializers.CurrentUserDefault())

    class Meta:
        model = Order
        fields = ['id', 'customer', 'created_at', 'total_price', 'items']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        customer = validated_data['customer']
        order = Order.objects.create(**validated_data)

        total = 0.0
        for item_data in items_data:
            product = item_data['product']
            quantity = item_data['quantity']
            price_at_purchase = item_data['price_at_purchase']  # Use price_at_purchase from the request
            total += price_at_purchase * quantity  # Calculate total based on price_at_purchase
            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=quantity,
                price_at_purchase=price_at_purchase
            )

        order.total_price = total
        order.save()
        return order

class UserProductStatsSerializer(serializers.ModelSerializer):
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())
    product = ProductSerializer(read_only=True)

    class Meta:
        model = UserProductStats
        fields = ['id', 'user', 'product', 'quantity', 'is_favorite']

    def create(self, validated_data):
        user = self.context['request'].user
        product = validated_data['product']
        quantity = validated_data.get('quantity', 0)
        is_favorite = validated_data.get('is_favorite', False)

        stats, created = UserProductStats.objects.update_or_create(
            user=user,
            product=product,
            defaults={'quantity': quantity, 'is_favorite': is_favorite}
        )
        return stats