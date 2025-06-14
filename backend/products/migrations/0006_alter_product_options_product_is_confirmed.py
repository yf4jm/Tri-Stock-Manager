# Generated by Django 5.2 on 2025-04-05 13:26

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('products', '0005_product_is_favorite'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='product',
            options={'ordering': ['-is_favorite', 'name']},
        ),
        migrations.AddField(
            model_name='product',
            name='is_confirmed',
            field=models.BooleanField(default=False),
        ),
    ]
