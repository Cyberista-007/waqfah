with open('ahmed.csv', 'r', encoding='utf-8') as f:
    for i in range(3):
        line = f.readline()
        # Filter to only English/Numbers to avoid encoding issues in print
        clean = "".join(c for c in line if ord(c) < 128)
        print(f"Line {i}: {clean[:100]}")
