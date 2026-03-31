import pickle

with open('house_price_model (2).pkl', 'rb') as f:
    model = pickle.load(f)

print("Model Type:", type(model))

if hasattr(model, 'feature_names_in_'):
    print("Expected Features:", model.feature_names_in_)
else:
    print("Does not have feature_names_in_ directly.")
