"""
================================================================================
 Circuit IQ — Virtual Physics Lab
 FILE: build_all.py
 ROLE: Build Automation Script — builds 3D lab and React portal
================================================================================
"""

import os
import shutil
import subprocess

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
THREE_DIR = os.path.join(BASE_DIR, "LABfront-IQ-3D")
REACT_DIR = os.path.join(BASE_DIR, "LABfront-IQ-Portal")

def run_cmd(args, cwd):
    print(f"Running: {' '.join(args)} in {cwd}")
    use_shell = os.name == 'nt'
    res = subprocess.run(args, cwd=cwd, shell=use_shell)
    if res.returncode != 0:
        raise Exception(f"Command failed with code {res.returncode}")

def main():
    print("=== Step 1: Building 3D Virtual Lab (Three.js) ===")
    run_cmd(["npm", "run", "build"], THREE_DIR)
    
    print("\n=== Step 2: Copying 3D Lab Assets to React Public Directory ===")
    src_html = os.path.join(THREE_DIR, "dist", "index.html")
    dest_html = os.path.join(REACT_DIR, "public", "lab.html")
    
    src_assets = os.path.join(THREE_DIR, "dist", "assets")
    dest_assets = os.path.join(REACT_DIR, "public", "assets")
    
    # Copy lab.html
    shutil.copy(src_html, dest_html)
    print(f"Copied {src_html} -> {dest_html}")
    
    # Remove old assets files to avoid stale cached builds
    os.makedirs(dest_assets, exist_ok=True)
    for filename in os.listdir(dest_assets):
        file_path = os.path.join(dest_assets, filename)
        try:
            if os.path.isfile(file_path) or os.path.islink(file_path):
                os.unlink(file_path)
            elif os.path.isdir(file_path):
                shutil.rmtree(file_path)
        except Exception as e:
            print(f"[Warn] Could not delete {file_path}: {e}")
            
    # Copy new assets
    for filename in os.listdir(src_assets):
        src_file = os.path.join(src_assets, filename)
        dest_file = os.path.join(dest_assets, filename)
        shutil.copy(src_file, dest_file)
        print(f"Copied {src_file} -> {dest_file}")
    
    print("\n=== Step 3: Building React Main Portal ===")
    run_cmd(["npm", "run", "build"], REACT_DIR)
    
    print("\nBuild complete! Both servers are ready to be run.")

if __name__ == "__main__":
    main()
