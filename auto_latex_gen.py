import os
import yaml
import jinja2
import subprocess
import shutil
from pathlib import Path


OUTPUT_DIR = os.path.abspath(os.path.join('_output'))
RECIPES_DIR = os.path.abspath(os.path.join('_recipes'))
# RECIPES_DIR = os.path.abspath(os.path.join('_dev'))
MAIN_TEX_FILE = os.path.join(OUTPUT_DIR, 'main.tex')

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

    
    template = LATEX_TEMPLATE_ENV.get_template('tex_recipe.tex')
    result = template.render(file_data=file_data, recipe_data=recipe_data_filtered, recipe_info=recipe_data_filtered['Recipe Info'])

    output_file = os.path.join(OUTPUT_DIR, f'{file_data["File Name"]}.tex')

    with open(output_file, 'w') as file:
        file.write(result)





def process_recipe_files(data_dir_path: str):

    files = os.listdir(data_dir_path)
    if os.path.exists(OUTPUT_DIR):
        shutil.rmtree(OUTPUT_DIR)
    os.mkdir(OUTPUT_DIR)

    recipes_data = {}

    for file in files:
        # Check if the current file is a regular file
        if os.path.isfile(os.path.join(RECIPES_DIR, file)):
            file_name, file_extension = os.path.splitext(file)
            
            if file_name == '_blank':
                continue

            file_data = {}
            file_data['Input File'] = os.path.join(RECIPES_DIR, file)
            file_data['File Name'] = f'_{file_name}'
            file_data['Output File'] = os.path.join(OUTPUT_DIR, f'{file_data["File Name"]}.tex')
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


    



# Iterate over all files


if __name__ == "__main__":

    process_recipe_files(RECIPES_DIR)