import csv
try:
    with open('ahmed.csv', 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        headers = next(reader)
        print(f"Headers found: {len(headers)}")
        # If headers are just numbers, it might not have a header row
        if all(h.isdigit() for h in headers):
            print("Detected: No header row (just data)")
        else:
            print("Detected: Header row present")
except Exception as e:
    print(f"Error: {e}")
