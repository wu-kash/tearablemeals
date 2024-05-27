import os
import yaml
import jinja2
import subprocess
import shutil
from pathlib import Path
import fnmatch
import segno

OUTPUT_DIR = os.path.abspath(os.path.join('_output'))
RECIPES_DIR = os.path.abspath(os.path.join('_recipes'))

# RECIPES_DIR = os.path.abspath(os.path.join('_dev'))

COMPONENTS_DIR = os.path.join(OUTPUT_DIR, '_components')
QR_DIR = os.path.join(OUTPUT_DIR, '_qr')
MAIN_TEX_FILE = os.path.join(OUTPUT_DIR, 'take_away_recipes.tex')

LATEX_TEMPLATE_ENV = jinja2.Environment(
        block_start_string = '\BLOCK{',
        block_end_string = '}',
        variable_start_string = '\VAR{',
        variable_end_string = '}',
        comment_start_string = '\#{',
        comment_end_string = '}',
        line_statement_prefix = '%%',
        line_comment_prefix = '%#',
        trim_blocks = True,
        loader=jinja2.FileSystemLoader(os.path.join('_resources', '_templates'))
    )

def gen_recipe_standalone_tex(file_data: dict):

    recipe_data = yaml.safe_load(Path(file_data['Input File']).read_text())
    recipe_data_filtered = {k:v for k,v in recipe_data.items() if v is not None}
    file_data['AmountIngredients'] = str(len(recipe_data['Ingredients'].keys()))

    url = recipe_data['Recipe Info']['source']['Value']

    qr_file = os.path.join(QR_DIR, f'{file_data["File Name"]}.png')
    qrcode = segno.make_qr(url)
    qrcode.save(qr_file)

    file_data['QR File'] = qr_file

    template = LATEX_TEMPLATE_ENV.get_template('tex_recipe.tex')
    result = template.render(file_data=file_data, recipe_data=recipe_data_filtered, recipe_info=recipe_data_filtered['Recipe Info'])

    output_file = os.path.join(COMPONENTS_DIR, f'{file_data["File Name"]}.tex')

    with open(output_file, 'w') as file:
        file.write(result)

def find_yaml_files(directory):
    yaml_files = []
    for root, dirnames, filenames in os.walk(directory):
        for filename in fnmatch.filter(filenames, '*.yaml'):
            yaml_path = os.path.join(root, filename)
            yaml_files.append(yaml_path)
            print(yaml_path)
    return yaml_files

def process_recipe_files(data_dir_path: str):

    files = os.listdir(data_dir_path)
    if os.path.exists(OUTPUT_DIR):
        shutil.rmtree(OUTPUT_DIR)
    os.mkdir(OUTPUT_DIR)
    os.mkdir(COMPONENTS_DIR)
    os.mkdir(QR_DIR)

    yaml_files = find_yaml_files(data_dir_path)

    recipes_data = {}

    for file in yaml_files:
        # Check if the current file is a regular file
    
        
        file_name = os.path.basename(file)
        file_name, file_extension = os.path.splitext(file_name)
        
        if file_name == '_blank':
            continue

        file_data = {}
        file_data['Input File'] = os.path.join(file)
        file_data['File Name'] = f'_{file_name}'
        file_data['Output File'] = os.path.join(COMPONENTS_DIR, f'{file_data["File Name"]}.tex')
        file_data['Recipe Name'] = file_name.replace('_', ' ').title()

        recipes_data[file_data['File Name']] = file_data

        gen_recipe_standalone_tex(file_data)

    template = LATEX_TEMPLATE_ENV.get_template('tex_main.tex')
    result = template.render(recipes_data=recipes_data)

    with open(MAIN_TEX_FILE, 'w') as file:
        file.write(result)


    proc = subprocess.Popen(['pdflatex', MAIN_TEX_FILE], cwd=OUTPUT_DIR)
    proc.communicate()

    # Clean up latex files
    output_files = os.listdir(OUTPUT_DIR)
    for item in output_files:
        if item.endswith(".aux"):
            os.remove(os.path.join(OUTPUT_DIR, item))

if __name__ == "__main__":
    

    process_recipe_files(RECIPES_DIR)