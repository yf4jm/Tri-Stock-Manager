from django.db import models
from django.contrib.auth import get_user_model
User = get_user_model()
# Create your models here.
class Category(models.Model):
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255)
    parent = models.ForeignKey('self', blank=True, null=True, related_name='children', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = "categories"

    def __str__(self):
        return self.name
class UserProductStats(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_stocks')
    product = models.ForeignKey('Product', on_delete=models.CASCADE, related_name='user_stocks')
    quantity = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_favorite = models.BooleanField(default=False)
    class Meta:
        ordering = ['-is_favorite', '-quantity','product__name']
    def __str__(self):
        return f"{self.user.username} - {self.product.name} ({self.quantity})"

class Product(models.Model):
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True)
    label = models.CharField(max_length=255, blank=True, null=True)
    url_reference = models.URLField(max_length=255, blank=True, null=True)
    image = models.ImageField(upload_to='products/', blank=True, null=True)
    category = models.ForeignKey(Category, related_name='products', on_delete=models.CASCADE)
    price = models.FloatField(null=True, blank=True, default=0.0)
    

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        ordering = ['name']
    def __str__(self):
        return  f"{self.name} ({self.category.name})"
class Order(models.Model):
    customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    created_at = models.DateTimeField(auto_now_add=True)
    total_price = models.FloatField(default=0.0)
    is_confirmed = models.BooleanField(default=False)
    def __str__(self):
        return f"Order #{self.pk} by {self.customer}"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    price_at_purchase = models.FloatField()

    def __str__(self):
        return f"{self.quantity} x {self.product.name}"
    