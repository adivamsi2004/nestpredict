import pandas as pd
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.linear_model import LinearRegression
import joblib
import os

# Create dummy data
data = {
    'area': [1500, 2000, 1200, 1800],
    'bedrooms': [3, 4, 2, 3],
    'bathrooms': [2.0, 3.0, 1.0, 2.0],
    'floors': [1, 2, 1, 2],
    'yearBuilt': [1990, 2010, 1980, 2005],
    'location': ['Ongole', 'Nellore', 'Kurnool', 'Nandyala'],
    'condition': ['Good', 'Excellent', 'Fair', 'Good'],
    'garage': ['Yes', 'Yes', 'No', 'Yes']
}
df = pd.DataFrame(data)
y = [150000, 250000, 100000, 180000] # dummy prices (base price before INR conversion)

# Create a sample pipeline
numeric_features = ['area', 'bedrooms', 'bathrooms', 'floors', 'yearBuilt']
categorical_features = ['location', 'condition', 'garage']

preprocessor = ColumnTransformer(
    transformers=[
        ('num', StandardScaler(), numeric_features),
        ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_features)
    ])

pipeline = Pipeline(steps=[('preprocessor', preprocessor),
                           ('model', LinearRegression())])

# Train the dummy model
pipeline.fit(df, y)

# Save the dummy model to replace the broken one
model_path = os.path.join(os.path.dirname(__file__), 'house_price_model (2).pkl')
joblib.dump(pipeline, model_path)
print("Successfully created a new dummy 'house_price_model (2).pkl' using scikit-learn 1.8.0")
