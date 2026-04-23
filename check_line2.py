with open('ahmed.csv', 'r', encoding='utf-8') as f:
    f.readline() # Skip first
    line = f.readline()
    print(f"Second line comma count: {line.count(',')}")
