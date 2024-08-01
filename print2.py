import json
import os
from selenium import webdriver

addr = "file:///C:/Users/lukie/OneDrive/Projects/recipes/_output_html/recipes/_bean_broccoli_salad.html#loaded"

# setting Chrome Driver
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
chromeOpt.add_argument('--headless')
chromeOpt.add_argument('--kiosk-printing')
driver = webdriver.Chrome(options=chromeOpt)
driver.get(addr)


# https://vanilla.aslushnikov.com/?Page.printToPDF
pdf = driver.execute_cdp_cmd("Page.printToPDF", {
  "printBackground": True,
  "paperHeight": 8.3,
  "paperWidth": 5.8,

})

import base64

with open("file.pdf", "wb") as f:
  f.write(base64.b64decode(pdf['data']))
