import os
import csv
import requests
from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand
from django.utils.text import slugify
from django.conf import settings
from products.models import Category, Product  # Adjust as needed

class Command(BaseCommand):
    help = "Import products from CSV files, download images, and save them to the database"

    CSV_BASE_DIR = r'C:\Users\yf4jm\Documents\GitHub\Tri-Stock-Manager\tri_csv'

    def handle(self, *args, **options):
        category_cache = {}  # (path, name) -> Category

        for root, dirs, files in os.walk(self.CSV_BASE_DIR, topdown=True):
            rel_path = os.path.relpath(root, self.CSV_BASE_DIR)
            path_parts = rel_path.split(os.sep) if rel_path != '.' else []
            parent = None

            # Traverse and create category path
            for depth, part in enumerate(path_parts):
                partial_path = os.sep.join(path_parts[:depth + 1])
                if partial_path not in category_cache:
                    slug = slugify(part.strip())
                    parent = Category.objects.create(
                        name=part.strip(),
                        slug=slug,
                        parent=parent
                    )
                    category_cache[partial_path] = parent
                else:
                    parent = category_cache[partial_path]

            # Create product categories only if there are CSV files
            for file_name in files:
                if file_name.endswith('.csv'):
                    cat_name = os.path.splitext(file_name)[0]
                    cat_slug = slugify(cat_name)

                    # Create final category for file
                    category = Category.objects.create(
                        name=cat_name,
                        slug=cat_slug,
                        parent=parent
                    )

                    file_path = os.path.join(root, file_name)
                    self.stdout.write(f"Importing {file_path} into category {category.name}")

                    with open(file_path, newline='', encoding='utf-8') as csvfile:
                        reader = csv.DictReader(csvfile)
                        for row in reader:
                            product_name = row.get("name", "").strip()
                            if not product_name:
                                continue

                            product_slug = slugify(product_name)
                            image_url = row.get("image_src", "").strip()

                            product, created = Product.objects.update_or_create(
                                slug=product_slug,
                                defaults={
                                    'name': product_name,
                                    'label': row.get("label", "").strip(),
                                    'url_reference': row.get("hyp_href", "").strip(),
                                    'category': category,
                                }
                            )

                            if created or not product.image:
                                self.save_product_image(product, image_url)

                    self.stdout.write(f"✓ Finished importing {file_name}")

    def save_product_image(self, product, image_url):
        if not image_url:
            return

        try:
            response = requests.get(image_url, timeout=10)
            if response.status_code == 200:
                file_ext = os.path.splitext(image_url.split("?")[0])[-1] or ".jpg"
                file_name = f"{product.slug}{file_ext}"
                product.image.save(file_name, ContentFile(response.content), save=True)
                self.stdout.write(f"✔ Saved image for {product.name}")
        except Exception as e:
            self.stdout.write(f"⚠ Failed to download image for {product.name}: {e}")
