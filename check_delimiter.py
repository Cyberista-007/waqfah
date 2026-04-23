with open('ahmed.csv', 'r', encoding='utf-8') as f:
    line = f.readline()
    print(f"Comma count: {line.count(',')}")
    print(f"Semicolon count: {line.count(';')}")
    print(f"Tab count: {line.count('\t')}")
    print(f"Pipe count: {line.count('|')}")
