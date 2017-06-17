from sklearn.ensemble import ExtraTreesRegressor
import pickle
import json
import sys

data = json.loads(sys.argv[1])

with open("ETR.obj", "rb") as filehandler:
    ETR = pickle.load(filehandler)

prediction = ETR.predict(data)
print(prediction[0])


