from sklearn.ensemble import ExtraTreesRegressor
import pickle
import json
import sys

data = json.loads(sys.argv[1])

with open("ETR.obj", "rb") as filehandler:
    ETR = pickle.load(filehandler)

prediction = ETR.predict(data)
feature_importances = ETR.feature_importances_

print(prediction[0])
print(feature_importances[0])
print(feature_importances[1])
print(feature_importances[2])
print(feature_importances[3])
print(feature_importances[4])
print(feature_importances[5])
print(feature_importances[6])
