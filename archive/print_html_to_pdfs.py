from PyPDF2 import PdfMerger
import os
import fnmatch
from selenium import webdriver
import json
import base64
import time

OUTPUT_DIR = os.path.abspath(os.path.join('_output_html'))
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
    for root, dirnames, filenames in os.walk(directory):
        for filename in fnmatch.filter(filenames, '*.html'):
            html_path = os.path.join(root, filename)
            html_files.append(html_path)
            print(html_path)
    return html_files

def html_to_pdf(html_files, output_pdf, driver):
    intermediate_pdfs = []
    
    # Convert each HTML file to a PDF
    for html_file in html_files:
        print('Processing: ', html_file)
        intermediate_pdf = f"{html_file.split('.')[0]}.pdf"

        html_addr  = f"file:///{html_file}"

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

# List of local HTML files
html_files = find_html_files(RECIPE_HTML_DIR)

# Convert and merge HTML pages to a single PDF
html_to_pdf(html_files, OUTPUT_PDF, driver)
