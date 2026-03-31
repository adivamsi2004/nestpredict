import urllib.request
import urllib.error
import json
req = urllib.request.Request('http://127.0.0.1:8000/predict', method='POST')
req.add_header('Content-Type', 'application/json')
data = json.dumps({'area': 2000, 'bedrooms': 3, 'bathrooms': 2.0, 'floors': 2, 'yearBuilt': 2018, 'location': 'Ongole', 'condition': 'Good', 'garage': 'Yes'}).encode('utf-8')
try:
    with urllib.request.urlopen(req, data=data) as f:
        print(f.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print("HTTPError:", e.code, e.read().decode('utf-8'))
except Exception as e:
    print("Error:", e)
