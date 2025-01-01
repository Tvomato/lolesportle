import subprocess

def run_script(script_name):
    result = subprocess.run(["python", script_name], check=True)
    return result.returncode

scripts = [
    "create_skeletons.py",
    "extract_players.py",
    "extract_tournies.py",
    "insert_tournies.py",
    "insert_players_and_teams.py",
    "get_tourny_winners.py",
    "get_worlds_appearances.py",
]

print(">> Now commencing backend setup <<")

for script in scripts:
    exit_code = run_script(script)
    if exit_code != 0:
        print(f"!! Error running {script}. Exiting with code {exit_code}. !!")
        print("!! Please ensure your credentials and database are set up properly !!")
        break

print(">> Backend setup complete! <<")
print(">> Welcome to Lolesportle! <<")
