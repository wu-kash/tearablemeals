import os
import yaml
import jinja2
import subprocess
import shutil
from pathlib import Path
import fnmatch
import segno

OUTPUT_DIR = os.path.abspath(os.path.join('_output_html'))
RECIPES_DIR = os.path.abspath(os.path.join('_recipes'))
# RECIPES_DIR = os.path.abspath(os.path.join('_dev'))
RESOURCE_DIR = os.path.abspath(os.path.join('_resources'))

COMPONENTS_DIR = os.path.join(OUTPUT_DIR, 'recipes')
HTML_RESOURCE_DIR = os.path.join(RESOURCE_DIR, os.path.join('_html'))
TEMPLATE_RESOURCE_DIR = os.path.join(RESOURCE_DIR, os.path.join('_templates'))
MAIN_HTML_FILE = os.path.join(OUTPUT_DIR, 'main.html')
QR_DIR = os.path.join(OUTPUT_DIR, 'qr')
LOG_FILE = os.path.join(OUTPUT_DIR, 'recipes.log')

HTML_TEMPLATE_ENV = jinja2.Environment(
        block_start_string = '\BLOCK{',
        block_end_string = '}',
        variable_start_string = '\VAR{',
        variable_end_string = '}',
        comment_start_string = '\#{',
        comment_end_string = '}',
        line_statement_prefix = '%%',
        line_comment_prefix = '%#',
        trim_blocks = True,
        loader=jinja2.FileSystemLoader(TEMPLATE_RESOURCE_DIR)
    )

def get_recipe_stats(recipes_file_data: dict):

    num_recipes = 0
    num_servings = 0
    num_tested = 0
    not_tested = []

    recipe_servings = []

    for file_name, file_data in recipes_file_data.items():

        recipe_data = yaml.safe_load(Path(file_data['Input File']).read_text())

        if recipe_data['Tested']:
            num_tested += 1
        else:
            not_tested.append(file_data['Recipe Name'])
        num_recipes += 1

        recipe_servings.append(recipe_data['Recipe Info']['portion']['Value'])
        num_servings += recipe_data['Recipe Info']['portion']['Value']

    print('\n')
    append_str_to_file('Recipe Stats:')
    append_str_to_file(f'Number of Recipes:        {num_recipes}')
    append_str_to_file(f'Number of Tested Recipes: {num_tested} ({(num_tested/num_recipes)*100:.2f}%)')
    append_str_to_file(f'Total Servings:           {num_servings} (Avg: {sum(recipe_servings) / len(recipe_servings):.2f})')
    append_str_to_file('\nFollowing recipes have not been tested:')
    for idx, recipe in enumerate(not_tested):
        append_str_to_file(f' {idx}]'.rjust(4, ' ') + f' {recipe}')

def gen_recipe_standalone(file_data: dict):

    recipe_data = yaml.safe_load(Path(file_data['Input File']).read_text())
    recipe_data_filtered = {k:v for k,v in recipe_data.items() if v is not None}
    file_data['AmountIngredients'] = str(len(recipe_data['Ingredients'].keys()))

    url = recipe_data['Recipe Info']['source']['Value']

    qr_file_name = f'{file_data["File Name"]}'.replace('_', ' ')
    qr_file_name = qr_file_name.title()
    qr_file_name = qr_file_name.replace(' ', '') + '.png'
    
    qr_file_path = os.path.join(QR_DIR, qr_file_name)
    qrcode = segno.make(url, micro=False,)
    qrcode.save(qr_file_path, scale=10, border=0, light=None)
    qrcode.save(qr_file_path.replace('.png', '.png'), scale=10, border=0, light=None)

    file_data['QR File'] = qr_file_path
    recipe_data['Recipe Info']['qr'] = {'Value': f'qr/{qr_file_name}'}

    template = HTML_TEMPLATE_ENV.get_template('template_recipe.html')
    result = template.render(file_data=file_data, recipe_data=recipe_data_filtered, recipe_info=recipe_data_filtered['Recipe Info'])

    output_file = os.path.join(COMPONENTS_DIR, f'{file_data["File Name"]}.html')

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
    os.mkdir(os.path.join(OUTPUT_DIR, 'img'))
    os.mkdir(COMPONENTS_DIR)
    os.mkdir(QR_DIR)

    shutil.copy(os.path.join(HTML_RESOURCE_DIR, 'styles.css'), os.path.join(OUTPUT_DIR, 'recipes'))
    shutil.copy(os.path.join(HTML_RESOURCE_DIR, 'script.js'), os.path.join(OUTPUT_DIR, 'recipes'))
    shutil.copy(os.path.join(RESOURCE_DIR, 'logo.jpg'), os.path.join(OUTPUT_DIR, 'img'))
    shutil.copy(os.path.join(RESOURCE_DIR, 'symbol_cooking.png'), os.path.join(OUTPUT_DIR, 'img'))
    shutil.copy(os.path.join(RESOURCE_DIR, 'symbol_portions.png'), os.path.join(OUTPUT_DIR, 'img'))
    shutil.copy(os.path.join(RESOURCE_DIR, 'symbol_preparation.png'), os.path.join(OUTPUT_DIR, 'img'))

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

        gen_recipe_standalone(file_data)

    template = HTML_TEMPLATE_ENV.get_template('template_main.html')
    result = template.render(recipes_data=recipes_data)

    with open(MAIN_HTML_FILE, 'w') as file:
        file.write(result)

    get_recipe_stats(recipes_data)

def append_str_to_file(str):

    with open(LOG_FILE, 'a') as file:
        print(str)
        file.write(str + '\n')

if __name__ == "__main__":
    
    process_recipe_files(RECIPES_DIR)