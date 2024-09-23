import PyPDF2
from PyPDF2 import PdfMerger
import os
import fnmatch
from selenium import webdriver
import json
import base64
import time

OUTPUT_DIR = r'playground\autoload_server_v2'
RECIPE_HTML_DIR = os.path.join(OUTPUT_DIR, 'recipes')
OUTPUT_PDF = os.path.abspath(os.path.join(OUTPUT_DIR, 'take_away_recipes.pdf'))

chromeOpt = webdriver.ChromeOptions()
appState = {
   "recentDestinations": [
        {
            "id": "Save as PDF",
            "origin": "local",
            "account": ""
        }
    ],
    "selectedDestinationId": "Save as PDF",
    "version": 2
}
prefs = {
    'printing.print_preview_sticky_settings.appState': json.dumps(appState)}
chromeOpt.add_experimental_option('prefs', prefs)
# chromeOpt.add_argument('--headless')
chromeOpt.add_argument('--kiosk-printing')
driver = webdriver.Chrome(options=chromeOpt)

def find_html_files(directory):
    html_files = []
    html_filenames = []
    for root, dirnames, filenames in os.walk(directory):
        for filename in fnmatch.filter(filenames, '*.yaml'):
            html_path = os.path.join(root, filename)
            html_files.append(html_path)
            html_filenames.append(filename.split('.yaml')[0])
            print(html_path)
    return html_filenames

def html_to_pdf(html_file_names, output_pdf, driver):

    error_list = []

    intermediate_pdfs = []

    # This first call fixes issue of first recipe not loading correctly
    html_base_path = 'http://localhost:3000/index.html'
    driver.get(html_base_path)
    
    # Convert each HTML file to a PDF
    for html_filename in html_file_names:
        print('Processing: ', html_filename)
        intermediate_pdf = f"{html_filename.split('.')[0]}.pdf"

        html_addr = f"http://localhost:3000/recipe.html?recipe={html_filename}"

        driver.get(html_addr)

        pdf = driver.execute_cdp_cmd("Page.printToPDF", {
            "printBackground": True,
            "paperHeight": 8.3,
            "paperWidth": 5.8,
        })

        # Get the print height value from the JavaScript variable
        height_info = driver.execute_script("return window.printHeight;")


        # driver.set_window_size(600, 800)

        if float(height_info['inches']) > 9.6:
            print('Error!!! PDF Exceeds A5 Height')
        
        # driver.set_window_size(1920, 1080)
        


        with open(intermediate_pdf, "wb") as f:
            f.write(base64.b64decode(pdf['data']))

        with open(intermediate_pdf, "rb") as f:
            pdf_reader = PyPDF2.PdfReader(f)
            num_pages = len(pdf_reader.pages)

            if num_pages > 1:
                error_list.append([html_filename, '[ERROR: Spilling over another page]'])


        intermediate_pdfs.append(intermediate_pdf)

        print('Generated PDF: ', intermediate_pdf)
    print('')
    
    # Merge all intermediate PDFs into a single PDF
    merger = PdfMerger()
    for pdf in intermediate_pdfs:
        merger.append(pdf)
    
    # Write out the final PDF
    merger.write(output_pdf)
    merger.close()

    for (file, error) in error_list:
        print(f'{file} {error}')

    print('')

# List of local HTML files
html_files = find_html_files(RECIPE_HTML_DIR)

# Convert and merge HTML pages to a single PDF
html_to_pdf(html_files, OUTPUT_PDF, driver)
