import csv
import json
import os

input_csv = 'ahmad.csv' if os.path.exists('ahmad.csv') else 'ahmed.csv'
output_folder = 'public/data/hadith/ahmad'

def convert():
    if not os.path.exists(input_csv):
        print(f"Error: {input_csv} not found.")
        return

    if not os.path.exists(output_folder):
        os.makedirs(f"{output_folder}/sections", exist_ok=True)

    print(f"Processing {input_csv}...")

    sections_index = {}
    
    try:
        with open(input_csv, mode='r', encoding='utf-8') as f:
            reader = csv.reader(f)
            all_hadiths = []
            for row in reader:
                if len(row) < 2: continue
                all_hadiths.append({"id": row[0].strip(), "arabic": row[1].strip()})

            print(f"Found {len(all_hadiths)} hadiths.")

            chunk_size = 100
            for i in range(0, len(all_hadiths), chunk_size):
                chunk = all_hadiths[i:i + chunk_size]
                section_id = (i // chunk_size) + 1
                
                section_hadiths = []
                for h in chunk:
                    section_hadiths.append({
                        "id": h["id"],
                        "idInBook": int(h["id"]) if h["id"].isdigit() else len(section_hadiths) + 1,
                        "chapterId": section_id,
                        "arabic": h["arabic"],
                        "english": {"narrator": "", "text": ""}
                    })
                
                # Arabic names for the JSON content (UTF-8 supported in file writing)
                sections_index[str(section_id)] = f"الجزء {section_id} (من {chunk[0]['id']} إلى {chunk[-1]['id']})"
                with open(f"{output_folder}/sections/{section_id}.json", 'w', encoding='utf-8') as out:
                    json.dump({"hadiths": section_hadiths}, out, ensure_ascii=False)

            with open(f"{output_folder}/sections.json", 'w', encoding='utf-8') as out:
                json.dump({"sections": sections_index}, out, ensure_ascii=False)

        print(f"Success! Created {len(sections_index)} chunks in Arabic format.")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    convert()
