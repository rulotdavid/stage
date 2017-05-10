from sklearn.ensemble import ExtraTreesRegressor
import pickle
import json
import sys

data = json.loads(sys.argv[1])

with open("lib\\forest.obj", "rb") as filehandler:
    forest = pickle.load(filehandler)

prediction = forest.predict(data)
print(prediction[0])

