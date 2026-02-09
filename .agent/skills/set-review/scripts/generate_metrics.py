import json
import os

def generate_report():
    set_info_path = 'src/data/setInfo.json'
    if not os.path.exists(set_info_path):
        print(f"Error: {set_info_path} not found.")
        return

    with open(set_info_path, 'r') as f:
        data = json.load(f)

    stats = data.get('stats', {})
    
    print("# Set Metrics Summary")
    print(f"Total Cards: {stats.get('totalCards')}")
    print("\n## Rarity Distribution")
    for rarity, count in stats.get('rarityBreakdown', {}).items():
        print(f"- {rarity}: {count}")
    
    print("\n## Color Distribution")
    for color, count in stats.get('colorCombinations', {}).items():
        if len(color) <= 2: # Stick to WUBRG and simple pairs for summary
            print(f"- {color}: {count}")

    print("\n## Mana Curve (Creatures)")
    curve = stats.get('manaCurveByColor', {})
    print("| Color | 1 | 2 | 3 | 4 | 5+ |")
    print("| :--- | :--- | :--- | :--- | :--- | :--- |")
    for color in ['W', 'U', 'B', 'R', 'G']:
        vals = curve.get(color, {})
        five_plus = sum(int(v) for k, v in vals.items() if k in ['5', '6+'])
        print(f"| {color} | {vals.get('1', 0)} | {vals.get('2', 0)} | {vals.get('3', 0)} | {vals.get('4', 0)} | {five_plus} |")

if __name__ == "__main__":
    generate_report()
