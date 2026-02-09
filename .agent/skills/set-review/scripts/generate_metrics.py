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
    
    print("# Enhanced Set Metrics Report")
    print(f"Total Cards: {stats.get('totalCards')}")
    print(f"Average CMC: {stats.get('averageCMC')}")
    
    print("\n## Evasion Distribution (Pillar Consistency)")
    keywords = stats.get('keywords', {})
    evasion_keys = ['Digital', 'Flying', 'Menace', 'Trample', 'Reach']
    for k in evasion_keys:
        print(f"- {k}: {keywords.get(k, 0)}")

    print("\n## Interaction & Resources")
    capabilities = stats.get('cardsWithAbilities', {})
    print(f"- Removal Spells: {capabilities.get('removal', 0)} (Target: ~25% of set)")
    print(f"- Card Draw/Selection: {capabilities.get('cardDraw', 0)}")
    print(f"- Energy Synergy: {capabilities.get('energyCards', 0)} ({round(capabilities.get('energyCards', 0)/int(data.get('cardCount', 1))*100, 1)}% density)")
    print(f"- Token Creators: {capabilities.get('tokenCreators', 0)}")

    print("\n## Creature Curve (Creatures)")
    curve = stats.get('manaCurveByColor', {})
    print("| Color | 1 | 2 | 3 | 4 | 5+ |")
    print("| :--- | :--- | :--- | :--- | :--- | :--- |")
    for color in ['W', 'U', 'B', 'R', 'G']:
        vals = curve.get(color, {})
        five_plus = sum(int(v) for k, v in vals.items() if k in ['5', '6+'])
        print(f"| {color} | {vals.get('1', 0)} | {vals.get('2', 0)} | {vals.get('3', 0)} | {vals.get('4', 0)} | {five_plus} |")

if __name__ == "__main__":
    generate_report()
