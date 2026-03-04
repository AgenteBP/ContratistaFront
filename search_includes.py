
import sys

file_path = r"c:\Users\Lucia Morandini\Desktop\One Drive\OneDrive\Documentos\GitHub\ContratistaFront\src\pages\suppliers\SupplierForm.jsx"
with open(file_path, 'r', encoding='utf-8') as f:
    for i, line in enumerate(f, 1):
        if 'includes(' in line:
            print(f"{i}: {line.strip()}")
