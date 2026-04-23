import csv
import json
import os
import re

def slugify(text):
    # Keep only Arabic characters, numbers, and spaces, then replace spaces with underscores
    text = re.sub(r'[^\u0600-\u06FF0-9\s]', '', text)
    return text.strip().replace(' ', '_')

# --- Musnad Ahmad Ar-Risala Titles (52 Volumes) ---
TITLES = [
    "مسند الخلفاء الراشدين (أبو بكر، عمر، عثمان، علي)",
    "تتمة مسند علي بن أبي طالب ومسند أهل البيت",
    "تتمة مسند أهل البيت ومسند عبد الله بن عباس",
    "تتمة مسند عبد الله بن عباس",
    "مسند عبد الله بن مسعود رضي الله عنه",
    "تتمة مسند عبد الله بن مسعود",
    "مسند عبد الله بن عمر بن الخطاب رضي الله عنهما",
    "تتمة مسند عبد الله بن عمر",
    "مسند أبي هريرة رضي الله عنه (1)",
    "مسند أبي هريرة رضي الله عنه (2)",
    "مسند أبي هريرة رضي الله عنه (3)",
    "مسند أبي هريرة رضي الله عنه (4)",
    "مسند أنس بن مالك رضي الله عنه (1)",
    "مسند أنس بن مالك رضي الله عنه (2)",
    "مسند جابر بن عبد الله رضي الله عنه (1)",
    "مسند جابر بن عبد الله رضي الله عنه (2)",
    "مسند المكثرين من الصحابة",
    "تتمة مسند المكثرين ومسند المكيين",
    "تتمة مسند المكيين ومسند المدنيين",
    "تتمة مسند المدنيين (1)",
    "تتمة مسند المدنيين (2)",
    "مسند الشاميين (1)",
    "مسند الشاميين (2)",
    "مسند الكوفيين (1)",
    "مسند الكوفيين (2)",
    "مسند الكوفيين (3)",
    "تتمة مسند الكوفيين ومسند البصريين",
    "تتمة مسند البصريين (1)",
    "تتمة مسند البصريين (2)",
    "مسند الأنصار رضي الله عنهم (1)",
    "مسند الأنصار رضي الله عنهم (2)",
    "مسند الأنصار رضي الله عنهم (3)",
    "مسند الأنصار رضي الله عنهم (4)",
    "مسند الأنصار رضي الله عنهم (5)",
    "مسند الأنصار رضي الله عنهم (6)",
    "مسند الأنصار رضي الله عنهم (7)",
    "تتمة مسند الأنصار ومسند القبائل",
    "تتمة مسند القبائل (1)",
    "تتمة مسند القبائل (2)",
    "تتمة مسند القبائل (3)",
    "تتمة مسند القبائل (4)",
    "تتمة مسند القبائل (5)",
    "مسند النساء (1)",
    "مسند النساء (2)",
    "مسند النساء (3)",
    "مسند النساء (4)",
    "مسند النساء (5)",
    "مسند النساء (6)",
    "مسند النساء (تتمة) والفهارس الأولية",
    "تتمة مسند النساء وجوامع المسانيد",
    "الفهارس العامة (1)",
    "الفهارس العامة (2)"
]

input_csv = 'ahmad.csv' if os.path.exists('ahmad.csv') else 'ahmed.csv'
output_folder = 'public/data/hadith/ahmad'

def convert():
    if not os.path.exists(input_csv):
        print(f"Error: {input_csv} not found.")
        return

    # Clean existing sections to avoid mixups
    if os.path.exists(f"{output_folder}/sections"):
        import shutil
        shutil.rmtree(f"{output_folder}/sections")
    os.makedirs(f"{output_folder}/sections", exist_ok=True)

    print(f"Processing {input_csv} into {len(TITLES)} Descriptive Ar-Risala Volumes...")

    sections_index = {} # Will store { "id": { "title": "...", "file": "..." } }
    
    try:
        with open(input_csv, mode='r', encoding='utf-8') as f:
            reader = csv.reader(f)
            all_hadiths = []
            for row in reader:
                if len(row) < 2: continue
                all_hadiths.append({"id": row[0].strip(), "arabic": row[1].strip()})

            num_volumes = len(TITLES)
            chunk_size = (len(all_hadiths) // num_volumes) + 1
            
            for i in range(num_volumes):
                start_idx = i * chunk_size
                end_idx = min((i + 1) * chunk_size, len(all_hadiths))
                
                if start_idx >= len(all_hadiths): break
                
                chunk = all_hadiths[start_idx:end_idx]
                section_id = i + 1
                
                # Create descriptive filename
                title = TITLES[i]
                safe_title = slugify(title)
                filename = f"{section_id:02d}_{safe_title}.json"
                
                section_hadiths = []
                for h in chunk:
                    section_hadiths.append({
                        "id": h["id"],
                        "idInBook": int(h["id"]) if h["id"].isdigit() else len(section_hadiths) + 1,
                        "chapterId": section_id,
                        "arabic": h["arabic"],
                        "english": {"narrator": "", "text": ""}
                    })
                
                sections_index[str(section_id)] = {
                    "name": f"المجلد {section_id}: {title}",
                    "file": filename
                }
                
                with open(f"{output_folder}/sections/{filename}", 'w', encoding='utf-8') as out:
                    json.dump({"hadiths": section_hadiths}, out, ensure_ascii=False)

            # Save the enhanced index
            with open(f"{output_folder}/sections.json", 'w', encoding='utf-8') as out:
                json.dump({"sections": sections_index}, out, ensure_ascii=False)

        print(f"Success! Created {len(sections_index)} scholarly volumes with descriptive filenames.")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    convert()
